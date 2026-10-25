import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/content/repository";

export default function robots(): MetadataRoute.Robots {
  const blockIndexing = process.env.VERCEL_ENV === "preview" || process.env.NEXT_PUBLIC_SITE_MODE === "preview";
  return blockIndexing ? { rules: { userAgent: "*", disallow: "/" } } : { rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/auth", "/api", "/preview"] }, sitemap: `${siteUrl}/sitemap.xml` };
}
