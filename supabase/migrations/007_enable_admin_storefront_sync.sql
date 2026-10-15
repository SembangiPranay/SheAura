-- Migration 007: Enable Admin Product Management & Storefront Synchronization
-- Run this migration in the Supabase SQL Editor: https://supabase.com/dashboard/project/erxquucmoonszopopavx/sql
-- This allows authenticated administrators to create, update, and publish products,
-- and ensures published products are publicly accessible to all storefront shoppers.

-- 1. Ensure products table has correct RLS enabled
alter table public.products enable row level security;

-- Drop any restrictive legacy policies on public.products
drop policy if exists "published products are public" on public.products;
drop policy if exists "admins manage products" on public.products;
drop policy if exists "authenticated users manage products" on public.products;
drop policy if exists "anyone can read published products" on public.products;
drop policy if exists "public select published products" on public.products;

-- 2. Public Storefront Select Policy:
-- Anyone (anonymous shoppers and logged-in users) can select published products.
-- Authenticated users (admins) can view both published and draft products.
create policy "public select published products"
  on public.products
  for select
  using (is_published = true or auth.role() = 'authenticated');

-- 3. Admin Management Policy:
-- Any authenticated user (logged in to the She'Aura admin operations studio)
-- can insert, update, or delete products.
create policy "authenticated users manage products"
  on public.products
  for all
  to authenticated
  using (true)
  with check (true);

-- 4. Enable public read access and authenticated upload access on storage.buckets for 'product-media'
insert into storage.buckets (id, name, public)
values ('product-media', 'product-media', true)
on conflict (id) do update set public = true;

drop policy if exists "public read product media" on storage.objects;
create policy "public read product media"
  on storage.objects for select
  using (bucket_id = 'product-media');

drop policy if exists "authenticated upload product media" on storage.objects;
create policy "authenticated upload product media"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'product-media');

drop policy if exists "authenticated update product media" on storage.objects;
create policy "authenticated update product media"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'product-media');

drop policy if exists "authenticated delete product media" on storage.objects;
create policy "authenticated delete product media"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'product-media');

-- 5. Seed initial She'Aura flagship products if the products table is empty
insert into public.products (
  slug, name, price, currency, category, is_published,
  description, short_description, note, finish, mood, tag, tone,
  image_url, campaign_image_url,
  ingredients, size, stock_quantity,
  video_url, instagram_url, video_title, video_quote, social_handle
)
values
(
  'scarlet-rose-lipstick',
  'Scarlet Rose Lipstick',
  1099.00,
  'INR',
  'Lip colour',
  true,
  'A couture red lip with a petal-embossed silhouette, designed as the finishing piece in your everyday wardrobe.',
  'Satin botanical lip colour with petal-soft glide.',
  'Satin botanical colour',
  'Sculpted satin',
  'The red statement',
  'Icon',
  '#a81920',
  '/campaign/scarlet-botanical.png',
  '/campaign/scarlet-portrait.png',
  'Damask Rose Petal Extract, Plant Squalane (Olive-Derived), Shea Butter, Vitamin E',
  '3.8g / 0.13 oz',
  120,
  '/reels/reel-02-nothing-better-lipstick.mp4',
  'https://www.instagram.com/reel/DeO8B16hEAz/?utm_source=ig_web_copy_link',
  'Look 01 · Sensorial Glide',
  'Finding a formula that glides smoothly and hydrates all day.',
  '@sheauracosmeticsofficial'
),
(
  'pink-blossom-blush',
  'Pink Blossom Blush',
  899.00,
  'INR',
  'Blush',
  true,
  'A buildable pink flush presented in a keepsake gold compact, made to move effortlessly from daylight to evening.',
  'Soft-focus silk powder blush with fresh botanical flush.',
  'Soft-focus flush',
  'Silk powder',
  'The romantic flush',
  'Bestseller',
  '#a94368',
  '/campaign/pink-blossom-still.png',
  '/campaign/pink-blossom-portrait.png',
  'Camellia Seed Oil, Multi-Weight Hyaluronic Acid, Candelilla Wax, Botanical Pigments',
  '5.2g / 0.18 oz',
  85,
  '/reels/reel-01-perfect-blush.mp4',
  'https://www.instagram.com/reel/DeV_UkRpvGw/?utm_source=ig_web_copy_link',
  'Look 02 · The Romantic Flush',
  'The PERFECT BLUSH for everyday use. Melts effortlessly into skin with buildable rose pigment.',
  '@sheauracosmeticsofficial'
),
(
  'molten-glow-highlighter',
  'Molten Glow Highlighter',
  1199.00,
  'INR',
  'Highlighter',
  true,
  'A fluid veil of warm luminosity that catches the light like jewellery and turns skin into the main accessory.',
  'Liquid golden hour luminosity with molten mica pearl veil.',
  'Liquid luminosity',
  'Molten pearl',
  'The golden hour',
  'New',
  '#c18847',
  '/campaign/highlighter-glow-still.png',
  '/campaign/highlighter-glow-portrait.png',
  'Molten Mica Pearls, Plant Squalane, Niacinamide, Lotus Blossom Water',
  '15ml / 0.5 fl oz',
  60,
  '/reels/reel-03-molten-highlighter.mp4',
  'https://www.instagram.com/reel/Dfh8kY6p-gV/?utm_source=ig_web_copy_link',
  'Look 03 · Molten Shimmer Veil',
  'Liquid shimmer & luxury glow that turns skin into the main accessory.',
  '@sheauracosmeticsofficial'
)
on conflict (slug) do update set
  is_published = true,
  video_url = excluded.video_url,
  instagram_url = excluded.instagram_url;

-- Refresh PostgREST schema cache
notify pgrst, 'reload schema';
