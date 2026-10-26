import type { Metadata } from "next";
import { getSiteContent } from "@/lib/content/repository";
import { WorkBrowser } from "@/components/sections/work-browser";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getSiteContent();
  return { title: content.home.work.archiveTitle, description: content.home.work.archiveDescription, alternates: { canonical: "/work" } };
}

export default async function WorkPage() {
  const content = await getSiteContent();
  return <main id="main-content" className="inner-page work-page"><section className="inner-hero site-container compact-inner-hero"><span className="page-kicker">{content.home.work.title}</span><h1>{content.home.work.archiveTitle}</h1><p>{content.home.work.archiveDescription}</p></section><section className="site-container work-browser"><WorkBrowser projects={content.projects} /></section></main>;
}
