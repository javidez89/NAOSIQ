export interface Subscription { status:'trialing'|'active'|'past_due'|'suspended'|'cancelled'; periodEnd:string; }
/** Proposed default: no grace period, read-only after expiry. Policy must be approved. */
export function canOperate(status:'active'|'suspended'|'closed',subscription:Subscription,now:Date):boolean {
  const end=Date.parse(subscription.periodEnd);
  return status==='active' && ['trialing','active'].includes(subscription.status) && Number.isFinite(end) && end>now.getTime();
}
export const basicEntitlements=Object.freeze({whatsapp:true,manualPayments:true,customerPortal:true,receiptVoucher:true,paymentVoucher:true});
