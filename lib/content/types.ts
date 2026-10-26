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
  coverUrl?: string;
  sourceUrl?: string;
  extraLinks: Array<{ label: string; url: string }>;
  externalUrl?: string;
  externalLabel?: string;
  problem: string;
  built: string;
  outcome: string;
  tech: string[];
  features: string[];
  featuresHeading: string;
  processSteps: string[];
  published: boolean;
};

export type NavigationItem = { label: string; href: string };
export type SocialPlatform = "linkedin" | "twitter" | "instagram" | "whatsapp" | "email" | "youtube" | "github" | "website";
export type SocialLink = { platform: SocialPlatform; label: string; url: string | null };
export type TimelineEntry = { title: string; subtitle: string; description: string; icon: "book" | "graduation" | "code" | "sparkles" };
export type SocialPost = { id: string; platform: "linkedin" | "twitter"; url?: string; embedHtml?: string; caption?: string; topic?: string; pinned?: boolean; createdAt?: string; isDemo?: true };
export type BlogArticle = { id?: string; slug: string; title: string; excerpt?: string; coverUrl?: string; tags?: string[]; contentMd?: string; publishedAt?: string; readingTime: number; links?: Array<{ label: string; url: string }>; treatment?: "blue" | "peach" | "lilac"; tag?: string; isDemo?: true };
export type HomeSectionType = "hero" | "work" | "focus" | "journey" | "posts" | "writing" | "hire";
export type HomeSection = { id: string; type: HomeSectionType; visible: boolean };
export type EditorialPromotions = {
  newsletter: { enabled: boolean; label: string; title: string; body: string; consent: string; cta: string };
  sponsor: { enabled: boolean; label: string; title: string; body: string; cta: string; url: string };
  focus: { enabled: boolean; label: string; title: string; description: string; projectSlug: string };
  thought: { enabled: boolean; label: string; body: string; byline: string };
};

export type SiteContent = {
  profile: { name: string; shortName: string; initials: string; description: string; availability: string; university: string; graduation: string; photoUrl?: string };
  navigation: NavigationItem[];
  footerNavigation: NavigationItem[];
  socials: SocialLink[];
  sections: HomeSection[];
  promotions: EditorialPromotions;
  projects: Project[];
  timeline: TimelineEntry[];
  posts: SocialPost[];
  articles: BlogArticle[];
  home: {
    hero: { title: string; emphasis: string; description: string; note: string; caption: string };
    work: { title: string; description: string; archiveTitle: string; archiveDescription: string };
    focus: { label: string; title: string; description: string };
    journey: { title: string; description: string };
    posts: { title: string; description: string };
    writing: { title: string; description: string };
    hire: { title: string; description: string; action: string };
  };
  pages: {
    about: { title: string; introduction: string; continuation: string; timelineHeading: string; capabilitiesHeading: string; capabilities: Array<{ title: string; description: string; icon: "globe" | "code" | "message" }>; closingNote: string };
    hire: { title: string; introduction: string; servicesHeading: string; servicesDescription: string; services: Array<{ title: string; description: string; icon: "globe" | "folder" | "code" }>; processHeading: string; process: Array<{ title: string; description: string }>; closingTitle: string; closingDescription: string };
    contact: { title: string; introduction: string; formHeading: string; formDescription: string };
    resume: { role: string; summary: string; location: string; education: Array<{ title: string; subtitle: string; description: string }>; scholarships: string[]; skills: string[] };
    footer: { note: string };
  };
  assistantEnabled: boolean;
  shareTemplate: "aurora" | "sunrise" | "ocean" | "paper";
};
