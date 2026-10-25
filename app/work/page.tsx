import type { Metadata } from "next";
import { getSiteContent } from "@/lib/content/repository";
import { WorkBrowser } from "@/components/sections/work-browser";

export const metadata: Metadata = { title: "Work", description: "Products built by Shivam Shukla for families, developers, and students.", alternates: { canonical: "/work" } };

export default async function WorkPage() {
  const content = await getSiteContent();
  return <main id="main-content" className="inner-page work-page"><section className="inner-hero site-container compact-inner-hero"><span className="page-kicker">Selected work</span><h1>Useful beats impressive.</h1><p>Three different problems. One rule: understand the person on the other side of the screen.</p></section><section className="site-container work-browser"><WorkBrowser projects={content.projects} /></section></main>;
}
