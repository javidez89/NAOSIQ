import { DomainError } from './errors';

export type OperationStatus = 'accepted' | 'processing' | 'succeeded' | 'failed' | 'reconciliation_required';
export type JobStatus = 'queued' | 'running' | 'succeeded' | 'failed';

export interface OperationRecord<Result = unknown> {
  id: string;
  tenantId: string;
  status: OperationStatus;
  result?: Result;
  updatedAt: string;
}

export interface JobRecord<Payload = unknown> {
  id: string;
  kind: string;
  status: JobStatus;
  attempts: number;
  availableAt: string;
  payload: Payload;
}

export interface OutboxEvent<Payload = unknown> {
  id: string;
  tenantId: string;
  eventType: string;
  aggregateId: string;
  payload: Payload;
  createdAt: string;
}

export interface OperationRecovery {
  operationId: string;
  status: 'reconciliation_required';
  retryAllowed: false;
}

/** A client timeout is an unknown result. Callers must query the original operation. */
export function recoverAfterTimeout(operationId: string): OperationRecovery {
  if (!operationId.trim()) throw new DomainError('VALIDATION', 'La operación original es obligatoria.');
  return { operationId, status: 'reconciliation_required', retryAllowed: false };
}

/** Deterministic exponential delay for future workers; no worker is enabled in P01. */
export function retryDelayMs(attempt: number, baseMs = 1_000, maximumMs = 300_000): number {
  if (!Number.isSafeInteger(attempt) || attempt < 0 || baseMs < 1 || maximumMs < baseMs) {
    throw new DomainError('VALIDATION', 'Configuración de reintento no válida.');
  }
  return Math.min(maximumMs, baseMs * (2 ** Math.min(attempt, 30)));
}

export function nextAttemptAt(now: Date, attempt: number): Date {
  if (!Number.isFinite(now.getTime())) throw new DomainError('VALIDATION', 'Instante no válido.');
  return new Date(now.getTime() + retryDelayMs(attempt));
}
