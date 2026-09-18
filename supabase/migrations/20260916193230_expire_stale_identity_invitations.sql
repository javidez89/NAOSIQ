begin;

-- A stale pending invitation must not permanently block a new invitation for
-- the same tenant and email. Expiration is materialized by the next authorized
-- invitation attempt so the partial unique index remains deterministic.
create or replace function private.create_identity_invitation(
  p_tenant uuid,p_email text,p_role text,p_expires_at timestamptz,p_request_id uuid
) returns uuid
language plpgsql security definer set search_path='' as $$
declare
  v_email text := lower(trim(p_email));
  v_existing public.identity_invitations%rowtype;
  v_id uuid;
  v_expired integer;
begin
  if auth.uid() is null or not private.has_role(p_tenant,array['admin']) then
    raise exception 'Access denied' using errcode='42501';
  end if;
  if not private.can_operate(p_tenant) then
    raise exception 'Tenant is not operational' using errcode='42501';
  end if;
  if p_role not in ('admin','advisor','technician','customer') then
    raise exception 'Invalid invited role' using errcode='23514';
  end if;
  if p_expires_at<=now() or p_expires_at>now()+interval '1 year' then
    raise exception 'Invalid invitation period' using errcode='23514';
  end if;
  select * into v_existing from public.identity_invitations
    where tenant_id=p_tenant and request_id=p_request_id;
  if found then
    if v_existing.email<>v_email or v_existing.proposed_role<>p_role or v_existing.expires_at<>p_expires_at then
      raise exception 'Idempotency key reused with different invitation' using errcode='23505';
    end if;
    return v_existing.id;
  end if;

  update public.identity_invitations
    set status='expired',version=version+1
    where tenant_id=p_tenant and email=v_email and status='pending' and expires_at<=now();
  get diagnostics v_expired = row_count;
  if v_expired>0 then
    perform private.audit(p_tenant,'identity.invitation.expired',null,jsonb_build_object(
      'expired_count',v_expired
    ));
  end if;

  insert into public.identity_invitations(tenant_id,email,proposed_role,request_id,invited_by,expires_at)
    values(p_tenant,v_email,p_role,p_request_id,auth.uid(),p_expires_at)
    returning id into v_id;
  insert into private.outbox(tenant_id,event_type,aggregate_id,payload)
    values(p_tenant,'identity.invitation.created',v_id,jsonb_build_object('invitation_id',v_id));
  perform private.audit(p_tenant,'identity.invitation.created',v_id,jsonb_build_object(
    'proposed_role',p_role,'expires_at',p_expires_at
  ));
  return v_id;
end;
$$;

commit;
