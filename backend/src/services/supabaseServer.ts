import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { config } from "../config.js";

// Elevate privileges securely on the backend only
export const supabaseAdmin: SupabaseClient = createClient(
  config.supabase.url,
  config.supabase.serviceRoleKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);
