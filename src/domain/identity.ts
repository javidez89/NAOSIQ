import { DomainError } from './errors';
export const roles = ['super_user', 'admin', 'advisor', 'technician', 'customer'] as const;
export type Role = typeof roles[number];
export type Permission = 'tenant.read' | 'tenant.manage' | 'customer.create' | 'repair.create' | 'repair.read' | 'repair.transition' | 'payment.read' | 'payment.record' | 'payment.confirm' | 'roles.manage' | 'voucher.receipt' | 'voucher.payment';
export interface Actor { userId: string; role: Role; tenantId?: string; active: boolean; aal: 'aal1' | 'aal2'; }
const permissions: Record<Role, readonly Permission[]> = {
  super_user: ['tenant.read','tenant.manage','customer.create','repair.create','repair.read','repair.transition','payment.read','payment.record','payment.confirm','roles.manage','voucher.receipt','voucher.payment'],
  admin: ['tenant.read','customer.create','repair.create','repair.read','repair.transition','payment.read','payment.record','payment.confirm','roles.manage','voucher.receipt','voucher.payment'],
  advisor: ['tenant.read','customer.create','repair.create','repair.read','voucher.receipt'],
  technician: ['tenant.read','repair.read','repair.transition'],
  customer: ['repair.read','payment.read','voucher.receipt','voucher.payment'],
};
/** UI/domain helper only. Database RLS/RPC are the authoritative enforcement layer. */
export function can(actor: Actor, permission: Permission, tenantId: string): boolean {
  if (!actor.active) return false;
  if (actor.role === 'super_user') return actor.aal === 'aal2' && permissions.super_user.includes(permission);
  return actor.tenantId === tenantId && permissions[actor.role].includes(permission)
    && (permission !== 'payment.confirm' || actor.aal === 'aal2');
}
export function assertPermission(actor: Actor, permission: Permission, tenantId: string): void {
  if (!can(actor, permission, tenantId)) throw new DomainError('FORBIDDEN', 'No tienes permiso para esta operación.');
}
