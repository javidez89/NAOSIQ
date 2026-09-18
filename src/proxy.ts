import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import type { Database } from '@/types/database.generated';
import { portalForPath, parsePortal, portals, portalCookie } from '@/config/portals';
export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  // Old shared entry points deliberately lead to the new portal selector.
  if (/^\/app(?:\/|$)/.test(path)) return NextResponse.redirect(new URL('/login', request.url), 307);
  const portal = portalForPath(path) ?? (path === '/auth/callback' ? parsePortal(request.nextUrl.searchParams.get('portal')) : null);
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const dev = process.env.NODE_ENV !== 'production';
  const endpoint = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const trustedConnect = endpoint ? new URL(endpoint).origin : '';
  const csp = [
    "default-src 'self'", `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' ${dev ? "'unsafe-eval'" : ''}`,
    "style-src 'self' 'unsafe-inline'", `connect-src 'self' ${trustedConnect} ${dev ? 'ws://localhost:*' : ''}`,
    "img-src 'self' data: blob:", "font-src 'self'", "object-src 'none'", "base-uri 'self'",
    "frame-ancestors 'none'", "form-action 'self'", ...(request.nextUrl.protocol === 'https:' ? ['upgrade-insecure-requests'] : []),
  ].join('; ');
  const forwarded = new Headers(request.headers);
  forwarded.set('x-naosiq-portal', portal ?? '');
  forwarded.set('x-nonce', nonce); forwarded.set('Content-Security-Policy', csp);
  let response = NextResponse.next({ request: { headers: forwarded } });
  const authPath = /(?:^\/login$|^\/auth\/|^\/(master|comercio|cliente)\/login$)/.test(path);
  const privatePath = !!portal && !authPath;
  const loginPath = portal ? `${portals[portal].base}/login` : '/login';
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if ((privatePath || authPath) && endpoint && key) {
    const db = createServerClient<Database>(endpoint, key, { cookieOptions: portalCookie(portal ?? 'comercio'), cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(values, cacheHeaders) {
        values.forEach(({ name, value }) => request.cookies.set(name, value));
        forwarded.set('cookie', request.cookies.toString());
        response = NextResponse.next({ request: { headers: forwarded } });
        values.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        Object.entries(cacheHeaders ?? {}).forEach(([name, value]) => response.headers.set(name, value));
      },
    }});
    const { data, error } = await db.auth.getClaims();
    if (privatePath && (error || !data?.claims)) {
      const redirect = NextResponse.redirect(new URL(loginPath, request.url));
      response.cookies.getAll().forEach(cookie => redirect.cookies.set(cookie));
      response = redirect;
    }
  } else if (privatePath) {
    response = NextResponse.redirect(new URL(`${loginPath}?notice=config`, request.url));
  }
  response.headers.set('Content-Security-Policy', csp);
  response.headers.set('X-Request-Id', crypto.randomUUID());
  // No authenticated HTML, session cookies or tenant data may enter a shared cache.
  if (privatePath || authPath) {
    response.headers.set('Cache-Control', 'private, no-store, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
  }
  return response;
}
export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico|icons/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'] };
