begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public,extensions;
select no_plan();

insert into auth.users(id,instance_id,aud,role,email,email_confirmed_at,created_at,updated_at) values
('61000000-0000-4000-8000-000000000001','00000000-0000-0000-0000-000000000000','authenticated','authenticated','p04-master@example.invalid',now(),now(),now()),
('61000000-0000-4000-8000-000000000002','00000000-0000-0000-0000-000000000000','authenticated','authenticated','p04-admin@example.invalid',now(),now(),now());
insert into public.tenants(id,name,slug) values
('61aaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','P04 Comercio A','p04-comercio-a'),
('61bbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','P04 Comercio B','p04-comercio-b');
insert into public.subscriptions(tenant_id,plan_code,status,current_period_end) values
('61aaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','basic','active',now()+interval '30 days'),
('61bbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','basic','active',now()+interval '30 days');
insert into public.memberships(tenant_id,user_id,role) values
('61aaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','61000000-0000-4000-8000-000000000002','admin');
insert into private.platform_admins(user_id) values('61000000-0000-4000-8000-000000000001');

select set_config('request.jwt.claims','{"sub":"61000000-0000-4000-8000-000000000002","role":"authenticated","aal":"aal2"}',true);
set local role authenticated;
select throws_ok($$select public.start_master_control_context(
  '61aaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','Necesito revisar configuración','62000000-0000-4000-8000-000000000001'
)$$,'42501',null,'Tenant admin cannot start platform control');

select set_config('request.jwt.claims','{"sub":"61000000-0000-4000-8000-000000000001","role":"authenticated","aal":"aal1"}',true);
select throws_ok($$select public.start_master_control_context(
  '61aaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','Necesito revisar configuración','62000000-0000-4000-8000-000000000001'
)$$,'42501',null,'Platform control requires MFA');

select set_config('request.jwt.claims','{"sub":"61000000-0000-4000-8000-000000000001","role":"authenticated","aal":"aal2"}',true);
select lives_ok($$select public.start_master_control_context(
  '61aaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','Necesito revisar configuración','62000000-0000-4000-8000-000000000001'
)$$,'Super Usuario starts explicit control');
select is((select count(*) from public.master_control_contexts),1::bigint,'One control fact exists');
select lives_ok($$select public.start_master_control_context(
  '61aaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','Necesito revisar configuración','62000000-0000-4000-8000-000000000001'
)$$,'Identical control retry is idempotent');
select is((select count(*) from public.master_control_contexts),1::bigint,'Retry does not duplicate control');
select throws_ok($$select public.start_master_control_context(
  '61bbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','Necesito revisar configuración','62000000-0000-4000-8000-000000000001'
)$$,'23505',null,'Changed tenant cannot reuse request id');
select ok(public.has_master_control_context(
  '61aaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',(select id from public.master_control_contexts)
),'Matching actor and tenant can use context');
select is(public.has_master_control_context(
  '61bbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',(select id from public.master_control_contexts)
),false,'Context cannot cross tenant');
select throws_ok($$select public.end_master_control_context(
  '61aaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',(select id from public.master_control_contexts),99
)$$,'40001',null,'Closing control enforces version');
select is(public.end_master_control_context(
  '61aaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',(select id from public.master_control_contexts),1
),2,'Control closes with expected version');
select is(public.has_master_control_context(
  '61aaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',(select id from public.master_control_contexts)
),false,'Closed context cannot be recovered as active');
select ok((select count(*)=1 from public.audit_events where action='master.context.started' and actor_id='61000000-0000-4000-8000-000000000001'),'Start preserves real actor in audit');
select ok((select count(*)=1 from public.audit_events where action='master.context.ended' and actor_id='61000000-0000-4000-8000-000000000001'),'End preserves real actor in audit');

select lives_ok($$select public.provision_tenant_v2(
  'P04 Nuevo Comercio','p04-nuevo-comercio','61000000-0000-4000-8000-000000000002',
  now()+interval '14 days','62000000-0000-4000-8000-000000000002'
)$$,'Super Usuario provisions one recoverable tenant');
select lives_ok($$select public.provision_tenant_v2(
  'P04 Nuevo Comercio','p04-nuevo-comercio','61000000-0000-4000-8000-000000000002',
  now()+interval '14 days','62000000-0000-4000-8000-000000000002'
)$$,'Identical provisioning retry is idempotent');
select is((select count(*) from public.tenants where slug='p04-nuevo-comercio'),1::bigint,'Provisioning retry creates one tenant');
select throws_ok($$select public.provision_tenant_v2(
  'P04 Comercio Alterado','p04-nuevo-comercio','61000000-0000-4000-8000-000000000002',
  now()+interval '14 days','62000000-0000-4000-8000-000000000002'
)$$,'23505',null,'Changed provisioning cannot reuse request id');
select throws_ok($$select public.provision_tenant(
  'Alta insegura','p04-alta-insegura','61000000-0000-4000-8000-000000000002',now()+interval '14 days'
)$$,'42501',null,'Legacy non-idempotent provisioning is unavailable to API');

select * from finish();
rollback;
