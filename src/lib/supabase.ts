import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL) as string | undefined;
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) as string | undefined;

/** Browser-safe client. The anon key is intentionally the only key accepted here. */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!, { auth: { persistSession: true, autoRefreshToken: true } })
  : null;
