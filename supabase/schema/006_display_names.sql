-- Read the common display_name field used by locally provisioned Auth identities.
-- Metadata remains presentation only; existing grants and authorization are preserved.
begin;
create or replace function private.directory_display_name(p_metadata jsonb) returns text
language sql immutable security invoker set search_path='' as $$
 select left(coalesce(
  nullif(btrim(regexp_replace(case when jsonb_typeof(p_metadata->'full_name')='string' then p_metadata->>'full_name' end,'[[:space:][:cntrl:]]+',' ','g')),''),
  nullif(btrim(regexp_replace(case when jsonb_typeof(p_metadata->'name')='string' then p_metadata->>'name' end,'[[:space:][:cntrl:]]+',' ','g')),''),
  nullif(btrim(regexp_replace(case when jsonb_typeof(p_metadata->'display_name')='string' then p_metadata->>'display_name' end,'[[:space:][:cntrl:]]+',' ','g')),''),
  'Usuario sin nombre'
 ),120);
$$;
commit;
