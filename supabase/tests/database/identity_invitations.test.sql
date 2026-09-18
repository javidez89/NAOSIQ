begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public,extensions;
select no_plan();

insert into auth.users(id,instance_id,aud,role,email,email_confirmed_at,created_at,updated_at) values
('51000000-0000-4000-8000-000000000001','00000000-0000-0000-0000-000000000000','authenticated','authenticated','p03-admin-a@example.invalid',now(),now(),now()),
('51000000-0000-4000-8000-000000000002','00000000-0000-0000-0000-000000000000','authenticated','authenticated','p03-admin-b@example.invalid',now(),now(),now()),
('51000000-0000-4000-8000-000000000003','00000000-0000-0000-0000-000000000000','authenticated','authenticated','p03-invitee-a@example.invalid',now(),now(),now()),
('51000000-0000-4000-8000-000000000004','00000000-0000-0000-0000-000000000000','authenticated','authenticated','p03-invitee-b@example.invalid',now(),now(),now());
insert into public.tenants(id,name,slug) values
('51aaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','P03 Comercio A','p03-comercio-a'),
('51bbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','P03 Comercio B','p03-comercio-b');
insert into public.subscriptions(tenant_id,plan_code,status,current_period_end) values
('51aaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','basic','active',now()+interval '30 days'),
('51bbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','basic','active',now()+interval '30 days');
insert into public.memberships(tenant_id,user_id,role) values
('51aaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','51000000-0000-4000-8000-000000000001','admin'),
('51bbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','51000000-0000-4000-8000-000000000002','admin');
insert into public.identity_invitations(
  tenant_id,email,proposed_role,status,request_id,invited_by,expires_at,created_at
) values(
  '51aaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','p03-expired@example.invalid','customer','pending',
  '52000000-0000-4000-8000-000000000005','51000000-0000-4000-8000-000000000001',
  now()-interval '1 hour',now()-interval '2 hours'
);

select set_config('request.jwt.claims','{"sub":"51000000-0000-4000-8000-000000000001","role":"authenticated","aal":"aal1"}',true);
set local role authenticated;
select lives_ok($$select public.create_identity_invitation(
  '51aaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','P03-INVITEE-A@EXAMPLE.INVALID','advisor',
  now()+interval '7 days','52000000-0000-4000-8000-000000000001'
)$$,'Admin creates invitation without creating identity or role');
select is((select count(*) from public.identity_invitations where email='p03-invitee-a@example.invalid'),1::bigint,'Invitation fact exists');
select is((select count(*) from public.memberships where user_id='51000000-0000-4000-8000-000000000003'),0::bigint,'Invitation does not create membership');
reset role;
select is((select count(*) from private.outbox where event_type='identity.invitation.created'),1::bigint,'Invitation creates one delivery intent without claiming delivery');
set local role authenticated;
select lives_ok($$select public.create_identity_invitation(
  '51aaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','p03-invitee-a@example.invalid','advisor',
  now()+interval '7 days','52000000-0000-4000-8000-000000000001'
)$$,'Identical invitation retry is idempotent');
select is((select count(*) from public.identity_invitations where email='p03-invitee-a@example.invalid'),1::bigint,'Invitation retry does not duplicate');
select throws_ok($$select public.create_identity_invitation(
  '51aaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','p03-invitee-a@example.invalid','technician',
  now()+interval '7 days','52000000-0000-4000-8000-000000000001'
)$$,'23505',null,'Changed invitation cannot reuse request id');
select throws_ok($$select public.create_identity_invitation(
  '51bbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','p03-invitee-a@example.invalid','advisor',
  now()+interval '7 days','52000000-0000-4000-8000-000000000002'
)$$,'42501',null,'Admin cannot invite across tenants');
select throws_ok($$select public.create_identity_invitation(
  '51aaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','p03-invitee-b@example.invalid','super_user',
  now()+interval '7 days','52000000-0000-4000-8000-000000000003'
)$$,'23514',null,'Invitation cannot grant Super Usuario');
select ok((select count(*)>0 from public.audit_events where action='identity.invitation.created' and actor_id='51000000-0000-4000-8000-000000000001'),'Invitation actor is audited');
select lives_ok($$select public.create_identity_invitation(
  '51aaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','p03-expired@example.invalid','customer',
  now()+interval '7 days','52000000-0000-4000-8000-000000000006'
)$$,'Expired invitation can be recovered with a new invitation');
select is((select count(*) from public.identity_invitations where email='p03-expired@example.invalid' and status='expired'),1::bigint,'Stale invitation is materialized as expired');
select is((select count(*) from public.identity_invitations where email='p03-expired@example.invalid' and status='pending'),1::bigint,'Recovery creates one new pending invitation');
select ok((select count(*)>0 from public.audit_events where action='identity.invitation.expired' and actor_id='51000000-0000-4000-8000-000000000001'),'Expiration recovery actor is audited');

select set_config('request.jwt.claims','{"sub":"51000000-0000-4000-8000-000000000002","role":"authenticated","aal":"aal1"}',true);
select throws_ok($$select public.accept_identity_invitation(
  (select id from public.identity_invitations where email='p03-invitee-a@example.invalid'),1
)$$,'42501',null,'Different identity cannot accept invitation');

select set_config('request.jwt.claims','{"sub":"51000000-0000-4000-8000-000000000003","role":"authenticated","aal":"aal1"}',true);
select is(public.accept_identity_invitation(
  (select id from public.identity_invitations where email='p03-invitee-a@example.invalid'),1
),2,'Matching verified identity accepts invitation');
select is(public.accept_identity_invitation(
  (select id from public.identity_invitations where email='p03-invitee-a@example.invalid'),1
),2,'Acceptance retry returns the existing fact');
select is((select count(*) from public.memberships where user_id='51000000-0000-4000-8000-000000000003'),0::bigint,'Acceptance still does not assign role');

select set_config('request.jwt.claims','{"sub":"51000000-0000-4000-8000-000000000001","role":"authenticated","aal":"aal1"}',true);
select throws_ok($$select public.activate_invited_membership(
  '51aaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',(select id from public.identity_invitations where email='p03-invitee-a@example.invalid'),1
)$$,'40001',null,'Activation checks invitation version');
select is(public.activate_invited_membership(
  '51aaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',(select id from public.identity_invitations where email='p03-invitee-a@example.invalid'),2
),3,'Administrator activates accepted role as a separate fact');
select is((select role from public.memberships where tenant_id='51aaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa' and user_id='51000000-0000-4000-8000-000000000003'),'advisor','Activated membership has proposed role');
select is(public.activate_invited_membership(
  '51aaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',(select id from public.identity_invitations where email='p03-invitee-a@example.invalid'),2
),3,'Activation retry does not duplicate membership');

select lives_ok($$select public.create_identity_invitation(
  '51aaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','p03-invitee-b@example.invalid','technician',
  now()+interval '7 days','52000000-0000-4000-8000-000000000004'
)$$,'Second invitation prepared for revocation');
select throws_ok($$select public.revoke_identity_invitation(
  '51aaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',(select id from public.identity_invitations where email='p03-invitee-b@example.invalid'),99
)$$,'40001',null,'Revocation enforces version');
select is(public.revoke_identity_invitation(
  '51aaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',(select id from public.identity_invitations where email='p03-invitee-b@example.invalid'),1
),2,'Pending invitation can be revoked');
select throws_ok($$insert into public.identity_invitations(tenant_id,email,proposed_role,request_id,invited_by,expires_at) values(
  '51aaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','forged@example.invalid','admin',gen_random_uuid(),'51000000-0000-4000-8000-000000000001',now()+interval '1 day'
)$$,'42501',null,'API cannot forge invitation facts');

select * from finish();
rollback;
