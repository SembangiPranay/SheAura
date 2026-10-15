-- She'Aura admin foundation. Run with Supabase CLI or paste into SQL editor.
create type public.admin_role as enum ('owner', 'admin', 'editor', 'fulfillment');
create type public.order_status as enum ('pending', 'paid', 'processing', 'shipped', 'completed', 'cancelled');

create table public.admin_profiles (id uuid primary key references auth.users(id) on delete cascade, display_name text, role public.admin_role not null default 'editor', created_at timestamptz not null default now());
create table public.products (id uuid primary key default gen_random_uuid(), slug text unique not null, name text not null, description text, price numeric(12,2) not null default 0, currency text not null default 'INR', category text, is_published boolean not null default false, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table public.product_media (id uuid primary key default gen_random_uuid(), product_id uuid not null references public.products(id) on delete cascade, storage_path text not null, media_type text not null check (media_type in ('image','video')), alt_text text, sort_order integer not null default 0, created_at timestamptz not null default now());
create table public.product_videos (id uuid primary key default gen_random_uuid(), product_id uuid not null references public.products(id) on delete cascade, video_url text not null, poster_url text, title text, created_at timestamptz not null default now());
create table public.product_social_posts (id uuid primary key default gen_random_uuid(), product_id uuid references public.products(id) on delete set null, platform text not null, post_url text not null, caption text, published_at timestamptz, created_at timestamptz not null default now());
create table public.orders (id uuid primary key default gen_random_uuid(), customer_email text not null, status public.order_status not null default 'pending', total numeric(12,2) not null default 0, currency text not null default 'INR', created_at timestamptz not null default now());
create table public.order_items (id uuid primary key default gen_random_uuid(), order_id uuid not null references public.orders(id) on delete cascade, product_id uuid references public.products(id) on delete set null, product_name text not null, quantity integer not null check (quantity > 0), unit_price numeric(12,2) not null);

alter table public.admin_profiles enable row level security;
alter table public.products enable row level security;
alter table public.product_media enable row level security;
alter table public.product_videos enable row level security;
alter table public.product_social_posts enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
create or replace function public.is_admin() returns boolean language sql security definer set search_path = public stable as $$ select exists (select 1 from admin_profiles where id = auth.uid() and role in ('owner','admin','editor','fulfillment')); $$;
create policy "published products are public" on public.products for select using (is_published = true or public.is_admin());
create policy "admins manage products" on public.products for all using (public.is_admin()) with check (public.is_admin());
create policy "admins manage product media" on public.product_media for all using (public.is_admin()) with check (public.is_admin());
create policy "admins manage product videos" on public.product_videos for all using (public.is_admin()) with check (public.is_admin());
create policy "admins manage social posts" on public.product_social_posts for all using (public.is_admin()) with check (public.is_admin());
create policy "admins manage orders" on public.orders for all using (public.is_admin()) with check (public.is_admin());
create policy "admins manage order items" on public.order_items for all using (public.is_admin()) with check (public.is_admin());
create policy "admins read own profile" on public.admin_profiles for select using (id = auth.uid() or public.is_admin());
