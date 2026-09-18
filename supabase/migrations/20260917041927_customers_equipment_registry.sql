begin;
create table public.equipment(
 id uuid primary key default gen_random_uuid(),tenant_id uuid not null,customer_id uuid not null,
 kind text not null check(char_length(kind) between 2 and 80),brand text not null default '',model text not null default '',
 serial_number text,notes text not null default '',version integer not null default 1,created_by uuid not null references auth.users(id),
 created_at timestamptz not null default now(),updated_at timestamptz not null default now(),
 unique(tenant_id,id),foreign key(tenant_id,customer_id) references public.customers(tenant_id,id)
);
create index equipment_customer_idx on public.equipment(tenant_id,customer_id,created_at desc);
create index equipment_serial_search_idx on public.equipment(tenant_id,lower(serial_number)) where serial_number is not null;
create table public.equipment_events(
 id bigint generated always as identity primary key,tenant_id uuid not null,equipment_id uuid not null,
 actor_id uuid not null references auth.users(id),event_type text not null,snapshot jsonb not null default '{}'::jsonb,created_at timestamptz not null default now(),
 foreign key(tenant_id,equipment_id) references public.equipment(tenant_id,id)
);
alter table public.equipment enable row level security; alter table public.equipment_events enable row level security;
revoke all on public.equipment,public.equipment_events from public,anon,authenticated;
grant select on public.equipment,public.equipment_events to authenticated;
create policy equipment_read on public.equipment for select to authenticated using(
 private.has_role(tenant_id,array['admin','advisor']) or exists(select 1 from public.customers c where c.tenant_id=equipment.tenant_id and c.id=equipment.customer_id and c.user_id=auth.uid() and private.has_role(c.tenant_id,array['customer']))
);
create policy equipment_events_read on public.equipment_events for select to authenticated using(exists(select 1 from public.equipment e where e.tenant_id=equipment_events.tenant_id and e.id=equipment_events.equipment_id));
create function private.create_equipment(p_tenant uuid,p_customer uuid,p_kind text,p_brand text,p_model text,p_serial text,p_notes text) returns uuid
language plpgsql security definer set search_path='' as $$declare v uuid; v_owned boolean; begin
 v_owned:=exists(select 1 from public.customers where tenant_id=p_tenant and id=p_customer and user_id=auth.uid());
 if auth.uid() is null or not (private.has_role(p_tenant,array['admin','advisor']) or (v_owned and private.has_role(p_tenant,array['customer']))) then raise exception 'Access denied' using errcode='42501'; end if;
 if not exists(select 1 from public.customers where tenant_id=p_tenant and id=p_customer) then raise exception 'Customer unavailable' using errcode='42501'; end if;
 insert into public.equipment(tenant_id,customer_id,kind,brand,model,serial_number,notes,created_by) values(p_tenant,p_customer,trim(p_kind),trim(p_brand),trim(p_model),nullif(lower(trim(p_serial)),''),trim(p_notes),auth.uid()) returning id into v;
 insert into public.equipment_events(tenant_id,equipment_id,actor_id,event_type,snapshot) values(p_tenant,v,auth.uid(),'equipment.created',jsonb_build_object('kind',trim(p_kind),'brand',trim(p_brand),'model',trim(p_model)));
 perform private.audit(p_tenant,'equipment.created',v); return v; end$$;
create function public.create_equipment(p_tenant uuid,p_customer uuid,p_kind text,p_brand text,p_model text,p_serial text,p_notes text) returns uuid language sql security invoker set search_path='' as $$select private.create_equipment(p_tenant,p_customer,p_kind,p_brand,p_model,p_serial,p_notes);$$;
revoke all on function private.create_equipment(uuid,uuid,text,text,text,text,text),public.create_equipment(uuid,uuid,text,text,text,text,text) from public,anon;
grant execute on function private.create_equipment(uuid,uuid,text,text,text,text,text),public.create_equipment(uuid,uuid,text,text,text,text,text) to authenticated;
commit;
