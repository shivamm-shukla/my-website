"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient, requireOwner } from "@/lib/supabase/server";

function value(form: FormData, key: string) { return String(form.get(key) || "").trim(); }
function checked(form: FormData, key: string) { return form.get(key) === "on"; }
function slug(value: string) { return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80); }
function admin() { const client = createSupabaseAdminClient(); if (!client) throw new Error("Supabase admin configuration is missing."); return client; }
function safeExternalUrl(raw: string) { if (!raw) return ""; try { const url = new URL(raw); return ["http:", "https:"].includes(url.protocol) ? url.toString() : ""; } catch { return ""; } }
function parseExtraLinks(raw: string) { return raw.split("\n").map((line) => { const [label, url] = line.split("|").map((part) => part.trim()); return label && safeExternalUrl(url || "") ? { label: label.slice(0, 60), url: safeExternalUrl(url || "") } : null; }).filter((item): item is { label: string; url: string } => Boolean(item)); }

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
  const record = { slug: slug(value(form, "slug") || title), title, excerpt: value(form, "excerpt"), cover_url: coverUrl, tags: value(form, "tags").split(",").map((item) => item.trim()).filter(Boolean), content_md: value(form, "content_md"), links: parseExtraLinks(value(form, "links")), published: checked(form, "published"), published_at: publishedAt ? new Date(publishedAt).toISOString() : null, reading_time: Math.max(1, Number(value(form, "reading_time")) || 1), updated_at: new Date().toISOString() };
  const query = id ? admin().from("blogs").update(record).eq("id", id) : admin().from("blogs").insert(record);
  const { error } = await query; if (error) throw error;
  revalidatePath("/blog"); revalidatePath(`/blog/${record.slug}`); revalidatePath("/"); revalidatePath("/admin");
}

export async function saveProject(form: FormData) {
  await requireOwner();
  const id = value(form, "id");
  const title = value(form, "title");
  const coverUrl = await uploadCover(form, value(form, "cover_url"));
  const list = (key: string) => value(form, key).split("\n").map((item) => item.trim()).filter(Boolean);
  const sourceUrl = safeExternalUrl(value(form, "source_url"));
  const record = { slug: slug(value(form, "slug") || title), title, summary: value(form, "summary"), category: value(form, "category"), cover_url: coverUrl, headline: value(form, "headline"), status: value(form, "status"), treatment: value(form, "treatment") || "care", problem: value(form, "problem"), built: value(form, "built"), tech: value(form, "tech").split(",").map((item) => item.trim()).filter(Boolean), features: list("features"), features_heading: value(form, "features_heading").slice(0, 100), process_steps: list("process_steps"), result: value(form, "result"), links: { primary: safeExternalUrl(value(form, "external_url")), label: value(form, "external_label"), source: sourceUrl, extra: parseExtraLinks(value(form, "extra_links")) }, order: Number(value(form, "order")) || 0, published: checked(form, "published"), updated_at: new Date().toISOString() };
  const query = id ? admin().from("projects").update(record).eq("id", id) : admin().from("projects").insert(record);
  const { error } = await query; if (error) throw error;
  revalidatePath("/work"); revalidatePath(`/work/${record.slug}`); revalidatePath("/"); revalidatePath("/admin");
}

export async function saveEditorialSettings(form: FormData) {
  await requireOwner();
  const clean = (key: string, max: number) => value(form, key).slice(0, max);
  const newsletter = {
    enabled: checked(form, "newsletter_enabled"), label: clean("newsletter_label", 80),
    title: clean("newsletter_title", 120), body: clean("newsletter_body", 400),
    consent: clean("newsletter_consent", 180), cta: clean("newsletter_cta", 48),
  };
  const sponsor = {
    enabled: checked(form, "sponsor_enabled"),
    label: clean("sponsor_label", 60), title: clean("sponsor_title", 120),
    body: clean("sponsor_body", 400), cta: clean("sponsor_cta", 48),
    url: clean("sponsor_url", 500).startsWith("/") ? clean("sponsor_url", 500) : safeExternalUrl(clean("sponsor_url", 500)),
  };
  const focus = {
    enabled: checked(form, "focus_enabled"), label: clean("focus_label", 60),
    title: clean("focus_title", 90), description: clean("focus_description", 240),
    projectSlug: slug(clean("focus_project_slug", 80)),
  };
  const thought = {
    enabled: checked(form, "thought_enabled"), label: clean("thought_label", 60),
    body: clean("thought_body", 280), byline: clean("thought_byline", 80),
  };
  if (sponsor.enabled && (!sponsor.label || !sponsor.title || !sponsor.body || !sponsor.cta || !sponsor.url)) throw new Error("Complete every sponsor placement field and its destination URL before enabling it.");
  if (newsletter.enabled && (!newsletter.label || !newsletter.title || !newsletter.body || !newsletter.consent || !newsletter.cta)) throw new Error("Complete every newsletter card field before enabling it.");
  if (thought.enabled && (!thought.label || !thought.body || !thought.byline)) throw new Error("Complete every thought card field before enabling it.");
  if (focus.enabled && (!focus.label || !focus.title || !focus.description || !focus.projectSlug)) throw new Error("Complete every current focus field before enabling it.");
  if (focus.enabled) {
    const { data, error } = await admin().from("projects").select("slug").eq("slug", focus.projectSlug).maybeSingle();
    if (error || !data) throw new Error("Choose an existing project for the current focus card.");
  }
  const client = admin();
  const { data: current } = await client.from("site_settings").select("content").eq("id", "default").maybeSingle();
  const oldContent = current?.content && typeof current.content === "object" ? current.content as Record<string, unknown> : {};
  const content = { ...oldContent, promotions: { newsletter, sponsor, focus, thought } };
  const { error } = await client.from("site_settings").upsert({ id: "default", content, public_read: true, updated_at: new Date().toISOString() }, { onConflict: "id" });
  if (error) throw error;
  for (const path of ["/", "/blog", "/posts", "/work", "/admin"]) revalidatePath(path);
}

export async function saveSiteCopy(form: FormData) {
  await requireOwner();
  const clean = (key: string, max: number) => value(form, key).slice(0, max);
  const profile = {
    name: clean("profile_name", 80), shortName: clean("profile_short_name", 40),
    description: clean("profile_description", 240), availability: clean("profile_availability", 80),
    university: clean("profile_university", 100), graduation: clean("profile_graduation", 40),
    initials: clean("profile_initials", 4).toLowerCase(),
  };
  if (!profile.name || !profile.shortName) throw new Error("Name and short name are required.");
  const home = {
    hero: {
      title: clean("hero_title", 100), emphasis: clean("hero_emphasis", 100),
      description: clean("hero_description", 280), note: clean("hero_note", 80), caption: clean("hero_caption", 120),
    },
    work: { title: clean("work_title", 100), description: clean("work_description", 240), archiveTitle: clean("work_archive_title", 100), archiveDescription: clean("work_archive_description", 240) },
    focus: { label: clean("home_focus_label", 80), title: clean("home_focus_title", 100), description: clean("home_focus_description", 240) },
    journey: { title: clean("journey_title", 100), description: clean("journey_description", 240) },
    posts: { title: clean("posts_title", 100), description: clean("posts_description", 240) },
    writing: { title: clean("writing_title", 100), description: clean("writing_description", 240) },
    hire: { title: clean("hire_title", 100), description: clean("hire_description", 240), action: clean("hire_action", 60) },
  };
  const client = admin();
  const { data: current } = await client.from("site_settings").select("content").eq("id", "default").maybeSingle();
  const oldContent = current?.content && typeof current.content === "object" ? current.content as Record<string, unknown> : {};
  const content = { ...oldContent, profile, home };
  const { error } = await client.from("site_settings").upsert({ id: "default", content, public_read: true, updated_at: new Date().toISOString() }, { onConflict: "id" });
  if (error) throw error;
  for (const path of ["/", "/about", "/blog", "/posts", "/work", "/hire-me", "/contact", "/resume", "/admin"]) revalidatePath(path);
}

export async function deleteRecord(form: FormData) {
  await requireOwner();
  const table = value(form, "table"); const id = value(form, "id");
  if (!(["posts", "blogs", "projects", "messages"] as string[]).includes(table) || !id) throw new Error("Invalid delete request.");
  const { error } = await admin().from(table).delete().eq("id", id); if (error) throw error;
  revalidatePath("/admin"); revalidatePath("/"); revalidatePath(`/${table === "blogs" ? "blog" : table === "projects" ? "work" : table}`);
}
