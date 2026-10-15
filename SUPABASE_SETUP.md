# Supabase setup

1. Create a Supabase project and copy its **Project URL** and public anon key into local `.env` (never commit this file):
   `VITE_SUPABASE_URL=...` and `VITE_SUPABASE_ANON_KEY=...`.
2. Apply migrations in this exact order, once each: `supabase/migrations/001_admin_foundation.sql`, then `supabase/migrations/002_product_catalog.sql`. Use `supabase db push` (linked project) or paste each complete file into the SQL editor in filename order. Do not rerun 001 against a populated project.
3. Create an Auth user, then insert its UUID into `public.admin_profiles` with an appropriate role. Do this from the SQL editor or a trusted server only.
4. Migration 002 creates the private `product-media` bucket and admin-only Storage policies. Keep it private; serve media with short-lived signed URLs. Do not replace these policies with public read access.
5. Populate products first, then variants/ingredients/inventory and related media/video/social rows. Use `product_publishing` for publication state and keep `products.is_published` compatible with existing storefront reads.

The browser client uses only the anon key and RLS. Never expose a service-role key in Vite environment variables or frontend code. Visit `/admin` for the connection check and management placeholders.
