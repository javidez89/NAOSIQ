begin;
-- Existing documents remain unchanged. No historical custody is inferred.
create table public.intake_events (
 id uuid primary key default gen_random_uuid(),
 tenant_id uuid not null,
 repair_id uuid not null,
 operation_id uuid not null,
 actor_id uuid not null references auth.users(id),
 physical_condition text not null check(char_length(physical_condition) between 2 and 1000),
 accessories text not null check(char_length(accessories) between 2 and 1000),
 confirmed_at timestamptz not null default now(),
 voucher_id uuid not null unique references public.vouchers(id),
 unique(tenant_id,repair_id), unique(tenant_id,operation_id),
 foreign key(tenant_id,repair_id) references public.repairs(tenant_id,id)
);
alter table public.intake_events enable row level security;
revoke all on public.intake_events from public,anon,authenticated;
grant select(id,tenant_id,repair_id,physical_condition,accessories,confirmed_at,voucher_id) on public.intake_events to authenticated;
create policy intake_read on public.intake_events for select to authenticated
 using(private.can_read_repair(tenant_id,repair_id));

-- One new voucher per confirmed event; legacy snapshots are preserved verbatim.
drop index public.vouchers_intake_unique;
create unique index vouchers_intake_event_unique on public.vouchers(tenant_id,(snapshot->>'intake_event_id'))
 where kind='intake' and snapshot ? 'intake_event_id';

create function private.confirm_intake(p_tenant uuid,p_repair uuid,p_expected_version integer,
 p_operation_id uuid,p_condition text,p_accessories text) returns uuid
language plpgsql security definer set search_path='' as $$
declare r public.repairs%rowtype; e public.intake_events%rowtype;
 v_event uuid:=gen_random_uuid(); v_voucher uuid; v_business text; v_customer text; v_actor text;
begin
 perform private.assert_write(p_tenant,array['admin','advisor']);
 select * into r from public.repairs where tenant_id=p_tenant and id=p_repair for update;
 if not found then raise exception 'Repair unavailable' using errcode='42501'; end if;
 select * into e from public.intake_events where tenant_id=p_tenant and repair_id=p_repair;
 if found then
  if e.operation_id is distinct from p_operation_id or e.actor_id is distinct from auth.uid()
   or e.physical_condition is distinct from trim(p_condition) or e.accessories is distinct from trim(p_accessories)
  then raise exception 'Intake already confirmed; consult original result' using errcode='23505'; end if;
  return e.voucher_id;
 end if;
 if r.version is distinct from p_expected_version then raise exception 'Version conflict' using errcode='40001'; end if;
 if p_operation_id is null or p_condition is null or p_accessories is null
  or char_length(trim(p_condition)) not between 2 and 1000 or char_length(trim(p_accessories)) not between 2 and 1000
 then raise exception 'Intake details required' using errcode='23514'; end if;
 select name into v_business from public.tenants where id=p_tenant;
 select name into v_customer from public.customers where tenant_id=p_tenant and id=r.customer_id;
 select coalesce(nullif(raw_user_meta_data->>'display_name',''),nullif(raw_user_meta_data->>'full_name',''),'Personal autorizado')
 into v_actor from auth.users where id=auth.uid();
 insert into public.vouchers(tenant_id,repair_id,kind,snapshot)
 values(p_tenant,p_repair,'intake',jsonb_build_object('intake_event_id',v_event,'business',v_business,
 'customer',v_customer,'device',r.device,'issue',r.issue,'repair_id',r.id,'issued_at',now(),
 'physical_condition',trim(p_condition),'accessories',trim(p_accessories),'received_by',v_actor))
 returning id into v_voucher;
 insert into public.intake_events(id,tenant_id,repair_id,operation_id,actor_id,physical_condition,accessories,voucher_id)
 values(v_event,p_tenant,p_repair,p_operation_id,auth.uid(),trim(p_condition),trim(p_accessories),v_voucher);
 update public.repairs set version=version+1,updated_at=now() where id=p_repair and tenant_id=p_tenant;
 perform private.audit(p_tenant,'intake.confirmed',p_repair,jsonb_build_object('event_id',v_event,'voucher_id',v_voucher,'operation_id',p_operation_id));
 insert into private.outbox(tenant_id,event_type,aggregate_id,payload)
 values(p_tenant,'intake.confirmed',p_repair,jsonb_build_object('event_id',v_event,'voucher_id',v_voucher));
 return v_voucher;
end;$$;
create function public.confirm_intake(p_tenant uuid,p_repair uuid,p_expected_version integer,
 p_operation_id uuid,p_condition text,p_accessories text) returns uuid
language sql security invoker set search_path='' as $$
 select private.confirm_intake(p_tenant,p_repair,p_expected_version,p_operation_id,p_condition,p_accessories);
$$;
revoke all on function private.confirm_intake(uuid,uuid,integer,uuid,text,text),public.confirm_intake(uuid,uuid,integer,uuid,text,text) from public,anon,authenticated;
grant execute on function private.confirm_intake(uuid,uuid,integer,uuid,text,text),public.confirm_intake(uuid,uuid,integer,uuid,text,text) to authenticated;
create or replace function private.create_repair(p_tenant uuid,p_customer uuid,p_device text,p_issue text,p_request_id uuid) returns uuid
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
 insert into public.repair_events(tenant_id,repair_id,status,actor_id) values(p_tenant,v_id,'created',auth.uid());
 perform private.audit(p_tenant,'repair.created',v_id);
 insert into private.outbox(tenant_id,event_type,aggregate_id) values(p_tenant,'repair.created',v_id);
 return v_id;
end;$$;


commit;
