begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public,extensions;
select no_plan();

-- Synthetic accounts cannot sign in. Every fixture is rolled back.
insert into auth.users(id,instance_id,aud,role,email,email_confirmed_at,raw_user_meta_data,created_at,updated_at)
select ('51000000-0000-4000-8000-'||lpad(i::text,12,'0'))::uuid,
 '00000000-0000-0000-0000-000000000000','authenticated','authenticated',
 'directory'||i||'@example.invalid',case when i=9 then null else now() end,
 case when i=4 then '{"full_name":"  Técnica   Local  "}'::jsonb
      when i=5 then '{"full_name":"Cliente","role":"super_user","is_admin":true}'::jsonb
      when i=11 then '{}'::jsonb
      else jsonb_build_object('name','Persona '||i) end,now(),now()
from generate_series(1,11) i;
insert into public.tenants(id,name,slug) values
 ('daaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','Directorio A','directory-comercio-a'),
 ('dbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','Directorio B','directory-comercio-b');
insert into public.subscriptions(tenant_id,plan_code,status,current_period_end) values
 ('daaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','basic','active',now()+interval '30 days'),
 ('dbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','basic','active',now()+interval '30 days');
insert into public.memberships(tenant_id,user_id,role,active) values
 ('daaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','51000000-0000-4000-8000-000000000001','admin',true),
 ('dbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','51000000-0000-4000-8000-000000000002','admin',true),
 ('daaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','51000000-0000-4000-8000-000000000003','advisor',true),
 ('daaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','51000000-0000-4000-8000-000000000004','technician',true),
 ('daaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','51000000-0000-4000-8000-000000000005','customer',true),
 ('daaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','51000000-0000-4000-8000-000000000006','technician',false),
 ('dbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','51000000-0000-4000-8000-000000000010','technician',true),
 ('daaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','51000000-0000-4000-8000-000000000011','technician',true);
insert into private.platform_admins(user_id) values('51000000-0000-4000-8000-000000000007');

select is((select count(*) from pg_proc p join pg_namespace n on n.oid=p.pronamespace
 where n.nspname='public' and p.proname in ('list_team_members','tenant_operational','list_verified_users') and not p.prosecdef),
 3::bigint,'Public directory RPCs are security invoker');
select is((select count(*) from pg_proc p join pg_namespace n on n.oid=p.pronamespace
 where n.nspname='private' and p.proname in ('list_team_members','tenant_operational','list_verified_users') and p.prosecdef
 and 'search_path=""'=any(p.proconfig)),3::bigint,'Privileged directory implementations have an empty search path');
select is((select p.proargnames from pg_proc p join pg_namespace n on n.oid=p.pronamespace
 where n.nspname='public' and p.proname='list_team_members'),array['p_tenant','user_id','display_name','role','active'],
 'Team contract never returns email or auth metadata');

select set_config('request.jwt.claims','{"sub":"51000000-0000-4000-8000-000000000001","role":"authenticated","aal":"aal1"}',true);
set local role authenticated;
select is((select count(*) from public.list_team_members('daaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa')),6::bigint,'Admin sees own full membership directory');
select is((select count(*) from public.list_team_members('daaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa') where not active),1::bigint,'Admin can identify inactive members without offering them as active technicians');
select is((select display_name from public.list_team_members('daaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa') where user_id='51000000-0000-4000-8000-000000000004'),'Técnica Local','Display names normalize whitespace');
select is((select display_name from public.list_team_members('daaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa') where user_id='51000000-0000-4000-8000-000000000011'),'Usuario sin nombre','Missing profile name does not expose an email');
select throws_ok($$select public.list_team_members('dbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb')$$,'42501',null,'Admin cannot enumerate other tenant identities');
select throws_ok($$select public.list_verified_users()$$,'42501',null,'Merchant admin cannot read the global auth directory');
select is(public.tenant_operational('daaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'),true,'Active member receives operational status');
select is(public.tenant_operational('dbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'),false,'Operational status does not reveal another tenant subscription');
select is(public.tenant_operational('dccccccc-cccc-4ccc-8ccc-cccccccccccc'),false,'Unknown tenant returns false');

select set_config('request.jwt.claims','{"sub":"51000000-0000-4000-8000-000000000003","role":"authenticated","aal":"aal2"}',true);
select is((select count(*) from public.list_team_members('daaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa')),3::bigint,'Advisor sees active technicians and their own profile');
select is((select count(*) from public.list_team_members('daaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa') where role in ('admin','customer') or not active),0::bigint,'Advisor directory omits other roles and inactive staff');
select is(public.tenant_operational('daaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'),true,'Advisor can read only operational eligibility');
select is((select count(*) from public.subscriptions),0::bigint,'Advisor still cannot read billing rows');
select throws_ok($$select public.list_verified_users()$$,'42501',null,'MFA does not grant the advisor global identity access');
select throws_ok($$select private.list_team_members('dbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb')$$,'42501',null,'Private implementation also rejects cross-tenant access');

select set_config('request.jwt.claims','{"sub":"51000000-0000-4000-8000-000000000004","role":"authenticated","aal":"aal1"}',true);
select is((select count(*) from public.list_team_members('daaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa')),1::bigint,'Technician only sees their own membership');
select is((select user_id from public.list_team_members('daaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa')),'51000000-0000-4000-8000-000000000004'::uuid,'Technician directory cannot enumerate other members');
select is(public.tenant_operational('daaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'),true,'Technician can inspect operational eligibility');
select is((select count(*) from public.subscriptions),0::bigint,'Technician still cannot read billing rows');

select set_config('request.jwt.claims','{"sub":"51000000-0000-4000-8000-000000000005","role":"authenticated","aal":"aal2","user_metadata":{"role":"super_user","is_admin":true}}',true);
select is((select count(*) from public.list_team_members('daaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa')),1::bigint,'Customer profile metadata does not expand directory permissions');
select is((select role from public.list_team_members('daaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa')),'customer','Roles come from memberships, never display metadata');
select throws_ok($$select public.list_verified_users()$$,'42501',null,'Editable metadata cannot grant the global directory');
select throws_ok($$select public.list_team_members('dbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb')$$,'42501',null,'Customer cannot enumerate another tenant');

select set_config('request.jwt.claims','{"sub":"51000000-0000-4000-8000-000000000008","role":"authenticated","aal":"aal2"}',true);
select throws_ok($$select public.list_team_members('daaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa')$$,'42501',null,'Verified identity without membership gets no team directory');
select is(public.tenant_operational('daaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'),false,'A verified identity alone is not tenant authorization');
select set_config('request.jwt.claims','{"role":"authenticated","aal":"aal2"}',true);
select throws_ok($$select public.list_team_members('daaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa')$$,'42501',null,'Missing auth identity is rejected');
select is(public.tenant_operational('daaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'),false,'Missing auth identity gets no operational signal');

select set_config('request.jwt.claims','{"sub":"51000000-0000-4000-8000-000000000007","role":"authenticated","aal":"aal1"}',true);
select throws_ok($$select public.list_verified_users()$$,'42501',null,'Platform directory requires MFA');
select throws_ok($$select public.list_team_members('daaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa')$$,'42501',null,'Platform membership directory requires MFA');
select is(public.tenant_operational('daaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'),false,'Platform eligibility requires MFA');
select set_config('request.jwt.claims','{"sub":"51000000-0000-4000-8000-000000000007","role":"authenticated","aal":"aal2"}',true);
select is((select count(*) from public.list_team_members('daaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa')),6::bigint,'MFA master can read tenant A directory');
select is((select count(*) from public.list_team_members('dbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb')),2::bigint,'MFA master can read tenant B directory');
select is((select count(*) from public.list_verified_users() where user_id::text like '51000000-0000-4000-8000-%'),10::bigint,'MFA master sees verified fixture identities');
select is((select count(*) from public.list_verified_users() where user_id='51000000-0000-4000-8000-000000000009'),0::bigint,'Unverified accounts never appear for membership selection');
select is((select email from public.list_verified_users() where user_id='51000000-0000-4000-8000-000000000008'),'directory8@example.invalid','Only master directory includes verified email for identity selection');
select is(public.tenant_operational('dccccccc-cccc-4ccc-8ccc-cccccccccccc'),false,'Master still cannot operate on an absent tenant');

reset role;
update public.memberships set active=false where tenant_id='daaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa' and user_id='51000000-0000-4000-8000-000000000001';
select set_config('request.jwt.claims','{"sub":"51000000-0000-4000-8000-000000000001","role":"authenticated","aal":"aal1"}',true);
set local role authenticated;
select throws_ok($$select public.list_team_members('daaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa')$$,'42501',null,'Revoked membership immediately loses directory access');
select is(public.tenant_operational('daaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'),false,'Revoked membership immediately loses operational eligibility');
reset role;
update public.subscriptions set current_period_end=now()-interval '1 second' where tenant_id='daaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
select set_config('request.jwt.claims','{"sub":"51000000-0000-4000-8000-000000000004","role":"authenticated","aal":"aal1"}',true);
set local role authenticated;
select is(public.tenant_operational('daaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'),false,'Expired subscription becomes non-operational without exposing billing');
select lives_ok($$select public.list_team_members('daaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa')$$,'Directory remains readable during subscription expiry');
select set_config('request.jwt.claims','{"sub":"51000000-0000-4000-8000-000000000007","role":"authenticated","aal":"aal2"}',true);
select is(public.tenant_operational('daaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'),true,'Existing master override remains consistent with command authorization');
reset role;
update public.subscriptions set current_period_end=now()+interval '30 days' where tenant_id='daaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
update public.tenants set status='suspended' where id='daaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
select set_config('request.jwt.claims','{"sub":"51000000-0000-4000-8000-000000000004","role":"authenticated","aal":"aal1"}',true);
set local role authenticated;
select is(public.tenant_operational('daaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'),false,'Suspended commerce is non-operational');
select lives_ok($$select public.list_team_members('daaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa')$$,'Suspended commerce keeps read access');
reset role;
update public.tenants set status='closed' where id='daaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
set local role authenticated;
select is(public.tenant_operational('daaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'),false,'Closed commerce is non-operational for a member');
select throws_ok($$select public.list_team_members('daaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa')$$,'42501',null,'Closed commerce follows existing read authorization');
reset role;
set local role anon;
select throws_ok($$select public.list_team_members('daaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa')$$,'42501',null,'Anonymous team RPC is denied');
select throws_ok($$select public.tenant_operational('daaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa')$$,'42501',null,'Anonymous operational RPC is denied');
select throws_ok($$select public.list_verified_users()$$,'42501',null,'Anonymous global identity RPC is denied');
reset role;
select * from finish();
rollback;
