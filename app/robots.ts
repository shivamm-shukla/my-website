import type { MetadataRoute } from "next";
import { isPreview, siteUrl } from "@/lib/content/repository";

export default function robots(): MetadataRoute.Robots {
  return isPreview ? { rules: { userAgent: "*", disallow: "/" } } : { rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/auth", "/api", "/preview"] }, sitemap: `${siteUrl}/sitemap.xml` };
}
