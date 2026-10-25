import { createHash } from "node:crypto";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

const memory = new Map<string, { count: number; start: number }>();

export async function rateLimit(scope: string, identity: string, limit: number, windowMs: number) {
  const key = `${scope}:${createHash("sha256").update(identity).digest("hex")}`;
  const now = Date.now();
  const client = createSupabaseAdminClient();
  if (!client) {
    const record = memory.get(key);
    if (!record || now - record.start >= windowMs) { memory.set(key, { count: 1, start: now }); return true; }
    if (record.count >= limit) return false;
    record.count += 1; return true;
  }
  const { data } = await client.from("rate_limits").select("*").eq("key", key).maybeSingle();
  const start = data?.window_start ? new Date(data.window_start).getTime() : now;
  const active = now - start < windowMs;
  if (active && Number(data?.count || 0) >= limit) return false;
  await client.from("rate_limits").upsert({ key, count: active ? Number(data?.count || 0) + 1 : 1, window_start: active ? new Date(start).toISOString() : new Date(now).toISOString(), updated_at: new Date(now).toISOString() });
  return true;
}
