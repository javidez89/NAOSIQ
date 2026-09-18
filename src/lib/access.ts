import 'server-only';
import { redirect } from 'next/navigation';
import { cookies, headers } from 'next/headers';
import { serverClient } from '@/lib/supabase/server';
import { appOrigin, assertReleaseAllowed } from '@/lib/env';
import { isSameOrigin, uuid } from '@/domain/validation';
import { DomainError } from '@/domain/errors';
import type { Role } from '@/domain/identity';
import { currentPortal } from '@/lib/portal';
import { portals, portalAllowsRole, type Portal } from '@/config/portals';
import { logUnexpected } from '@/lib/logger';
import { masterContextCookie } from '@/domain/master';
export async function hasPortalAccess(db: Awaited<ReturnType<typeof serverClient>>, userId: string, portal: Portal) {
  if (portal === 'master') {
    const { data, error } = await db.rpc('has_platform_access');
    return !error && data === true;
  }
  const { data, error } = await db.from('memberships').select('role').eq('user_id', userId).eq('active', true);
  return !error && !!data?.some(m => portalAllowsRole(portal, m.role));
}
export async function currentUser() {
  assertReleaseAllowed();
  const db = await serverClient();
  const portal = await currentPortal();
  const base = portals[portal].base;
  const { data: { user }, error } = await db.auth.getUser();
  if (error || !user) redirect(`${base}/login`);
  if (!await hasPortalAccess(db, user.id, portal)) redirect(`${base}/login?notice=access`);
  return { db, user, portal, base };
}
export async function assertActionOrigin() {
  const requestHeaders = await headers();
  if (!isSameOrigin(requestHeaders.get('origin'), appOrigin())) throw new DomainError('FORBIDDEN', 'Origen no permitido.');
}
export async function tenantContext(input: string) {
  const tenantId = uuid(input);
  const { db, user, portal, base } = await currentUser();
  const { data, error } = await db.from('memberships').select('role,active').eq('tenant_id', tenantId).eq('user_id', user.id).maybeSingle();
  const { data: platform } = await db.rpc('is_platform_admin');
  if (portal === 'master') {
    if (platform !== true) throw new DomainError('FORBIDDEN', 'Acceso no permitido.');
    const rawContext = (await cookies()).get(masterContextCookie)?.value;
    let contextId = '';
    try { contextId = uuid(rawContext ?? ''); } catch { redirect(`/master/businesses/${tenantId}/control?notice=context`); }
    const { data: contextAllowed, error: contextError } = await db.rpc('has_master_control_context', { p_tenant: tenantId, p_context: contextId });
    if (contextError || contextAllowed !== true) redirect(`/master/businesses/${tenantId}/control?notice=context`);
  } else if (error || !data?.active || !portalAllowsRole(portal, data.role)) {
    throw new DomainError('FORBIDDEN', 'Acceso no permitido.');
  }
  return { db, user, portal, base, tenantId, role: (portal === 'master' ? 'super_user' : data?.role) as Role };
}
export function publicError(error: unknown): string {
  if (error instanceof DomainError) return error.message;
  const correlationId = logUnexpected('application.action.failed', error);
  return `No fue posible completar la operación. Revise permisos, datos y estado de la suscripción. Referencia: ${correlationId}.`;
}
