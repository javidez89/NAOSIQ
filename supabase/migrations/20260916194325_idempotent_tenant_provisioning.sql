begin;

alter table public.tenants add column provision_request_id uuid;
create unique index tenants_provision_request_unique
  on public.tenants(provision_request_id) where provision_request_id is not null;

create function private.provision_tenant_v2(
  p_name text,p_slug text,p_admin uuid,p_period_end timestamptz,p_request_id uuid
) returns uuid
language plpgsql security definer set search_path='' as $$
declare
  v_id uuid;
  v_name text := trim(p_name);
begin
  if not private.is_platform_admin() then
    raise exception 'Platform MFA required' using errcode='42501';
  end if;
  if p_period_end is null or p_period_end<=now() or p_period_end>now()+interval '1 year' then
    raise exception 'Invalid period' using errcode='23514';
  end if;
  if not exists(select 1 from auth.users where id=p_admin and email_confirmed_at is not null) then
    raise exception 'Verified administrator required' using errcode='42501';
  end if;

  select id into v_id from public.tenants where provision_request_id=p_request_id;
  if found then
    if not exists(
      select 1 from public.tenants t
      join public.memberships m on m.tenant_id=t.id and m.user_id=p_admin and m.role='admin' and m.active
      join public.subscriptions s on s.tenant_id=t.id and s.plan_code='basic' and s.status='trialing'
      where t.id=v_id and t.name=v_name and t.slug=p_slug and s.current_period_end=p_period_end
    ) then
      raise exception 'Idempotency key reused with different tenant' using errcode='23505';
    end if;
    return v_id;
  end if;

  insert into public.tenants(name,slug,provision_request_id)
    values(v_name,p_slug,p_request_id) returning id into v_id;
  insert into public.memberships(tenant_id,user_id,role) values(v_id,p_admin,'admin');
  insert into public.subscriptions(tenant_id,plan_code,status,current_period_end)
    values(v_id,'basic','trialing',p_period_end);
  insert into public.tenant_settings(tenant_id) values(v_id);
  perform private.audit(v_id,'tenant.provisioned',v_id,jsonb_build_object('request_id',p_request_id));
  return v_id;
end;
$$;

create function public.provision_tenant_v2(
  p_name text,p_slug text,p_admin uuid,p_period_end timestamptz,p_request_id uuid
) returns uuid
language sql security invoker set search_path='' as $$
  select private.provision_tenant_v2(p_name,p_slug,p_admin,p_period_end,p_request_id);
$$;

-- P04 callers must use the recoverable command. Keep the old function for
-- migration history and internal compatibility, but remove API execution.
revoke all on function public.provision_tenant(text,text,uuid,timestamptz) from authenticated;
revoke all on function private.provision_tenant(text,text,uuid,timestamptz) from authenticated;
revoke all on function private.provision_tenant_v2(text,text,uuid,timestamptz,uuid) from public,anon;
grant execute on function private.provision_tenant_v2(text,text,uuid,timestamptz,uuid) to authenticated;
revoke all on function public.provision_tenant_v2(text,text,uuid,timestamptz,uuid) from public,anon;
grant execute on function public.provision_tenant_v2(text,text,uuid,timestamptz,uuid) to authenticated;

commit;
