begin;
alter table public.repairs add column equipment_id uuid;
alter table public.repairs add constraint repairs_equipment_fk foreign key(tenant_id,equipment_id) references public.equipment(tenant_id,id);
create table public.order_evidence(
 id uuid primary key default gen_random_uuid(),tenant_id uuid not null,repair_id uuid not null,
 kind text not null check(kind in ('reported','intake','diagnostic','repair','qa','delivery')),
 object_path text not null,content_type text not null,byte_size bigint not null check(byte_size between 1 and 10485760),
 captured_by uuid not null references auth.users(id),captured_at timestamptz not null default now(),
 unique(tenant_id,id),foreign key(tenant_id,repair_id) references public.repairs(tenant_id,id),
 check(object_path like tenant_id::text||'/%' and object_path not like '%..%')
);
alter table public.order_evidence enable row level security; revoke all on public.order_evidence from public,anon,authenticated; grant select on public.order_evidence to authenticated;
create policy order_evidence_read on public.order_evidence for select to authenticated using(private.can_read_repair(tenant_id,repair_id));
create function private.attach_order_evidence(p_tenant uuid,p_repair uuid,p_kind text,p_path text,p_type text,p_size bigint) returns uuid
language plpgsql security definer set search_path='' as $$declare v uuid; begin
 if not private.can_read_repair(p_tenant,p_repair) then raise exception 'Access denied' using errcode='42501'; end if;
 if p_kind in ('intake','diagnostic','repair','qa','delivery') and not private.has_role(p_tenant,array['admin','advisor','technician']) then raise exception 'Staff evidence required' using errcode='42501'; end if;
 insert into public.order_evidence(tenant_id,repair_id,kind,object_path,content_type,byte_size,captured_by) values(p_tenant,p_repair,p_kind,p_path,p_type,p_size,auth.uid()) returning id into v;
 perform private.audit(p_tenant,'order.evidence.attached',p_repair,jsonb_build_object('evidence_id',v,'kind',p_kind)); return v; end$$;
create function public.attach_order_evidence(p_tenant uuid,p_repair uuid,p_kind text,p_path text,p_type text,p_size bigint) returns uuid language sql security invoker set search_path='' as $$select private.attach_order_evidence(p_tenant,p_repair,p_kind,p_path,p_type,p_size);$$;
revoke all on function private.attach_order_evidence(uuid,uuid,text,text,text,bigint),public.attach_order_evidence(uuid,uuid,text,text,text,bigint) from public,anon;
grant execute on function private.attach_order_evidence(uuid,uuid,text,text,text,bigint),public.attach_order_evidence(uuid,uuid,text,text,text,bigint) to authenticated;
commit;
