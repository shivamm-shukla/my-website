import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { getSiteContent } from "@/lib/content/repository";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getSiteContent();
  return { title: "Hire me", description: content.pages.hire.introduction, alternates: { canonical: "/hire-me" } };
}

export default async function HireMePage() {
  const content = await getSiteContent();
  return <main id="main-content" className="inner-page hire-page">
    <section className="inner-hero site-container hire-hero"><div><span className="availability hero-availability"><span className="availability-dot" />{content.profile.availability}</span><h1>{content.pages.hire.title}</h1><p>{content.pages.hire.introduction}</p><div className="inner-actions"><Link href="/contact" className="button">Start a conversation<Icon name="arrow-right" size={17} /></Link><Link href="/work" className="button button-secondary">See my work</Link></div></div><div className="hire-hero-art"><Image src="/images/hire-me.png" alt="The robot with symbols for apps, planning, and collaboration" fill priority sizes="(max-width: 760px) 94vw, 45vw" /></div></section>
    <section className="inner-section site-container"><div className="inner-section-heading"><span>What I build</span><h2>{content.pages.hire.servicesHeading}</h2><p>{content.pages.hire.servicesDescription}</p></div><div className="service-grid">{content.pages.hire.services.map((service, index) => <article key={service.title}><span className="service-number">{String(index + 1).padStart(2, "0")}</span><Icon name={service.icon} size={26} /><h3>{service.title}</h3><p>{service.description}</p></article>)}</div></section>
    <section className="process-section"><div className="site-container"><div className="inner-section-heading"><span>How we work</span><h2>{content.pages.hire.processHeading}</h2></div><ol>{content.pages.hire.process.map((step) => <li key={step.title}><strong>{step.title}</strong><p>{step.description}</p></li>)}</ol></div></section>
    <section className="page-cta site-container"><span>Have something in mind?</span><h2>{content.pages.hire.closingTitle}</h2><p>{content.pages.hire.closingDescription}</p><Link href="/contact" className="button button-on-blue">Start with hello<Icon name="arrow-up-right" size={18} /></Link></section>
  </main>;
}
