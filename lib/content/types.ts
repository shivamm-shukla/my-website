export type ProjectCategory = "Product" | "Developer tools" | "Education";

export type Project = {
  id: string;
  slug: string;
  title: string;
  category: ProjectCategory;
  headline: string;
  summary: string;
  status: string;
  treatment: "care" | "terminal" | "learning";
  externalUrl?: string;
  externalLabel?: string;
  problem: string;
  built: string;
  outcome: string;
  tech: string[];
  published: boolean;
};

export type NavigationItem = { label: string; href: string };
export type SocialPlatform = "linkedin" | "twitter" | "instagram" | "whatsapp" | "email";
export type SocialLink = { platform: SocialPlatform; label: string; url: string | null };
export type TimelineEntry = { title: string; subtitle: string; description: string; icon: "book" | "graduation" | "code" | "sparkles" };
export type SocialPost = { id: string; platform: "linkedin" | "twitter"; url?: string; embedHtml?: string; caption?: string; topic?: string; pinned?: boolean; createdAt?: string; isDemo?: true };
export type BlogArticle = { id?: string; slug: string; title: string; excerpt?: string; coverUrl?: string; tags?: string[]; contentMd?: string; publishedAt?: string; readingTime: number; treatment?: "blue" | "peach" | "lilac"; tag?: string; isDemo?: true };
export type HomeSectionType = "hero" | "work" | "focus" | "journey" | "posts" | "writing" | "hire";
export type HomeSection = { id: string; type: HomeSectionType; visible: boolean };

export type SiteContent = {
  profile: { name: string; shortName: string; initials: string; description: string; availability: string; university: string; graduation: string };
  navigation: NavigationItem[];
  footerNavigation: NavigationItem[];
  socials: SocialLink[];
  sections: HomeSection[];
  projects: Project[];
  timeline: TimelineEntry[];
  posts: SocialPost[];
  articles: BlogArticle[];
  home: {
    hero: { title: string; emphasis: string; description: string; note: string; caption: string };
    work: { title: string; description: string };
    focus: { label: string; title: string; description: string };
    journey: { title: string; description: string };
    posts: { title: string; description: string };
    writing: { title: string; description: string };
    hire: { title: string; description: string; action: string };
  };
};
