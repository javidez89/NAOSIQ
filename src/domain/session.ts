import { DomainError } from './errors';

export const sessionPolicy = {
  decision: 'D04',
  status: 'pending',
  idleWarningMinutes: null,
  idleExpiryMinutes: null,
  absoluteExpiryHours: null,
  elevationMinutes: null,
} as const;

export type OAuthCallbackOutcome = 'exchange' | 'cancelled' | 'failed';

export function oauthCallbackOutcome(code: unknown, error: unknown): OAuthCallbackOutcome {
  if (error === 'access_denied') return 'cancelled';
  if (typeof error === 'string' && error.length > 0) return 'failed';
  return typeof code === 'string' && code.length > 0 ? 'exchange' : 'failed';
}

export function safePortalReturnPath(value: unknown, portalBase: string): string {
  if (!['/master','/comercio','/cliente'].includes(portalBase)) {
    throw new DomainError('VALIDATION', 'Portal no válido.');
  }
  if (typeof value !== 'string' || /[\\\r\n\u0000]/.test(value) || value.startsWith('//')) return portalBase;
  let parsed: URL;
  try { parsed = new URL(value, 'https://return.local'); }
  catch { return portalBase; }
  if (parsed.origin !== 'https://return.local') return portalBase;
  if (parsed.pathname !== portalBase && !parsed.pathname.startsWith(`${portalBase}/`)) return portalBase;
  if (parsed.pathname === `${portalBase}/login`) return portalBase;
  return `${parsed.pathname}${parsed.search}${parsed.hash}`;
}
