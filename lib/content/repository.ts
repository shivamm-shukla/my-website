import { siteContent } from "@/content/seed";
import type { SiteContent } from "./types";

export const isPreview = process.env.NEXT_PUBLIC_SITE_MODE !== "live";
export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://shivamshukla.site";

export async function getSiteContent(): Promise<SiteContent> {
  // Phase 3 replaces this repository with published Supabase snapshots.
  // Page components and the future admin preview retain the same contract.
  return {
    ...siteContent,
    projects: siteContent.projects.filter((project) => project.published),
    posts: isPreview ? siteContent.posts : [],
    articles: isPreview ? siteContent.articles : [],
  };
}
