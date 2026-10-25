import { createClient } from "@supabase/supabase-js";
import { hasSupabasePublicConfig, supabaseAnonKey, supabaseUrl } from "./config";

export function createSupabasePublicClient() {
  if (!hasSupabasePublicConfig) return null;
  return createClient(supabaseUrl, supabaseAnonKey, { auth: { autoRefreshToken: false, persistSession: false } });
}
