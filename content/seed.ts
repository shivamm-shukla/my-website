import type { SiteContent } from "@/lib/content/types";

// This typed seed becomes the initial CMS content. Personal facts come from AGENTS.md.
// Explicit demo records are for the design preview and are never production content.
export const siteContent: SiteContent = {
  profile: {
    name: "Shivam Shukla",
    shortName: "Shivam",
    initials: "ss",
    description: "Computer science student. Builder of products for real people.",
    availability: "Open for freelance projects",
    university: "Sitare University",
    graduation: "May 2028",
  },
  navigation: [
    { label: "Work", href: "/#work" },
    { label: "About", href: "/#journey" },
    { label: "Writing", href: "/#writing" },
    { label: "Resume", href: "/resume" },
  ],
  footerNavigation: [
    { label: "Home", href: "/" }, { label: "About", href: "/about" },
    { label: "Work", href: "/work" }, { label: "Posts", href: "/posts" },
    { label: "Blog", href: "/blog" }, { label: "Hire me", href: "/hire-me" },
    { label: "Resume", href: "/resume" }, { label: "Contact", href: "/contact" },
  ],
  socials: [
    { platform: "linkedin", label: "LinkedIn", url: null },
    { platform: "twitter", label: "X / Twitter", url: null },
    { platform: "instagram", label: "Instagram", url: null },
    { platform: "whatsapp", label: "WhatsApp", url: null },
    { platform: "email", label: "Email", url: null },
  ],
  sections: ["hero", "work", "focus", "journey", "posts", "writing", "hire"].map((type) => ({ id: type, type, visible: true })) as SiteContent["sections"],
  projects: [
    {
      id: "thravia", slug: "thravia", title: "Thravia", category: "Product",
      headline: "A little company.\nA lot of peace of mind.",
      summary: "A trusted companion for your loved one’s hospital visit. Even when you’re far away.",
      status: "Currently building", treatment: "care", externalUrl: "https://thravia.app", externalLabel: "Visit Thravia", published: true,
    },
    {
      id: "brg-cli", slug: "brg-cli", title: "brg-cli", category: "Developer tools",
      headline: "Different tools.\nSame context.",
      summary: "Switch between AI coding tools. Bring your project context with you.",
      status: "On npm", treatment: "terminal", externalUrl: "https://www.npmjs.com/package/brg-cli", externalLabel: "View on npm", published: true,
    },
    {
      id: "jeetlo", slug: "jeetlo", title: "Jeetlo", category: "Education",
      headline: "Big dreams.\nApni language mein.",
      summary: "AI-powered exam prep for Hindi-medium students preparing for JNVST and CHS.",
      status: "Android app", treatment: "learning", published: true,
    },
  ],
  timeline: [
    { title: "Navodaya", subtitle: "Where it started", description: "Jawahar Navodaya Vidyalaya. Class captain, then school captain. Learning to show up for people.", icon: "book" },
    { title: "Sitare University", subtitle: "Learning by building", description: "B.Tech in Computer Science. AI Club, Rhetoric Club, and Class Representative in second year.", icon: "graduation" },
    { title: "Building what’s next", subtitle: "Right now", description: "Working on Thravia, building useful tools, and taking on freelance projects.", icon: "sparkles" },
  ],
  posts: [
    { id: "sample-people", platform: "linkedin", caption: "Before the stack. Before the screens. One question: whose day are we making a little easier?", topic: "A thought on building", isDemo: true },
    { id: "sample-context", platform: "twitter", caption: "New tool. Same project.\n\nYour context should make the trip with you.", topic: "Notes from the terminal", isDemo: true },
    { id: "sample-language", platform: "linkedin", caption: "A familiar language can turn an intimidating screen into an invitation. That’s a design detail worth caring about.", topic: "Building for people", isDemo: true },
  ],
  articles: [
    { slug: "sample-before-the-code", title: "Good software starts before the first line of code", tag: "Product thinking", readingTime: 5, treatment: "blue", isDemo: true },
    { slug: "sample-carrying-context", title: "What happens to context when you switch AI tools?", tag: "Developer tools", readingTime: 4, treatment: "lilac", isDemo: true },
    { slug: "sample-building-in-hindi", title: "Making room for Hindi on the internet", tag: "Design & language", readingTime: 6, treatment: "peach", isDemo: true },
  ],
  home: {
    hero: {
      title: "I build products",
      emphasis: "people actually need.",
      description: "Hi, I’m Shivam. I turn everyday problems into thoughtful software. Currently building Thravia.",
      note: "Made for\nreal people.",
      caption: "A little curiosity goes a long way.",
    },
    work: { title: "Selected work.", description: "Different problems. The same care for the people behind them." },
    focus: { label: "On my desk right now", title: "Thravia", description: "Making hospital visits feel a little less lonely." },
    journey: { title: "A little of my story.", description: "A student, a builder. Always a beginner at something." },
    posts: { title: "From my corner of the internet.", description: "Small thoughts on the things I’m building and figuring out." },
    writing: { title: "Thinking out loud.", description: "A little more room for the ideas that stick around." },
    hire: { title: "Something on your mind?\nLet’s build it.", description: "Websites, apps, and thoughtful AI features. Tell me what you have in mind.", action: "Start a conversation" },
  },
};
