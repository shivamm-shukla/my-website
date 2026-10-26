import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSiteContent, isPreview, siteUrl } from "@/lib/content/repository";
import { Icon } from "@/components/ui/icon";
import { ProjectArt } from "@/components/sections/project-art";
import { ShareButton, SharePreviewCard } from "@/components/sections/share-designer";
import { EditorialPromotions, ThoughtCard } from "@/components/sections/editorial-promotions";
import { BlogSubscribeCard } from "@/components/sections/blog-interactions";

export async function generateStaticParams() { return (await getSiteContent()).projects.map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> { const { slug } = await params; const project = (await getSiteContent()).projects.find((item) => item.slug === slug); if (!project) return {}; return { title: project.title, description: project.summary, alternates: { canonical: `/work/${slug}` }, openGraph: { title: project.title, description: project.summary, images: [`/api/og?title=${encodeURIComponent(project.title)}`] }, twitter: { card: "summary_large_image", images: [`/api/og?title=${encodeURIComponent(project.title)}`] } }; }

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const content = await getSiteContent();
  const projects = content.projects;
  const project = projects.find((item) => item.slug === slug);
  if (!project) notFound();
  const moreProjects = projects.filter((item) => item.slug !== slug);
  const cover = project.coverUrl;
  const links = [
    ...(project.externalUrl ? [{ label: project.externalLabel || "Live site", url: project.externalUrl }] : []),
    ...(project.sourceUrl ? [{ label: "Source code", url: project.sourceUrl }] : []),
    ...project.extraLinks,
  ];
  const featureContent = project.features.map((item) => { const [title, ...body] = item.split("::"); return { title: title.trim(), body: body.join("::").trim() }; });
  const processContent = project.processSteps.map((item) => { const [title, ...body] = item.split("::"); return { title: title.trim(), body: body.join("::").trim() }; });
  return <main id="main-content" className={`inner-page case-page case-${project.treatment}`}>
    <article className="project-story site-container">
      <Link href="/work" className="back-link"><Icon name="arrow-left" size={16}/>Work</Link>
      <header className="project-story-header"><span className="project-category">{project.status || project.category}</span><h1>{project.title}</h1><p>{project.headline.replace("\n", " ")}</p><div className="case-actions">{links.slice(0, 2).map((link) => <a key={link.url} className="button button-secondary" href={link.url} target="_blank" rel="noopener noreferrer">{link.label}<Icon name="arrow-up-right" size={16}/></a>)}<ShareButton item={{ kind: "project", title: project.title, description: project.summary, category: project.category, meta: `A project by ${content.profile.name}`, cta: "Explore the project", path: `/work/${project.slug}`, url: `${siteUrl}/work/${project.slug}` }}/></div></header>
      <div className="case-cover">{cover ? <Image src={cover} alt={`${project.title} project cover`} fill priority sizes="(max-width: 760px) 94vw, 820px" unoptimized/> : <ProjectArt treatment={project.treatment}/>}</div>
      <section className="case-facts" aria-label="Project facts"><div><strong>{project.category}</strong><span>Type</span></div><div><strong>{project.status || ""}</strong><span>Status</span></div>{project.tech.length > 0 && <div><strong>{project.tech.join(", ")}</strong><span>Built with</span></div>}</section>
      <div className="project-copy-body"><section><h2>Overview</h2><p>{project.summary}</p>{project.built && <p>{project.built}</p>}</section>{project.problem && <section><h2>The problem</h2>{isPreview && <small className="draft-copy-note">Draft wording · needs owner review</small>}<p>{project.problem}</p></section>}</div>
      {featureContent.length > 0 && <section className="project-detail-section"><h2>{project.featuresHeading || "What it does"}</h2><div className="project-feature-grid">{featureContent.map((feature, index) => <article key={`${index}-${feature.title}`}><h3>{feature.title}</h3>{feature.body && <p>{feature.body}</p>}</article>)}</div></section>}
      {processContent.length > 0 && <section className="project-detail-section"><h2>How to use it</h2><ol className="project-step-list">{processContent.map((step, index) => <li key={`${index}-${step.title}`}><b>{index + 1}</b><div><h3>{step.title}</h3>{step.body && <p>{step.body}</p>}</div></li>)}</ol></section>}
      {project.outcome && <section className="project-detail-section"><h2>Where it stands</h2><p>{project.outcome}</p></section>}
      {links.length > 0 && <section className="project-detail-section"><h2>Links</h2><div className="project-link-list">{links.map((link) => <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer">{link.label}<Icon name="arrow-up-right" size={16}/></a>)}</div></section>}
      <SharePreviewCard template={content.shareTemplate} item={{ kind: "project", title: project.title, description: project.summary, category: project.category, meta: `A project by ${content.profile.name}`, cta: "Explore the project", path: `/work/${project.slug}`, url: `${siteUrl}/work/${project.slug}` }}/>
    </article>
    <EditorialPromotions settings={content.promotions} context="project"/>
    {(content.promotions.newsletter.enabled || content.promotions.thought.enabled) && <section className="site-container project-reader-promos">
      {content.promotions.newsletter.enabled && <BlogSubscribeCard settings={content.promotions.newsletter} />}
      {content.promotions.thought.enabled && <ThoughtCard thought={content.promotions.thought}/>}
    </section>}
    {moreProjects.length > 0 && <section className="site-container more-projects"><h2>More projects</h2><div>{moreProjects.map((item) => <Link key={item.slug} href={`/work/${item.slug}`}><span>{item.category}</span><strong>{item.title}</strong><p>{item.summary}</p><Icon name="arrow-up-right" size={18}/></Link>)}</div></section>}
  </main>;
}
