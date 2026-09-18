begin;
-- Initial least-privilege membership administration belongs to the master.
-- Delegation to the merchant admin is a product decision, not silently granted.
create function private.set_membership(p_tenant uuid,p_user uuid,p_role text,p_active boolean) returns void
language plpgsql security definer set search_path='' as $$
declare v_old public.memberships%rowtype;
begin
 if not private.is_platform_admin() then raise exception 'Platform MFA required' using errcode='42501'; end if;
 if not exists(select 1 from auth.users where id=p_user and email_confirmed_at is not null) then raise exception 'Verified user required' using errcode='42501'; end if;
 -- Serialize membership changes for this tenant, including last-admin protection.
 perform 1 from public.tenants where id=p_tenant for update;
 if not found then raise exception 'Tenant unavailable' using errcode='42501'; end if;
 select * into v_old from public.memberships where tenant_id=p_tenant and user_id=p_user for update;
 if v_old.role='admin' and v_old.active and (not p_active or p_role<>'admin') and not exists(
    select 1 from public.memberships where tenant_id=p_tenant and role='admin' and active and user_id<>p_user
 ) then raise exception 'Last administrator cannot be removed' using errcode='23514'; end if;
 if p_role <> 'customer' and exists(select 1 from public.customers where tenant_id=p_tenant and user_id=p_user) then
   raise exception 'Unlink customer identity before role change' using errcode='23514'; end if;
 if p_role <> 'technician' and exists(select 1 from public.repairs where tenant_id=p_tenant and assigned_to=p_user) then
   raise exception 'Reassign repairs before role change' using errcode='23514'; end if;
 insert into public.memberships(tenant_id,user_id,role,active) values(p_tenant,p_user,p_role,p_active)
 on conflict(tenant_id,user_id) do update set role=excluded.role,active=excluded.active;
 perform private.audit(p_tenant,'membership.changed',p_user,jsonb_build_object('role',p_role,'active',p_active));
end;$$;
create function private.link_customer(p_tenant uuid,p_customer uuid,p_user uuid) returns void
language plpgsql security definer set search_path='' as $$
begin
 if not private.is_platform_admin() then raise exception 'Platform MFA required' using errcode='42501'; end if;
 if not exists(select 1 from public.memberships where tenant_id=p_tenant and user_id=p_user and role='customer' and active) then
   raise exception 'Customer membership required' using errcode='42501'; end if;
 update public.customers set user_id=p_user where id=p_customer and tenant_id=p_tenant and user_id is null;
 if not found then raise exception 'Customer unavailable or already linked' using errcode='42501'; end if;
 perform private.audit(p_tenant,'customer.linked',p_customer,jsonb_build_object('user_id',p_user));
end;$$;
create function public.set_membership(p_tenant uuid,p_user uuid,p_role text,p_active boolean) returns void language sql security invoker set search_path='' as $$select private.set_membership(p_tenant,p_user,p_role,p_active);$$;
create function public.link_customer(p_tenant uuid,p_customer uuid,p_user uuid) returns void language sql security invoker set search_path='' as $$select private.link_customer(p_tenant,p_customer,p_user);$$;
revoke all on function private.set_membership(uuid,uuid,text,boolean),private.link_customer(uuid,uuid,uuid),public.set_membership(uuid,uuid,text,boolean),public.link_customer(uuid,uuid,uuid) from public,anon;
grant execute on function private.set_membership(uuid,uuid,text,boolean),private.link_customer(uuid,uuid,uuid),public.set_membership(uuid,uuid,text,boolean),public.link_customer(uuid,uuid,uuid) to authenticated;
commit;
