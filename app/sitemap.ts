import type { MetadataRoute } from "next";
import { isPreview, siteUrl } from "@/lib/content/repository";

export default function sitemap(): MetadataRoute.Sitemap {
  if (isPreview) return [];
  const routes = ["", "/about", "/work", "/work/thravia", "/work/brg-cli", "/work/jeetlo", "/hire-me", "/resume", "/contact"];
  return routes.map((route, index) => ({ url: `${siteUrl}${route}`, changeFrequency: index === 0 ? "weekly" : "monthly", priority: index === 0 ? 1 : route === "/work" ? .9 : .7 }));
}
