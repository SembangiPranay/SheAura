-- She'Aura product catalog expansion. Apply after 001_admin_foundation.sql.
-- All changes are additive so existing admin and storefront queries remain valid.

alter table public.products
  add column if not exists subtitle text,
  add column if not exists short_description text,
  add column if not exists long_description text,
  add column if not exists brand text,
  add column if not exists sku text,
  add column if not exists tags text[] not null default '{}',
  add column if not exists benefits text[] not null default '{}',
  add column if not exists how_to_use text,
  add column if not exists care_instructions text,
  add column if not exists seo_title text,
  add column if not exists seo_description text,
  add column if not exists canonical_url text,
  add column if not exists published_at timestamptz,
  add column if not exists scheduled_publish_at timestamptz,
  add column if not exists archived_at timestamptz;
create unique index if not exists products_sku_unique on public.products (sku) where sku is not null;

alter table public.product_media
  add column if not exists title text,
  add column if not exists mime_type text,
  add column if not exists file_size_bytes bigint check (file_size_bytes is null or file_size_bytes >= 0),
  add column if not exists width integer check (width is null or width > 0),
  add column if not exists height integer check (height is null or height > 0),
  add column if not exists duration_seconds numeric(10,2) check (duration_seconds is null or duration_seconds >= 0),
  add column if not exists metadata jsonb not null default '{}'::jsonb;
alter table public.product_videos
  add column if not exists media_id uuid references public.product_media(id) on delete set null,
  add column if not exists mime_type text,
  add column if not exists duration_seconds numeric(10,2) check (duration_seconds is null or duration_seconds >= 0),
  add column if not exists metadata jsonb not null default '{}'::jsonb;
alter table public.product_social_posts
  add column if not exists media_id uuid references public.product_media(id) on delete set null,
  add column if not exists external_post_id text,
  add column if not exists author_handle text,
  add column if not exists thumbnail_url text,
  add column if not exists metadata jsonb not null default '{}'::jsonb;

create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(), product_id uuid not null references public.products(id) on delete cascade,
  name text not null, sku text unique, option_values jsonb not null default '{}'::jsonb,
  price numeric(12,2), compare_at_price numeric(12,2), currency text not null default 'INR',
  weight_grams numeric(10,2), is_active boolean not null default true, sort_order integer not null default 0,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.product_ingredients (
  id uuid primary key default gen_random_uuid(), product_id uuid not null references public.products(id) on delete cascade,
  name text not null, inci_name text, description text, allergen_notes text, sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create table if not exists public.product_inventory (
  id uuid primary key default gen_random_uuid(), product_id uuid not null references public.products(id) on delete cascade,
  variant_id uuid references public.product_variants(id) on delete cascade, quantity integer not null default 0 check (quantity >= 0),
  reserved_quantity integer not null default 0 check (reserved_quantity >= 0 and reserved_quantity <= quantity), reorder_level integer not null default 0 check (reorder_level >= 0),
  location text not null default 'default', updated_at timestamptz not null default now(), unique (product_id, variant_id, location)
);
create table if not exists public.product_publishing (
  product_id uuid primary key references public.products(id) on delete cascade, status text not null default 'draft' check (status in ('draft','scheduled','published','archived')),
  visible_from timestamptz, visible_until timestamptz, published_by uuid references auth.users(id) on delete set null,
  revision integer not null default 1 check (revision > 0), notes text, updated_at timestamptz not null default now()
);

create index if not exists product_variants_product_idx on public.product_variants(product_id);
create index if not exists product_ingredients_product_idx on public.product_ingredients(product_id);
create index if not exists product_inventory_product_idx on public.product_inventory(product_id);
create index if not exists product_media_product_sort_idx on public.product_media(product_id, sort_order);
create index if not exists product_social_posts_product_idx on public.product_social_posts(product_id, published_at desc);

alter table public.product_variants enable row level security;
alter table public.product_ingredients enable row level security;
alter table public.product_inventory enable row level security;
alter table public.product_publishing enable row level security;
drop policy if exists "admins manage product variants" on public.product_variants;
drop policy if exists "admins manage product ingredients" on public.product_ingredients;
drop policy if exists "admins manage product inventory" on public.product_inventory;
drop policy if exists "admins manage product publishing" on public.product_publishing;
create policy "admins manage product variants" on public.product_variants for all using (public.is_admin()) with check (public.is_admin());
create policy "admins manage product ingredients" on public.product_ingredients for all using (public.is_admin()) with check (public.is_admin());
create policy "admins manage product inventory" on public.product_inventory for all using (public.is_admin()) with check (public.is_admin());
create policy "admins manage product publishing" on public.product_publishing for all using (public.is_admin()) with check (public.is_admin());

-- Safe, private bucket setup. Existing bucket settings are preserved.
insert into storage.buckets (id, name, public) values ('product-media', 'product-media', false) on conflict (id) do nothing;
drop policy if exists "admins upload product media" on storage.objects;
drop policy if exists "admins update product media" on storage.objects;
drop policy if exists "admins delete product media" on storage.objects;
drop policy if exists "admins read product media" on storage.objects;
create policy "admins upload product media" on storage.objects for insert to authenticated with check (bucket_id = 'product-media' and public.is_admin());
create policy "admins update product media" on storage.objects for update to authenticated using (bucket_id = 'product-media' and public.is_admin()) with check (bucket_id = 'product-media' and public.is_admin());
create policy "admins delete product media" on storage.objects for delete to authenticated using (bucket_id = 'product-media' and public.is_admin());
create policy "admins read product media" on storage.objects for select to authenticated using (bucket_id = 'product-media' and public.is_admin());
