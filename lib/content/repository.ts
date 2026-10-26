import { siteContent } from "@/content/seed";
import type { BlogArticle, Project, SiteContent, SocialPost } from "./types";
import { createSupabasePublicClient } from "@/lib/supabase/public";

export const isPreview = process.env.NEXT_PUBLIC_SITE_MODE !== "live";
export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://shivamshukla.site";

function mapProject(row: Record<string, unknown>): Project {
  const links = (row.links || {}) as Record<string, string>;
  return {
    id: String(row.id), slug: String(row.slug), title: String(row.title), summary: String(row.summary || ""),
    category: row.category as Project["category"], headline: String(row.headline || row.title), status: String(row.status || "Published"),
    treatment: (row.treatment || "care") as Project["treatment"], coverUrl: row.cover_url ? String(row.cover_url) : undefined, externalUrl: links.primary, externalLabel: links.label, sourceUrl: links.source,
    problem: String(row.problem || ""), built: String(row.built || ""), outcome: String(row.result || ""), tech: Array.isArray(row.tech) ? row.tech.map(String) : [],
    features: Array.isArray(row.features) ? row.features.map(String) : [], featuresHeading: String(row.features_heading || ""), processSteps: Array.isArray(row.process_steps) ? row.process_steps.map(String) : [],
    extraLinks: Array.isArray(links.extra) ? (links.extra as unknown as Array<Record<string, unknown>>).filter((link) => typeof link.label === "string" && typeof link.url === "string").map((link) => ({ label: String(link.label), url: String(link.url) })) : [], published: true,
  };
}

function mapPost(row: Record<string, unknown>): SocialPost {
  return { id: String(row.id), platform: row.platform as SocialPost["platform"], url: String(row.url || ""), embedHtml: row.embed_html ? String(row.embed_html) : undefined, caption: row.caption ? String(row.caption) : undefined, pinned: Boolean(row.pinned), createdAt: String(row.created_at || "") };
}

function mapBlog(row: Record<string, unknown>): BlogArticle {
  const links = Array.isArray(row.links) ? row.links as Array<Record<string, unknown>> : [];
  return { id: String(row.id), slug: String(row.slug), title: String(row.title), excerpt: String(row.excerpt || ""), coverUrl: row.cover_url ? String(row.cover_url) : undefined, tags: Array.isArray(row.tags) ? row.tags.map(String) : [], contentMd: String(row.content_md || ""), publishedAt: String(row.published_at || ""), readingTime: Number(row.reading_time || 1), links: links.filter((link) => typeof link.label === "string" && typeof link.url === "string").map((link) => ({ label: String(link.label), url: String(link.url) })) };
}

export async function getPublishedPosts(): Promise<SocialPost[]> {
  if (isPreview) return siteContent.posts;
  const client = createSupabasePublicClient();
  if (!client) return [];
  const { data, error } = await client.from("posts").select("*").eq("published", true).order("pinned", { ascending: false }).order("created_at", { ascending: false });
  if (error) return [];
  return (data || []).map(mapPost);
}

export async function getPublishedBlogs(): Promise<BlogArticle[]> {
  if (isPreview) return siteContent.articles;
  const client = createSupabasePublicClient();
  if (!client) return [];
  const { data, error } = await client.from("blogs").select("*").eq("published", true).lte("published_at", new Date().toISOString()).order("published_at", { ascending: false });
  if (error) return [];
  return (data || []).map(mapBlog);
}

export async function getPublishedBlog(slug: string) { return (await getPublishedBlogs()).find((article) => article.slug === slug); }

export type PublicBlogComment = { id: string; name: string; body: string; createdAt: string };
export async function getApprovedBlogComments(slug: string): Promise<PublicBlogComment[]> {
  const client = createSupabasePublicClient();
  if (!client) return [];
  const { data, error } = await client.from("comments").select("id,name,body,created_at").eq("blog_slug", slug).eq("status", "approved").order("created_at", { ascending: true });
  if (error) return [];
  return (data || []).map((row) => ({ id: String(row.id), name: String(row.name), body: String(row.body), createdAt: String(row.created_at) }));
}

export async function getSiteContent(): Promise<SiteContent> {
  // Phase 3 replaces this repository with published Supabase snapshots.
  // Page components and the future admin preview retain the same contract.
  let projects = siteContent.projects.filter((project) => project.published);
  let promotions = siteContent.promotions;
  let profile = siteContent.profile;
  let home = siteContent.home;
  if (!isPreview) {
    projects = [];
    const client = createSupabasePublicClient();
    if (client) {
      const { data } = await client.from("projects").select("*").eq("published", true).order("order", { ascending: true });
      if (data) projects = data.map(mapProject);
      const settings = await client.from("site_settings").select("content").eq("id", "default").maybeSingle();
      const value = settings.data?.content as Partial<SiteContent> | undefined;
      if (value?.promotions) {
        const stored = value.promotions;
        promotions = {
          ...promotions, ...stored,
          newsletter: { ...promotions.newsletter, ...stored.newsletter },
          sponsor: { ...promotions.sponsor, ...stored.sponsor },
          focus: { ...promotions.focus, ...stored.focus },
          thought: { ...promotions.thought, ...stored.thought },
        };
      }
      if (value?.profile) profile = { ...profile, ...value.profile };
      if (value?.home) {
        home = {
          ...home, ...value.home,
          hero: { ...home.hero, ...value.home.hero }, work: { ...home.work, ...value.home.work },
          focus: { ...home.focus, ...value.home.focus }, journey: { ...home.journey, ...value.home.journey },
          posts: { ...home.posts, ...value.home.posts }, writing: { ...home.writing, ...value.home.writing },
          hire: { ...home.hire, ...value.home.hire },
        };
      }
    }
  }
  return {
    ...siteContent,
    projects,
    promotions,
    profile,
    home,
    posts: await getPublishedPosts(),
    articles: await getPublishedBlogs(),
  };
}
