begin;

create or replace function private.create_repair(
  p_tenant uuid,
  p_customer uuid,
  p_device text,
  p_issue text,
  p_request_id uuid
) returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid;
  v_existing public.repairs%rowtype;
begin
  perform private.assert_write(p_tenant, array['admin', 'advisor']);

  perform 1
    from public.customers
   where tenant_id = p_tenant
     and id = p_customer;
  if not found then
    raise exception 'Customer unavailable' using errcode = '42501';
  end if;

  insert into public.repairs(tenant_id, customer_id, device, issue, created_by, request_id)
  values (p_tenant, p_customer, trim(p_device), trim(p_issue), auth.uid(), p_request_id)
  on conflict (tenant_id, request_id) do nothing
  returning id into v_id;

  if v_id is null then
    select *
      into strict v_existing
      from public.repairs
     where tenant_id = p_tenant
       and request_id = p_request_id;

    if v_existing.customer_id <> p_customer
       or v_existing.device <> trim(p_device)
       or v_existing.issue <> trim(p_issue)
       or v_existing.created_by <> auth.uid() then
      raise exception 'Idempotency conflict' using errcode = '23505';
    end if;
    return v_existing.id;
  end if;

  insert into public.repair_events(tenant_id, repair_id, status, actor_id)
  values (p_tenant, v_id, 'created', auth.uid());
  perform private.audit(p_tenant, 'repair.created', v_id);
  insert into private.outbox(tenant_id, event_type, aggregate_id)
  values (p_tenant, 'repair.created', v_id);
  return v_id;
end
$$;

commit;
