import type { MetadataRoute } from "next";
import { isPreview, siteUrl } from "@/lib/content/repository";

export default function sitemap(): MetadataRoute.Sitemap {
  // Add routes only as they are implemented and have publishable content.
  return isPreview ? [] : [{ url: siteUrl, changeFrequency: "weekly", priority: 1 }];
}
