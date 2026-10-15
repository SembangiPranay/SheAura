import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Production fallbacks ensuring zero-downtime authentication even when .env is absent in CI/CD builds
const DEFAULT_SUPABASE_URL = "https://erxquucmoonszopopavx.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVyeHF1dWNtb29uc3pvcG9wYXZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIwNjE3MzAsImV4cCI6MjEwNzYzNzczMH0.95JwMIJygPAmdPNcTGN3HQaPDw1mgTH1adVoUuK4Vuk";

const supabaseUrl =
  (import.meta.env.VITE_SUPABASE_URL ||
    import.meta.env.NEXT_PUBLIC_SUPABASE_URL ||
    DEFAULT_SUPABASE_URL) as string;

const supabaseAnonKey =
  (import.meta.env.VITE_SUPABASE_ANON_KEY ||
    import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    DEFAULT_SUPABASE_ANON_KEY) as string;

/** Browser-safe Supabase client configured with resilient public anon key */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
