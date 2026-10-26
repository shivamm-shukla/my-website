import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getSiteContent } from "@/lib/content/repository";
import { Icon } from "@/components/ui/icon";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getSiteContent();
  return { title: "About", description: content.pages.about.introduction, alternates: { canonical: "/about" } };
}

export default async function AboutPage() {
  const content = await getSiteContent();
  return <main id="main-content" className="inner-page about-page">
    <section className="inner-hero site-container about-hero">
      <div className="about-intro"><span className="page-kicker">About {content.profile.shortName}</span><h1>{content.pages.about.title}</h1><p>{content.pages.about.introduction}</p><p>{content.pages.about.continuation}</p><div className="inner-actions"><Link href="/work" className="button">See my work<Icon name="arrow-right" size={17} /></Link><Link href="/contact" className="button button-secondary">Say hello</Link></div></div>
      <div className="portrait-placeholder">{content.profile.photoUrl ? <Image src={content.profile.photoUrl} alt={`Portrait of ${content.profile.name}`} fill sizes="(max-width: 760px) 80vw, 400px" unoptimized/> : <><span className="portrait-initials">{content.profile.initials.toUpperCase()}</span><div><strong>Photo coming soon</strong><small>TODO(owner): add {content.profile.shortName}’s portrait</small></div></>}</div>
    </section>

    <section className="journey-banner site-container" aria-label="Shivam’s journey"><Image src="/images/about-journey.png" alt="A playful landscape illustrating a journey from home to new ideas" width={3584} height={1184} sizes="(max-width: 760px) 94vw, 1100px" /></section>

    <section className="inner-section site-container"><div className="inner-section-heading"><span>How I got here</span><h2>{content.pages.about.timelineHeading}</h2></div><div className="about-timeline">{content.timeline.map((entry, index) => <article key={entry.title}><span className="timeline-count">0{index + 1}</span><div className={`journey-icon journey-icon-${index}`}><Icon name={entry.icon} size={26} /></div><div><small>{entry.subtitle}</small><h3>{entry.title}</h3><p>{entry.description}</p></div></article>)}</div></section>

    <section className="inner-section site-container"><div className="inner-section-heading"><span>What I do</span><h2>{content.pages.about.capabilitiesHeading}</h2></div><div className="about-capabilities">{content.pages.about.capabilities.map((capability) => <article key={capability.title}><Icon name={capability.icon} size={25} /><h3>{capability.title}</h3><p>{capability.description}</p></article>)}</div></section>

    <section className="recognition-section site-container">{content.pages.about.closingNote.split(" · ").filter(Boolean).map((item, index) => <div key={item}><span className="recognition-icon"><Icon name={index ? "graduation" : "check"} size={24} /></span><p>{item}</p></div>)}<div><span className="recognition-icon"><Icon name="heart" size={24}/></span><p>School captain, class captain, and Class Representative</p></div></section>
  </main>;
}
