begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public,extensions;
select no_plan();

insert into auth.users(id,instance_id,aud,role,email,email_confirmed_at,created_at,updated_at) values
('41000000-0000-4000-8000-000000000001','00000000-0000-0000-0000-000000000000','authenticated','authenticated','p02-admin-a@example.invalid',now(),now(),now()),
('41000000-0000-4000-8000-000000000002','00000000-0000-0000-0000-000000000000','authenticated','authenticated','p02-admin-b@example.invalid',now(),now(),now()),
('41000000-0000-4000-8000-000000000003','00000000-0000-0000-0000-000000000000','authenticated','authenticated','p02-advisor-a@example.invalid',now(),now(),now()),
('41000000-0000-4000-8000-000000000004','00000000-0000-0000-0000-000000000000','authenticated','authenticated','p02-tech-a@example.invalid',now(),now(),now()),
('41000000-0000-4000-8000-000000000005','00000000-0000-0000-8000-000000000000','authenticated','authenticated','p02-extra-a@example.invalid',now(),now(),now()),
('41000000-0000-4000-8000-000000000006','00000000-0000-0000-0000-000000000000','authenticated','authenticated','p02-master@example.invalid',now(),now(),now());

insert into public.tenants(id,name,slug) values
('41aaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','P02 Comercio A','p02-comercio-a'),
('41bbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','P02 Comercio B','p02-comercio-b');
insert into public.subscriptions(tenant_id,plan_code,status,current_period_end) values
('41aaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','basic','active',now()+interval '30 days'),
('41bbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','basic','active',now()+interval '30 days');
insert into public.memberships(tenant_id,user_id,role) values
('41aaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','41000000-0000-4000-8000-000000000001','admin'),
('41bbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','41000000-0000-4000-8000-000000000002','admin'),
('41aaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','41000000-0000-4000-8000-000000000003','advisor'),
('41aaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','41000000-0000-4000-8000-000000000004','technician');
insert into private.platform_admins(user_id) values('41000000-0000-4000-8000-000000000006');

select set_config('request.jwt.claims','{"sub":"41000000-0000-4000-8000-000000000001","role":"authenticated","aal":"aal1"}',true);
set local role authenticated;
select lives_ok($$select public.grant_delegation(
  '41aaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','41000000-0000-4000-8000-000000000004',
  'orders.intake.confirm','43000000-0000-4000-8000-000000000001',now()+interval '7 days',
  '42000000-0000-4000-8000-000000000001'
)$$,'Admin A grants a bounded non-financial permission');
select lives_ok($$select public.grant_delegation(
  '41aaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','41000000-0000-4000-8000-000000000004',
  'orders.intake.confirm','43000000-0000-4000-8000-000000000001',now()+interval '7 days',
  '42000000-0000-4000-8000-000000000001'
)$$,'Identical grant retry is idempotent');
select is((select count(*) from public.delegations),1::bigint,'Retry creates only one delegation');
select throws_ok($$select public.grant_delegation(
  '41aaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','41000000-0000-4000-8000-000000000004',
  'inventory.consume',null,now()+interval '7 days','42000000-0000-4000-8000-000000000001'
)$$,'23505',null,'Changed payload cannot reuse request id');
select throws_ok($$select public.grant_delegation(
  '41bbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','41000000-0000-4000-8000-000000000004',
  'orders.intake.confirm',null,now()+interval '7 days','42000000-0000-4000-8000-000000000002'
)$$,'42501',null,'Admin cannot grant across tenants');
select throws_ok($$select public.grant_delegation(
  '41aaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','41000000-0000-4000-8000-000000000003',
  'payments.confirm',null,now()+interval '7 days','42000000-0000-4000-8000-000000000003'
)$$,'42501',null,'Financial delegation remains disabled');
select throws_ok($$select public.grant_delegation(
  '41aaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','41000000-0000-4000-8000-000000000004',
  'orders.intake.confirm',null,now()-interval '1 minute','42000000-0000-4000-8000-000000000004'
)$$,'23514',null,'Expired delegation is rejected');
select lives_ok($$select public.set_membership(
  '41aaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','41000000-0000-4000-8000-000000000005','advisor',true
)$$,'Admin can add a verified member in own tenant');
select throws_ok($$select public.set_membership(
  '41bbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','41000000-0000-4000-8000-000000000005','advisor',true
)$$,'42501',null,'Tenant id in body does not grant membership access');
select ok((select count(*)>0 from public.audit_events where action='delegation.granted' and actor_id='41000000-0000-4000-8000-000000000001'),'Real grant actor is audited');

select set_config('request.jwt.claims','{"sub":"41000000-0000-4000-8000-000000000004","role":"authenticated","aal":"aal1"}',true);
select is((select count(*) from public.delegations),1::bigint,'Grantee sees own tenant delegation');
select is(public.has_delegation(
  '41aaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','orders.intake.confirm','43000000-0000-4000-8000-000000000001'
),true,'Active resource delegation is usable');
select is(public.has_delegation(
  '41bbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','orders.intake.confirm','43000000-0000-4000-8000-000000000001'
),false,'Delegation cannot cross tenant');
select throws_ok($$insert into public.operation_jobs(tenant_id,requested_by,operation_id,kind) values(
  '41aaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','41000000-0000-4000-8000-000000000004',gen_random_uuid(),'test'
)$$,'42501',null,'API cannot forge a job');
select throws_ok($$insert into public.tenant_files(tenant_id,owner_id,storage_key) values(
  '41aaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','41000000-0000-4000-8000-000000000004','private/test.txt'
)$$,'42501',null,'API cannot forge file metadata');

select set_config('request.jwt.claims','{"sub":"41000000-0000-4000-8000-000000000003","role":"authenticated","aal":"aal1"}',true);
select throws_ok($$select public.grant_delegation(
  '41aaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','41000000-0000-4000-8000-000000000004',
  'documents.read',null,now()+interval '1 day','42000000-0000-4000-8000-000000000005'
)$$,'42501',null,'Advisor cannot grant permissions');
select is((select count(*) from public.delegations),0::bigint,'Unrelated advisor cannot list another member delegation');

select set_config('request.jwt.claims','{"sub":"41000000-0000-4000-8000-000000000001","role":"authenticated","aal":"aal1"}',true);
select throws_ok($$select public.revoke_delegation(
  '41aaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',(select id from public.delegations limit 1),99
)$$,'40001',null,'Delegation revoke enforces version');
select is(public.revoke_delegation(
  '41aaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',(select id from public.delegations limit 1),1
),2,'Admin revokes with expected version');

select set_config('request.jwt.claims','{"sub":"41000000-0000-4000-8000-000000000004","role":"authenticated","aal":"aal1"}',true);
select is(public.has_delegation(
  '41aaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','orders.intake.confirm','43000000-0000-4000-8000-000000000001'
),false,'Revoked delegation is no longer usable');

reset role;
select * from finish();
rollback;
