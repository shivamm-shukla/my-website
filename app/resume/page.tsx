import type { Metadata } from "next";
import { existsSync } from "node:fs";
import path from "node:path";
import Link from "next/link";
import { getSiteContent } from "@/lib/content/repository";
import { Icon } from "@/components/ui/icon";

export const metadata: Metadata = { title: "Resume", description: "Shivam Shukla’s education, projects, leadership, and scholarships.", alternates: { canonical: "/resume" } };

export default async function ResumePage() {
  const content = await getSiteContent();
  const hasPdf = existsSync(path.join(process.cwd(), "public", "shivam-shukla-resume.pdf"));
  return <main id="main-content" className="inner-page resume-page"><div className="resume-toolbar site-container"><Link href="/" className="back-link"><Icon name="arrow-left" size={16} />Home</Link><div>{hasPdf ? <a className="button button-small" href="/shivam-shukla-resume.pdf" download>Download PDF<Icon name="arrow-up-right" size={15} /></a> : <span className="resume-pdf-note">TODO(owner): upload resume PDF</span>}</div></div><article className="resume-sheet site-container"><header><div><h1>{content.profile.name}</h1><p>Computer Science student and product builder</p></div><div className="resume-contact"><span>Lucknow, India</span><span>shivamshukla.site</span><span>Contact details: TODO(owner)</span></div></header><section><h2>Profile</h2><p>Third-year B.Tech Computer Science student at Sitare University, graduating May 2028. Builds products for real people, currently building Thravia, and is open to freelance projects.</p></section><section><h2>Selected projects</h2><div className="resume-items">{content.projects.map((project) => <article key={project.id}><div><h3>{project.title}</h3><span>{project.status}</span></div><p>{project.summary}</p></article>)}</div></section><section><h2>Education</h2><div className="resume-items"><article><div><h3>Sitare University</h3><span>Graduating May 2028</span></div><p>B.Tech in Computer Science. Member of the AI Club and Rhetoric Club. Class Representative in second year.</p></article><article><div><h3>Jawahar Navodaya Vidyalaya</h3><span>Alumnus</span></div><p>Class captain from class 7 to 11 and school captain in class 11.</p></article></div></section><section className="resume-two-column"><div><h2>Scholarships</h2><ul><li>Reliance Foundation Scholar</li><li>Sitare Foundation scholarship recipient</li></ul></div><div><h2>Skills</h2><p className="todo-copy">TODO(owner): confirm technical skills before publication.</p></div></section></article></main>;
}
