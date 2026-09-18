'use server';
import { redirect } from 'next/navigation';
import { serverClient } from '@/lib/supabase/server';
import { appOrigin } from '@/lib/env';
import { assertActionOrigin, hasPortalAccess } from '@/lib/access';
import { currentPortal, portalBase } from '@/lib/portal';
import type { FormState } from '@/components/action-form';
import { safePortalReturnPath } from '@/domain/session';
export async function login(_state: FormState, form: FormData): Promise<FormState> {
  await assertActionOrigin();
  const email = String(form.get('email') ?? '').trim();
  const password = String(form.get('password') ?? '');
  if (email.length > 254 || password.length < 8 || password.length > 256) return { ok: false, message: 'Credenciales no válidas.' };
  const db = await serverClient();
  const { data, error } = await db.auth.signInWithPassword({ email, password });
  if (error) return { ok: false, message: 'No pudimos iniciar sesión. Revise las credenciales o inténtelo más tarde.' };
  if (!data.user || !await hasPortalAccess(db, data.user.id, await currentPortal())) {
    await db.auth.signOut({ scope: 'local' });
    return { ok: false, message: 'Esta cuenta no tiene acceso a este portal. Selecciona el acceso correspondiente a tu cuenta.' };
  }
  const base = await portalBase();
  redirect(safePortalReturnPath(form.get('returnTo'), base));
}
export async function googleLogin(form: FormData) {
  await assertActionOrigin();
  const base = await portalBase();
  if (process.env.GOOGLE_AUTH_ENABLED !== 'true') redirect(`${base}/login?notice=config`);
  const returnTo = safePortalReturnPath(form.get('returnTo'), base);
  const callback = new URL('/auth/callback', appOrigin());
  callback.searchParams.set('portal', await currentPortal());
  callback.searchParams.set('next', returnTo);
  const db = await serverClient();
  const { data, error } = await db.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: callback.toString() } });
  if (error || !data.url) redirect(`${base}/login?notice=oauth`);
  redirect(data.url);
}
export async function logout() {
  await assertActionOrigin();
  const db = await serverClient();
  await db.auth.signOut({ scope: 'local' });
  redirect(`${await portalBase()}/login`);
}
