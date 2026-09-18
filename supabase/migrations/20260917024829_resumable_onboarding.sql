begin;

create table public.onboarding_drafts (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references auth.users(id),
  request_id uuid not null unique,
  step text not null default 'business' check(step in ('business','plan','url','admin','brand','payments','publication','review','completed')),
  snapshot jsonb not null default '{}'::jsonb check(jsonb_typeof(snapshot)='object'),
  version integer not null default 1 check(version>0),
  status text not null default 'draft' check(status in ('draft','completed','cancelled')),
  tenant_id uuid references public.tenants(id),
  finalize_request_id uuid unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);
alter table public.onboarding_drafts enable row level security;
revoke all on public.onboarding_drafts from public,anon,authenticated;
grant select on public.onboarding_drafts to authenticated;
create policy onboarding_master_read on public.onboarding_drafts for select to authenticated
  using(private.is_platform_admin() and created_by=auth.uid());

create function private.create_onboarding_draft(p_request_id uuid) returns uuid
language plpgsql security definer set search_path='' as $$
declare v_id uuid;
begin
  if not private.is_platform_admin() then raise exception 'Platform MFA required' using errcode='42501'; end if;
  select id into v_id from public.onboarding_drafts where request_id=p_request_id and created_by=auth.uid();
  if found then return v_id; end if;
  insert into public.onboarding_drafts(created_by,request_id) values(auth.uid(),p_request_id) returning id into v_id;
  perform private.audit(null,'onboarding.created',v_id);
  return v_id;
end;
$$;

create function private.update_onboarding_draft(
  p_draft uuid,p_expected_version integer,p_step text,p_patch jsonb
) returns integer
language plpgsql security definer set search_path='' as $$
declare v_version integer;
begin
  if not private.is_platform_admin() then raise exception 'Platform MFA required' using errcode='42501'; end if;
  if p_step not in ('business','plan','url','admin','brand','payments','publication','review')
    or jsonb_typeof(p_patch)<>'object' then raise exception 'Invalid onboarding data' using errcode='23514'; end if;
  update public.onboarding_drafts set snapshot=snapshot||p_patch,step=p_step,version=version+1,updated_at=now()
    where id=p_draft and created_by=auth.uid() and status='draft' and version=p_expected_version
    returning version into v_version;
  if v_version is null then raise exception 'Version conflict or draft unavailable' using errcode='40001'; end if;
  perform private.audit(null,'onboarding.updated',p_draft,jsonb_build_object('step',p_step,'version',v_version));
  return v_version;
end;
$$;

create function private.finalize_onboarding_draft(
  p_draft uuid,p_expected_version integer,p_request_id uuid
) returns uuid
language plpgsql security definer set search_path='' as $$
declare
  d public.onboarding_drafts%rowtype;
  v_tenant uuid;
  v_invitation uuid;
  v_name text;
  v_slug text;
  v_email text;
  v_period_end timestamptz;
  v_invitation_end timestamptz;
begin
  if not private.is_platform_admin() then raise exception 'Platform MFA required' using errcode='42501'; end if;
  select * into d from public.onboarding_drafts where id=p_draft and created_by=auth.uid() for update;
  if not found then raise exception 'Draft unavailable' using errcode='42501'; end if;
  if d.status='completed' then
    if d.finalize_request_id=p_request_id then return d.tenant_id; end if;
    raise exception 'Draft already completed' using errcode='23505';
  end if;
  if d.version<>p_expected_version then raise exception 'Version conflict' using errcode='40001'; end if;
  v_name := trim(d.snapshot->>'name');
  v_slug := lower(trim(d.snapshot->>'slug'));
  v_email := lower(trim(d.snapshot->>'admin_email'));
  v_period_end := (d.snapshot->>'period_end')::timestamptz;
  v_invitation_end := (d.snapshot->>'invitation_expires_at')::timestamptz;
  if char_length(v_name) not between 2 and 120 or not private.valid_tenant_slug(v_slug)
    or v_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
    or v_period_end<=now() or v_period_end>now()+interval '1 year'
    or v_invitation_end<=now() or v_invitation_end>now()+interval '1 year' then
    raise exception 'Incomplete onboarding snapshot' using errcode='23514';
  end if;
  if exists(select 1 from public.tenant_routes where slug=v_slug) then raise exception 'Slug unavailable' using errcode='23505'; end if;
  insert into public.tenants(name,slug,provision_request_id) values(v_name,v_slug,p_request_id) returning id into v_tenant;
  insert into public.subscriptions(tenant_id,plan_code,status,current_period_end) values(v_tenant,'basic','trialing',v_period_end);
  insert into public.tenant_settings(tenant_id,public_page_enabled) values(v_tenant,false);
  insert into public.tenant_routes(slug,tenant_id,status,assigned_by) values(v_slug,v_tenant,'primary',auth.uid());
  insert into public.identity_invitations(tenant_id,email,proposed_role,request_id,invited_by,expires_at)
    values(v_tenant,v_email,'admin',gen_random_uuid(),auth.uid(),v_invitation_end) returning id into v_invitation;
  insert into private.outbox(tenant_id,event_type,aggregate_id,payload)
    values(v_tenant,'identity.invitation.created',v_invitation,jsonb_build_object('invitation_id',v_invitation));
  update public.onboarding_drafts set status='completed',step='completed',tenant_id=v_tenant,
    finalize_request_id=p_request_id,version=version+1,updated_at=now(),completed_at=now() where id=p_draft;
  perform private.audit(v_tenant,'tenant.onboarding.completed',v_tenant,jsonb_build_object('draft_id',p_draft));
  return v_tenant;
end;
$$;

create function public.create_onboarding_draft(p_request_id uuid) returns uuid language sql security invoker set search_path='' as $$select private.create_onboarding_draft(p_request_id);$$;
create function public.update_onboarding_draft(p_draft uuid,p_expected_version integer,p_step text,p_patch jsonb) returns integer language sql security invoker set search_path='' as $$select private.update_onboarding_draft(p_draft,p_expected_version,p_step,p_patch);$$;
create function public.finalize_onboarding_draft(p_draft uuid,p_expected_version integer,p_request_id uuid) returns uuid language sql security invoker set search_path='' as $$select private.finalize_onboarding_draft(p_draft,p_expected_version,p_request_id);$$;
revoke all on function private.create_onboarding_draft(uuid),private.update_onboarding_draft(uuid,integer,text,jsonb),private.finalize_onboarding_draft(uuid,integer,uuid) from public,anon;
grant execute on function private.create_onboarding_draft(uuid),private.update_onboarding_draft(uuid,integer,text,jsonb),private.finalize_onboarding_draft(uuid,integer,uuid) to authenticated;
revoke all on function public.create_onboarding_draft(uuid),public.update_onboarding_draft(uuid,integer,text,jsonb),public.finalize_onboarding_draft(uuid,integer,uuid) from public,anon;
grant execute on function public.create_onboarding_draft(uuid),public.update_onboarding_draft(uuid,integer,text,jsonb),public.finalize_onboarding_draft(uuid,integer,uuid) to authenticated;

commit;
