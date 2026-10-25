export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "") || "";
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
export const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
export const ownerEmail = process.env.OWNER_EMAIL?.trim().toLowerCase() || "";
export const hasSupabasePublicConfig = Boolean(supabaseUrl && supabaseAnonKey);
export const hasSupabaseAdminConfig = Boolean(supabaseUrl && supabaseServiceKey && ownerEmail);
