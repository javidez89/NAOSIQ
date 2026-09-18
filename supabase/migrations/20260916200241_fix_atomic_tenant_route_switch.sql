begin;

create or replace function private.assign_tenant_slug(
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
  -- Reserve the globally unique slug before mutating the current route. It is
  -- initially a valid redirect, then promoted after the old primary is demoted.
  insert into public.tenant_routes(slug,tenant_id,status,redirect_to_slug,version,assigned_by)
    values(v_slug,p_tenant,'redirect',v_current.slug,v_version,auth.uid());
  update public.tenant_routes set status='redirect',redirect_to_slug=v_slug,version=version+1
    where slug=v_current.slug;
  update public.tenant_routes set status='primary',redirect_to_slug=null
    where slug=v_slug;
  update public.tenants set slug=v_slug where id=p_tenant;
  insert into public.tenant_route_changes(tenant_id,actor_id,request_id,previous_slug,assigned_slug,result_version)
    values(p_tenant,auth.uid(),p_request_id,v_current.slug,v_slug,v_version);
  perform private.audit(p_tenant,'tenant.route.assigned',p_tenant,jsonb_build_object(
    'previous_slug',v_current.slug,'assigned_slug',v_slug,'version',v_version
  ));
  return v_version;
end;
$$;

commit;
