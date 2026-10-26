import { createSupabaseAdminClient, getOwner } from "@/lib/supabase/server";

function csv(value: unknown) {
  const text = String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

export async function GET() {
  const owner = await getOwner();
  if (!owner) return new Response("Unauthorized", { status: 401 });
  const client = createSupabaseAdminClient();
  if (!client) return new Response("Studio is unavailable", { status: 503 });
  const { data, error } = await client.from("subscribers").select("email,consent_text,consented_at,source,status").order("consented_at", { ascending: false });
  if (error) return new Response("Could not export subscribers", { status: 500 });
  const rows = [
    ["email", "consent_text", "consented_at", "source", "status"],
    ...(data || []).map((row) => [row.email, row.consent_text, row.consented_at, row.source, row.status]),
  ];
  const body = rows.map((row) => row.map(csv).join(",")).join("\r\n");
  return new Response(body, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": "attachment; filename=site-subscribers.csv", "Cache-Control": "private, no-store" } });
}
