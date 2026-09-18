import { DomainError } from './errors';
import { assertPermission, type Actor } from './identity';
import { text, uuid } from './validation';
export const statuses = ['created','in_repair','waiting_parts','software_installation','backup_completed','completed'] as const;
export type RepairStatus = typeof statuses[number];
export const statusLabels: Record<RepairStatus,string> = {
  created:'Creado', in_repair:'En reparación', waiting_parts:'Pendiente de repuesto',
  software_installation:'Instalación de software', backup_completed:'Backup completado', completed:'Completado',
};
export const transitions: Record<RepairStatus, readonly RepairStatus[]> = {
  created:['in_repair','software_installation'],
  in_repair:['waiting_parts','software_installation','backup_completed','completed'],
  waiting_parts:['in_repair'],
  software_installation:['in_repair','backup_completed','completed'],
  backup_completed:['in_repair','completed'], completed:[],
};
export interface Repair { id:string; tenantId:string; customerUserId:string|null; assignedTo:string|null; status:RepairStatus; version:number; device:string; issue:string; }
export function canReadRepair(actor:Actor, repair:Repair):boolean {
  try { assertPermission(actor,'repair.read',repair.tenantId); } catch { return false; }
  return actor.role === 'customer' ? repair.customerUserId === actor.userId
    : actor.role === 'technician' ? repair.assignedTo === actor.userId : true;
}
export function transitionRepair(actor:Actor, repair:Repair, next:RepairStatus, expectedVersion:number):Repair {
  assertPermission(actor,'repair.transition',repair.tenantId);
  if (!canReadRepair(actor,repair)) throw new DomainError('FORBIDDEN','Esta orden no está asignada a tu usuario.');
  if (repair.version !== expectedVersion) throw new DomainError('CONFLICT','La orden cambió. Recarga antes de continuar.');
  if (!transitions[repair.status].includes(next)) throw new DomainError('VALIDATION','Transición de estado no permitida.');
  return {...repair,status:next,version:repair.version+1};
}
export function parseRepairInput(input:Record<string,unknown>) {
  return { customerId:uuid(input.customerId,'Cliente'),device:text(input.device,'Equipo',2,160),issue:text(input.issue,'Falla reportada',5,2000) };
}
