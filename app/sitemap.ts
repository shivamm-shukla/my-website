import type { MetadataRoute } from "next";
import { getSiteContent, isPreview, siteUrl } from "@/lib/content/repository";

// Refresh published slugs and update dates from Supabase after owners publish.
export const revalidate = 3600;

function validDate(value?: string) {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function newestDate(values: Array<string | undefined>, fallback: Date) {
  const dates = values.map(validDate).filter((date): date is Date => Boolean(date));
  return dates.length ? new Date(Math.max(...dates.map((date) => date.getTime()))) : fallback;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (isPreview) return [];

  const content = await getSiteContent();
  const deployDate = validDate(process.env.VERCEL_GIT_COMMIT_TIMESTAMP) || new Date();
  const staticDate = validDate(content.updatedAt) || deployDate;
  const projectDates = content.projects.map((project) => project.updatedAt);
  const articleDates = content.articles.filter((article) => !article.isDemo).flatMap((article) => [article.updatedAt, article.publishedAt]);
  const postDates = content.posts.filter((post) => !post.isDemo).map((post) => post.createdAt);
  const url = (path: string) => new URL(path, `${siteUrl}/`).toString();
  const pages: MetadataRoute.Sitemap = [
    { url: url("/"), lastModified: newestDate([content.updatedAt, ...projectDates, ...articleDates, ...postDates], deployDate), changeFrequency: "weekly", priority: 1 },
    { url: url("/about"), lastModified: staticDate, changeFrequency: "monthly", priority: 0.7 },
    { url: url("/work"), lastModified: newestDate(projectDates, staticDate), changeFrequency: "monthly", priority: 0.9 },
    ...content.projects.map((project) => ({ url: url(`/work/${encodeURIComponent(project.slug)}`), lastModified: validDate(project.updatedAt) || staticDate, changeFrequency: "monthly" as const, priority: 0.8 })),
    { url: url("/blog"), lastModified: newestDate(articleDates, staticDate), changeFrequency: "weekly", priority: 0.9 },
    ...content.articles.filter((article) => !article.isDemo).map((article) => ({ url: url(`/blog/${encodeURIComponent(article.slug)}`), lastModified: validDate(article.updatedAt) || validDate(article.publishedAt) || staticDate, changeFrequency: "monthly" as const, priority: 0.7 })),
    { url: url("/resume"), lastModified: staticDate, changeFrequency: "monthly", priority: 0.6 },
    { url: url("/hire-me"), lastModified: staticDate, changeFrequency: "monthly", priority: 0.7 },
    { url: url("/contact"), lastModified: staticDate, changeFrequency: "yearly", priority: 0.5 },
    { url: url("/posts"), lastModified: newestDate(postDates, staticDate), changeFrequency: "weekly", priority: 0.6 },
  ];

  return pages;
}
