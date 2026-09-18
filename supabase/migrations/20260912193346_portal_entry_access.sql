begin;
-- Self-only entry check. Operational master privileges still require AAL2.
create function private.has_platform_access() returns boolean
language sql stable security definer set search_path = '' as $$
  select auth.uid() is not null and exists (
    select 1 from private.platform_admins where user_id = auth.uid() and active
  );
$$;
revoke all on function private.has_platform_access() from public, anon, authenticated;
grant execute on function private.has_platform_access() to authenticated;
create function public.has_platform_access() returns boolean
language sql stable security invoker set search_path = '' as $$
  select private.has_platform_access();
$$;
revoke all on function public.has_platform_access() from public, anon, authenticated;
grant execute on function public.has_platform_access() to authenticated;
commit;
