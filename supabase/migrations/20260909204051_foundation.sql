-- CLI-created migration; source snapshots preserved in supabase/schema.
begin;
-- Source: 001_core.sql
-- SOURCE TEMPLATE, not an applied migration. npm run db:init asks the pinned CLI
-- to create a real migration filename and copies these ordered sources into it.
-- PostgreSQL 17 / Supabase. Never apply this file directly to production.

create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

create table public.tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 120),
  slug text not null unique check (char_length(slug) between 3 and 48 and slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and slug not in ('admin','api','auth','login','master','app','demo')),
  status text not null default 'active' check (status in ('active','suspended','closed')),
  created_at timestamptz not null default now()
);
create table private.platform_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create table public.memberships (
  tenant_id uuid not null references public.tenants(id),
  user_id uuid not null references auth.users(id),
  role text not null check (role in ('admin','advisor','technician','customer')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  primary key(tenant_id,user_id)
);
create index memberships_user_active_idx on public.memberships(user_id,tenant_id) where active;
create table public.plans (
  code text primary key,
  name text not null,
  entitlements jsonb not null,
  price_minor bigint check(price_minor >= 0),
  currency text not null default 'COP' check(currency = 'COP')
);
insert into public.plans(code,name,entitlements,price_minor)
 values('basic','Básico','{"whatsapp":true,"manual_payments":true,"customer_portal":true,"intake_voucher":true,"payment_voucher":true}',null);
create table public.subscriptions (
  tenant_id uuid primary key references public.tenants(id),
  plan_code text not null references public.plans(code),
  status text not null check(status in ('trialing','active','past_due','suspended','cancelled')),
  current_period_end timestamptz not null,
  updated_at timestamptz not null default now()
);
create table public.tenant_settings (
  tenant_id uuid primary key references public.tenants(id),
  locale text not null default 'es-CO' check(locale in ('es-CO')),
  timezone text not null default 'America/Bogota' check(timezone in ('America/Bogota')),
  public_page_enabled boolean not null default false,
  public_contact text,
  updated_at timestamptz not null default now()
);
create table public.customers (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id),
  user_id uuid,
  name text not null check(char_length(name) between 2 and 120),
  phone text not null default '' check(char_length(phone) <= 30),
  created_at timestamptz not null default now(),
  unique(tenant_id,id),
  foreign key(tenant_id,user_id) references public.memberships(tenant_id,user_id)
);
create index customers_tenant_idx on public.customers(tenant_id,created_at);
create index customers_user_idx on public.customers(tenant_id,user_id) where user_id is not null;
create table public.repairs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id),
  customer_id uuid not null,
  assigned_to uuid,
  device text not null check(char_length(device) between 2 and 160),
  issue text not null check(char_length(issue) between 5 and 2000),
  status text not null default 'created' check(status in ('created','in_repair','waiting_parts','software_installation','backup_completed','completed')),
  version integer not null default 1 check(version > 0),
  created_by uuid not null references auth.users(id),
  request_id uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(tenant_id,id), unique(tenant_id,request_id),
  foreign key(tenant_id,customer_id) references public.customers(tenant_id,id),
  foreign key(tenant_id,assigned_to) references public.memberships(tenant_id,user_id)
);
create index repairs_tenant_created_idx on public.repairs(tenant_id,created_at desc);
create index repairs_customer_idx on public.repairs(tenant_id,customer_id);
create index repairs_assigned_idx on public.repairs(tenant_id,assigned_to,status);
create table public.repair_events (
  id uuid primary key default gen_random_uuid(), tenant_id uuid not null,
  repair_id uuid not null, status text not null, actor_id uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  foreign key(tenant_id,repair_id) references public.repairs(tenant_id,id)
);
create index repair_events_repair_idx on public.repair_events(tenant_id,repair_id,created_at);
create table public.payments (
  id uuid primary key default gen_random_uuid(), tenant_id uuid not null, repair_id uuid not null,
  amount_minor bigint not null check(amount_minor between 1 and 999999999999),
  currency text not null default 'COP' check(currency = 'COP'),
  method text not null check(method in ('cash','breb','nequi','bank_transfer')),
  status text not null default 'pending' check(status in ('pending','confirmed','reversed')),
  idempotency_key text not null check(idempotency_key ~ '^[A-Za-z0-9_-]{16,80}$'),
  created_by uuid not null references auth.users(id),
  confirmed_by uuid references auth.users(id), confirmed_at timestamptz,
  created_at timestamptz not null default now(),
  unique(tenant_id,id), unique(tenant_id,idempotency_key),
  foreign key(tenant_id,repair_id) references public.repairs(tenant_id,id),
  check((status = 'pending' and confirmed_by is null and confirmed_at is null) or (status in ('confirmed','reversed') and confirmed_by is not null and confirmed_at is not null))
);
create index payments_repair_idx on public.payments(tenant_id,repair_id,created_at);
create table public.vouchers (
  id uuid primary key default gen_random_uuid(), tenant_id uuid not null, repair_id uuid not null,
  payment_id uuid, kind text not null check(kind in ('intake','payment')),
  snapshot jsonb not null check(jsonb_typeof(snapshot) = 'object'),
  schema_version integer not null default 1 check(schema_version = 1),
  created_at timestamptz not null default now(),
  foreign key(tenant_id,repair_id) references public.repairs(tenant_id,id),
  foreign key(tenant_id,payment_id) references public.payments(tenant_id,id),
  check((kind='intake' and payment_id is null) or (kind='payment' and payment_id is not null)),
  unique(payment_id)
);
create unique index vouchers_intake_unique on public.vouchers(tenant_id,repair_id) where kind='intake';
create index vouchers_repair_idx on public.vouchers(tenant_id,repair_id);
create table public.audit_events (
  id bigint generated always as identity primary key,
  tenant_id uuid references public.tenants(id), actor_id uuid not null references auth.users(id),
  action text not null, record_id uuid, metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index audit_events_tenant_time_idx on public.audit_events(tenant_id,created_at desc);
create table private.outbox (
  id uuid primary key default gen_random_uuid(), tenant_id uuid not null references public.tenants(id),
  event_type text not null, aggregate_id uuid not null,
  payload jsonb not null default '{}'::jsonb,
  attempts integer not null default 0 check(attempts >= 0),
  available_at timestamptz not null default now(), processed_at timestamptz,
  created_at timestamptz not null default now()
);
create index outbox_pending_idx on private.outbox(available_at) where processed_at is null;

-- Defense in depth in both exposed and private schemas.
alter table public.tenants enable row level security;
alter table public.memberships enable row level security;
alter table public.plans enable row level security;
alter table public.subscriptions enable row level security;
alter table public.tenant_settings enable row level security;
alter table public.customers enable row level security;
alter table public.repairs enable row level security;
alter table public.repair_events enable row level security;
alter table public.payments enable row level security;
alter table public.vouchers enable row level security;
alter table public.audit_events enable row level security;
alter table private.platform_admins enable row level security;
alter table private.outbox enable row level security;
revoke all on all tables in schema private from public,anon,authenticated;
revoke all on public.tenants,public.memberships,public.plans,public.subscriptions,public.tenant_settings,public.customers,public.repairs,public.repair_events,public.payments,public.vouchers,public.audit_events from public,anon,authenticated;
grant select on public.tenants,public.memberships,public.plans,public.subscriptions,public.tenant_settings,public.customers,public.repairs,public.repair_events,public.payments,public.vouchers,public.audit_events to authenticated;
-- Deliberately no direct INSERT/UPDATE/DELETE privileges for API users.


-- Source: 002_authorization.sql

-- Definer functions are restricted, schema-qualified and contain explicit identity checks.
-- User metadata is never an authorization source. Private is NOT a Data API schema.
create function private.is_platform_admin() returns boolean
language sql stable security definer set search_path = '' as $$
 select auth.uid() is not null
 and coalesce(auth.jwt()->>'aal','aal1') = 'aal2'
 and exists(select 1 from private.platform_admins where user_id=auth.uid() and active);
$$;
create function private.has_role(p_tenant uuid,p_roles text[]) returns boolean
language sql stable security definer set search_path = '' as $$
 select auth.uid() is not null and (
   private.is_platform_admin() or exists(
     select 1 from public.memberships m join public.tenants t on t.id=m.tenant_id
     where m.tenant_id=p_tenant and m.user_id=auth.uid() and m.active
       and m.role=any(p_roles) and t.status<>'closed'
   )
 );
$$;
create function private.can_operate(p_tenant uuid) returns boolean
language sql stable security definer set search_path = '' as $$
 select auth.uid() is not null and (private.is_platform_admin() or exists(
   select 1 from public.tenants t join public.subscriptions s on s.tenant_id=t.id
   where t.id=p_tenant and t.status='active' and s.status in ('trialing','active') and s.current_period_end>now()
 ));
$$;
create function private.can_read_repair(p_tenant uuid,p_repair uuid) returns boolean
language sql stable security definer set search_path = '' as $$
 select auth.uid() is not null and (
  private.has_role(p_tenant,array['admin','advisor']) or exists(
   select 1 from public.repairs r join public.customers c on c.tenant_id=r.tenant_id and c.id=r.customer_id
   where r.tenant_id=p_tenant and r.id=p_repair and (
     (private.has_role(p_tenant,array['technician']) and r.assigned_to=auth.uid())
     or (private.has_role(p_tenant,array['customer']) and c.user_id=auth.uid())
   )
  )
 );
$$;
create function private.owns_repair(p_tenant uuid,p_repair uuid) returns boolean
language sql stable security definer set search_path = '' as $$
 select auth.uid() is not null and private.has_role(p_tenant,array['customer']) and exists(
   select 1 from public.repairs r join public.customers c on c.tenant_id=r.tenant_id and c.id=r.customer_id
   where r.id=p_repair and r.tenant_id=p_tenant and c.user_id=auth.uid()
 );
$$;
create function private.assert_write(p_tenant uuid,p_roles text[],p_mfa boolean default false) returns void
language plpgsql security definer set search_path = '' as $$
begin
 if auth.uid() is null or not private.has_role(p_tenant,p_roles) then raise exception 'Access denied' using errcode='42501'; end if;
 if not private.can_operate(p_tenant) then raise exception 'Tenant is not operational' using errcode='42501'; end if;
 if p_mfa and coalesce(auth.jwt()->>'aal','aal1')<>'aal2' then raise exception 'MFA required' using errcode='42501'; end if;
end;
$$;
create function private.audit(p_tenant uuid,p_action text,p_record uuid,p_metadata jsonb default '{}'::jsonb) returns void
language plpgsql security definer set search_path = '' as $$
begin
 if auth.uid() is null then raise exception 'Authentication required' using errcode='42501'; end if;
 insert into public.audit_events(tenant_id,actor_id,action,record_id,metadata) values(p_tenant,auth.uid(),p_action,p_record,p_metadata);
end;
$$;

create policy tenants_read on public.tenants for select to authenticated
 using(private.has_role(id,array['admin','advisor','technician','customer']));
create policy memberships_read on public.memberships for select to authenticated
 using(private.has_role(tenant_id,array['admin']) or (user_id=auth.uid() and active and private.has_role(tenant_id,array['advisor','technician','customer'])));
create policy plans_read on public.plans for select to authenticated using(auth.uid() is not null);
create policy subscriptions_read on public.subscriptions for select to authenticated using(private.has_role(tenant_id,array['admin']));
create policy settings_read on public.tenant_settings for select to authenticated using(private.has_role(tenant_id,array['admin']));
create policy customers_read on public.customers for select to authenticated
 using(private.has_role(tenant_id,array['admin','advisor']) or (user_id=auth.uid() and private.has_role(tenant_id,array['customer'])));
create policy repairs_read on public.repairs for select to authenticated using(private.can_read_repair(tenant_id,id));
create policy events_read on public.repair_events for select to authenticated using(private.can_read_repair(tenant_id,repair_id));
create policy payments_read on public.payments for select to authenticated
 using(private.has_role(tenant_id,array['admin']) or private.owns_repair(tenant_id,repair_id));
create policy vouchers_read on public.vouchers for select to authenticated
 using(private.has_role(tenant_id,array['admin']) or private.owns_repair(tenant_id,repair_id) or (kind='intake' and private.has_role(tenant_id,array['advisor'])));
create policy audit_read on public.audit_events for select to authenticated using(private.has_role(tenant_id,array['admin']));

revoke all on all functions in schema private from public,anon,authenticated;
-- Policy helpers only. No API caller can append arbitrary audit records.
grant execute on function private.is_platform_admin(),private.has_role(uuid,text[]),private.can_operate(uuid),private.can_read_repair(uuid,uuid),private.owns_repair(uuid,uuid) to authenticated;
create function public.is_platform_admin() returns boolean language sql stable security invoker set search_path='' as $$select private.is_platform_admin();$$;
revoke all on function public.is_platform_admin() from public,anon;
grant execute on function public.is_platform_admin() to authenticated;
revoke select on public.repair_events from authenticated;
grant select(id,tenant_id,repair_id,status,created_at) on public.repair_events to authenticated;


-- Source: 003_commands.sql

create function private.create_customer(p_tenant uuid,p_name text,p_phone text) returns uuid
language plpgsql security definer set search_path='' as $$
declare v_id uuid;
begin
 perform private.assert_write(p_tenant,array['admin','advisor']);
 insert into public.customers(tenant_id,name,phone) values(p_tenant,trim(p_name),trim(p_phone)) returning id into v_id;
 perform private.audit(p_tenant,'customer.created',v_id);
 return v_id;
end;$$;

create function private.create_repair(p_tenant uuid,p_customer uuid,p_device text,p_issue text,p_request_id uuid) returns uuid
language plpgsql security definer set search_path='' as $$
declare v_id uuid; v_existing public.repairs%rowtype; v_name text; v_business text;
begin
 perform private.assert_write(p_tenant,array['admin','advisor']);
 select name into v_name from public.customers where tenant_id=p_tenant and id=p_customer;
 if not found then raise exception 'Customer unavailable' using errcode='42501'; end if;
 insert into public.repairs(tenant_id,customer_id,device,issue,created_by,request_id)
 values(p_tenant,p_customer,trim(p_device),trim(p_issue),auth.uid(),p_request_id)
 on conflict(tenant_id,request_id) do nothing returning id into v_id;
 if v_id is null then
   select * into strict v_existing from public.repairs where tenant_id=p_tenant and request_id=p_request_id;
   if v_existing.customer_id<>p_customer or v_existing.device<>trim(p_device) or v_existing.issue<>trim(p_issue) or v_existing.created_by<>auth.uid() then
     raise exception 'Idempotency conflict' using errcode='23505';
   end if;
   return v_existing.id;
 end if;
 select name into v_business from public.tenants where id=p_tenant;
 insert into public.repair_events(tenant_id,repair_id,status,actor_id) values(p_tenant,v_id,'created',auth.uid());
 insert into public.vouchers(tenant_id,repair_id,kind,snapshot)
 values(p_tenant,v_id,'intake',jsonb_build_object('business',v_business,'customer',v_name,'device',trim(p_device),'issue',trim(p_issue),'repair_id',v_id,'issued_at',now()));
 perform private.audit(p_tenant,'repair.created',v_id);
 insert into private.outbox(tenant_id,event_type,aggregate_id) values(p_tenant,'repair.created',v_id);
 return v_id;
end;$$;

create function private.transition_repair(p_tenant uuid,p_repair uuid,p_expected_version integer,p_status text) returns integer
language plpgsql security definer set search_path='' as $$
declare r public.repairs%rowtype; v_allowed boolean;
begin
 perform private.assert_write(p_tenant,array['admin','technician']);
 select * into r from public.repairs where tenant_id=p_tenant and id=p_repair for update;
 if not found or not private.can_read_repair(p_tenant,p_repair) then raise exception 'Repair unavailable' using errcode='42501'; end if;
 if r.version is distinct from p_expected_version then raise exception 'Version conflict' using errcode='40001'; end if;
 v_allowed := case r.status
 when 'created' then p_status in ('in_repair','software_installation')
 when 'in_repair' then p_status in ('waiting_parts','software_installation','backup_completed','completed')
 when 'waiting_parts' then p_status='in_repair'
 when 'software_installation' then p_status in ('in_repair','backup_completed','completed')
 when 'backup_completed' then p_status in ('in_repair','completed')
 else false end;
 if not coalesce(v_allowed,false) then raise exception 'Invalid transition' using errcode='23514'; end if;
 update public.repairs set status=p_status,version=version+1,updated_at=now() where tenant_id=p_tenant and id=p_repair;
 insert into public.repair_events(tenant_id,repair_id,status,actor_id) values(p_tenant,p_repair,p_status,auth.uid());
 perform private.audit(p_tenant,'repair.transitioned',p_repair,jsonb_build_object('from',r.status,'to',p_status,'version',r.version+1));
 insert into private.outbox(tenant_id,event_type,aggregate_id,payload) values(p_tenant,'repair.transitioned',p_repair,jsonb_build_object('status',p_status));
 return r.version+1;
end;$$;

create function private.assign_technician(p_tenant uuid,p_repair uuid,p_user uuid) returns void
language plpgsql security definer set search_path='' as $$
begin
 perform private.assert_write(p_tenant,array['admin']);
 if not exists(select 1 from public.memberships where tenant_id=p_tenant and user_id=p_user and active and role='technician') then
   raise exception 'Technician unavailable' using errcode='42501'; end if;
 update public.repairs set assigned_to=p_user,version=version+1,updated_at=now() where tenant_id=p_tenant and id=p_repair;
 if not found then raise exception 'Repair unavailable' using errcode='42501'; end if;
 perform private.audit(p_tenant,'repair.assigned',p_repair,jsonb_build_object('assignee',p_user));
end;$$;

create function private.record_payment(p_tenant uuid,p_repair uuid,p_amount bigint,p_method text,p_idempotency_key text) returns uuid
language plpgsql security definer set search_path='' as $$
declare v_id uuid; v_existing public.payments%rowtype;
begin
 perform private.assert_write(p_tenant,array['admin']);
 if not exists(select 1 from public.repairs where tenant_id=p_tenant and id=p_repair) then raise exception 'Repair unavailable' using errcode='42501'; end if;
 insert into public.payments(tenant_id,repair_id,amount_minor,method,idempotency_key,created_by)
 values(p_tenant,p_repair,p_amount,p_method,p_idempotency_key,auth.uid())
 on conflict(tenant_id,idempotency_key) do nothing returning id into v_id;
 if v_id is null then
   select * into strict v_existing from public.payments where tenant_id=p_tenant and idempotency_key=p_idempotency_key;
   if v_existing.repair_id is distinct from p_repair or v_existing.amount_minor is distinct from p_amount or v_existing.method is distinct from p_method then
      raise exception 'Idempotency conflict' using errcode='23505'; end if;
   return v_existing.id;
 end if;
 perform private.audit(p_tenant,'payment.pending',v_id);
 return v_id;
end;$$;

create function private.confirm_payment(p_tenant uuid,p_payment uuid) returns uuid
language plpgsql security definer set search_path='' as $$
declare p public.payments%rowtype; v_voucher uuid; v_business text;
begin
 perform private.assert_write(p_tenant,array['admin'],true);
 select * into p from public.payments where tenant_id=p_tenant and id=p_payment for update;
 if not found then raise exception 'Payment unavailable' using errcode='42501'; end if;
 if p.status='reversed' then raise exception 'Payment reversed' using errcode='23514'; end if;
 if p.status='confirmed' then select id into strict v_voucher from public.vouchers where payment_id=p.id; return v_voucher; end if;
 update public.payments set status='confirmed',confirmed_by=auth.uid(),confirmed_at=now() where id=p.id;
 select name into v_business from public.tenants where id=p_tenant;
 insert into public.vouchers(tenant_id,repair_id,payment_id,kind,snapshot)
 values(p_tenant,p.repair_id,p.id,'payment',jsonb_build_object('business',v_business,'repair_id',p.repair_id,'payment_id',p.id,'amount_minor',p.amount_minor,'currency',p.currency,'method',p.method,'issued_at',now()))
 returning id into v_voucher;
 perform private.audit(p_tenant,'payment.confirmed',p.id,jsonb_build_object('voucher_id',v_voucher));
 insert into private.outbox(tenant_id,event_type,aggregate_id) values(p_tenant,'payment.confirmed',p.id);
 return v_voucher;
end;$$;

create function private.provision_tenant(p_name text,p_slug text,p_admin uuid,p_period_end timestamptz) returns uuid
language plpgsql security definer set search_path='' as $$
declare v_id uuid;
begin
 if not private.is_platform_admin() then raise exception 'Platform MFA required' using errcode='42501'; end if;
 if p_period_end is null or p_period_end<=now() or p_period_end>now()+interval '1 year' then raise exception 'Invalid period' using errcode='23514'; end if;
 if not exists(select 1 from auth.users where id=p_admin and email_confirmed_at is not null) then raise exception 'Verified administrator required' using errcode='42501'; end if;
 insert into public.tenants(name,slug) values(trim(p_name),p_slug) returning id into v_id;
 insert into public.memberships(tenant_id,user_id,role) values(v_id,p_admin,'admin');
 insert into public.subscriptions(tenant_id,plan_code,status,current_period_end) values(v_id,'basic','trialing',p_period_end);
 insert into public.tenant_settings(tenant_id) values(v_id);
 perform private.audit(v_id,'tenant.provisioned',v_id);
 return v_id;
end;$$;
create function private.set_tenant_status(p_tenant uuid,p_status text,p_reason text) returns void
language plpgsql security definer set search_path='' as $$
begin
 if not private.is_platform_admin() then raise exception 'Platform MFA required' using errcode='42501'; end if;
 if p_reason is null or char_length(trim(p_reason))<10 or char_length(p_reason)>500 then raise exception 'Reason required' using errcode='23514'; end if;
 update public.tenants set status=p_status where id=p_tenant;
 if not found then raise exception 'Tenant unavailable' using errcode='42501'; end if;
 perform private.audit(p_tenant,'tenant.status_changed',p_tenant,jsonb_build_object('status',p_status,'reason',trim(p_reason)));
end;$$;

-- The public API contains security-invoker wrappers only. Each private command
-- performs explicit authorization; authenticated receives no table write grants.
create function public.create_customer(p_tenant uuid,p_name text,p_phone text) returns uuid language sql security invoker set search_path='' as $$select private.create_customer(p_tenant,p_name,p_phone);$$;
create function public.create_repair(p_tenant uuid,p_customer uuid,p_device text,p_issue text,p_request_id uuid) returns uuid language sql security invoker set search_path='' as $$select private.create_repair(p_tenant,p_customer,p_device,p_issue,p_request_id);$$;
create function public.transition_repair(p_tenant uuid,p_repair uuid,p_expected_version integer,p_status text) returns integer language sql security invoker set search_path='' as $$select private.transition_repair(p_tenant,p_repair,p_expected_version,p_status);$$;
create function public.assign_technician(p_tenant uuid,p_repair uuid,p_user uuid) returns void language sql security invoker set search_path='' as $$select private.assign_technician(p_tenant,p_repair,p_user);$$;
create function public.record_payment(p_tenant uuid,p_repair uuid,p_amount bigint,p_method text,p_idempotency_key text) returns uuid language sql security invoker set search_path='' as $$select private.record_payment(p_tenant,p_repair,p_amount,p_method,p_idempotency_key);$$;
create function public.confirm_payment(p_tenant uuid,p_payment uuid) returns uuid language sql security invoker set search_path='' as $$select private.confirm_payment(p_tenant,p_payment);$$;
create function public.provision_tenant(p_name text,p_slug text,p_admin uuid,p_period_end timestamptz) returns uuid language sql security invoker set search_path='' as $$select private.provision_tenant(p_name,p_slug,p_admin,p_period_end);$$;
create function public.set_tenant_status(p_tenant uuid,p_status text,p_reason text) returns void language sql security invoker set search_path='' as $$select private.set_tenant_status(p_tenant,p_status,p_reason);$$;

revoke all on function private.create_customer(uuid,text,text),private.create_repair(uuid,uuid,text,text,uuid),private.transition_repair(uuid,uuid,integer,text),private.assign_technician(uuid,uuid,uuid),private.record_payment(uuid,uuid,bigint,text,text),private.confirm_payment(uuid,uuid),private.provision_tenant(text,text,uuid,timestamptz),private.set_tenant_status(uuid,text,text) from public,anon;
grant execute on function private.create_customer(uuid,text,text),private.create_repair(uuid,uuid,text,text,uuid),private.transition_repair(uuid,uuid,integer,text),private.assign_technician(uuid,uuid,uuid),private.record_payment(uuid,uuid,bigint,text,text),private.confirm_payment(uuid,uuid),private.provision_tenant(text,text,uuid,timestamptz),private.set_tenant_status(uuid,text,text) to authenticated;
revoke all on function public.create_customer(uuid,text,text),public.create_repair(uuid,uuid,text,text,uuid),public.transition_repair(uuid,uuid,integer,text),public.assign_technician(uuid,uuid,uuid),public.record_payment(uuid,uuid,bigint,text,text),public.confirm_payment(uuid,uuid),public.provision_tenant(text,text,uuid,timestamptz),public.set_tenant_status(uuid,text,text) from public,anon;
grant execute on function public.create_customer(uuid,text,text),public.create_repair(uuid,uuid,text,text,uuid),public.transition_repair(uuid,uuid,integer,text),public.assign_technician(uuid,uuid,uuid),public.record_payment(uuid,uuid,bigint,text,text),public.confirm_payment(uuid,uuid),public.provision_tenant(text,text,uuid,timestamptz),public.set_tenant_status(uuid,text,text) to authenticated;


-- Source: 004_team.sql

-- Initial least-privilege membership administration belongs to the master.
-- Delegation to the merchant admin is a product decision, not silently granted.
create function private.set_membership(p_tenant uuid,p_user uuid,p_role text,p_active boolean) returns void
language plpgsql security definer set search_path='' as $$
declare v_old public.memberships%rowtype;
begin
 if not private.is_platform_admin() then raise exception 'Platform MFA required' using errcode='42501'; end if;
 if not exists(select 1 from auth.users where id=p_user and email_confirmed_at is not null) then raise exception 'Verified user required' using errcode='42501'; end if;
 -- Serialize membership changes for this tenant, including last-admin protection.
 perform 1 from public.tenants where id=p_tenant for update;
 if not found then raise exception 'Tenant unavailable' using errcode='42501'; end if;
 select * into v_old from public.memberships where tenant_id=p_tenant and user_id=p_user for update;
 if v_old.role='admin' and v_old.active and (not p_active or p_role<>'admin') and not exists(
    select 1 from public.memberships where tenant_id=p_tenant and role='admin' and active and user_id<>p_user
 ) then raise exception 'Last administrator cannot be removed' using errcode='23514'; end if;
 if p_role <> 'customer' and exists(select 1 from public.customers where tenant_id=p_tenant and user_id=p_user) then
   raise exception 'Unlink customer identity before role change' using errcode='23514'; end if;
 if p_role <> 'technician' and exists(select 1 from public.repairs where tenant_id=p_tenant and assigned_to=p_user) then
   raise exception 'Reassign repairs before role change' using errcode='23514'; end if;
 insert into public.memberships(tenant_id,user_id,role,active) values(p_tenant,p_user,p_role,p_active)
 on conflict(tenant_id,user_id) do update set role=excluded.role,active=excluded.active;
 perform private.audit(p_tenant,'membership.changed',p_user,jsonb_build_object('role',p_role,'active',p_active));
end;$$;
create function private.link_customer(p_tenant uuid,p_customer uuid,p_user uuid) returns void
language plpgsql security definer set search_path='' as $$
begin
 if not private.is_platform_admin() then raise exception 'Platform MFA required' using errcode='42501'; end if;
 if not exists(select 1 from public.memberships where tenant_id=p_tenant and user_id=p_user and role='customer' and active) then
   raise exception 'Customer membership required' using errcode='42501'; end if;
 update public.customers set user_id=p_user where id=p_customer and tenant_id=p_tenant and user_id is null;
 if not found then raise exception 'Customer unavailable or already linked' using errcode='42501'; end if;
 perform private.audit(p_tenant,'customer.linked',p_customer,jsonb_build_object('user_id',p_user));
end;$$;
create function public.set_membership(p_tenant uuid,p_user uuid,p_role text,p_active boolean) returns void language sql security invoker set search_path='' as $$select private.set_membership(p_tenant,p_user,p_role,p_active);$$;
create function public.link_customer(p_tenant uuid,p_customer uuid,p_user uuid) returns void language sql security invoker set search_path='' as $$select private.link_customer(p_tenant,p_customer,p_user);$$;
revoke all on function private.set_membership(uuid,uuid,text,boolean),private.link_customer(uuid,uuid,uuid),public.set_membership(uuid,uuid,text,boolean),public.link_customer(uuid,uuid,uuid) from public,anon;
grant execute on function private.set_membership(uuid,uuid,text,boolean),private.link_customer(uuid,uuid,uuid),public.set_membership(uuid,uuid,text,boolean),public.link_customer(uuid,uuid,uuid) to authenticated;

commit;
