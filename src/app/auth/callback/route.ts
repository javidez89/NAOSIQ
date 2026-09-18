import { NextResponse, type NextRequest } from 'next/server';
import { serverClient } from '@/lib/supabase/server';
import { appOrigin } from '@/lib/env';
import { hasPortalAccess } from '@/lib/access';
import { currentPortal } from '@/lib/portal';
import { portals } from '@/config/portals';
import { oauthCallbackOutcome, safePortalReturnPath } from '@/domain/session';
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const providerError = request.nextUrl.searchParams.get('error');
  const portal = await currentPortal();
  const base = portals[portal].base;
  const next = safePortalReturnPath(request.nextUrl.searchParams.get('next'), base);
  const loginUrl = (notice: string) => {
    const target = new URL(`${base}/login`, appOrigin());
    target.searchParams.set('notice', notice);
    target.searchParams.set('returnTo', next);
    return target;
  };
  const outcome = oauthCallbackOutcome(code, providerError);
  if (outcome === 'cancelled') return NextResponse.redirect(loginUrl('cancelled'));
  if (outcome === 'exchange' && code) {
    const db = await serverClient();
    const { error } = await db.auth.exchangeCodeForSession(code);
    if (!error) {
      const { data: { user } } = await db.auth.getUser();
      if (user && await hasPortalAccess(db, user.id, portal)) return NextResponse.redirect(new URL(next, appOrigin()));
      await db.auth.signOut({ scope: 'local' });
      return NextResponse.redirect(loginUrl('access'));
    }
  }
  return NextResponse.redirect(loginUrl('oauth'));
}
