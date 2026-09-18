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
select throws_ok($$select public.confirm_intake('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','30000000-0000-4000-8000-000000000001',1,'90000000-0000-4000-8000-000000000051','Pantalla intacta','Sin accesorios')$$,'42501',null,'Cross tenant intake denied');
select throws_ok($$select public.confirm_intake('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','30000000-0000-4000-8000-000000000001',99,'90000000-0000-4000-8000-000000000051','Pantalla intacta','Sin accesorios')$$,'40001',null,'Stale version denied');
select throws_ok($$select public.confirm_intake('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','30000000-0000-4000-8000-000000000001',1,'90000000-0000-4000-8000-000000000051','','Sin accesorios')$$,'23514',null,'Condition required in database');
select lives_ok($$select public.confirm_intake('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','30000000-0000-4000-8000-000000000001',1,'90000000-0000-4000-8000-000000000051','Pantalla intacta','Sin accesorios')$$,'Admin confirms physical intake');
select lives_ok($$select public.confirm_intake('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','30000000-0000-4000-8000-000000000001',1,'90000000-0000-4000-8000-000000000051','Pantalla intacta','Sin accesorios')$$,'Identical retry returns original despite advanced version');
select is((select count(*) from public.intake_events),1::bigint,'One custody event');
select is((select count(*) from public.vouchers where kind='intake'),1::bigint,'One receipt');
select is((select version from public.repairs where id='30000000-0000-4000-8000-000000000001'),2,'Only one version increment');
select is((select snapshot->>'physical_condition' from public.vouchers where kind='intake'),'Pantalla intacta','Snapshot records observed condition');
select throws_ok($$select public.confirm_intake('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','30000000-0000-4000-8000-000000000001',1,'90000000-0000-4000-8000-000000000051','Different condition','Sin accesorios')$$,'23505',null,'Changed payload cannot reuse operation');
select throws_ok($$select public.confirm_intake('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','30000000-0000-4000-8000-000000000001',1,'90000000-0000-4000-8000-000000000052','Pantalla intacta','Sin accesorios')$$,'23505',null,'New key cannot repeat custody');
select throws_ok($$select public.confirm_intake('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','30000000-0000-4000-8000-000000000003',1,'90000000-0000-4000-8000-000000000051','Pantalla intacta','Sin accesorios')$$,'23505',null,'Operation key cannot be reused on another order');
select is((select count(*) from public.vouchers where kind='intake'),1::bigint,'Conflict rolls back extra voucher');
select throws_ok($$delete from public.intake_events$$,'42501',null,'Custody events cannot be deleted by API');
select throws_ok($$update public.intake_events set accessories='Modified'$$,'42501',null,'Custody events cannot be rewritten');
select set_config('request.jwt.claims','{"sub":"10000000-0000-4000-8000-000000000003","role":"authenticated","aal":"aal1"}',true);
select lives_ok($$select public.confirm_intake('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','30000000-0000-4000-8000-000000000003',1,'90000000-0000-4000-8000-000000000053','Pantalla intacta','Sin accesorios')$$,'Advisor can confirm intake without financial permissions');
select set_config('request.jwt.claims','{"sub":"10000000-0000-4000-8000-000000000004","role":"authenticated","aal":"aal1"}',true);
select throws_ok($$select public.confirm_intake('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','30000000-0000-4000-8000-000000000001',1,'90000000-0000-4000-8000-000000000051','Pantalla intacta','Sin accesorios')$$,'42501',null,'Technician cannot confirm custody by default');
select set_config('request.jwt.claims','{"sub":"10000000-0000-4000-8000-000000000005","role":"authenticated","aal":"aal1"}',true);
select throws_ok($$select public.confirm_intake('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','30000000-0000-4000-8000-000000000001',1,'90000000-0000-4000-8000-000000000051','Pantalla intacta','Sin accesorios')$$,'42501',null,'Customer cannot confirm custody');
select is((select count(*) from public.intake_events),1::bigint,'Customer sees only own custody');
select set_config('request.jwt.claims','{"sub":"10000000-0000-4000-8000-000000000002","role":"authenticated","aal":"aal1"}',true);
select is((select count(*) from public.intake_events),0::bigint,'Other business cannot read custody');
reset role;
select is((select count(*) from private.outbox where event_type='intake.confirmed' and tenant_id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'),2::bigint,'Outbox deduplicated');
select is((select count(*) from public.audit_events where action='intake.confirmed' and tenant_id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'),2::bigint,'Real actors audited once per event');
update public.tenants set status='suspended' where id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
select set_config('request.jwt.claims','{"sub":"10000000-0000-4000-8000-000000000001","role":"authenticated","aal":"aal1"}',true);
set local role authenticated;
select throws_ok($$select public.confirm_intake('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','30000000-0000-4000-8000-000000000001',1,'90000000-0000-4000-8000-000000000051','Pantalla intacta','Sin accesorios')$$,'42501',null,'Suspension enforced even on retry');
reset role; set local role anon;
select throws_ok($$select public.confirm_intake('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','30000000-0000-4000-8000-000000000001',1,'90000000-0000-4000-8000-000000000051','Pantalla intacta','Sin accesorios')$$,'42501',null,'Anonymous command denied');
select throws_ok($$select id from public.intake_events$$,'42501',null,'Anonymous custody read denied');
reset role; select * from finish(); rollback;
