import { DomainError } from './errors';
export function text(value: unknown, field: string, min: number, max: number): string {
  if (typeof value !== 'string') throw new DomainError('VALIDATION', `${field}: texto requerido.`);
  const result = value.trim();
  if (result.length < min || result.length > max || /[\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(result)) {
    throw new DomainError('VALIDATION', `${field}: longitud o caracteres no válidos.`);
  }
  return result;
}
export function uuid(value: unknown, field = 'Identificador'): string {
  if (typeof value !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)) {
    throw new DomainError('VALIDATION', `${field}: UUID no válido.`);
  }
  return value.toLowerCase();
}
export function slug(value: unknown): string {
  const result = text(value, 'URL del comercio', 3, 48);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(result) || ['admin','api','auth','login','master','app','demo'].includes(result)) {
    throw new DomainError('VALIDATION', 'URL reservada o no válida.');
  }
  return result;
}
export function safeReturnPath(value: unknown): string {
  if (typeof value !== 'string' || !/^\/app(?:[/?]|$)/.test(value) || /[\\\r\n]/.test(value)) return '/app';
  return value;
}
export function isSameOrigin(actual: string | null, expected: string): boolean {
  if (!actual) return false;
  try { return new URL(actual).origin === new URL(expected).origin && actual === new URL(actual).origin; }
  catch { return false; }
}
