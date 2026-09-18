begin;
create extension if not exists pgtap with schema extensions;
set local search_path=public,extensions;
select no_plan();
insert into auth.users(id,instance_id,aud,role,email,email_confirmed_at,created_at,updated_at) values
('71000000-0000-4000-8000-000000000001','00000000-0000-0000-0000-000000000000','authenticated','authenticated','p05-master@example.invalid',now(),now(),now()),
('71000000-0000-4000-8000-000000000002','00000000-0000-0000-0000-000000000000','authenticated','authenticated','p05-admin@example.invalid',now(),now(),now());
insert into public.tenants(id,name,slug) values
('71aaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','P05 Comercio A','p05-comercio-a'),
('71bbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','P05 Comercio B','p05-comercio-b');
insert into public.tenant_routes(slug,tenant_id,status) values
('p05-comercio-a','71aaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','primary'),
('p05-comercio-b','71bbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','primary');
insert into public.subscriptions(tenant_id,plan_code,status,current_period_end) values
('71aaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','basic','active',now()+interval '30 days'),
('71bbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','basic','active',now()+interval '30 days');
insert into public.memberships(tenant_id,user_id,role) values
('71aaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','71000000-0000-4000-8000-000000000002','admin');
insert into private.platform_admins(user_id) values('71000000-0000-4000-8000-000000000001');

select set_config('request.jwt.claims','{"sub":"71000000-0000-4000-8000-000000000002","role":"authenticated","aal":"aal2"}',true);
set local role authenticated;
select throws_ok($$select public.assign_tenant_slug('71aaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','p05-nueva-ruta',1,'72000000-0000-4000-8000-000000000001')$$,'42501',null,'Tenant admin cannot change structural URL');
select set_config('request.jwt.claims','{"sub":"71000000-0000-4000-8000-000000000001","role":"authenticated","aal":"aal1"}',true);
select throws_ok($$select public.assign_tenant_slug('71aaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','p05-nueva-ruta',1,'72000000-0000-4000-8000-000000000001')$$,'42501',null,'URL assignment requires MFA');
select set_config('request.jwt.claims','{"sub":"71000000-0000-4000-8000-000000000001","role":"authenticated","aal":"aal2"}',true);
select is(public.tenant_slug_available('p05-nueva-ruta'),true,'Valid free slug is available');
select is(public.tenant_slug_available('admin'),false,'Reserved slug is unavailable');
select is(public.assign_tenant_slug('71aaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','p05-nueva-ruta',1,'72000000-0000-4000-8000-000000000001'),2,'Master assigns new route');
select is(public.assign_tenant_slug('71aaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','p05-nueva-ruta',1,'72000000-0000-4000-8000-000000000001'),2,'Identical retry recovers result');
select is((select slug from public.tenants where id='71aaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'),'p05-nueva-ruta','Tenant projection follows primary route');
select is((select status from public.tenant_routes where slug='p05-comercio-a'),'redirect','Previous slug becomes redirect');
select is((select target_slug from public.resolve_tenant_slug('p05-comercio-a')),'p05-nueva-ruta','Old slug resolves safely to current slug');
select throws_ok($$select public.assign_tenant_slug('71bbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','p05-nueva-ruta',1,'72000000-0000-4000-8000-000000000002')$$,'23505',null,'Second tenant loses slug collision without overwrite');
select is((select slug from public.tenants where id='71bbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'),'p05-comercio-b','Collision preserves losing tenant draft state');
select throws_ok($$select public.assign_tenant_slug('71aaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','otra-ruta',2,'72000000-0000-4000-8000-000000000001')$$,'23505',null,'Changed retry cannot reuse request id');
select throws_ok($$select public.assign_tenant_slug('71aaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','otra-ruta',99,'72000000-0000-4000-8000-000000000003')$$,'40001',null,'Assignment enforces route version');
select ok((select count(*)=1 from public.audit_events where action='tenant.route.assigned' and actor_id='71000000-0000-4000-8000-000000000001'),'Assignment audits real actor');
select throws_ok($$update public.tenant_routes set status='redirect'$$,'42501',null,'API cannot forge route state');
select * from finish();
rollback;
