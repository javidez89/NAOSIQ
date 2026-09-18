begin;

-- P04: an explicit, opaque context records when a real Super Usuario enters a
-- tenant workspace. The context never changes the actor or creates a tenant role.
create table public.master_control_contexts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id),
  actor_id uuid not null references auth.users(id),
  reason text not null check(char_length(trim(reason)) between 10 and 500),
  request_id uuid not null,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  version integer not null default 1 check(version > 0),
  unique(actor_id,request_id),
  check(ended_at is null or ended_at>=started_at)
);
create index master_control_contexts_actor_open_idx
  on public.master_control_contexts(actor_id,tenant_id,started_at desc)
  where ended_at is null;

alter table public.master_control_contexts enable row level security;
revoke all on public.master_control_contexts from public,anon,authenticated;
grant select(id,tenant_id,actor_id,reason,started_at,ended_at,version)
  on public.master_control_contexts to authenticated;
create policy master_control_contexts_read on public.master_control_contexts
  for select to authenticated using(private.is_platform_admin() and actor_id=auth.uid());

create function private.start_master_control_context(
  p_tenant uuid,p_reason text,p_request_id uuid
) returns uuid
language plpgsql security definer set search_path='' as $$
declare
  v_existing public.master_control_contexts%rowtype;
  v_id uuid;
  v_reason text := trim(p_reason);
begin
  if not private.is_platform_admin() then
    raise exception 'Platform MFA required' using errcode='42501';
  end if;
  if char_length(v_reason)<10 or char_length(v_reason)>500 then
    raise exception 'Reason required' using errcode='23514';
  end if;
  perform 1 from public.tenants where id=p_tenant;
  if not found then raise exception 'Tenant unavailable' using errcode='42501'; end if;

  select * into v_existing from public.master_control_contexts
    where actor_id=auth.uid() and request_id=p_request_id;
  if found then
    if v_existing.tenant_id<>p_tenant or v_existing.reason<>v_reason then
      raise exception 'Idempotency key reused with different context' using errcode='23505';
    end if;
    return v_existing.id;
  end if;

  insert into public.master_control_contexts(tenant_id,actor_id,reason,request_id)
    values(p_tenant,auth.uid(),v_reason,p_request_id) returning id into v_id;
  perform private.audit(p_tenant,'master.context.started',v_id,jsonb_build_object('reason',v_reason));
  return v_id;
end;
$$;

create function private.has_master_control_context(p_tenant uuid,p_context uuid) returns boolean
language sql stable security definer set search_path='' as $$
  select private.is_platform_admin() and exists(
    select 1 from public.master_control_contexts
    where id=p_context and tenant_id=p_tenant and actor_id=auth.uid() and ended_at is null
  );
$$;

create function private.end_master_control_context(
  p_tenant uuid,p_context uuid,p_expected_version integer
) returns integer
language plpgsql security definer set search_path='' as $$
declare v_version integer;
begin
  if not private.is_platform_admin() then
    raise exception 'Platform MFA required' using errcode='42501';
  end if;
  update public.master_control_contexts
    set ended_at=now(),version=version+1
    where id=p_context and tenant_id=p_tenant and actor_id=auth.uid()
      and ended_at is null and version=p_expected_version
    returning version into v_version;
  if v_version is null then
    if exists(select 1 from public.master_control_contexts where id=p_context and actor_id=auth.uid()) then
      raise exception 'Version conflict or context already closed' using errcode='40001';
    end if;
    raise exception 'Control context unavailable' using errcode='42501';
  end if;
  perform private.audit(p_tenant,'master.context.ended',p_context,jsonb_build_object('version',v_version));
  return v_version;
end;
$$;

create function public.start_master_control_context(p_tenant uuid,p_reason text,p_request_id uuid) returns uuid
language sql security invoker set search_path='' as $$select private.start_master_control_context(p_tenant,p_reason,p_request_id);$$;
create function public.has_master_control_context(p_tenant uuid,p_context uuid) returns boolean
language sql stable security invoker set search_path='' as $$select private.has_master_control_context(p_tenant,p_context);$$;
create function public.end_master_control_context(p_tenant uuid,p_context uuid,p_expected_version integer) returns integer
language sql security invoker set search_path='' as $$select private.end_master_control_context(p_tenant,p_context,p_expected_version);$$;

revoke all on function private.start_master_control_context(uuid,text,uuid),private.has_master_control_context(uuid,uuid),private.end_master_control_context(uuid,uuid,integer) from public,anon;
grant execute on function private.start_master_control_context(uuid,text,uuid),private.has_master_control_context(uuid,uuid),private.end_master_control_context(uuid,uuid,integer) to authenticated;
revoke all on function public.start_master_control_context(uuid,text,uuid),public.has_master_control_context(uuid,uuid),public.end_master_control_context(uuid,uuid,integer) from public,anon;
grant execute on function public.start_master_control_context(uuid,text,uuid),public.has_master_control_context(uuid,uuid),public.end_master_control_context(uuid,uuid,integer) to authenticated;

commit;
