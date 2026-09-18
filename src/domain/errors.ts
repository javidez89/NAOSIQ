export type ErrorCode = 'VALIDATION' | 'FORBIDDEN' | 'NOT_FOUND' | 'CONFLICT' | 'SUSPENDED';
export class DomainError extends Error {
  constructor(public readonly code: ErrorCode, message: string) { super(message); this.name = 'DomainError'; }
}
