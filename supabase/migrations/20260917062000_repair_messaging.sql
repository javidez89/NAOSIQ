begin;
create unique index if not exists conversations_repair_audience_unique
  on public.conversations(tenant_id,repair_id,audience) where repair_id is not null;

create function private.send_repair_message(p_tenant uuid,p_repair uuid,p_body text,p_request_id uuid) returns uuid
language plpgsql security definer set search_path='' as $$
declare v_message uuid;v_conversation uuid;v_body text:=trim(p_body);
begin
  select id into v_message from public.messages where tenant_id=p_tenant and request_id=p_request_id;
  if found then return v_message; end if;
  if auth.uid() is null or not private.can_operate(p_tenant) or not private.can_read_repair(p_tenant,p_repair) then
    raise exception 'Repair conversation unavailable' using errcode='42501';
  end if;
  if char_length(v_body)<1 or char_length(v_body)>2000 then raise exception 'Invalid message' using errcode='23514'; end if;
  select id into v_conversation from public.conversations where tenant_id=p_tenant and repair_id=p_repair and audience='customer';
  if v_conversation is null then
    insert into public.conversations(tenant_id,repair_id,audience) values(p_tenant,p_repair,'customer')
      on conflict(tenant_id,repair_id,audience) where repair_id is not null do update set audience=excluded.audience
      returning id into v_conversation;
  end if;
  insert into public.messages(tenant_id,conversation_id,author_id,body,request_id)
    values(p_tenant,v_conversation,auth.uid(),v_body,p_request_id) returning id into v_message;
  insert into private.outbox(tenant_id,event_type,aggregate_id,payload)
    values(p_tenant,'message.created',v_message,jsonb_build_object('conversation_id',v_conversation,'channel','in_app','external_delivery',false));
  perform private.audit(p_tenant,'message.created',v_message,jsonb_build_object('repair_id',p_repair,'channel','in_app'));
  return v_message;
end$$;
create function public.send_repair_message(p_tenant uuid,p_repair uuid,p_body text,p_request_id uuid) returns uuid
language sql security invoker set search_path='' as $$select private.send_repair_message(p_tenant,p_repair,p_body,p_request_id)$$;
revoke all on function private.send_repair_message(uuid,uuid,text,uuid),public.send_repair_message(uuid,uuid,text,uuid) from public,anon;
grant execute on function public.send_repair_message(uuid,uuid,text,uuid) to authenticated;
commit;
