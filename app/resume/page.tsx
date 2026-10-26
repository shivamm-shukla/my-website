import type { Metadata } from "next";
import { existsSync } from "node:fs";
import path from "node:path";
import Link from "next/link";
import { getSiteContent } from "@/lib/content/repository";
import { Icon } from "@/components/ui/icon";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getSiteContent();
  return { title: "Resume", description: content.pages.resume.summary, alternates: { canonical: "/resume" } };
}

export default async function ResumePage() {
  const content = await getSiteContent();
  const hasPdf = existsSync(path.join(process.cwd(), "public", "shivam-shukla-resume.pdf"));
  return <main id="main-content" className="inner-page resume-page">
    <div className="resume-toolbar site-container"><Link href="/" className="back-link"><Icon name="arrow-left" size={16}/>Home</Link><div>{hasPdf ? <a className="button button-small" href="/shivam-shukla-resume.pdf" download>Download PDF<Icon name="arrow-up-right" size={15}/></a> : <span className="resume-pdf-note">TODO(owner): upload resume PDF</span>}</div></div>
    <article className="resume-sheet site-container">
      <header><div><h1>{content.profile.name}</h1><p>{content.pages.resume.role}</p></div><div className="resume-contact"><span>{content.pages.resume.location}</span><span>shivamshukla.site</span><span>Contact details: TODO(owner)</span></div></header>
      <section><h2>Profile</h2><p>{content.pages.resume.summary}</p></section>
      <section><h2>Selected projects</h2><div className="resume-items">{content.projects.map((project) => <article key={project.id}><div><h3>{project.title}</h3><span>{project.status}</span></div><p>{project.summary}</p></article>)}</div></section>
      <section><h2>Education</h2><div className="resume-items">{content.pages.resume.education.map((item) => <article key={item.title}><div><h3>{item.title}</h3><span>{item.subtitle}</span></div><p>{item.description}</p></article>)}</div></section>
      <section className="resume-two-column"><div><h2>Scholarships</h2><ul>{content.pages.resume.scholarships.map((item) => <li key={item}>{item}</li>)}</ul></div>{content.pages.resume.skills.length > 0 && <div><h2>Skills</h2><ul>{content.pages.resume.skills.map((item) => <li key={item}>{item}</li>)}</ul></div>}</section>
    </article>
  </main>;
}
