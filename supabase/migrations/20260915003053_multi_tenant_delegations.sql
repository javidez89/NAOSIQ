begin;

-- P02: tenant-scoped delegation and secondary-resource contracts. Direct writes
-- remain denied; every command resolves auth.uid() and tenant membership in SQL.
create table public.delegations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id),
  granted_by uuid not null references auth.users(id),
  granted_to uuid not null references auth.users(id),
  permission text not null check (permission in (
    'orders.intake.confirm',
    'orders.delivery.confirm',
    'quotes.publish',
    'documents.read',
    'documents.request',
    'inventory.consume'
  )),
  resource_id uuid,
  request_id uuid not null,
  active boolean not null default true,
  valid_from timestamptz not null default now(),
  expires_at timestamptz not null,
  version integer not null default 1 check (version > 0),
  created_at timestamptz not null default now(),
  revoked_at timestamptz,
  unique (tenant_id,id),
  unique (tenant_id,request_id),
  foreign key (tenant_id,granted_to) references public.memberships(tenant_id,user_id),
  check (granted_by <> granted_to),
  check (expires_at > valid_from),
  check ((active and revoked_at is null) or (not active and revoked_at is not null))
);
create index delegations_grantee_active_idx
  on public.delegations(tenant_id,granted_to,permission,expires_at)
  where active;

-- Metadata only. Upload and workers remain disabled until their later prompts,
-- but their records cannot exist without a tenant and a tenant member actor.
create table public.tenant_files (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id),
  owner_id uuid not null references auth.users(id),
  storage_key text not null check (char_length(storage_key) between 8 and 500),
  status text not null default 'pending' check (status in ('pending','available','quarantined','deleted')),
  created_at timestamptz not null default now(),
  unique (tenant_id,id),
  unique (tenant_id,storage_key),
  foreign key (tenant_id,owner_id) references public.memberships(tenant_id,user_id)
);
create index tenant_files_owner_idx on public.tenant_files(tenant_id,owner_id,created_at desc);

create table public.operation_jobs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id),
  requested_by uuid not null references auth.users(id),
  operation_id uuid not null,
  kind text not null check (char_length(kind) between 3 and 80),
  status text not null default 'queued' check (status in ('queued','running','succeeded','failed','reconciliation_required')),
  available_at timestamptz not null default now(),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (tenant_id,id),
  unique (tenant_id,operation_id),
  foreign key (tenant_id,requested_by) references public.memberships(tenant_id,user_id),
  check ((status = 'succeeded' and completed_at is not null) or (status <> 'succeeded' and completed_at is null))
);
create index operation_jobs_pending_idx on public.operation_jobs(tenant_id,available_at)
  where status in ('queued','failed');

alter table public.delegations enable row level security;
alter table public.tenant_files enable row level security;
alter table public.operation_jobs enable row level security;
revoke all on public.delegations,public.tenant_files,public.operation_jobs from public,anon,authenticated;
grant select on public.delegations,public.tenant_files,public.operation_jobs to authenticated;

create function private.has_delegation(p_tenant uuid,p_permission text,p_resource uuid default null) returns boolean
language sql stable security definer set search_path='' as $$
  select auth.uid() is not null and exists(
    select 1
    from public.delegations d
    join public.memberships m on m.tenant_id=d.tenant_id and m.user_id=d.granted_to
    join public.tenants t on t.id=d.tenant_id
    where d.tenant_id=p_tenant
      and d.granted_to=auth.uid()
      and d.permission=p_permission
      and d.active and m.active and t.status<>'closed'
      and d.valid_from<=now() and d.expires_at>now()
      and (d.resource_id is null or d.resource_id=p_resource)
  );
$$;

create function private.grant_delegation(
  p_tenant uuid,
  p_grantee uuid,
  p_permission text,
  p_resource uuid,
  p_expires_at timestamptz,
  p_request_id uuid
) returns uuid
language plpgsql security definer set search_path='' as $$
declare
  v_existing public.delegations%rowtype;
  v_role text;
  v_id uuid;
begin
  if auth.uid() is null or not private.has_role(p_tenant,array['admin']) then
    raise exception 'Access denied' using errcode='42501';
  end if;
  if not private.can_operate(p_tenant) then
    raise exception 'Tenant is not operational' using errcode='42501';
  end if;
  if p_grantee=auth.uid() then
    raise exception 'Self delegation is not allowed' using errcode='23514';
  end if;
  if p_expires_at<=now() or p_expires_at>now()+interval '90 days' then
    raise exception 'Invalid delegation period' using errcode='23514';
  end if;
  select role into v_role from public.memberships
    where tenant_id=p_tenant and user_id=p_grantee and active;
  if v_role is null then raise exception 'Active grantee membership required' using errcode='42501'; end if;
  if not (
    (p_permission='orders.intake.confirm' and v_role='technician') or
    (p_permission in ('orders.delivery.confirm','quotes.publish','documents.read','documents.request') and v_role in ('advisor','technician')) or
    (p_permission='inventory.consume' and v_role='technician')
  ) then raise exception 'Delegation is not allowed for this role' using errcode='42501'; end if;

  select * into v_existing from public.delegations
    where tenant_id=p_tenant and request_id=p_request_id;
  if found then
    if v_existing.granted_to<>p_grantee
      or v_existing.permission<>p_permission
      or v_existing.resource_id is distinct from p_resource
      or v_existing.expires_at<>p_expires_at then
      raise exception 'Idempotency key reused with different delegation' using errcode='23505';
    end if;
    return v_existing.id;
  end if;

  insert into public.delegations(
    tenant_id,granted_by,granted_to,permission,resource_id,expires_at,request_id
  ) values (
    p_tenant,auth.uid(),p_grantee,p_permission,p_resource,p_expires_at,p_request_id
  ) returning id into v_id;
  perform private.audit(p_tenant,'delegation.granted',v_id,jsonb_build_object(
    'granted_to',p_grantee,'permission',p_permission,'resource_id',p_resource,'expires_at',p_expires_at
  ));
  return v_id;
end;
$$;

create function private.revoke_delegation(p_tenant uuid,p_delegation uuid,p_expected_version integer) returns integer
language plpgsql security definer set search_path='' as $$
declare v_version integer;
begin
  if auth.uid() is null or not private.has_role(p_tenant,array['admin']) then
    raise exception 'Access denied' using errcode='42501';
  end if;
  update public.delegations
    set active=false,revoked_at=now(),version=version+1
    where tenant_id=p_tenant and id=p_delegation and active and version=p_expected_version
    returning version into v_version;
  if v_version is null then
    if exists(select 1 from public.delegations where tenant_id=p_tenant and id=p_delegation) then
      raise exception 'Version conflict' using errcode='40001';
    end if;
    raise exception 'Delegation unavailable' using errcode='42501';
  end if;
  perform private.audit(p_tenant,'delegation.revoked',p_delegation,jsonb_build_object('version',v_version));
  return v_version;
end;
$$;

-- ADMIN may manage memberships only inside its active tenant. SUPER_USER access
-- remains backed by private.platform_admins and can never be granted via this RPC.
create or replace function private.set_membership(p_tenant uuid,p_user uuid,p_role text,p_active boolean) returns void
language plpgsql security definer set search_path='' as $$
declare v_old public.memberships%rowtype;
begin
  if auth.uid() is null or not private.has_role(p_tenant,array['admin']) then
    raise exception 'Access denied' using errcode='42501';
  end if;
  if not exists(select 1 from auth.users where id=p_user and email_confirmed_at is not null) then
    raise exception 'Verified user required' using errcode='42501';
  end if;
  perform 1 from public.tenants where id=p_tenant for update;
  if not found then raise exception 'Tenant unavailable' using errcode='42501'; end if;
  select * into v_old from public.memberships where tenant_id=p_tenant and user_id=p_user for update;
  if v_old.role='admin' and v_old.active and (not p_active or p_role<>'admin') and not exists(
    select 1 from public.memberships where tenant_id=p_tenant and role='admin' and active and user_id<>p_user
  ) then raise exception 'Last administrator cannot be removed' using errcode='23514'; end if;
  if p_role <> 'customer' and exists(select 1 from public.customers where tenant_id=p_tenant and user_id=p_user) then
    raise exception 'Unlink customer identity before role change' using errcode='23514';
  end if;
  if p_role <> 'technician' and exists(select 1 from public.repairs where tenant_id=p_tenant and assigned_to=p_user) then
    raise exception 'Reassign repairs before role change' using errcode='23514';
  end if;
  insert into public.memberships(tenant_id,user_id,role,active) values(p_tenant,p_user,p_role,p_active)
  on conflict(tenant_id,user_id) do update set role=excluded.role,active=excluded.active;
  perform private.audit(p_tenant,'membership.changed',p_user,jsonb_build_object('role',p_role,'active',p_active));
end;
$$;

create policy delegations_read on public.delegations for select to authenticated using(
  private.has_role(tenant_id,array['admin']) or (granted_to=auth.uid() and private.has_role(tenant_id,array['advisor','technician']))
);
create policy tenant_files_read on public.tenant_files for select to authenticated using(
  private.has_role(tenant_id,array['admin']) or (owner_id=auth.uid() and private.has_role(tenant_id,array['advisor','technician','customer']))
);
create policy operation_jobs_read on public.operation_jobs for select to authenticated using(
  private.has_role(tenant_id,array['admin']) or (requested_by=auth.uid() and private.has_role(tenant_id,array['advisor','technician','customer']))
);

create function public.has_delegation(p_tenant uuid,p_permission text,p_resource uuid default null) returns boolean
language sql stable security invoker set search_path='' as $$select private.has_delegation(p_tenant,p_permission,p_resource);$$;
create function public.grant_delegation(p_tenant uuid,p_grantee uuid,p_permission text,p_resource uuid,p_expires_at timestamptz,p_request_id uuid) returns uuid
language sql security invoker set search_path='' as $$select private.grant_delegation(p_tenant,p_grantee,p_permission,p_resource,p_expires_at,p_request_id);$$;
create function public.revoke_delegation(p_tenant uuid,p_delegation uuid,p_expected_version integer) returns integer
language sql security invoker set search_path='' as $$select private.revoke_delegation(p_tenant,p_delegation,p_expected_version);$$;

revoke all on function private.has_delegation(uuid,text,uuid),private.grant_delegation(uuid,uuid,text,uuid,timestamptz,uuid),private.revoke_delegation(uuid,uuid,integer) from public,anon;
grant execute on function private.has_delegation(uuid,text,uuid),private.grant_delegation(uuid,uuid,text,uuid,timestamptz,uuid),private.revoke_delegation(uuid,uuid,integer) to authenticated;
revoke all on function public.has_delegation(uuid,text,uuid),public.grant_delegation(uuid,uuid,text,uuid,timestamptz,uuid),public.revoke_delegation(uuid,uuid,integer) from public,anon;
grant execute on function public.has_delegation(uuid,text,uuid),public.grant_delegation(uuid,uuid,text,uuid,timestamptz,uuid),public.revoke_delegation(uuid,uuid,integer) to authenticated;

commit;
