import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSiteContent } from "@/lib/content/repository";
import { Icon } from "@/components/ui/icon";
import { ProjectArt } from "@/components/sections/project-art";

const covers: Record<string, string | undefined> = { thravia: "/images/thravia.png", "brg-cli": "/images/brg-cli.png" };

export async function generateStaticParams() { return (await getSiteContent()).projects.map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> { const { slug } = await params; const project = (await getSiteContent()).projects.find((item) => item.slug === slug); if (!project) return {}; return { title: project.title, description: project.summary, alternates: { canonical: `/work/${slug}` } }; }

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const projects = (await getSiteContent()).projects;
  const project = projects.find((item) => item.slug === slug);
  if (!project) notFound();
  const next = projects[(projects.indexOf(project) + 1) % projects.length];
  const cover = covers[project.slug];
  return <main id="main-content" className={`inner-page case-page case-${project.treatment}`}>
    <section className="case-hero site-container"><Link href="/work" className="back-link"><Icon name="arrow-left" size={16} />All work</Link><div className="case-title"><div><span className="page-kicker">{project.category}</span><h1>{project.title}</h1><p>{project.headline.replace("\n", " ")}</p></div><span className="case-status">{project.status}</span></div><div className="case-cover">{cover ? <Image src={cover} alt={`${project.title} project illustration`} fill priority sizes="(max-width: 760px) 94vw, 1100px" /> : <ProjectArt treatment={project.treatment} />}</div></section>
    <section className="case-body site-container"><aside><span>Project note</span><p>Verified public facts only. Screenshots, role, technology, and measured results are waiting for Shivam’s confirmation.</p>{project.externalUrl && <a href={project.externalUrl} target="_blank" rel="noopener noreferrer" className="text-link">{project.externalLabel}<Icon name="arrow-up-right" size={17} /></a>}</aside><div className="case-story"><article><span>01</span><h2>The problem</h2><p>{project.problem}</p></article><article><span>02</span><h2>What I built</h2><p>{project.built}</p></article><article><span>03</span><h2>Where it stands</h2><p>{project.outcome}</p></article><article className="case-tech"><span>04</span><h2>Technology</h2><p className="todo-copy">TODO(owner): confirm the technology stack and Shivam’s role before publishing these details.</p></article></div></section>
    <section className="next-project site-container"><span>Next project</span><Link href={`/work/${next.slug}`}><strong>{next.title}</strong><span>{next.summary}</span><Icon name="arrow-up-right" size={25} /></Link></section>
  </main>;
}
