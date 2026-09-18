import { DomainError } from './errors';
import { can, type Actor, type Role } from './identity';

export const delegablePermissions = [
  'orders.intake.confirm',
  'orders.delivery.confirm',
  'quotes.publish',
  'documents.read',
  'documents.request',
  'inventory.consume',
] as const;

export type DelegablePermission = typeof delegablePermissions[number];

const eligibleRoles: Record<DelegablePermission, readonly Role[]> = {
  'orders.intake.confirm': ['technician'],
  'orders.delivery.confirm': ['advisor', 'technician'],
  'quotes.publish': ['advisor', 'technician'],
  'documents.read': ['advisor', 'technician'],
  'documents.request': ['advisor', 'technician'],
  'inventory.consume': ['technician'],
};

export interface DelegationDraft {
  tenantId: string;
  grantedTo: string;
  granteeRole: Role;
  permission: DelegablePermission;
  resourceId?: string;
  expiresAt: Date;
  requestId: string;
}

export interface DelegationRecord extends DelegationDraft {
  id: string;
  active: boolean;
  validFrom: Date;
  version: number;
}

export function assertDelegationGrant(actor: Actor, draft: DelegationDraft, now: Date): void {
  if (!can(actor, 'roles.manage', draft.tenantId)) {
    throw new DomainError('FORBIDDEN', 'No tienes permiso para delegar en este comercio.');
  }
  if (actor.userId === draft.grantedTo) {
    throw new DomainError('VALIDATION', 'No puedes delegarte permisos a ti mismo.');
  }
  if (!eligibleRoles[draft.permission].includes(draft.granteeRole)) {
    throw new DomainError('FORBIDDEN', 'El rol seleccionado no puede recibir este permiso.');
  }
  const duration = draft.expiresAt.getTime() - now.getTime();
  if (duration <= 0 || duration > 90 * 24 * 60 * 60 * 1000) {
    throw new DomainError('VALIDATION', 'La delegación debe vencer dentro de los próximos 90 días.');
  }
}

export function resolveDelegationRetry(existing: DelegationRecord, draft: DelegationDraft): string {
  const same = existing.tenantId === draft.tenantId
    && existing.grantedTo === draft.grantedTo
    && existing.granteeRole === draft.granteeRole
    && existing.permission === draft.permission
    && existing.resourceId === draft.resourceId
    && existing.expiresAt.getTime() === draft.expiresAt.getTime()
    && existing.requestId === draft.requestId;
  if (!same) throw new DomainError('CONFLICT', 'La operación ya fue usada con otros datos.');
  return existing.id;
}

export function canUseDelegation(
  record: DelegationRecord,
  actor: Actor,
  tenantId: string,
  permission: DelegablePermission,
  resourceId: string | undefined,
  now: Date,
): boolean {
  return actor.active
    && actor.tenantId === tenantId
    && actor.userId === record.grantedTo
    && record.tenantId === tenantId
    && record.permission === permission
    && record.active
    && record.validFrom.getTime() <= now.getTime()
    && record.expiresAt.getTime() > now.getTime()
    && (record.resourceId === undefined || record.resourceId === resourceId);
}
