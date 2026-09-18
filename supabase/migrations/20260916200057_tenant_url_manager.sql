begin;

create table public.tenant_routes (
  slug text primary key check(char_length(slug) between 3 and 48 and slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  tenant_id uuid not null references public.tenants(id),
  status text not null check(status in ('primary','redirect')),
  redirect_to_slug text references public.tenant_routes(slug),
  version integer not null default 1 check(version>0),
  assigned_by uuid references auth.users(id),
  assigned_at timestamptz not null default now(),
  check((status='primary' and redirect_to_slug is null) or (status='redirect' and redirect_to_slug is not null and redirect_to_slug<>slug))
);
create unique index tenant_routes_one_primary_idx on public.tenant_routes(tenant_id) where status='primary';

insert into public.tenant_routes(slug,tenant_id,status)
select slug,id,'primary' from public.tenants;

create table public.tenant_route_changes (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id),
  actor_id uuid not null references auth.users(id),
  request_id uuid not null unique,
  previous_slug text not null,
  assigned_slug text not null,
  result_version integer not null check(result_version>0),
  created_at timestamptz not null default now()
);

alter table public.tenant_routes enable row level security;
alter table public.tenant_route_changes enable row level security;
revoke all on public.tenant_routes,public.tenant_route_changes from public,anon,authenticated;
grant select on public.tenant_routes,public.tenant_route_changes to authenticated;
create policy tenant_routes_master_read on public.tenant_routes for select to authenticated using(private.is_platform_admin());
create policy tenant_route_changes_master_read on public.tenant_route_changes for select to authenticated using(private.is_platform_admin());

create function private.valid_tenant_slug(p_slug text) returns boolean
language sql immutable set search_path='' as $$
  select p_slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
    and char_length(p_slug) between 3 and 48
    and p_slug not in ('admin','api','auth','login','master','app','demo','cliente','comercio');
$$;

create function private.tenant_slug_available(p_slug text) returns boolean
language sql stable security definer set search_path='' as $$
  select private.is_platform_admin() and private.valid_tenant_slug(p_slug)
    and not exists(select 1 from public.tenant_routes where slug=p_slug);
$$;

create function private.assign_tenant_slug(
  p_tenant uuid,p_slug text,p_expected_version integer,p_request_id uuid
) returns integer
language plpgsql security definer set search_path='' as $$
declare
  v_slug text := lower(trim(p_slug));
  v_current public.tenant_routes%rowtype;
  v_change public.tenant_route_changes%rowtype;
  v_version integer;
begin
  if not private.is_platform_admin() then raise exception 'Platform MFA required' using errcode='42501'; end if;
  if not private.valid_tenant_slug(v_slug) then raise exception 'Reserved or invalid slug' using errcode='23514'; end if;
  select * into v_change from public.tenant_route_changes where request_id=p_request_id;
  if found then
    if v_change.tenant_id<>p_tenant or v_change.assigned_slug<>v_slug then
      raise exception 'Idempotency key reused with different route' using errcode='23505';
    end if;
    return v_change.result_version;
  end if;
  select * into v_current from public.tenant_routes where tenant_id=p_tenant and status='primary' for update;
  if not found then raise exception 'Tenant route unavailable' using errcode='42501'; end if;
  if v_current.version<>p_expected_version then raise exception 'Version conflict' using errcode='40001'; end if;
  if v_current.slug=v_slug then
    insert into public.tenant_route_changes(tenant_id,actor_id,request_id,previous_slug,assigned_slug,result_version)
      values(p_tenant,auth.uid(),p_request_id,v_slug,v_slug,v_current.version);
    return v_current.version;
  end if;
  v_version := v_current.version+1;
  insert into public.tenant_routes(slug,tenant_id,status,version,assigned_by)
    values(v_slug,p_tenant,'primary',v_version,auth.uid());
  update public.tenant_routes set status='redirect',redirect_to_slug=v_slug,version=version+1
    where slug=v_current.slug;
  update public.tenants set slug=v_slug where id=p_tenant;
  insert into public.tenant_route_changes(tenant_id,actor_id,request_id,previous_slug,assigned_slug,result_version)
    values(p_tenant,auth.uid(),p_request_id,v_current.slug,v_slug,v_version);
  perform private.audit(p_tenant,'tenant.route.assigned',p_tenant,jsonb_build_object(
    'previous_slug',v_current.slug,'assigned_slug',v_slug,'version',v_version
  ));
  return v_version;
end;
$$;

create function public.tenant_slug_available(p_slug text) returns boolean
language sql stable security invoker set search_path='' as $$select private.tenant_slug_available(lower(trim(p_slug)));$$;
create function public.assign_tenant_slug(p_tenant uuid,p_slug text,p_expected_version integer,p_request_id uuid) returns integer
language sql security invoker set search_path='' as $$select private.assign_tenant_slug(p_tenant,p_slug,p_expected_version,p_request_id);$$;
create function public.resolve_tenant_slug(p_slug text)
returns table(tenant_id uuid,status text,target_slug text)
language sql stable security definer set search_path='' as $$
  select r.tenant_id,r.status,coalesce(r.redirect_to_slug,r.slug)
  from public.tenant_routes r where r.slug=lower(trim(p_slug));
$$;

revoke all on function private.valid_tenant_slug(text),private.tenant_slug_available(text),private.assign_tenant_slug(uuid,text,integer,uuid) from public,anon;
grant execute on function private.tenant_slug_available(text),private.assign_tenant_slug(uuid,text,integer,uuid) to authenticated;
revoke all on function public.tenant_slug_available(text),public.assign_tenant_slug(uuid,text,integer,uuid) from public,anon;
grant execute on function public.tenant_slug_available(text),public.assign_tenant_slug(uuid,text,integer,uuid) to authenticated;
revoke all on function public.resolve_tenant_slug(text) from public;
grant execute on function public.resolve_tenant_slug(text) to anon,authenticated;

commit;
