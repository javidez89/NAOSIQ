begin;
create function private.create_customer(p_tenant uuid,p_name text,p_phone text) returns uuid
language plpgsql security definer set search_path='' as $$
declare v_id uuid;
begin
 perform private.assert_write(p_tenant,array['admin','advisor']);
 insert into public.customers(tenant_id,name,phone) values(p_tenant,trim(p_name),trim(p_phone)) returning id into v_id;
 perform private.audit(p_tenant,'customer.created',v_id);
 return v_id;
end;$$;

create function private.create_repair(p_tenant uuid,p_customer uuid,p_device text,p_issue text,p_request_id uuid) returns uuid
language plpgsql security definer set search_path='' as $$
declare v_id uuid; v_existing public.repairs%rowtype; v_name text; v_business text;
begin
 perform private.assert_write(p_tenant,array['admin','advisor']);
 select name into v_name from public.customers where tenant_id=p_tenant and id=p_customer;
 if not found then raise exception 'Customer unavailable' using errcode='42501'; end if;
 insert into public.repairs(tenant_id,customer_id,device,issue,created_by,request_id)
 values(p_tenant,p_customer,trim(p_device),trim(p_issue),auth.uid(),p_request_id)
 on conflict(tenant_id,request_id) do nothing returning id into v_id;
 if v_id is null then
   select * into strict v_existing from public.repairs where tenant_id=p_tenant and request_id=p_request_id;
   if v_existing.customer_id<>p_customer or v_existing.device<>trim(p_device) or v_existing.issue<>trim(p_issue) or v_existing.created_by<>auth.uid() then
     raise exception 'Idempotency conflict' using errcode='23505';
   end if;
   return v_existing.id;
 end if;
 select name into v_business from public.tenants where id=p_tenant;
 insert into public.repair_events(tenant_id,repair_id,status,actor_id) values(p_tenant,v_id,'created',auth.uid());
 insert into public.vouchers(tenant_id,repair_id,kind,snapshot)
 values(p_tenant,v_id,'intake',jsonb_build_object('business',v_business,'customer',v_name,'device',trim(p_device),'issue',trim(p_issue),'repair_id',v_id,'issued_at',now()));
 perform private.audit(p_tenant,'repair.created',v_id);
 insert into private.outbox(tenant_id,event_type,aggregate_id) values(p_tenant,'repair.created',v_id);
 return v_id;
end;$$;

create function private.transition_repair(p_tenant uuid,p_repair uuid,p_expected_version integer,p_status text) returns integer
language plpgsql security definer set search_path='' as $$
declare r public.repairs%rowtype; v_allowed boolean;
begin
 perform private.assert_write(p_tenant,array['admin','technician']);
 select * into r from public.repairs where tenant_id=p_tenant and id=p_repair for update;
 if not found or not private.can_read_repair(p_tenant,p_repair) then raise exception 'Repair unavailable' using errcode='42501'; end if;
 if r.version is distinct from p_expected_version then raise exception 'Version conflict' using errcode='40001'; end if;
 v_allowed := case r.status
 when 'created' then p_status in ('in_repair','software_installation')
 when 'in_repair' then p_status in ('waiting_parts','software_installation','backup_completed','completed')
 when 'waiting_parts' then p_status='in_repair'
 when 'software_installation' then p_status in ('in_repair','backup_completed','completed')
 when 'backup_completed' then p_status in ('in_repair','completed')
 else false end;
 if not coalesce(v_allowed,false) then raise exception 'Invalid transition' using errcode='23514'; end if;
 update public.repairs set status=p_status,version=version+1,updated_at=now() where tenant_id=p_tenant and id=p_repair;
 insert into public.repair_events(tenant_id,repair_id,status,actor_id) values(p_tenant,p_repair,p_status,auth.uid());
 perform private.audit(p_tenant,'repair.transitioned',p_repair,jsonb_build_object('from',r.status,'to',p_status,'version',r.version+1));
 insert into private.outbox(tenant_id,event_type,aggregate_id,payload) values(p_tenant,'repair.transitioned',p_repair,jsonb_build_object('status',p_status));
 return r.version+1;
end;$$;

create function private.assign_technician(p_tenant uuid,p_repair uuid,p_user uuid) returns void
language plpgsql security definer set search_path='' as $$
begin
 perform private.assert_write(p_tenant,array['admin']);
 if not exists(select 1 from public.memberships where tenant_id=p_tenant and user_id=p_user and active and role='technician') then
   raise exception 'Technician unavailable' using errcode='42501'; end if;
 update public.repairs set assigned_to=p_user,version=version+1,updated_at=now() where tenant_id=p_tenant and id=p_repair;
 if not found then raise exception 'Repair unavailable' using errcode='42501'; end if;
 perform private.audit(p_tenant,'repair.assigned',p_repair,jsonb_build_object('assignee',p_user));
end;$$;

create function private.record_payment(p_tenant uuid,p_repair uuid,p_amount bigint,p_method text,p_idempotency_key text) returns uuid
language plpgsql security definer set search_path='' as $$
declare v_id uuid; v_existing public.payments%rowtype;
begin
 perform private.assert_write(p_tenant,array['admin']);
 if not exists(select 1 from public.repairs where tenant_id=p_tenant and id=p_repair) then raise exception 'Repair unavailable' using errcode='42501'; end if;
 insert into public.payments(tenant_id,repair_id,amount_minor,method,idempotency_key,created_by)
 values(p_tenant,p_repair,p_amount,p_method,p_idempotency_key,auth.uid())
 on conflict(tenant_id,idempotency_key) do nothing returning id into v_id;
 if v_id is null then
   select * into strict v_existing from public.payments where tenant_id=p_tenant and idempotency_key=p_idempotency_key;
   if v_existing.repair_id is distinct from p_repair or v_existing.amount_minor is distinct from p_amount or v_existing.method is distinct from p_method then
      raise exception 'Idempotency conflict' using errcode='23505'; end if;
   return v_existing.id;
 end if;
 perform private.audit(p_tenant,'payment.pending',v_id);
 return v_id;
end;$$;

create function private.confirm_payment(p_tenant uuid,p_payment uuid) returns uuid
language plpgsql security definer set search_path='' as $$
declare p public.payments%rowtype; v_voucher uuid; v_business text;
begin
 perform private.assert_write(p_tenant,array['admin'],true);
 select * into p from public.payments where tenant_id=p_tenant and id=p_payment for update;
 if not found then raise exception 'Payment unavailable' using errcode='42501'; end if;
 if p.status='reversed' then raise exception 'Payment reversed' using errcode='23514'; end if;
 if p.status='confirmed' then select id into strict v_voucher from public.vouchers where payment_id=p.id; return v_voucher; end if;
 update public.payments set status='confirmed',confirmed_by=auth.uid(),confirmed_at=now() where id=p.id;
 select name into v_business from public.tenants where id=p_tenant;
 insert into public.vouchers(tenant_id,repair_id,payment_id,kind,snapshot)
 values(p_tenant,p.repair_id,p.id,'payment',jsonb_build_object('business',v_business,'repair_id',p.repair_id,'payment_id',p.id,'amount_minor',p.amount_minor,'currency',p.currency,'method',p.method,'issued_at',now()))
 returning id into v_voucher;
 perform private.audit(p_tenant,'payment.confirmed',p.id,jsonb_build_object('voucher_id',v_voucher));
 insert into private.outbox(tenant_id,event_type,aggregate_id) values(p_tenant,'payment.confirmed',p.id);
 return v_voucher;
end;$$;

create function private.provision_tenant(p_name text,p_slug text,p_admin uuid,p_period_end timestamptz) returns uuid
language plpgsql security definer set search_path='' as $$
declare v_id uuid;
begin
 if not private.is_platform_admin() then raise exception 'Platform MFA required' using errcode='42501'; end if;
 if p_period_end is null or p_period_end<=now() or p_period_end>now()+interval '1 year' then raise exception 'Invalid period' using errcode='23514'; end if;
 if not exists(select 1 from auth.users where id=p_admin and email_confirmed_at is not null) then raise exception 'Verified administrator required' using errcode='42501'; end if;
 insert into public.tenants(name,slug) values(trim(p_name),p_slug) returning id into v_id;
 insert into public.memberships(tenant_id,user_id,role) values(v_id,p_admin,'admin');
 insert into public.subscriptions(tenant_id,plan_code,status,current_period_end) values(v_id,'basic','trialing',p_period_end);
 insert into public.tenant_settings(tenant_id) values(v_id);
 perform private.audit(v_id,'tenant.provisioned',v_id);
 return v_id;
end;$$;
create function private.set_tenant_status(p_tenant uuid,p_status text,p_reason text) returns void
language plpgsql security definer set search_path='' as $$
begin
 if not private.is_platform_admin() then raise exception 'Platform MFA required' using errcode='42501'; end if;
 if p_reason is null or char_length(trim(p_reason))<10 or char_length(p_reason)>500 then raise exception 'Reason required' using errcode='23514'; end if;
 update public.tenants set status=p_status where id=p_tenant;
 if not found then raise exception 'Tenant unavailable' using errcode='42501'; end if;
 perform private.audit(p_tenant,'tenant.status_changed',p_tenant,jsonb_build_object('status',p_status,'reason',trim(p_reason)));
end;$$;

-- The public API contains security-invoker wrappers only. Each private command
-- performs explicit authorization; authenticated receives no table write grants.
create function public.create_customer(p_tenant uuid,p_name text,p_phone text) returns uuid language sql security invoker set search_path='' as $$select private.create_customer(p_tenant,p_name,p_phone);$$;
create function public.create_repair(p_tenant uuid,p_customer uuid,p_device text,p_issue text,p_request_id uuid) returns uuid language sql security invoker set search_path='' as $$select private.create_repair(p_tenant,p_customer,p_device,p_issue,p_request_id);$$;
create function public.transition_repair(p_tenant uuid,p_repair uuid,p_expected_version integer,p_status text) returns integer language sql security invoker set search_path='' as $$select private.transition_repair(p_tenant,p_repair,p_expected_version,p_status);$$;
create function public.assign_technician(p_tenant uuid,p_repair uuid,p_user uuid) returns void language sql security invoker set search_path='' as $$select private.assign_technician(p_tenant,p_repair,p_user);$$;
create function public.record_payment(p_tenant uuid,p_repair uuid,p_amount bigint,p_method text,p_idempotency_key text) returns uuid language sql security invoker set search_path='' as $$select private.record_payment(p_tenant,p_repair,p_amount,p_method,p_idempotency_key);$$;
create function public.confirm_payment(p_tenant uuid,p_payment uuid) returns uuid language sql security invoker set search_path='' as $$select private.confirm_payment(p_tenant,p_payment);$$;
create function public.provision_tenant(p_name text,p_slug text,p_admin uuid,p_period_end timestamptz) returns uuid language sql security invoker set search_path='' as $$select private.provision_tenant(p_name,p_slug,p_admin,p_period_end);$$;
create function public.set_tenant_status(p_tenant uuid,p_status text,p_reason text) returns void language sql security invoker set search_path='' as $$select private.set_tenant_status(p_tenant,p_status,p_reason);$$;

revoke all on function private.create_customer(uuid,text,text),private.create_repair(uuid,uuid,text,text,uuid),private.transition_repair(uuid,uuid,integer,text),private.assign_technician(uuid,uuid,uuid),private.record_payment(uuid,uuid,bigint,text,text),private.confirm_payment(uuid,uuid),private.provision_tenant(text,text,uuid,timestamptz),private.set_tenant_status(uuid,text,text) from public,anon;
grant execute on function private.create_customer(uuid,text,text),private.create_repair(uuid,uuid,text,text,uuid),private.transition_repair(uuid,uuid,integer,text),private.assign_technician(uuid,uuid,uuid),private.record_payment(uuid,uuid,bigint,text,text),private.confirm_payment(uuid,uuid),private.provision_tenant(text,text,uuid,timestamptz),private.set_tenant_status(uuid,text,text) to authenticated;
revoke all on function public.create_customer(uuid,text,text),public.create_repair(uuid,uuid,text,text,uuid),public.transition_repair(uuid,uuid,integer,text),public.assign_technician(uuid,uuid,uuid),public.record_payment(uuid,uuid,bigint,text,text),public.confirm_payment(uuid,uuid),public.provision_tenant(text,text,uuid,timestamptz),public.set_tenant_status(uuid,text,text) from public,anon;
grant execute on function public.create_customer(uuid,text,text),public.create_repair(uuid,uuid,text,text,uuid),public.transition_repair(uuid,uuid,integer,text),public.assign_technician(uuid,uuid,uuid),public.record_payment(uuid,uuid,bigint,text,text),public.confirm_payment(uuid,uuid),public.provision_tenant(text,text,uuid,timestamptz),public.set_tenant_status(uuid,text,text) to authenticated;
commit;
