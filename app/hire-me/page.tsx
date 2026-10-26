import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";

export const metadata: Metadata = { title: "Hire me", description: "Work with Shivam Shukla on websites, mobile apps, and thoughtful AI features.", alternates: { canonical: "/hire-me" } };

export default function HireMePage() {
  return <main id="main-content" className="inner-page hire-page">
    <section className="inner-hero site-container hire-hero"><div><span className="availability hero-availability"><span className="availability-dot" />Open for freelance projects</span><h1>Bring the problem.<br />We’ll shape the product.</h1><p>I build clear, useful digital products for people who care about the problem they are solving.</p><div className="inner-actions"><Link href="/contact" className="button">Start a conversation<Icon name="arrow-right" size={17} /></Link><Link href="/work" className="button button-secondary">See my work</Link></div></div><div className="hire-hero-art"><Image src="/images/hire-me.png" alt="The robot with symbols for apps, planning, and collaboration" fill priority sizes="(max-width: 760px) 94vw, 45vw" /></div></section>
    <section className="inner-section site-container"><div className="inner-section-heading"><span>What I build</span><h2>Small enough to stay focused. Serious enough to ship.</h2></div><div className="service-grid"><article><span className="service-number">01</span><Icon name="globe" size={26} /><h3>Websites</h3><p>Fast, responsive sites with a clear message and a polished experience.</p></article><article><span className="service-number">02</span><Icon name="folder" size={26} /><h3>Mobile apps</h3><p>Focused app experiences built around a real task and a real audience.</p></article><article><span className="service-number">03</span><Icon name="code" size={26} /><h3>AI features</h3><p>Useful AI inside a product, with clear limits and a reason to exist.</p></article></div></section>
    <section className="process-section"><div className="site-container"><div className="inner-section-heading"><span>How we work</span><h2>Talk. Build. Ship.</h2></div><ol><li><strong>Talk</strong><p>We clarify the problem, the people, and what a useful first release looks like.</p></li><li><strong>Build</strong><p>You see the work as it takes shape. Feedback stays concrete and frequent.</p></li><li><strong>Ship</strong><p>We finish the details, test the experience, and put it in people’s hands.</p></li></ol></div></section>
    <section className="page-cta site-container"><span>Have something in mind?</span><h2>Tell me the messy version.</h2><p>It does not need to be a perfect brief. A problem and a little context are enough to begin.</p><Link href="/contact" className="button button-on-blue">Start with hello<Icon name="arrow-up-right" size={18} /></Link></section>
  </main>;
}
