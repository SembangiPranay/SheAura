-- Migration 005: Add motion video & Instagram social reel alignment to products
-- Run this in Supabase SQL Editor to support direct product videos & Instagram Reels.

alter table public.products
  add column if not exists video_url text,
  add column if not exists instagram_url text,
  add column if not exists video_title text,
  add column if not exists video_quote text,
  add column if not exists social_handle text default '@sheauracosmeticsofficial';

-- Refresh PostgREST schema cache
notify pgrst, 'reload schema';
