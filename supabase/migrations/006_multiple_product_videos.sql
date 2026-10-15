-- Migration 006: Add multiple motion videos & Instagram posts array to products
-- Run this in Supabase SQL Editor to support an array of videos/reels per product.

alter table public.products
  add column if not exists videos jsonb default '[]'::jsonb;

-- Populate existing products' videos column from legacy single video columns if empty
update public.products
set videos = jsonb_build_array(
  jsonb_build_object(
    'id', 'vid-1',
    'video_url', coalesce(video_url, ''),
    'instagram_url', coalesce(instagram_url, ''),
    'title', coalesce(video_title, 'Look 01 · Sensorial Glide'),
    'quote', coalesce(video_quote, 'Finding a formula that glides smoothly and hydrates all day.'),
    'social_handle', coalesce(social_handle, '@sheauracosmeticsofficial')
  )
)
where (videos is null or jsonb_array_length(videos) = 0)
  and (video_url is not null and video_url != '' or instagram_url is not null and instagram_url != '');

-- Refresh PostgREST schema cache
notify pgrst, 'reload schema';
