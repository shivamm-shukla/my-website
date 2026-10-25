import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getSiteContent } from "@/lib/content/repository";
import { Icon } from "@/components/ui/icon";

export const metadata: Metadata = { title: "About", description: "Shivam Shukla’s story: from Jawahar Navodaya Vidyalaya to Sitare University, Thravia, and products for real people.", alternates: { canonical: "/about" } };

export default async function AboutPage() {
  const content = await getSiteContent();
  return <main id="main-content" className="inner-page about-page">
    <section className="inner-hero site-container about-hero">
      <div className="about-intro"><span className="page-kicker">About Shivam</span><h1>A student who learns by building.</h1><p>I’m Shivam Shukla, a third-year Computer Science student at Sitare University in Lucknow. I like finding everyday problems and turning them into software that feels useful, clear, and human.</p><p>Right now, I’m building Thravia and taking on freelance work. I’m still early in the journey, which means there is always something new to understand and something worth shipping.</p><div className="inner-actions"><Link href="/work" className="button">See my work<Icon name="arrow-right" size={17} /></Link><Link href="/contact" className="button button-secondary">Say hello</Link></div></div>
      <div className="portrait-placeholder"><span className="portrait-initials">SS</span><div><strong>Photo coming soon</strong><small>TODO(owner): add Shivam’s portrait</small></div></div>
    </section>

    <section className="journey-banner site-container" aria-label="Shivam’s journey"><Image src="/images/about-journey.png" alt="A playful landscape illustrating a journey from home to new ideas" width={3584} height={1184} sizes="(max-width: 760px) 94vw, 1100px" /></section>

    <section className="inner-section site-container"><div className="inner-section-heading"><span>How I got here</span><h2>Leadership came first. Building followed.</h2></div><div className="about-timeline">{content.timeline.map((entry, index) => <article key={entry.title}><span className="timeline-count">0{index + 1}</span><div className={`journey-icon journey-icon-${index}`}><Icon name={entry.icon} size={26} /></div><div><small>{entry.subtitle}</small><h3>{entry.title}</h3><p>{entry.description}</p></div></article>)}</div></section>

    <section className="inner-section site-container"><div className="inner-section-heading"><span>What I do</span><h2>From rough idea to something people can use.</h2></div><div className="about-capabilities"><article><Icon name="globe" size={25} /><h3>Product thinking</h3><p>Start with the person, the problem, and the smallest useful version.</p></article><article><Icon name="code" size={25} /><h3>Build and ship</h3><p>Turn the idea into a thoughtful website, app, or useful AI feature.</p></article><article><Icon name="message" size={25} /><h3>Clear communication</h3><p>Keep the work understandable, collaborative, and moving forward.</p></article></div></section>

    <section className="recognition-section site-container"><div><span className="recognition-icon"><Icon name="sparkles" size={24} /></span><p>Reliance Foundation Scholar</p></div><div><span className="recognition-icon"><Icon name="graduation" size={24} /></span><p>Sitare Foundation scholarship recipient</p></div><div><span className="recognition-icon"><Icon name="heart" size={24} /></span><p>School captain, class captain, and Class Representative</p></div></section>
  </main>;
}
