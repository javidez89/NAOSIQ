'use server';

import { redirect } from 'next/navigation';
import { assertActionOrigin, hasPortalAccess } from '@/lib/access';
import { serverClient } from '@/lib/supabase/server';
import { currentPortal, portalBase } from '@/lib/portal';
import { safePortalReturnPath } from '@/domain/session';

export async function continueSession(form: FormData) {
  await assertActionOrigin();
  const portal = await currentPortal();
  const base = await portalBase();
  const returnTo = safePortalReturnPath(form.get('returnTo'), base);
  const db = await serverClient();
  const { data, error } = await db.auth.refreshSession();
  if (error || !data.user || !await hasPortalAccess(db, data.user.id, portal)) {
    await db.auth.signOut({ scope: 'local' });
    redirect(`${base}/login?notice=access&returnTo=${encodeURIComponent(returnTo)}`);
  }
  redirect(returnTo);
}
