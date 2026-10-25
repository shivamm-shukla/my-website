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
  published: boolean;
};

export type NavigationItem = { label: string; href: string };
export type SocialPlatform = "linkedin" | "twitter" | "instagram" | "whatsapp" | "email";
export type SocialLink = { platform: SocialPlatform; label: string; url: string | null };
export type TimelineEntry = { title: string; subtitle: string; description: string; icon: "book" | "graduation" | "sparkles" };
export type SamplePost = { id: string; platform: "linkedin" | "twitter"; caption: string; topic: string; isDemo: true };
export type SampleArticle = { slug: string; title: string; tag: string; readingTime: number; treatment: "blue" | "peach" | "lilac"; isDemo: true };
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
  posts: SamplePost[];
  articles: SampleArticle[];
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
