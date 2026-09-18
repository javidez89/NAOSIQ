begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public,extensions;
select no_plan();
-- Fixtures are local-only and rolled back; these accounts cannot sign in.
insert into auth.users(id,instance_id,aud,role,email,email_confirmed_at,created_at,updated_at)
select ('10000000-0000-4000-8000-'||lpad(i::text,12,'0'))::uuid,'00000000-0000-0000-0000-000000000000','authenticated','authenticated','test'||i||'@example.invalid',now(),now(),now() from generate_series(1,7) i;
insert into public.tenants(id,name,slug) values
('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','Comercio A','test-comercio-a'),
('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','Comercio B','test-comercio-b');
insert into public.subscriptions values
('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','basic','active',now()+interval '30 days',now()),
('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','basic','active',now()+interval '30 days',now());
insert into public.memberships(tenant_id,user_id,role) values
('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','10000000-0000-4000-8000-000000000001','admin'),
('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','10000000-0000-4000-8000-000000000002','admin'),
('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','10000000-0000-4000-8000-000000000003','advisor'),
('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','10000000-0000-4000-8000-000000000004','technician'),
('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','10000000-0000-4000-8000-000000000005','customer'),
('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','10000000-0000-4000-8000-000000000006','customer');
insert into private.platform_admins(user_id) values('10000000-0000-4000-8000-000000000007');
insert into public.customers(id,tenant_id,user_id,name) values
('20000000-0000-4000-8000-000000000001','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','10000000-0000-4000-8000-000000000005','Cliente A'),
('20000000-0000-4000-8000-000000000002','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',null,'Cliente B'),
('20000000-0000-4000-8000-000000000003','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','10000000-0000-4000-8000-000000000006','Cliente A2');
insert into public.repairs(id,tenant_id,customer_id,assigned_to,device,issue,created_by,request_id) values
('30000000-0000-4000-8000-000000000001','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','20000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000004','Laptop A','No enciende','10000000-0000-4000-8000-000000000001',gen_random_uuid()),
('30000000-0000-4000-8000-000000000002','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','20000000-0000-4000-8000-000000000002',null,'Laptop B','No enciende','10000000-0000-4000-8000-000000000002',gen_random_uuid()),
('30000000-0000-4000-8000-000000000003','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','20000000-0000-4000-8000-000000000003',null,'Laptop A2','No enciende','10000000-0000-4000-8000-000000000001',gen_random_uuid());

select set_config('request.jwt.claims','{"sub":"10000000-0000-4000-8000-000000000001","role":"authenticated","aal":"aal1"}',true);
set local role authenticated;
select is((select count(*) from public.repairs),2::bigint,'Admin A sees only A');
select is((select count(*) from public.repairs where tenant_id='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'),0::bigint,'B is invisible');
select throws_ok($$update public.repairs set status='completed'$$,'42501',null,'Direct API updates denied');
select throws_ok($$select public.create_customer('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','Intrusion','')$$,'42501',null,'Cross-tenant command denied');
select throws_ok($$select public.create_repair('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','20000000-0000-4000-8000-000000000002','Crossed device','Wrong customer',gen_random_uuid())$$,'42501',null,'Cross-tenant customer denied');
select throws_ok($$select public.transition_repair('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','30000000-0000-4000-8000-000000000001',99,'in_repair')$$,'40001',null,'Optimistic concurrency enforced');
select throws_ok($$select public.transition_repair('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','30000000-0000-4000-8000-000000000001',1,'completed')$$,'23514',null,'Invalid state transition rejected');
select lives_ok($$select public.create_repair('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','20000000-0000-4000-8000-000000000001','Phone C','Broken screen','90000000-0000-4000-8000-000000000001')$$,'Intake transaction accepted');
select is((select count(*) from public.vouchers where kind='intake'),0::bigint,'Request does not create a custody voucher');
select lives_ok($$select public.create_repair('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','20000000-0000-4000-8000-000000000001','Phone C','Broken screen','90000000-0000-4000-8000-000000000001')$$,'Intake retry is idempotent');
select is((select count(*) from public.vouchers where kind='intake'),0::bigint,'Request retry still does not create custody');
select lives_ok($$select public.record_payment('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','30000000-0000-4000-8000-000000000001',5000000,'bank_transfer','payment-test-intent-001')$$,'Admin can register pending payment');
select is((select count(*) from public.vouchers where kind='payment'),0::bigint,'Pending payment never emits payment voucher');
select throws_ok($$select public.confirm_payment('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',(select id from public.payments limit 1))$$,'42501',null,'MFA enforced in SQL');
select throws_ok($$select public.record_payment('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','30000000-0000-4000-8000-000000000001',1,'bank_transfer','payment-test-intent-001')$$,'23505',null,'Different payload cannot reuse idempotency key');

select set_config('request.jwt.claims','{"sub":"10000000-0000-4000-8000-000000000003","role":"authenticated","aal":"aal2"}',true);
select is((select count(*) from public.payments),0::bigint,'Advisor cannot read payments even with MFA');
select throws_ok($$select public.record_payment('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','30000000-0000-4000-8000-000000000001',1,'cash','advisor-intent-0001')$$,'42501',null,'Advisor cannot register money');
select throws_ok($$select public.transition_repair('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','30000000-0000-4000-8000-000000000001',1,'in_repair')$$,'42501',null,'Advisor cannot perform technical transition');
select throws_ok($$select public.set_membership('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','10000000-0000-4000-8000-000000000003','admin',true)$$,'42501',null,'Advisor cannot self-escalate');

select set_config('request.jwt.claims','{"sub":"10000000-0000-4000-8000-000000000004","role":"authenticated","aal":"aal1"}',true);
select is((select count(*) from public.repairs),1::bigint,'Technician sees only assigned repair');
select is((select count(*) from public.customers),0::bigint,'Technician cannot list customer PII');
select throws_ok($$select public.transition_repair('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','30000000-0000-4000-8000-000000000003',1,'in_repair')$$,'42501',null,'Unassigned repair command rejected');
select lives_ok($$select public.transition_repair('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','30000000-0000-4000-8000-000000000001',1,'in_repair')$$,'Assigned technician can progress repair');

select set_config('request.jwt.claims','{"sub":"10000000-0000-4000-8000-000000000005","role":"authenticated","aal":"aal1","user_metadata":{"role":"super_user"}}',true);
select is((select count(*) from public.repairs),2::bigint,'Customer sees only own two repairs');
select is((select count(*) from public.repairs where id='30000000-0000-4000-8000-000000000003'),0::bigint,'Other customer data hidden');
select is(public.is_platform_admin(),false,'Editable metadata cannot escalate');
select throws_ok($$select public.create_customer('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','Escalation','')$$,'42501',null,'Customer cannot create staff-side records');

select set_config('request.jwt.claims','{"sub":"10000000-0000-4000-8000-000000000001","role":"authenticated","aal":"aal2"}',true);
select lives_ok($$select public.confirm_payment('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',(select id from public.payments limit 1))$$,'MFA admin can confirm payment');
select lives_ok($$select public.confirm_payment('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',(select id from public.payments limit 1))$$,'Confirmation retry accepted');
select is((select count(*) from public.vouchers where kind='payment'),1::bigint,'One payment voucher after repeated confirmation');
select is((select status from public.payments limit 1),'confirmed','Payment confirmed atomically');
select throws_ok($$delete from public.audit_events$$,'42501',null,'Application cannot delete audit history');

reset role;
update public.subscriptions set current_period_end=now()-interval '1 second' where tenant_id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
set local role authenticated;
select throws_ok($$select public.create_customer('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','Expired tenant','')$$,'42501',null,'Expiry enforced without cron');
select ok((select count(*)>0 from public.repairs),'Read-only access is preserved at expiry');
reset role;
update public.memberships set active=false where user_id='10000000-0000-4000-8000-000000000001';
set local role authenticated;
select is((select count(*) from public.repairs),0::bigint,'Membership revocation is effective without JWT refresh');
select set_config('request.jwt.claims','{"sub":"10000000-0000-4000-8000-000000000007","role":"authenticated","aal":"aal1"}',true);
select is(public.is_platform_admin(),false,'Platform admin requires MFA');
select set_config('request.jwt.claims','{"sub":"10000000-0000-4000-8000-000000000007","role":"authenticated","aal":"aal2"}',true);
select is(public.is_platform_admin(),true,'Active platform admin with MFA recognized');
select is((select count(*) from public.tenants where id in ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb')),2::bigint,'Master can see both fixture tenants');
reset role;
set local role anon;
select throws_ok($$select * from public.repairs$$,'42501',null,'Anonymous direct data access denied');
select throws_ok($$select public.is_platform_admin()$$,'42501',null,'Anonymous RPC denied');
reset role;
select * from finish();
rollback;
