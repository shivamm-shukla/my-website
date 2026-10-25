import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { hasSupabaseAdminConfig, hasSupabasePublicConfig, ownerEmail, supabaseAnonKey, supabaseServiceKey, supabaseUrl } from "./config";

export async function createSupabaseServerClient() {
  if (!hasSupabasePublicConfig) return null;
  const store = await cookies();
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (values) => { try { values.forEach(({ name, value, options }) => store.set(name, value, options)); } catch {} },
    },
  });
}

export function createSupabaseAdminClient() {
  if (!hasSupabaseAdminConfig) return null;
  return createClient(supabaseUrl, supabaseServiceKey, { auth: { autoRefreshToken: false, persistSession: false } });
}

export async function getOwner() {
  const client = await createSupabaseServerClient();
  if (!client || !ownerEmail) return null;
  const { data: { user } } = await client.auth.getUser();
  return user?.email?.toLowerCase() === ownerEmail ? user : null;
}

export async function requireOwner() {
  const owner = await getOwner();
  if (!owner) throw new Error("Owner authentication required.");
  return owner;
}
