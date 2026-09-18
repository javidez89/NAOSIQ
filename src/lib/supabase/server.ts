import 'server-only';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { publicSupabaseEnv } from '@/lib/env';
import type { Database } from '@/types/database.generated';
import { currentPortal } from '@/lib/portal';
import { portalCookie } from '@/config/portals';
export async function serverClient() {
  const { url, key } = publicSupabaseEnv();
  const jar = await cookies();
  return createServerClient<Database>(url, key, {
    cookieOptions: portalCookie(await currentPortal()),
    cookies: {
      getAll: () => jar.getAll(),
      setAll(values) {
        try { values.forEach(({ name, value, options }) => jar.set(name, value, options)); }
        catch { /* Read-only Server Component. proxy.ts persists refresh cookies and cache headers. */ }
      },
    },
  });
}
