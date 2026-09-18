begin;

-- F08: link a customer request to an owned saved device without trusting its label.
create function private.create_customer_repair_request_v2(
  p_tenant uuid,
  p_equipment uuid,
  p_device text,
  p_issue text,
  p_request_id uuid
) returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_repair uuid;
  v_customer uuid;
  v_device text;
  v_existing public.repairs%rowtype;
begin
  perform private.assert_write(p_tenant, array['customer']);

  select id
    into v_customer
    from public.customers
   where tenant_id = p_tenant
     and user_id = auth.uid()
   order by created_at
   limit 1;

  if v_customer is null then
    raise exception 'Customer profile unavailable' using errcode = '42501';
  end if;

  if p_equipment is not null then
    select concat_ws(' ', kind, nullif(brand, ''), nullif(model, ''))
      into v_device
      from public.equipment
     where tenant_id = p_tenant
       and id = p_equipment
       and customer_id = v_customer;

    if v_device is null then
      raise exception 'Equipment unavailable' using errcode = '42501';
    end if;
  else
    v_device := trim(p_device);
    if char_length(v_device) not between 2 and 160 then
      raise exception 'Invalid device' using errcode = '23514';
    end if;
  end if;

  if char_length(trim(p_issue)) not between 5 and 2000 then
    raise exception 'Invalid issue' using errcode = '23514';
  end if;

  insert into public.repairs(
    tenant_id, customer_id, equipment_id, device, issue, created_by, request_id
  ) values (
    p_tenant, v_customer, p_equipment, v_device, trim(p_issue), auth.uid(), p_request_id
  )
  on conflict (tenant_id, request_id) do nothing
  returning id into v_repair;

  if v_repair is null then
    select *
      into strict v_existing
      from public.repairs
     where tenant_id = p_tenant
       and request_id = p_request_id;

    if v_existing.customer_id <> v_customer
       or v_existing.equipment_id is distinct from p_equipment
       or v_existing.device <> v_device
       or v_existing.issue <> trim(p_issue) then
      raise exception 'Idempotency conflict' using errcode = '23505';
    end if;

    return v_existing.id;
  end if;

  insert into public.repair_events(tenant_id, repair_id, status, actor_id)
  values (p_tenant, v_repair, 'created', auth.uid());

  perform private.audit(
    p_tenant,
    'repair.requested_by_customer',
    v_repair,
    jsonb_build_object('equipment_id', p_equipment)
  );

  insert into private.outbox(tenant_id, event_type, aggregate_id)
  values (p_tenant, 'repair.requested', v_repair);

  return v_repair;
end
$$;

create function public.create_customer_repair_request_v2(
  p_tenant uuid,
  p_equipment uuid,
  p_device text,
  p_issue text,
  p_request_id uuid
) returns uuid
language sql
security invoker
set search_path = ''
as $$
  select private.create_customer_repair_request_v2(
    p_tenant, p_equipment, p_device, p_issue, p_request_id
  )
$$;

revoke all on function private.create_customer_repair_request_v2(uuid, uuid, text, text, uuid) from public, anon;
revoke all on function public.create_customer_repair_request_v2(uuid, uuid, text, text, uuid) from public, anon;
grant execute on function private.create_customer_repair_request_v2(uuid, uuid, text, text, uuid) to authenticated;
grant execute on function public.create_customer_repair_request_v2(uuid, uuid, text, text, uuid) to authenticated;

commit;
