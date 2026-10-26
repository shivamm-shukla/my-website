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
    treatment: (row.treatment || "care") as Project["treatment"], externalUrl: links.primary, externalLabel: links.label,
    problem: String(row.problem || ""), built: String(row.built || ""), outcome: String(row.result || ""), tech: Array.isArray(row.tech) ? row.tech.map(String) : [], published: true,
  };
}

function mapPost(row: Record<string, unknown>): SocialPost {
  return { id: String(row.id), platform: row.platform as SocialPost["platform"], url: String(row.url || ""), embedHtml: row.embed_html ? String(row.embed_html) : undefined, caption: row.caption ? String(row.caption) : undefined, pinned: Boolean(row.pinned), createdAt: String(row.created_at || "") };
}

function mapBlog(row: Record<string, unknown>): BlogArticle {
  return { id: String(row.id), slug: String(row.slug), title: String(row.title), excerpt: String(row.excerpt || ""), coverUrl: row.cover_url ? String(row.cover_url) : undefined, tags: Array.isArray(row.tags) ? row.tags.map(String) : [], contentMd: String(row.content_md || ""), publishedAt: String(row.published_at || ""), readingTime: Number(row.reading_time || 1) };
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
  if (!isPreview) {
    const client = createSupabasePublicClient();
    if (client) {
      const { data } = await client.from("projects").select("*").eq("published", true).order("order", { ascending: true });
      if (data?.length) projects = data.map(mapProject);
    }
  }
  return {
    ...siteContent,
    projects,
    posts: await getPublishedPosts(),
    articles: await getPublishedBlogs(),
  };
}
