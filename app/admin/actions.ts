"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient, requireOwner } from "@/lib/supabase/server";

function value(form: FormData, key: string) { return String(form.get(key) || "").trim(); }
function checked(form: FormData, key: string) { return form.get(key) === "on"; }
function slug(value: string) { return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80); }
function admin() { const client = createSupabaseAdminClient(); if (!client) throw new Error("Supabase admin configuration is missing."); return client; }

async function uploadCover(form: FormData, fallback?: string) {
  const file = form.get("cover_file");
  if (!(file instanceof File) || !file.size) return fallback || null;
  if (file.size > 6_000_000 || !["image/png", "image/jpeg", "image/webp", "image/avif"].includes(file.type)) throw new Error("Cover must be PNG, JPG, WebP, or AVIF under 6 MB.");
  const extension = file.name.split(".").pop()?.replace(/[^a-z0-9]/gi, "") || "webp";
  const path = `covers/${crypto.randomUUID()}.${extension}`;
  const client = admin();
  const { error } = await client.storage.from("site-media").upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw error;
  return client.storage.from("site-media").getPublicUrl(path).data.publicUrl;
}

export async function savePost(form: FormData) {
  await requireOwner();
  const id = value(form, "id");
  const record = { platform: value(form, "platform"), url: value(form, "url"), embed_html: value(form, "embed_html") || null, caption: value(form, "caption") || null, pinned: checked(form, "pinned"), published: checked(form, "published") };
  const query = id ? admin().from("posts").update(record).eq("id", id) : admin().from("posts").insert(record);
  const { error } = await query; if (error) throw error;
  revalidatePath("/posts"); revalidatePath("/"); revalidatePath("/admin");
}

export async function saveBlog(form: FormData) {
  await requireOwner();
  const id = value(form, "id");
  const title = value(form, "title");
  const coverUrl = await uploadCover(form, value(form, "cover_url"));
  const publishedAt = value(form, "published_at");
  const record = { slug: slug(value(form, "slug") || title), title, excerpt: value(form, "excerpt"), cover_url: coverUrl, tags: value(form, "tags").split(",").map((item) => item.trim()).filter(Boolean), content_md: value(form, "content_md"), published: checked(form, "published"), published_at: publishedAt ? new Date(publishedAt).toISOString() : null, reading_time: Math.max(1, Number(value(form, "reading_time")) || 1), updated_at: new Date().toISOString() };
  const query = id ? admin().from("blogs").update(record).eq("id", id) : admin().from("blogs").insert(record);
  const { error } = await query; if (error) throw error;
  revalidatePath("/blog"); revalidatePath(`/blog/${record.slug}`); revalidatePath("/"); revalidatePath("/admin");
}

export async function saveProject(form: FormData) {
  await requireOwner();
  const id = value(form, "id");
  const title = value(form, "title");
  const coverUrl = await uploadCover(form, value(form, "cover_url"));
  const record = { slug: slug(value(form, "slug") || title), title, summary: value(form, "summary"), category: value(form, "category"), cover_url: coverUrl, headline: value(form, "headline"), status: value(form, "status"), treatment: value(form, "treatment") || "care", problem: value(form, "problem"), built: value(form, "built"), tech: value(form, "tech").split(",").map((item) => item.trim()).filter(Boolean), result: value(form, "result"), links: { primary: value(form, "external_url"), label: value(form, "external_label") }, order: Number(value(form, "order")) || 0, published: checked(form, "published"), updated_at: new Date().toISOString() };
  const query = id ? admin().from("projects").update(record).eq("id", id) : admin().from("projects").insert(record);
  const { error } = await query; if (error) throw error;
  revalidatePath("/work"); revalidatePath(`/work/${record.slug}`); revalidatePath("/"); revalidatePath("/admin");
}

export async function deleteRecord(form: FormData) {
  await requireOwner();
  const table = value(form, "table"); const id = value(form, "id");
  if (!(["posts", "blogs", "projects", "messages"] as string[]).includes(table) || !id) throw new Error("Invalid delete request.");
  const { error } = await admin().from(table).delete().eq("id", id); if (error) throw error;
  revalidatePath("/admin"); revalidatePath("/"); revalidatePath(`/${table === "blogs" ? "blog" : table === "projects" ? "work" : table}`);
}
