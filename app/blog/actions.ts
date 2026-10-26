"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rate-limit";

export type ReaderActionState = { status: "idle" | "error" | "unavailable" | "success"; message: string };

async function requestIdentity() {
  const requestHeaders = await headers();
  return requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() || requestHeaders.get("x-real-ip") || "unknown";
}

export async function subscribeToBlog(_: ReaderActionState, formData: FormData): Promise<ReaderActionState> {
  if (String(formData.get("company") || "").trim()) return { status: "success", message: "Thanks for subscribing." };
  const email = String(formData.get("email") || "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 160) return { status: "error", message: "Enter a valid email address." };
  if (formData.get("consent") !== "on") return { status: "error", message: "Please confirm you want to receive writing updates." };
  if (!await rateLimit("blog-subscribe", await requestIdentity(), 3, 60 * 60 * 1000)) return { status: "error", message: "Too many attempts. Please try again later." };
  const client = createSupabaseAdminClient();
  if (!client) return { status: "unavailable", message: "Subscriptions are not connected yet. Your address was not stored." };
  const consentText = String(formData.get("consent_copy") || "").trim().slice(0, 180);
  if (consentText.length < 8) return { status: "error", message: "Please confirm the subscription consent text." };
  const { error } = await client.from("subscribers").insert({ email, consent_text: consentText, source: "blog" });
  if (error && error.code !== "23505") return { status: "error", message: "Could not save your subscription. Please try again." };
  return { status: "success", message: error ? "You’re already on the list." : "You’re subscribed. Thank you." };
}

export async function submitBlogComment(_: ReaderActionState, formData: FormData): Promise<ReaderActionState> {
  if (String(formData.get("website") || "").trim()) return { status: "success", message: "Your comment is waiting for review." };
  const slug = String(formData.get("slug") || "").trim();
  const name = String(formData.get("name") || "").trim();
  const body = String(formData.get("body") || "").trim();
  if (!/^[a-z0-9-]{1,80}$/.test(slug)) return { status: "error", message: "This article is not available for comments." };
  if (name.length < 2 || name.length > 60) return { status: "error", message: "Name must be between 2 and 60 characters." };
  if (body.length < 10 || body.length > 2000) return { status: "error", message: "Comment must be between 10 and 2,000 characters." };
  if (!await rateLimit("blog-comment", await requestIdentity(), 4, 60 * 60 * 1000)) return { status: "error", message: "Too many comments from this connection. Try again later." };
  const client = createSupabaseAdminClient();
  if (!client) return { status: "unavailable", message: "Discussion is not connected yet. Your comment was not stored." };
  const { data: article } = await client.from("blogs").select("slug").eq("slug", slug).eq("published", true).maybeSingle();
  if (!article) return { status: "error", message: "This article is not available for comments." };
  const { error } = await client.from("comments").insert({ blog_slug: slug, name, body, status: "pending" });
  if (error) return { status: "error", message: "Could not save your comment. Please try again." };
  revalidatePath(`/blog/${slug}`);
  return { status: "success", message: "Thanks. Your comment is waiting for review." };
}

