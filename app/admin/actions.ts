"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient, requireOwner } from "@/lib/supabase/server";
import type { HomeSection, NavigationItem, SiteContent, SocialLink, SocialPlatform, TimelineEntry } from "@/lib/content/types";
import { siteContent } from "@/content/seed";

function value(form: FormData, key: string) { return String(form.get(key) || "").trim(); }
function checked(form: FormData, key: string) { return form.get(key) === "on"; }
function slug(value: string) { return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80); }
function admin() { const client = createSupabaseAdminClient(); if (!client) throw new Error("Supabase admin configuration is missing."); return client; }
function safeExternalUrl(raw: string) { if (!raw) return ""; try { const url = new URL(raw); return ["http:", "https:"].includes(url.protocol) ? url.toString() : ""; } catch { return ""; } }
function safeSocialUrl(raw: string, platform: SocialPlatform) {
  const input = raw.trim(); if (!input) return null;
  if (platform === "email") return input.startsWith("mailto:") && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.slice(7)) ? input.slice(0, 170) : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input) ? `mailto:${input}` : null;
  const candidate = /^[a-z][a-z\d+.-]*:/i.test(input) ? input : `https://${input}`;
  return safeExternalUrl(candidate) || null;
}
function parseExtraLinks(raw: string) { return raw.split("\n").map((line) => { const [label, url] = line.split("|").map((part) => part.trim()); return label && safeExternalUrl(url || "") ? { label: label.slice(0, 60), url: safeExternalUrl(url || "") } : null; }).filter((item): item is { label: string; url: string } => Boolean(item)); }
function parseNavigation(raw: string, allowed: string[]): NavigationItem[] {
  return raw.split("\n").map((line) => { const [label, href] = line.split("|").map((part) => part.trim()); return label && allowed.includes(href || "") ? { label: label.slice(0, 30), href: href || "" } : null; }).filter((item): item is NavigationItem => Boolean(item));
}
function parsePairs(raw: string, max = 12) {
  return raw.split("\n").slice(0, max).map((line) => {
    const [title, description] = line.split("::").map((part) => part.trim());
    return { title: (title || "").slice(0, 100), description: (description || "").slice(0, 300) };
  }).filter((item) => item.title && item.description);
}

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

export async function uploadBlogImage(form: FormData): Promise<{ url?: string; error?: string }> {
  await requireOwner();
  const file = form.get("content_image_file");
  if (!(file instanceof File) || !file.size) return { error: "Choose an image file first." };
  if (file.size > 6_000_000 || !["image/png", "image/jpeg", "image/webp", "image/avif"].includes(file.type)) return { error: "Choose a PNG, JPG, WebP, or AVIF image under 6 MB." };
  const extension = file.name.split(".").pop()?.replace(/[^a-z0-9]/gi, "") || "webp";
  const client = admin(); const path = `articles/${crypto.randomUUID()}.${extension}`;
  const { error } = await client.storage.from("site-media").upload(path, file, { contentType: file.type, upsert: false });
  if (error) return { error: "Could not upload that image. Check the site-media storage bucket." };
  return { url: client.storage.from("site-media").getPublicUrl(path).data.publicUrl };
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
  const client = admin();
  const { data: current } = await client.from("site_settings").select("content").eq("id", "default").maybeSingle();
  const oldContent = current?.content && typeof current.content === "object" ? current.content as Record<string, unknown> : {};
  const oldProfile = oldContent.profile && typeof oldContent.profile === "object" ? oldContent.profile as Record<string, unknown> : {};
  let photoUrl = clean("profile_photo_url", 500) || String(oldProfile.photoUrl || "");
  const photo = form.get("profile_photo");
  if (photo instanceof File && photo.size) {
    if (photo.size > 6_000_000 || !["image/png", "image/jpeg", "image/webp", "image/avif"].includes(photo.type)) throw new Error("Profile photo must be PNG, JPG, WebP, or AVIF under 6 MB.");
    const extension = photo.name.split(".").pop()?.replace(/[^a-z0-9]/gi, "") || "webp";
    const path = `profile/${crypto.randomUUID()}.${extension}`;
    const { error } = await client.storage.from("site-media").upload(path, photo, { contentType: photo.type, upsert: false });
    if (error) throw error;
    photoUrl = client.storage.from("site-media").getPublicUrl(path).data.publicUrl;
  }
  const profile = {
    name: clean("profile_name", 80), shortName: clean("profile_short_name", 40),
    description: clean("profile_description", 240), availability: clean("profile_availability", 80),
    university: clean("profile_university", 100), graduation: clean("profile_graduation", 40),
    initials: clean("profile_initials", 4).toLowerCase(), photoUrl: safeExternalUrl(photoUrl) || "",
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
  const capabilities = parsePairs(value(form, "about_capabilities"), 8).map((item, index) => ({ ...item, icon: siteContent.pages.about.capabilities[index % siteContent.pages.about.capabilities.length].icon }));
  const services = parsePairs(value(form, "hire_services"), 8).map((item, index) => ({ ...item, icon: siteContent.pages.hire.services[index % siteContent.pages.hire.services.length].icon }));
  const process = parsePairs(value(form, "hire_process"), 8);
  const education = parsePairs(value(form, "resume_education"), 8).map((item, index) => ({ ...item, subtitle: siteContent.pages.resume.education[index]?.subtitle || "" }));
  const scholarships = value(form, "resume_scholarships").split("\n").map((item) => item.trim().slice(0, 120)).filter(Boolean).slice(0, 8);
  const skills = value(form, "resume_skills").split("\n").map((item) => item.trim().slice(0, 80)).filter(Boolean).slice(0, 30);
  const pages = {
    about: { title: clean("about_title", 100), introduction: clean("about_introduction", 400), continuation: clean("about_continuation", 400), timelineHeading: clean("about_timeline_heading", 120), capabilitiesHeading: clean("about_capabilities_heading", 120), capabilities, closingNote: clean("about_closing_note", 180) },
    hire: { title: clean("hire_page_title", 120), introduction: clean("hire_page_introduction", 400), servicesHeading: clean("hire_services_heading", 120), servicesDescription: clean("hire_services_description", 300), services, processHeading: clean("hire_process_heading", 120), process, closingTitle: clean("hire_closing_title", 120), closingDescription: clean("hire_closing_description", 300) },
    contact: { title: clean("contact_title", 100), introduction: clean("contact_introduction", 400), formHeading: clean("contact_form_heading", 120), formDescription: clean("contact_form_description", 260) },
    resume: { role: clean("resume_role", 100), summary: clean("resume_summary", 400), location: clean("resume_location", 100), education, scholarships, skills },
    footer: { note: clean("footer_note", 180) },
  };
  const platforms: SocialPlatform[] = ["linkedin", "twitter", "instagram", "whatsapp", "email", "youtube", "github", "website"];
  let socials: SocialLink[];
  try {
    const parsed = JSON.parse(clean("social_links_json", 8000)) as Array<Record<string, unknown>>;
    socials = parsed.filter((item) => platforms.includes(item.platform as SocialPlatform)).map((item) => {
      const platform = item.platform as SocialPlatform;
      return { platform, label: String(item.label || "").trim().slice(0, 40), url: safeSocialUrl(String(item.url || ""), platform) };
    }).filter((item) => item.label);
    if (new Set(socials.map((item) => item.platform)).size !== socials.length) throw new Error("Each social platform can appear once.");
  } catch { throw new Error("Check the social links before saving. Each link needs a unique platform and a valid URL."); }
  let sections: HomeSection[];
  try {
    const parsed = JSON.parse(clean("home_sections_json", 4000)) as Array<Record<string, unknown>>;
    const allowed = new Set(["hero", "work", "focus", "journey", "posts", "writing", "hire"]);
    sections = parsed.filter((item) => allowed.has(String(item.type))).map((item) => ({ id: String(item.type), type: String(item.type) as HomeSection["type"], visible: Boolean(item.visible) }));
    if (new Set(sections.map((section) => section.type)).size !== sections.length || !sections.some((section) => section.type === "hero" && section.visible)) throw new Error("The Home page must keep one visible hero section.");
  } catch { throw new Error("Check Home section order and visibility before saving."); }
  const navigation = parseNavigation(clean("navigation", 2000), ["/", "/about", "/work", "/blog", "/resume", "/contact"]);
  const footerNavigation = parseNavigation(clean("footer_navigation", 4000), ["/", "/about", "/work", "/posts", "/blog", "/hire-me", "/resume", "/contact"]);
  const assistantEnabled = checked(form, "assistant_enabled");
  const shareTemplate = (["aurora", "sunrise", "ocean", "paper"].includes(value(form, "share_template")) ? value(form, "share_template") : "aurora") as SiteContent["shareTemplate"];
  let timeline: TimelineEntry[];
  try {
    const parsed = JSON.parse(clean("timeline_json", 8000)) as Array<Record<string, unknown>>;
    const icons = new Set(["book", "graduation", "code", "sparkles"]);
    timeline = parsed.map((item) => ({ title: String(item.title || "").trim().slice(0, 80), subtitle: String(item.subtitle || "").trim().slice(0, 80), description: String(item.description || "").trim().slice(0, 280), icon: icons.has(String(item.icon)) ? String(item.icon) as TimelineEntry["icon"] : "code" })).filter((item) => item.title && item.description);
    if (!timeline.length) throw new Error("Add at least one complete journey item.");
  } catch { throw new Error("Check the journey items before saving."); }
  const content = { ...oldContent, profile, home, pages, socials, sections, navigation, footerNavigation, timeline, assistantEnabled, shareTemplate };
  const { error } = await client.from("site_settings").upsert({ id: "default", content, public_read: true, updated_at: new Date().toISOString() }, { onConflict: "id" });
  if (error) throw error;
  for (const path of ["/", "/about", "/blog", "/posts", "/work", "/hire-me", "/contact", "/resume", "/admin"]) revalidatePath(path);
}

export async function updateAudienceRecord(form: FormData) {
  await requireOwner();
  const kind = value(form, "kind"); const id = value(form, "id"); const status = value(form, "status");
  const client = admin();
  if (!id) throw new Error("Missing audience record.");
  if (kind === "comment" && ["approved", "rejected", "delete"].includes(status)) {
    const result = status === "delete" ? await client.from("comments").delete().eq("id", id) : await client.from("comments").update({ status }).eq("id", id);
    if (result.error) throw result.error;
  } else if (kind === "subscriber" && status === "unsubscribed") {
    const { error } = await client.from("subscribers").update({ status }).eq("id", id); if (error) throw error;
  } else throw new Error("Invalid audience action.");
  revalidatePath("/admin");
}

export async function deleteRecord(form: FormData) {
  await requireOwner();
  const table = value(form, "table"); const id = value(form, "id");
  if (!(["posts", "blogs", "projects", "messages"] as string[]).includes(table) || !id) throw new Error("Invalid delete request.");
  const { error } = await admin().from(table).delete().eq("id", id); if (error) throw error;
  revalidatePath("/admin"); revalidatePath("/"); revalidatePath(`/${table === "blogs" ? "blog" : table === "projects" ? "work" : table}`);
}
