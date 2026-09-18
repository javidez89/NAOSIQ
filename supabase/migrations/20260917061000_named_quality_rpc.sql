-- Named arguments are required for PostgREST RPC discovery and generated clients.
drop function if exists public.complete_qa(uuid,uuid,jsonb,text);
create function public.complete_qa(p_tenant uuid,p_repair uuid,p_checks jsonb,p_notes text) returns uuid
language sql security invoker set search_path='' as $$
  select private.complete_qa(p_tenant,p_repair,p_checks,p_notes)
$$;
revoke all on function public.complete_qa(uuid,uuid,jsonb,text) from public,anon;
grant execute on function public.complete_qa(uuid,uuid,jsonb,text) to authenticated;
