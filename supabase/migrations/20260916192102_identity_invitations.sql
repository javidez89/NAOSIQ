begin;

-- P03: invitation, identity acceptance and role activation are separate facts.
-- Creating an invitation never creates an Auth user or a membership.
create table public.identity_invitations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id),
  email text not null check (
    email=lower(email) and char_length(email) between 6 and 254
    and email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
  ),
  proposed_role text not null check (proposed_role in ('admin','advisor','technician','customer')),
  status text not null default 'pending' check (status in ('pending','accepted','activated','revoked','expired')),
  request_id uuid not null,
  invited_by uuid not null references auth.users(id),
  accepted_by uuid references auth.users(id),
  activated_by uuid references auth.users(id),
  expires_at timestamptz not null,
  accepted_at timestamptz,
  activated_at timestamptz,
  revoked_at timestamptz,
  version integer not null default 1 check(version > 0),
  created_at timestamptz not null default now(),
  unique(tenant_id,id),
  unique(tenant_id,request_id),
  check(expires_at > created_at),
  check(
    (status='pending' and accepted_by is null and accepted_at is null and activated_by is null and activated_at is null and revoked_at is null)
    or (status='accepted' and accepted_by is not null and accepted_at is not null and activated_by is null and activated_at is null and revoked_at is null)
    or (status='activated' and accepted_by is not null and accepted_at is not null and activated_by is not null and activated_at is not null and revoked_at is null)
    or (status='revoked' and activated_by is null and activated_at is null and revoked_at is not null)
    or (status='expired' and activated_by is null and activated_at is null)
  )
);
create unique index identity_invitations_one_open_email_idx
  on public.identity_invitations(tenant_id,email)
  where status in ('pending','accepted');
create index identity_invitations_tenant_created_idx
  on public.identity_invitations(tenant_id,created_at desc);

alter table public.identity_invitations enable row level security;
revoke all on public.identity_invitations from public,anon,authenticated;
grant select on public.identity_invitations to authenticated;

create function private.is_current_verified_email(p_email text) returns boolean
language sql stable security definer set search_path='' as $$
  select auth.uid() is not null and exists(
    select 1 from auth.users
    where id=auth.uid() and email_confirmed_at is not null and lower(email)=lower(p_email)
  );
$$;

create policy identity_invitations_read on public.identity_invitations for select to authenticated using(
  private.has_role(tenant_id,array['admin']) or accepted_by=auth.uid()
  or (status='pending' and private.is_current_verified_email(email))
);

create function private.create_identity_invitation(
  p_tenant uuid,p_email text,p_role text,p_expires_at timestamptz,p_request_id uuid
) returns uuid
language plpgsql security definer set search_path='' as $$
declare
  v_email text := lower(trim(p_email));
  v_existing public.identity_invitations%rowtype;
  v_id uuid;
begin
  if auth.uid() is null or not private.has_role(p_tenant,array['admin']) then
    raise exception 'Access denied' using errcode='42501';
  end if;
  if not private.can_operate(p_tenant) then
    raise exception 'Tenant is not operational' using errcode='42501';
  end if;
  if p_role not in ('admin','advisor','technician','customer') then
    raise exception 'Invalid invited role' using errcode='23514';
  end if;
  if p_expires_at<=now() or p_expires_at>now()+interval '1 year' then
    raise exception 'Invalid invitation period' using errcode='23514';
  end if;
  select * into v_existing from public.identity_invitations
    where tenant_id=p_tenant and request_id=p_request_id;
  if found then
    if v_existing.email<>v_email or v_existing.proposed_role<>p_role or v_existing.expires_at<>p_expires_at then
      raise exception 'Idempotency key reused with different invitation' using errcode='23505';
    end if;
    return v_existing.id;
  end if;
  insert into public.identity_invitations(tenant_id,email,proposed_role,request_id,invited_by,expires_at)
    values(p_tenant,v_email,p_role,p_request_id,auth.uid(),p_expires_at)
    returning id into v_id;
  insert into private.outbox(tenant_id,event_type,aggregate_id,payload)
    values(p_tenant,'identity.invitation.created',v_id,jsonb_build_object('invitation_id',v_id));
  perform private.audit(p_tenant,'identity.invitation.created',v_id,jsonb_build_object(
    'proposed_role',p_role,'expires_at',p_expires_at
  ));
  return v_id;
end;
$$;

create function private.accept_identity_invitation(p_invitation uuid,p_expected_version integer) returns integer
language plpgsql security definer set search_path='' as $$
declare
  v_inv public.identity_invitations%rowtype;
  v_email text;
  v_version integer;
begin
  if auth.uid() is null then raise exception 'Authentication required' using errcode='42501'; end if;
  select lower(email) into v_email from auth.users
    where id=auth.uid() and email_confirmed_at is not null;
  if v_email is null then raise exception 'Verified identity required' using errcode='42501'; end if;
  select * into v_inv from public.identity_invitations where id=p_invitation for update;
  if not found or v_inv.email<>v_email then raise exception 'Invitation unavailable' using errcode='42501'; end if;
  if v_inv.status='accepted' and v_inv.accepted_by=auth.uid() then return v_inv.version; end if;
  if v_inv.status<>'pending' then raise exception 'Invitation unavailable' using errcode='42501'; end if;
  if v_inv.expires_at<=now() then
    raise exception 'Invitation expired' using errcode='22023';
  end if;
  if v_inv.version<>p_expected_version then raise exception 'Version conflict' using errcode='40001'; end if;
  update public.identity_invitations
    set status='accepted',accepted_by=auth.uid(),accepted_at=now(),version=version+1
    where id=p_invitation returning version into v_version;
  perform private.audit(v_inv.tenant_id,'identity.invitation.accepted',p_invitation);
  return v_version;
end;
$$;

create function private.activate_invited_membership(p_tenant uuid,p_invitation uuid,p_expected_version integer) returns integer
language plpgsql security definer set search_path='' as $$
declare
  v_inv public.identity_invitations%rowtype;
  v_version integer;
begin
  if auth.uid() is null or not private.has_role(p_tenant,array['admin']) then
    raise exception 'Access denied' using errcode='42501';
  end if;
  select * into v_inv from public.identity_invitations
    where tenant_id=p_tenant and id=p_invitation for update;
  if not found then raise exception 'Invitation unavailable' using errcode='42501'; end if;
  if v_inv.status='activated' then
    if exists(select 1 from public.memberships where tenant_id=p_tenant and user_id=v_inv.accepted_by and role=v_inv.proposed_role and active) then
      return v_inv.version;
    end if;
    raise exception 'Activated invitation is inconsistent' using errcode='40001';
  end if;
  if v_inv.status<>'accepted' or v_inv.accepted_by is null then
    raise exception 'Accepted invitation required' using errcode='23514';
  end if;
  if v_inv.version<>p_expected_version then raise exception 'Version conflict' using errcode='40001'; end if;
  perform private.set_membership(p_tenant,v_inv.accepted_by,v_inv.proposed_role,true);
  update public.identity_invitations
    set status='activated',activated_by=auth.uid(),activated_at=now(),version=version+1
    where id=p_invitation returning version into v_version;
  perform private.audit(p_tenant,'identity.invitation.activated',p_invitation,jsonb_build_object(
    'user_id',v_inv.accepted_by,'role',v_inv.proposed_role
  ));
  return v_version;
end;
$$;

create function private.revoke_identity_invitation(p_tenant uuid,p_invitation uuid,p_expected_version integer) returns integer
language plpgsql security definer set search_path='' as $$
declare v_version integer;
begin
  if auth.uid() is null or not private.has_role(p_tenant,array['admin']) then
    raise exception 'Access denied' using errcode='42501';
  end if;
  update public.identity_invitations
    set status='revoked',revoked_at=now(),version=version+1
    where tenant_id=p_tenant and id=p_invitation and status in ('pending','accepted') and version=p_expected_version
    returning version into v_version;
  if v_version is null then
    if exists(select 1 from public.identity_invitations where tenant_id=p_tenant and id=p_invitation) then
      raise exception 'Version conflict or invitation already final' using errcode='40001';
    end if;
    raise exception 'Invitation unavailable' using errcode='42501';
  end if;
  perform private.audit(p_tenant,'identity.invitation.revoked',p_invitation,jsonb_build_object('version',v_version));
  return v_version;
end;
$$;

create function public.create_identity_invitation(p_tenant uuid,p_email text,p_role text,p_expires_at timestamptz,p_request_id uuid) returns uuid
language sql security invoker set search_path='' as $$select private.create_identity_invitation(p_tenant,p_email,p_role,p_expires_at,p_request_id);$$;
create function public.accept_identity_invitation(p_invitation uuid,p_expected_version integer) returns integer
language sql security invoker set search_path='' as $$select private.accept_identity_invitation(p_invitation,p_expected_version);$$;
create function public.activate_invited_membership(p_tenant uuid,p_invitation uuid,p_expected_version integer) returns integer
language sql security invoker set search_path='' as $$select private.activate_invited_membership(p_tenant,p_invitation,p_expected_version);$$;
create function public.revoke_identity_invitation(p_tenant uuid,p_invitation uuid,p_expected_version integer) returns integer
language sql security invoker set search_path='' as $$select private.revoke_identity_invitation(p_tenant,p_invitation,p_expected_version);$$;

revoke all on function private.is_current_verified_email(text),private.create_identity_invitation(uuid,text,text,timestamptz,uuid),private.accept_identity_invitation(uuid,integer),private.activate_invited_membership(uuid,uuid,integer),private.revoke_identity_invitation(uuid,uuid,integer) from public,anon;
grant execute on function private.is_current_verified_email(text),private.create_identity_invitation(uuid,text,text,timestamptz,uuid),private.accept_identity_invitation(uuid,integer),private.activate_invited_membership(uuid,uuid,integer),private.revoke_identity_invitation(uuid,uuid,integer) to authenticated;
revoke all on function public.create_identity_invitation(uuid,text,text,timestamptz,uuid),public.accept_identity_invitation(uuid,integer),public.activate_invited_membership(uuid,uuid,integer),public.revoke_identity_invitation(uuid,uuid,integer) from public,anon;
grant execute on function public.create_identity_invitation(uuid,text,text,timestamptz,uuid),public.accept_identity_invitation(uuid,integer),public.activate_invited_membership(uuid,uuid,integer),public.revoke_identity_invitation(uuid,uuid,integer) to authenticated;

commit;
