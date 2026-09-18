import { DomainError } from './errors';
import { assertMinor } from './money';
import { assertPermission, type Actor } from './identity';
export const manualMethods=['cash','breb','nequi','bank_transfer'] as const;
export type ManualMethod=typeof manualMethods[number];
export interface Payment { id:string; tenantId:string; repairId:string; amountMinor:number; currency:'COP'; method:ManualMethod; status:'pending'|'confirmed'|'reversed'; idempotencyKey:string; }
export function validatePayment(payment:Payment):Payment {
  assertMinor(payment.amountMinor);
  if (!payment.amountMinor || payment.currency!=='COP' || !manualMethods.includes(payment.method)) throw new DomainError('VALIDATION','Pago no válido.');
  if (!/^[a-zA-Z0-9_-]{16,80}$/.test(payment.idempotencyKey)) throw new DomainError('VALIDATION','Clave de idempotencia no válida.');
  return payment;
}
export function confirmPayment(actor:Actor,payment:Payment):Payment {
  assertPermission(actor,'payment.confirm',payment.tenantId);
  validatePayment(payment);
  if (payment.status==='reversed') throw new DomainError('CONFLICT','Un pago revertido no se confirma nuevamente.');
  return payment.status==='confirmed' ? payment : {...payment,status:'confirmed'};
}
/** Reference idempotency rule; durable atomic deduplication is implemented in PostgreSQL. */
export function samePaymentIntent(a:Payment,b:Payment):boolean {
  return a.tenantId===b.tenantId && a.repairId===b.repairId && a.currency===b.currency && a.amountMinor===b.amountMinor && a.method===b.method;
}
export function paidTotal(payments:readonly Payment[]):number {
  return payments.filter(p=>p.status==='confirmed').reduce((sum,p)=>assertMinor(sum+validatePayment(p).amountMinor),0);
}
