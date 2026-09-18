begin;
drop function if exists public.move_inventory(uuid,uuid,text,integer,uuid,uuid);
create function public.move_inventory(p_tenant uuid,p_item uuid,p_kind text,p_quantity integer,p_request uuid,p_repair uuid default null) returns uuid
language sql security invoker set search_path='' as $$select private.move_inventory(p_tenant,p_item,p_kind,p_quantity,p_request,p_repair)$$;
revoke all on function public.move_inventory(uuid,uuid,text,integer,uuid,uuid) from public,anon;
grant execute on function public.move_inventory(uuid,uuid,text,integer,uuid,uuid) to authenticated;
commit;
