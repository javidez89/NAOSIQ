-- SOURCE TEMPLATE, not an applied migration. npm run db:init asks the pinned CLI
-- to create a real migration filename and copies these ordered sources into it.
-- PostgreSQL 17 / Supabase. Never apply this file directly to production.
begin;
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
commit;
