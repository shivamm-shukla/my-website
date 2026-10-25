import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getSiteContent, isPreview } from "@/lib/content/repository";
import { Icon } from "@/components/ui/icon";

const pages: Record<string, { title: string; description: string }> = {
  posts: { title: "Notes from the internet.", description: "A home for thoughts, updates, and ideas. Real social posts will be managed through the owner’s studio." },
  blog: { title: "Thinking out loud.", description: "Longer thoughts on building useful things. The full writing experience comes with the content studio." },
  admin: { title: "Your personal studio.", description: "The private workspace for pages, projects, writing, media, and everything that makes this website yours. Owner authentication and editing are planned for the CMS phase." },
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string[] }> }): Promise<Metadata> {
  const { slug } = await params;
  return { title: pages[slug.join("/")]?.title || "Content preview", robots: { index: false, follow: false }, alternates: { canonical: `/${slug.join("/")}` } };
}

export default async function PreviewPage({ params }: { params: Promise<{ slug: string[] }> }) {
  if (!isPreview) notFound();
  const { slug } = await params;
  const path = slug.join("/");
  const content = await getSiteContent();
  const project = slug[0] === "work" ? content.projects.find((item) => item.slug === slug[1]) : undefined;
  const article = slug[0] === "blog" ? content.articles.find((item) => item.slug === slug[1]) : undefined;
  const page = pages[path] || (project ? { title: project.title, description: project.summary } : article ? { title: article.title, description: "This is a sample article title for reviewing the design. It is not a published article by Shivam." } : undefined);
  if (!page || slug.length > 2) notFound();
  return <main id="main-content" className="site-container preview-page"><span className="preview-label">Phase 1 preview</span><h1>{page.title}</h1><p>{page.description}</p>{project && <div className="preview-window"><h2>{project.headline.replace("\n", " ")}</h2><p>The full case study will use Shivam’s real screenshots, technology choices, and outcomes. Those details haven’t been added yet.</p>{project.externalUrl && <a href={project.externalUrl} target="_blank" rel="noopener noreferrer" className="text-link">{project.externalLabel}<Icon name="arrow-up-right" size={17} /></a>}</div>}{!project && !article && <div className="preview-window"><h2>Home is ready for its first look.</h2><p>This route is reserved for the next build phase. Nothing here pretends to submit a form, sign you in, or publish content.</p></div>}<Link href="/" className="button button-secondary"><Icon name="arrow-left" size={16} />Back to Home</Link></main>;
}
