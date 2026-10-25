"use server";

import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export type ContactState = {
  status: "idle" | "error" | "unavailable" | "success";
  message: string;
  errors: Partial<Record<"name" | "email" | "message", string>>;
};

export async function submitContact(_: ContactState, formData: FormData): Promise<ContactState> {
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const message = String(formData.get("message") || "").trim();
  const company = String(formData.get("company") || "").trim();
  if (company) return { status: "success", message: "Thanks — your message is in.", errors: {} };

  const errors: ContactState["errors"] = {};
  if (name.length < 2 || name.length > 80) errors.name = "Please enter a name between 2 and 80 characters.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 160) errors.email = "Please enter a valid email address.";
  if (message.length < 20 || message.length > 3000) errors.message = "Please write between 20 and 3,000 characters.";
  if (Object.keys(errors).length) return { status: "error", message: "Please check the highlighted fields.", errors };

  const client = createSupabaseAdminClient();
  if (!client) return { status: "unavailable", message: "The private inbox is being connected. Your message was not stored yet — please use a social contact when its owner-supplied link appears here.", errors: {} };
  const requestHeaders = await headers();
  const ip = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() || requestHeaders.get("x-real-ip") || "unknown";
  const key = `contact:${createHash("sha256").update(ip).digest("hex")}`;
  const now = Date.now();
  const { data: limit } = await client.from("rate_limits").select("*").eq("key", key).maybeSingle();
  const windowStart = limit?.window_start ? new Date(limit.window_start).getTime() : now;
  const active = now - windowStart < 60 * 60 * 1000;
  if (active && Number(limit?.count || 0) >= 5) return { status: "error", message: "Too many messages from this connection. Please try again in an hour.", errors: {} };
  await client.from("rate_limits").upsert({ key, count: active ? Number(limit?.count || 0) + 1 : 1, window_start: active ? new Date(windowStart).toISOString() : new Date(now).toISOString(), updated_at: new Date(now).toISOString() });
  const { error } = await client.from("messages").insert({ name, email, message });
  if (error) return { status: "error", message: "The message could not be sent. Please try again shortly.", errors: {} };
  return { status: "success", message: "Thanks — your message is safely in Shivam’s inbox.", errors: {} };
}
