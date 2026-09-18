-- Source for the incremental local directory migration. Existing migrations stay immutable.
begin;

-- Profile metadata is untrusted presentation only. It never supplies a role,
-- membership, verification state, or any authorization decision.
create function private.directory_display_name(p_metadata jsonb) returns text
language sql immutable security invoker set search_path='' as $$
 select left(coalesce(
  nullif(btrim(regexp_replace(case when jsonb_typeof(p_metadata->'full_name')='string' then p_metadata->>'full_name' end,'[[:space:][:cntrl:]]+',' ','g')),''),
  nullif(btrim(regexp_replace(case when jsonb_typeof(p_metadata->'name')='string' then p_metadata->>'name' end,'[[:space:][:cntrl:]]+',' ','g')),''),
  'Usuario sin nombre'
 ),120);
$$;

create function private.list_team_members(p_tenant uuid)
returns table(user_id uuid,display_name text,role text,active boolean)
language plpgsql stable security definer set search_path='' as $$
declare
 v_actor uuid := auth.uid();
 v_master boolean := private.is_platform_admin();
 v_role text;
begin
 if v_actor is null then raise exception 'Access denied' using errcode='42501'; end if;
 if v_master then
  if not exists(select 1 from public.tenants t where t.id=p_tenant) then
   raise exception 'Access denied' using errcode='42501';
  end if;
 else
  select m.role into v_role
  from public.memberships m join public.tenants t on t.id=m.tenant_id
  where m.tenant_id=p_tenant and m.user_id=v_actor and m.active and t.status<>'closed';
  if not found then raise exception 'Access denied' using errcode='42501'; end if;
 end if;

 -- Admins and MFA platform admins can review inactive memberships as well.
 -- Advisors need technician names to read the repairs they already can access.
 -- Other members can resolve their own profile without enumerating teammates.
 return query
 select m.user_id,private.directory_display_name(u.raw_user_meta_data),m.role,m.active
 from public.memberships m join auth.users u on u.id=m.user_id
 where m.tenant_id=p_tenant and (
  v_master or v_role='admin' or (
   m.active and (m.user_id=v_actor or (v_role='advisor' and m.role='technician'))
  )
 )
 order by private.directory_display_name(u.raw_user_meta_data),m.user_id;
end;
$$;

-- Only the eligibility boolean crosses this boundary; subscription rows,
-- plan prices, dates and billing status retain their existing RLS restrictions.
create function private.tenant_operational(p_tenant uuid) returns boolean
language plpgsql stable security definer set search_path='' as $$
begin
 if auth.uid() is null or not exists(select 1 from public.tenants t where t.id=p_tenant) then
  return false;
 end if;
 if not private.has_role(p_tenant,array['admin','advisor','technician','customer']) then
  return false;
 end if;
 -- Preserve the existing master override used by authorized write commands.
 return private.can_operate(p_tenant);
end;
$$;

-- Global identity selection is exclusively a master operation with MFA.
-- Verified email disambiguates presentation names; UUID remains the selected
-- identity value passed to the already-authorized membership command.
create function private.list_verified_users()
returns table(user_id uuid,display_name text,email text)
language plpgsql stable security definer set search_path='' as $$
begin
 if auth.uid() is null or not private.is_platform_admin() then
  raise exception 'Platform MFA required' using errcode='42501';
 end if;
 return query
 select u.id,private.directory_display_name(u.raw_user_meta_data),u.email::text
 from auth.users u
 where u.email_confirmed_at is not null
 order by private.directory_display_name(u.raw_user_meta_data),u.email,u.id;
end;
$$;

create function public.list_team_members(p_tenant uuid)
returns table(user_id uuid,display_name text,role text,active boolean)
language sql stable security invoker set search_path='' as $$
 select * from private.list_team_members(p_tenant);
$$;
create function public.tenant_operational(p_tenant uuid) returns boolean
language sql stable security invoker set search_path='' as $$
 select private.tenant_operational(p_tenant);
$$;
create function public.list_verified_users()
returns table(user_id uuid,display_name text,email text)
language sql stable security invoker set search_path='' as $$
 select * from private.list_verified_users();
$$;

revoke all on function private.directory_display_name(jsonb),
 private.list_team_members(uuid),private.tenant_operational(uuid),private.list_verified_users(),
 public.list_team_members(uuid),public.tenant_operational(uuid),public.list_verified_users()
 from public,anon,authenticated;
grant execute on function
 private.list_team_members(uuid),private.tenant_operational(uuid),private.list_verified_users(),
 public.list_team_members(uuid),public.tenant_operational(uuid),public.list_verified_users()
 to authenticated;
commit;
