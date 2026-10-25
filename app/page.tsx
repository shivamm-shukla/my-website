import { getSiteContent } from "@/lib/content/repository";
import { HeroSection, WorkSection, FocusSection, JourneySection, PostsSection, WritingSection, HireSection } from "@/components/sections/home-sections";
import type { HomeSectionType, SiteContent } from "@/lib/content/types";

const sectionRenderers: Record<HomeSectionType, React.ComponentType<{ content: SiteContent }>> = {
  hero: HeroSection, work: WorkSection, focus: FocusSection, journey: JourneySection,
  posts: PostsSection, writing: WritingSection, hire: HireSection,
};

export default async function HomePage() {
  const content = await getSiteContent();
  return <main id="main-content">{content.sections.filter((section) => section.visible).map((section) => {
    const Section = sectionRenderers[section.type];
    return <Section key={section.id} content={content} />;
  })}</main>;
}
