import test from 'node:test';
import assert from 'node:assert/strict';
import {can,roles} from '../../.build-domain/domain/identity.js';
import {assertDelegationGrant,canUseDelegation,resolveDelegationRetry} from '../../.build-domain/domain/delegations.js';
import {statuses,transitions,transitionRepair,canReadRepair,parseRepairInput} from '../../.build-domain/domain/repairs.js';
import {parseMoney,sumMinor,MAX_MINOR} from '../../.build-domain/domain/money.js';
import {confirmPayment,paidTotal,samePaymentIntent} from '../../.build-domain/domain/payments.js';
import {safeReturnPath,slug,isSameOrigin} from '../../.build-domain/domain/validation.js';
import {canOperate,basicEntitlements} from '../../.build-domain/domain/billing.js';
import {objectPath,validUpload} from '../../.build-domain/domain/storage.js';
import {nextAttemptAt,recoverAfterTimeout,retryDelayMs} from '../../.build-domain/domain/operations.js';
import {oauthCallbackOutcome,safePortalReturnPath,sessionPolicy} from '../../.build-domain/domain/session.js';
const actor=(role='admin',overrides={})=>({userId:'user-a',tenantId:'tenant-a',role,aal:'aal2',active:true,...overrides});
const repair={id:'repair-a',tenantId:'tenant-a',customerUserId:'customer-a',assignedTo:'tech-a',status:'created',version:1,device:'Portatil',issue:'No enciende'};
const payment={id:'payment-a',tenantId:'tenant-a',repairId:'repair-a',amountMinor:15000000,currency:'COP',method:'nequi',status:'pending',idempotencyKey:'unique-request-0001'};
for(const role of roles.filter(r=>r!=='super_user')) test(`tenant isolation: ${role}`,()=>assert.equal(can(actor(role),'repair.read','tenant-b'),false));
for(const role of roles) test(`inactive actor denied: ${role}`,()=>assert.equal(can(actor(role,{active:false}),'repair.read','tenant-a'),false));
for(const permission of ['payment.read','payment.record','payment.confirm','roles.manage']) test(`advisor denied ${permission}`,()=>assert.equal(can(actor('advisor'),permission,'tenant-a'),false));
test('super user requires MFA',()=>assert.equal(can(actor('super_user',{aal:'aal1'}),'tenant.manage','tenant-b'),false));
test('super user with MFA can govern tenants',()=>assert.equal(can(actor('super_user'),'tenant.manage','tenant-b'),true));
test('admin can manage roles only in own tenant',()=>{
  assert.equal(can(actor(),'roles.manage','tenant-a'),true);
  assert.equal(can(actor(),'roles.manage','tenant-b'),false);
});

const delegationDraft={tenantId:'tenant-a',grantedTo:'tech-a',granteeRole:'technician',permission:'orders.intake.confirm',resourceId:'repair-a',expiresAt:new Date('2026-10-01T00:00:00Z'),requestId:'delegation-request-a'};
const delegationRecord={...delegationDraft,id:'delegation-a',active:true,validFrom:new Date('2026-09-01T00:00:00Z'),version:1};
test('admin can grant a bounded non-financial delegation',()=>assert.doesNotThrow(()=>assertDelegationGrant(actor(),delegationDraft,new Date('2026-09-14T00:00:00Z'))));
test('advisor cannot grant a delegation',()=>assert.throws(()=>assertDelegationGrant(actor('advisor'),delegationDraft,new Date('2026-09-14T00:00:00Z')),{code:'FORBIDDEN'}));
test('delegation cannot cross tenant',()=>assert.throws(()=>assertDelegationGrant(actor(),{...delegationDraft,tenantId:'tenant-b'},new Date('2026-09-14T00:00:00Z')),{code:'FORBIDDEN'}));
test('delegation expiry is bounded',()=>assert.throws(()=>assertDelegationGrant(actor(),{...delegationDraft,expiresAt:new Date('2027-01-01T00:00:00Z')},new Date('2026-09-14T00:00:00Z')),{code:'VALIDATION'}));
test('identical delegation retry resolves the original record',()=>assert.equal(resolveDelegationRetry(delegationRecord,delegationDraft),'delegation-a'));
test('altered delegation retry conflicts',()=>assert.throws(()=>resolveDelegationRetry(delegationRecord,{...delegationDraft,resourceId:'repair-b'}),{code:'CONFLICT'}));
test('delegation use checks actor, tenant, resource and time',()=>{
  const technician=actor('technician',{userId:'tech-a'});
  assert.equal(canUseDelegation(delegationRecord,technician,'tenant-a','orders.intake.confirm','repair-a',new Date('2026-09-14T00:00:00Z')),true);
  assert.equal(canUseDelegation(delegationRecord,technician,'tenant-b','orders.intake.confirm','repair-a',new Date('2026-09-14T00:00:00Z')),false);
  assert.equal(canUseDelegation(delegationRecord,technician,'tenant-a','orders.intake.confirm','repair-a',new Date('2026-10-02T00:00:00Z')),false);
});
test('technician reads assigned repair',()=>assert.equal(canReadRepair(actor('technician',{userId:'tech-a'}),repair),true));
test('technician cannot read someone else assignment',()=>assert.equal(canReadRepair(actor('technician'),repair),false));
test('customer reads own repair',()=>assert.equal(canReadRepair(actor('customer',{userId:'customer-a'}),repair),true));
test('customer cannot read another customer',()=>assert.equal(canReadRepair(actor('customer'),repair),false));
for(const from of statuses) for(const to of statuses) test(`transition ${from} -> ${to}`,()=>{
 const source={...repair,status:from};
 if(transitions[from].includes(to)) { const next=transitionRepair(actor(),source,to,1);assert.equal(next.status,to);assert.equal(next.version,2);assert.equal(source.status,from); }
 else assert.throws(()=>transitionRepair(actor(),source,to,1),{code:'VALIDATION'});
});
test('optimistic concurrency conflict',()=>assert.throws(()=>transitionRepair(actor(),repair,'in_repair',0),{code:'CONFLICT'}));
test('advisor cannot change technical state',()=>assert.throws(()=>transitionRepair(actor('advisor'),repair,'in_repair',1),{code:'FORBIDDEN'}));
test('customer cannot change technical state',()=>assert.throws(()=>transitionRepair(actor('customer'),repair,'in_repair',1),{code:'FORBIDDEN'}));
for(const [input,expected] of [['0',0],['0.01',1],['150000',15000000],['23.5',2350],['9999999999.99',MAX_MINOR]]) test(`parse amount ${input}`,()=>assert.equal(parseMoney(input),expected));
for(const input of ['-1','NaN','Infinity','1e3','1,000','01','1.001','10000000000',' 10','']) test(`reject amount ${input}`,()=>assert.throws(()=>parseMoney(input),{code:'VALIDATION'}));
test('overflow is rejected',()=>assert.throws(()=>sumMinor([MAX_MINOR,1]),{code:'VALIDATION'}));
test('sum cents exact',()=>assert.equal(sumMinor([10,20]),30));
test('pending transfer not counted',()=>assert.equal(paidTotal([payment]),0));
test('confirmed payment counted',()=>assert.equal(paidTotal([confirmPayment(actor(),payment)]),15000000));
test('payment confirmation idempotent',()=>{const p=confirmPayment(actor(),payment);assert.strictEqual(confirmPayment(actor(),p),p);});
test('financial action requires MFA',()=>assert.throws(()=>confirmPayment(actor('admin',{aal:'aal1'}),payment),{code:'FORBIDDEN'}));
test('advisor cannot confirm payment',()=>assert.throws(()=>confirmPayment(actor('advisor'),payment),{code:'FORBIDDEN'}));
test('reversed payment cannot reconfirm',()=>assert.throws(()=>confirmPayment(actor(),{...payment,status:'reversed'}),{code:'CONFLICT'}));
test('idempotency different amount is different intent',()=>assert.equal(samePaymentIntent(payment,{...payment,amountMinor:1}),false));
for(const path of ['https://evil.test','//evil.test','/\\evil.test','/admin','/app\\evil','/app\r\nx']) test(`unsafe redirect ${JSON.stringify(path)}`,()=>assert.equal(safeReturnPath(path),'/app'));
test('safe redirect preserved',()=>assert.equal(safeReturnPath('/app/orders'),'/app/orders'));
test('OAuth cancellation is distinct from exchange failure',()=>{
  assert.equal(oauthCallbackOutcome(null,'access_denied'),'cancelled');
  assert.equal(oauthCallbackOutcome('code',null),'exchange');
  assert.equal(oauthCallbackOutcome(null,'server_error'),'failed');
});
for(const path of ['https://evil.test/x','//evil.test/x','/master','/cliente\\x','/cliente/login','/cliente\r\nx']) {
  test(`unsafe portal return ${JSON.stringify(path)}`,()=>assert.equal(safePortalReturnPath(path,'/cliente'),'/cliente'));
}
test('safe portal return preserves authorized task',()=>assert.equal(safePortalReturnPath('/cliente/t/a?tab=docs#latest','/cliente'),'/cliente/t/a?tab=docs#latest'));
test('D04 session durations remain unset',()=>{
  assert.equal(sessionPolicy.status,'pending');
  assert.equal(sessionPolicy.idleExpiryMinutes,null);
  assert.equal(sessionPolicy.absoluteExpiryHours,null);
});
test('origin check exact',()=>{assert.equal(isSameOrigin('https://good.test','https://good.test'),true);assert.equal(isSameOrigin('https://good.test.evil','https://good.test'),false);assert.equal(isSameOrigin(null,'https://good.test'),false);});
for(const value of ['admin','../x','Uppercase','a--b','ab','-bad']) test(`reject slug ${value}`,()=>assert.throws(()=>slug(value),{code:'VALIDATION'}));
test('valid tenant slug',()=>assert.equal(slug('taller-javi'),'taller-javi'));
const now=new Date('2026-09-08T12:00:00Z');
test('active subscription operates',()=>assert.equal(canOperate('active',{status:'active',periodEnd:'2026-10-08T12:00:00Z'},now),true));
test('expiry exact boundary denied',()=>assert.equal(canOperate('active',{status:'active',periodEnd:now.toISOString()},now),false));
for(const state of ['past_due','suspended','cancelled']) test(`subscription ${state} blocked`,()=>assert.equal(canOperate('active',{status:state,periodEnd:'2027-01-01'},now),false));
test('bad expiry fails closed',()=>assert.equal(canOperate('active',{status:'active',periodEnd:'bad'},now),false));
test('basic always has WhatsApp',()=>assert.equal(basicEntitlements.whatsapp,true));
test('private object path is tenant scoped',()=>{const id='00000000-0000-4000-8000-000000000001';assert.equal(objectPath(id,id,id,'jpg'),`${id}/${id}/${id}.jpg`);});
test('path traversal blocked',()=>assert.throws(()=>objectPath('../x','../x','../x','jpg'),{code:'VALIDATION'}));
test('SVG not accepted',()=>assert.equal(validUpload('image/svg+xml',100),false));
test('oversize attachment blocked',()=>assert.equal(validUpload('image/jpeg',6*1024*1024),false));
test('valid photo accepted',()=>assert.equal(validUpload('image/jpeg',1000),true));
test('repair input rejects missing customer',()=>assert.throws(()=>parseRepairInput({device:'Portatil',issue:'No enciende'}),{code:'VALIDATION'}));
test('timeout requires reconciliation instead of blind retry',()=>assert.deepEqual(recoverAfterTimeout('operation-a'),{operationId:'operation-a',status:'reconciliation_required',retryAllowed:false}));
test('timeout recovery requires original operation id',()=>assert.throws(()=>recoverAfterTimeout('  '),{code:'VALIDATION'}));
test('job retry grows exponentially and is capped',()=>{assert.equal(retryDelayMs(0),1000);assert.equal(retryDelayMs(3),8000);assert.equal(retryDelayMs(30),300000);});
test('job retry rejects invalid attempt',()=>assert.throws(()=>retryDelayMs(-1),{code:'VALIDATION'}));
test('next job attempt uses server supplied time',()=>assert.equal(nextAttemptAt(new Date('2026-09-14T00:00:00Z'),2).toISOString(),'2026-09-14T00:00:04.000Z'));
