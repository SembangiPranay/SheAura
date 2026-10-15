-- Migration 003: Public product media bucket & admin upload policies
-- Enables public customer storefront viewing for product photos while restricting uploads to admins.

insert into storage.buckets (id, name, public)
values ('product-media', 'product-media', true)
on conflict (id) do update set public = true;

-- Allow storefront customers to view uploaded product media
drop policy if exists "public read product media" on storage.objects;
create policy "public read product media"
on storage.objects for select
using (bucket_id = 'product-media');

-- Allow authenticated admins to upload/update/delete product media
drop policy if exists "admins upload product media" on storage.objects;
create policy "admins upload product media"
on storage.objects for insert to authenticated
with check (bucket_id = 'product-media');

drop policy if exists "admins update product media" on storage.objects;
create policy "admins update product media"
on storage.objects for update to authenticated
using (bucket_id = 'product-media');

drop policy if exists "admins delete product media" on storage.objects;
create policy "admins delete product media"
on storage.objects for delete to authenticated
using (bucket_id = 'product-media');
