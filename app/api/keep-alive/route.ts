import { timingSafeEqual } from "node:crypto";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function matches(value: string, expected: string) {
  const a = Buffer.from(value); const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET || "";
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || "";
  if (!secret || !matches(token, secret)) return Response.json({ ok: false }, { status: 401 });
  const client = createSupabaseAdminClient();
  if (!client) return Response.json({ ok: false, error: "Supabase is not configured." }, { status: 503 });
  const { error } = await client.from("posts").select("id", { head: true, count: "exact" }).limit(1);
  if (error) return Response.json({ ok: false, error: error.message }, { status: 500 });
  return Response.json({ ok: true, checkedAt: new Date().toISOString() }, { headers: { "Cache-Control": "no-store" } });
}
