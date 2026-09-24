/**
 * Supabase credentials stay on the server.
 * Use SUPABASE_URL and SUPABASE_ANON_KEY (not VITE_).
 * Browser code must call the server functions in supabase-admin.ts.
 */
export { getSupabaseConfigured } from "@/lib/supabase-admin";
