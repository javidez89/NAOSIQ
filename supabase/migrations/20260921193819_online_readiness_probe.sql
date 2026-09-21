begin;

-- A data-free marker used by the private readiness route to prove that the
-- Data API reaches the expected schema. It does not bypass RLS or expose rows.
create function public.system_readiness()
returns text
language sql
stable
security invoker
set search_path = ''
as $$
  select '20260921193819'::text
$$;

revoke all on function public.system_readiness() from public;
grant execute on function public.system_readiness() to anon, authenticated;

commit;
