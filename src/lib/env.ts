import 'server-only';
export function isConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
}
export function publicSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error('Supabase no configurado. Consulte .env.example.');
  if (key.startsWith('eyJ') && JSON.parse(Buffer.from(key.split('.')[1] ?? '', 'base64url').toString()).role !== 'anon') throw new Error('Clave privilegiada en variable pública.');
  if (key.startsWith('sb_secret_')) throw new Error('Una clave secreta nunca puede ser NEXT_PUBLIC.');
  const parsed = new URL(url);
  if (parsed.protocol !== 'https:' && !['localhost', '127.0.0.1'].includes(parsed.hostname)) {
    throw new Error('Supabase requiere HTTPS fuera de localhost.');
  }
  return { url, key };
}
export function appOrigin(): string {
  const origin = process.env.APP_ORIGIN;
  if (!origin) throw new Error('APP_ORIGIN es obligatorio.');
  const url = new URL(origin);
  if (url.origin !== origin) throw new Error('APP_ORIGIN debe ser un origen exacto, sin ruta ni barra final.');
  return origin;
}
export function assertReleaseAllowed() {
  if ((process.env.APP_ENV === 'production' || process.env.VERCEL_ENV === 'production') && process.env.RELEASE_APPROVED !== 'true') {
    throw new Error('Release bloqueado: completar docs/12-release.md.');
  }
}
