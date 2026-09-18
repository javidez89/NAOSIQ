begin;
create table public.tenant_public_profiles(
  tenant_id uuid primary key references public.tenants(id),
  brand_name text not null check(char_length(brand_name) between 2 and 120),
  headline text not null default 'Servicio técnico con seguimiento claro' check(char_length(headline)<=180),
  description text not null default '' check(char_length(description)<=1200),
  contact_text text not null default '' check(char_length(contact_text)<=500),
  published boolean not null default false,
  version integer not null default 1 check(version>0),
  updated_at timestamptz not null default now()
);
create table public.public_catalog_items(
  id uuid primary key default gen_random_uuid(),tenant_id uuid not null references public.tenants(id),
  kind text not null check(kind in ('service','product')),name text not null check(char_length(name) between 2 and 120),
  description text not null default '' check(char_length(description)<=1000),price_label text,
  active boolean not null default true,sort_order integer not null default 0,version integer not null default 1,
  unique(tenant_id,id)
);
insert into public.tenant_public_profiles(tenant_id,brand_name,published) select id,name,false from public.tenants on conflict do nothing;
alter table public.tenant_public_profiles enable row level security;
alter table public.public_catalog_items enable row level security;
revoke all on public.tenant_public_profiles,public.public_catalog_items from public,anon,authenticated;
grant select on public.tenant_public_profiles,public.public_catalog_items to authenticated;
create policy public_profiles_staff_read on public.tenant_public_profiles for select to authenticated using(private.has_role(tenant_id,array['admin','advisor']));
create policy public_catalog_staff_read on public.public_catalog_items for select to authenticated using(private.has_role(tenant_id,array['admin','advisor']));

create function private.set_public_profile(p_tenant uuid,p_brand text,p_headline text,p_description text,p_contact text,p_published boolean,p_expected_version integer) returns integer
language plpgsql security definer set search_path='' as $$declare v integer; begin
 if auth.uid() is null or not private.has_role(p_tenant,array['admin']) then raise exception 'Access denied' using errcode='42501'; end if;
 update public.tenant_public_profiles set brand_name=trim(p_brand),headline=trim(p_headline),description=trim(p_description),contact_text=trim(p_contact),published=p_published,version=version+1,updated_at=now()
 where tenant_id=p_tenant and version=p_expected_version returning version into v;
 if v is null then raise exception 'Version conflict' using errcode='40001'; end if;
 perform private.audit(p_tenant,'public.profile.updated',p_tenant,jsonb_build_object('published',p_published,'version',v)); return v;
end$$;
create function private.upsert_catalog_item(p_tenant uuid,p_item uuid,p_kind text,p_name text,p_description text,p_price_label text,p_active boolean,p_sort integer,p_expected_version integer) returns uuid
language plpgsql security definer set search_path='' as $$declare v_id uuid:=coalesce(p_item,gen_random_uuid()); v integer; begin
 if auth.uid() is null or not private.has_role(p_tenant,array['admin']) then raise exception 'Access denied' using errcode='42501'; end if;
 if p_item is null then insert into public.public_catalog_items(id,tenant_id,kind,name,description,price_label,active,sort_order) values(v_id,p_tenant,p_kind,trim(p_name),trim(p_description),nullif(trim(p_price_label),''),p_active,p_sort);
 else update public.public_catalog_items set kind=p_kind,name=trim(p_name),description=trim(p_description),price_label=nullif(trim(p_price_label),''),active=p_active,sort_order=p_sort,version=version+1 where id=p_item and tenant_id=p_tenant and version=p_expected_version returning version into v;
 if v is null then raise exception 'Version conflict' using errcode='40001'; end if; end if;
 perform private.audit(p_tenant,'public.catalog.updated',v_id,jsonb_build_object('kind',p_kind)); return v_id;
end$$;
create function public.get_public_profile(p_slug text) returns table(tenant_id uuid,current_slug text,requested_status text,brand_name text,headline text,description text,contact_text text)
language sql stable security definer set search_path='' as $$select p.tenant_id,r.target_slug,r.status,p.brand_name,p.headline,p.description,p.contact_text from public.resolve_tenant_slug(p_slug) r join public.tenant_public_profiles p on p.tenant_id=r.tenant_id join public.tenants t on t.id=p.tenant_id where p.published and t.status='active';$$;
create function public.get_public_catalog(p_slug text,p_kind text) returns table(id uuid,kind text,name text,description text,price_label text)
language sql stable security definer set search_path='' as $$select i.id,i.kind,i.name,i.description,i.price_label from public.resolve_tenant_slug(p_slug) r join public.tenant_public_profiles p on p.tenant_id=r.tenant_id and p.published join public.public_catalog_items i on i.tenant_id=r.tenant_id and i.active where i.kind=p_kind order by i.sort_order,i.name;$$;
create function public.set_public_profile(p_tenant uuid,p_brand text,p_headline text,p_description text,p_contact text,p_published boolean,p_expected_version integer) returns integer language sql security invoker set search_path='' as $$select private.set_public_profile(p_tenant,p_brand,p_headline,p_description,p_contact,p_published,p_expected_version);$$;
create function public.upsert_catalog_item(p_tenant uuid,p_item uuid,p_kind text,p_name text,p_description text,p_price_label text,p_active boolean,p_sort integer,p_expected_version integer) returns uuid language sql security invoker set search_path='' as $$select private.upsert_catalog_item(p_tenant,p_item,p_kind,p_name,p_description,p_price_label,p_active,p_sort,p_expected_version);$$;
revoke all on function private.set_public_profile(uuid,text,text,text,text,boolean,integer),private.upsert_catalog_item(uuid,uuid,text,text,text,text,boolean,integer,integer) from public,anon;
grant execute on function private.set_public_profile(uuid,text,text,text,text,boolean,integer),private.upsert_catalog_item(uuid,uuid,text,text,text,text,boolean,integer,integer) to authenticated;
revoke all on function public.set_public_profile(uuid,text,text,text,text,boolean,integer),public.upsert_catalog_item(uuid,uuid,text,text,text,text,boolean,integer,integer) from public,anon;
grant execute on function public.set_public_profile(uuid,text,text,text,text,boolean,integer),public.upsert_catalog_item(uuid,uuid,text,text,text,text,boolean,integer,integer) to authenticated;
revoke all on function public.get_public_profile(text),public.get_public_catalog(text,text) from public;
grant execute on function public.get_public_profile(text),public.get_public_catalog(text,text) to anon,authenticated;
commit;
