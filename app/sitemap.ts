import type { MetadataRoute } from "next";
import { getPublishedBlogs, isPreview, siteUrl } from "@/lib/content/repository";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (isPreview) return [];
  const routes = ["", "/about", "/work", "/work/thravia", "/work/brg-cli", "/work/jeetlo", "/posts", "/blog", "/hire-me", "/resume", "/contact"];
  const pages = routes.map((route, index) => ({ url: `${siteUrl}${route}`, changeFrequency: index === 0 ? "weekly" as const : "monthly" as const, priority: index === 0 ? 1 : route === "/work" || route === "/blog" ? .9 : .7 }));
  const articles = (await getPublishedBlogs()).filter((article) => !article.isDemo).map((article) => ({ url: `${siteUrl}/blog/${article.slug}`, lastModified: article.publishedAt, changeFrequency: "monthly" as const, priority: .7 }));
  return [...pages, ...articles];
}
