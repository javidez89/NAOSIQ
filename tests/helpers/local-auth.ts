import { createHmac, randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, type Page } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

export type LocalAccount = 'master' | 'adminA' | 'adminB' | 'advisorA' | 'technicianA' | 'customerA' | 'customerB';
type Account = { id: string; email: string; password: string };
type Credentials = { installationId: string; accounts: Record<LocalAccount, Account> };
type Seed = {
  installationId: string;
  tenants: Record<'a' | 'b', string>;
  repairs: Record<'aPhone' | 'aLaptop' | 'aTablet' | 'aConsole' | 'bPhone' | 'bLaptop', string>;
  vouchers: Record<'aPhone' | 'aLaptop' | 'aTablet' | 'aConsole' | 'bPhone' | 'bLaptop', string>;
  payments: { aPending: string };
};

function localJson<T>(name: string): T {
  try { return JSON.parse(readFileSync(resolve('.local', name), 'utf8')) as T; }
  catch { throw new Error(`Falta un archivo local válido (${name}). Ejecuta primero la semilla sintética.`); }
}

export function localFixture() {
  const credentials = localJson<Credentials>('credentials.json');
  const seed = localJson<Seed>('seed.json');
  if (!credentials.installationId || credentials.installationId !== seed.installationId) {
    throw new Error('La semilla y las credenciales deben pertenecer a la misma instalación local.');
  }
  for (const key of ['master', 'adminA', 'adminB', 'advisorA', 'technicianA', 'customerA', 'customerB'] as const) {
    const account = credentials.accounts?.[key];
    if (!account?.id || !account.email?.endsWith('@techi.example.test') || account.password?.length < 32) {
      throw new Error(`La cuenta sintética ${key} no está preparada.`);
    }
  }
  return { seed, accounts: credentials.accounts };
}

function loopback(input: string): URL {
  const url = new URL(input);
  if (!['127.0.0.1', '[::1]'].includes(url.hostname) || url.protocol !== 'http:' || url.username || url.password) {
    throw new Error('Las pruebas autenticadas solo permiten HTTP en una IP de loopback local.');
  }
  return url;
}

function configuration() {
  const content = readFileSync(resolve('.env.local'), 'utf8');
  const value = (key: string) => {
    const raw = content.match(new RegExp(`^${key}=(.*)$`, 'm'))?.[1]?.trim() ?? '';
    return raw.replace(/^(["'])(.*)\1$/, '$2');
  };
  const url = loopback(value('NEXT_PUBLIC_SUPABASE_URL'));
  const publicKey = value('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY');
  if (url.pathname !== '/' || !publicKey || publicKey.startsWith('sb_secret_')) {
    throw new Error('Se requiere una configuración pública de Supabase local.');
  }
  if (publicKey.startsWith('eyJ')) {
    const claims = JSON.parse(Buffer.from(publicKey.split('.')[1] ?? '', 'base64url').toString('utf8')) as { role?: string };
    if (claims.role !== 'anon') throw new Error('Las pruebas no admiten claves privilegiadas.');
  }
  return { url: url.origin, publicKey };
}

export async function authenticatedClient(role: LocalAccount) {
  const { url, publicKey } = configuration();
  const { accounts } = localFixture();
  const db = createClient(url, publicKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { fetch: (input, init) => {
      loopback(typeof input === 'string' ? input : input instanceof URL ? input.href : input.url);
      return fetch(input, { ...init, redirect: 'error', signal: AbortSignal.timeout(15_000) });
    } },
  });
  const { error } = await db.auth.signInWithPassword({ email: accounts[role].email, password: accounts[role].password });
  if (error) throw new Error(`No se pudo autenticar la cuenta sintética ${role}.`);
  return db;
}

export function accountPortal(role: LocalAccount) { return role === 'master' ? 'master' : role.startsWith('customer') ? 'cliente' : 'comercio'; }

export async function login(page: Page, role: LocalAccount) {
  const { accounts } = localFixture();
  const portal = accountPortal(role);
  await page.goto(`/${portal}/login`);
  await expect(page.getByRole('heading', { name: 'Bienvenido de nuevo' })).toBeVisible();
  loopback(page.url());
  await expect(page.getByLabel('Correo electrónico')).toBeEditable();
  await expect(page.getByLabel('Contraseña', { exact: true })).toBeEditable();
  // No captured traces or screenshots; redact any failed fill diagnostics.
  try {
    await page.getByLabel('Correo electrónico').fill(accounts[role].email);
    await page.getByLabel('Contraseña', { exact: true }).fill(accounts[role].password);
    await page.getByRole('button', { name: 'Iniciar sesión', exact: true }).click();
    await page.waitForURL(`**/${portal}`);
  } catch {
    await page.getByLabel('Contraseña', { exact: true }).fill('').catch(() => {});
    throw new Error(`No se pudo completar el inicio de sesión de ${role}; no se registran sus credenciales.`);
  }
  await expect(page.getByRole('heading', { name: portal === 'master' ? 'CRM maestro protegido' : portal === 'cliente' ? 'Mis servicios' : 'Mis comercios', exact: true })).toBeVisible();
}

/** RFC 6238: SHA-1, six digits and a 30-second period, as used by local Auth. */
export function totp(secret: string, now = Date.now()): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = '';
  for (const character of secret.toUpperCase().replace(/=+$/, '')) {
    const index = alphabet.indexOf(character);
    if (index < 0) throw new Error('El autenticador local devolvió un secreto inválido.');
    bits += index.toString(2).padStart(5, '0');
  }
  const bytes = [];
  for (let offset = 0; offset + 8 <= bits.length; offset += 8) bytes.push(parseInt(bits.slice(offset, offset + 8), 2));
  const counter = Buffer.alloc(8);
  counter.writeBigUInt64BE(BigInt(Math.floor(now / 30_000)));
  const digest = createHmac('sha1', Buffer.from(bytes)).update(counter).digest();
  const offset = digest[digest.length - 1]! & 15;
  return String((digest.readUInt32BE(offset) & 0x7fffffff) % 1_000_000).padStart(6, '0');
}

export async function temporaryTotp(role: 'adminA' | 'master') {
  const db = await authenticatedClient(role);
  const listed = await db.auth.mfa.listFactors();
  if (listed.error || listed.data.totp.some(factor => factor.status === 'verified')) {
    await db.auth.signOut({ scope: 'local' });
    throw new Error(`La cuenta ${role} necesita un perfil local sin factores previos; las pruebas no eliminan factores ajenos.`);
  }
  const enrolled = await db.auth.mfa.enroll({ factorType: 'totp', friendlyName: `local-e2e-${randomUUID()}` });
  if (enrolled.error || !enrolled.data) {
    await db.auth.signOut({ scope: 'local' });
    throw new Error('No se pudo inscribir el autenticador TOTP local.');
  }
  const { id: factorId, totp: factor } = enrolled.data;
  const firstWindow = Math.floor(Date.now() / 30_000);
  const verified = await db.auth.mfa.challengeAndVerify({ factorId, code: totp(factor.secret) });
  if (verified.error) {
    await db.auth.mfa.unenroll({ factorId });
    await db.auth.signOut({ scope: 'local' });
    throw new Error('No se pudo verificar el factor TOTP local; comprueba el reloj del sistema.');
  }
  return {
    async verifyInBrowser(page: Page) {
      // Enabling the first factor invalidates older AAL1 sessions in local Auth.
      // Start a fresh password session before testing the actual browser challenge.
      await login(page, role);
      await page.goto(`/${accountPortal(role)}/security`);
      await expect(page.getByRole('heading', { name: 'Seguridad de la cuenta' })).toBeVisible();
      await expect(page.getByText('aal1', { exact: true })).toBeVisible();
      // Auth rejects reuse of an already consumed TOTP, even in another session.
      const wait = (firstWindow + 1) * 30_000 + 1_500 - Date.now();
      if (wait > 0) await new Promise(resolve => setTimeout(resolve, wait));
      try {
        await page.getByLabel('Código de seis dígitos').fill(totp(factor.secret));
        await page.getByRole('button', { name: 'Verificar código' }).click();
      } catch { throw new Error('No se pudo enviar el código TOTP local; el código no se registra.'); }
      await expect(page.getByText('Verificación completada.', { exact: true })).toBeVisible();
      await expect(page.locator('strong').filter({ hasText: /^aal2$/ })).toBeVisible();
      await expect(page.getByLabel('Código de seis dígitos')).toHaveValue('');
    },
    async cleanup() {
      // Only the factor created above is removed, using this user's real AAL2 session.
      const removed = await db.auth.mfa.unenroll({ factorId });
      await db.auth.signOut({ scope: 'local' });
      if (removed.error) throw new Error(`No se pudo retirar el factor temporal de ${role}; requiere revisión local.`);
    },
  };
}
