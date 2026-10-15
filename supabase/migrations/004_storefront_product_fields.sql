-- Migration 004: Add essential storefront fields to products table
-- Run this in Supabase SQL Editor to support the full She'Aura luxury catalog.

alter table public.products
  add column if not exists image_url text,
  add column if not exists campaign_image_url text,
  add column if not exists note text,
  add column if not exists finish text,
  add column if not exists mood text,
  add column if not exists tag text,
  add column if not exists tone text default '#a81920',
  add column if not exists ingredients text,
  add column if not exists size text,
  add column if not exists stock_quantity integer default 0;

-- Refresh PostgREST schema cache
notify pgrst, 'reload schema';
