begin;
-- Definer functions are restricted, schema-qualified and contain explicit identity checks.
-- User metadata is never an authorization source. Private is NOT a Data API schema.
create function private.is_platform_admin() returns boolean
language sql stable security definer set search_path = '' as $$
 select auth.uid() is not null
 and coalesce(auth.jwt()->>'aal','aal1') = 'aal2'
 and exists(select 1 from private.platform_admins where user_id=auth.uid() and active);
$$;
create function private.has_role(p_tenant uuid,p_roles text[]) returns boolean
language sql stable security definer set search_path = '' as $$
 select auth.uid() is not null and (
   private.is_platform_admin() or exists(
     select 1 from public.memberships m join public.tenants t on t.id=m.tenant_id
     where m.tenant_id=p_tenant and m.user_id=auth.uid() and m.active
       and m.role=any(p_roles) and t.status<>'closed'
   )
 );
$$;
create function private.can_operate(p_tenant uuid) returns boolean
language sql stable security definer set search_path = '' as $$
 select auth.uid() is not null and (private.is_platform_admin() or exists(
   select 1 from public.tenants t join public.subscriptions s on s.tenant_id=t.id
   where t.id=p_tenant and t.status='active' and s.status in ('trialing','active') and s.current_period_end>now()
 ));
$$;
create function private.can_read_repair(p_tenant uuid,p_repair uuid) returns boolean
language sql stable security definer set search_path = '' as $$
 select auth.uid() is not null and (
  private.has_role(p_tenant,array['admin','advisor']) or exists(
   select 1 from public.repairs r join public.customers c on c.tenant_id=r.tenant_id and c.id=r.customer_id
   where r.tenant_id=p_tenant and r.id=p_repair and (
     (private.has_role(p_tenant,array['technician']) and r.assigned_to=auth.uid())
     or (private.has_role(p_tenant,array['customer']) and c.user_id=auth.uid())
   )
  )
 );
$$;
create function private.owns_repair(p_tenant uuid,p_repair uuid) returns boolean
language sql stable security definer set search_path = '' as $$
 select auth.uid() is not null and private.has_role(p_tenant,array['customer']) and exists(
   select 1 from public.repairs r join public.customers c on c.tenant_id=r.tenant_id and c.id=r.customer_id
   where r.id=p_repair and r.tenant_id=p_tenant and c.user_id=auth.uid()
 );
$$;
create function private.assert_write(p_tenant uuid,p_roles text[],p_mfa boolean default false) returns void
language plpgsql security definer set search_path = '' as $$
begin
 if auth.uid() is null or not private.has_role(p_tenant,p_roles) then raise exception 'Access denied' using errcode='42501'; end if;
 if not private.can_operate(p_tenant) then raise exception 'Tenant is not operational' using errcode='42501'; end if;
 if p_mfa and coalesce(auth.jwt()->>'aal','aal1')<>'aal2' then raise exception 'MFA required' using errcode='42501'; end if;
end;
$$;
create function private.audit(p_tenant uuid,p_action text,p_record uuid,p_metadata jsonb default '{}'::jsonb) returns void
language plpgsql security definer set search_path = '' as $$
begin
 if auth.uid() is null then raise exception 'Authentication required' using errcode='42501'; end if;
 insert into public.audit_events(tenant_id,actor_id,action,record_id,metadata) values(p_tenant,auth.uid(),p_action,p_record,p_metadata);
end;
$$;

create policy tenants_read on public.tenants for select to authenticated
 using(private.has_role(id,array['admin','advisor','technician','customer']));
create policy memberships_read on public.memberships for select to authenticated
 using(private.has_role(tenant_id,array['admin']) or (user_id=auth.uid() and active and private.has_role(tenant_id,array['advisor','technician','customer'])));
create policy plans_read on public.plans for select to authenticated using(auth.uid() is not null);
create policy subscriptions_read on public.subscriptions for select to authenticated using(private.has_role(tenant_id,array['admin']));
create policy settings_read on public.tenant_settings for select to authenticated using(private.has_role(tenant_id,array['admin']));
create policy customers_read on public.customers for select to authenticated
 using(private.has_role(tenant_id,array['admin','advisor']) or (user_id=auth.uid() and private.has_role(tenant_id,array['customer'])));
create policy repairs_read on public.repairs for select to authenticated using(private.can_read_repair(tenant_id,id));
create policy events_read on public.repair_events for select to authenticated using(private.can_read_repair(tenant_id,repair_id));
create policy payments_read on public.payments for select to authenticated
 using(private.has_role(tenant_id,array['admin']) or private.owns_repair(tenant_id,repair_id));
create policy vouchers_read on public.vouchers for select to authenticated
 using(private.has_role(tenant_id,array['admin']) or private.owns_repair(tenant_id,repair_id) or (kind='intake' and private.has_role(tenant_id,array['advisor'])));
create policy audit_read on public.audit_events for select to authenticated using(private.has_role(tenant_id,array['admin']));

revoke all on all functions in schema private from public,anon,authenticated;
-- Policy helpers only. No API caller can append arbitrary audit records.
grant execute on function private.is_platform_admin(),private.has_role(uuid,text[]),private.can_operate(uuid),private.can_read_repair(uuid,uuid),private.owns_repair(uuid,uuid) to authenticated;
create function public.is_platform_admin() returns boolean language sql stable security invoker set search_path='' as $$select private.is_platform_admin();$$;
revoke all on function public.is_platform_admin() from public,anon;
grant execute on function public.is_platform_admin() to authenticated;
revoke select on public.repair_events from authenticated;
grant select(id,tenant_id,repair_id,status,created_at) on public.repair_events to authenticated;
commit;
