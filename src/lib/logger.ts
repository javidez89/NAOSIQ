import 'server-only';
import { randomUUID } from 'node:crypto';

type ErrorShape = { name?: unknown; code?: unknown; digest?: unknown };

/** Emits a bounded JSON record. Error messages, stacks, form values and tokens are excluded. */
export function logUnexpected(event: string, error: unknown): string {
  const correlationId = randomUUID();
  const value = error && typeof error === 'object' ? error as ErrorShape : {};
  const record = {
    timestamp: new Date().toISOString(),
    level: 'error',
    event: event.replace(/[^a-z0-9._-]/gi, '_').slice(0, 80),
    correlationId,
    errorName: typeof value.name === 'string' ? value.name.slice(0, 80) : 'UnknownError',
    errorCode: typeof value.code === 'string' ? value.code.slice(0, 40) : undefined,
    digest: typeof value.digest === 'string' ? value.digest.slice(0, 80) : undefined,
  };
  console.error(JSON.stringify(record));
  return correlationId;
}
