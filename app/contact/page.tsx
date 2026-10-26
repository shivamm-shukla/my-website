import type { Metadata } from "next";
import { ContactForm } from "@/components/contact-form";
import { SocialLinks } from "@/components/ui/social-links";
import { getSiteContent } from "@/lib/content/repository";

export const metadata: Metadata = { title: "Contact", description: "Start a conversation with Shivam Shukla about a project, product, or idea.", alternates: { canonical: "/contact" } };

export default async function ContactPage() {
  const content = await getSiteContent();
  const availableSocials = content.socials.filter((social) => social.url);
  return <main id="main-content" className="inner-page contact-page"><section className="inner-hero site-container contact-hero"><div><span className="page-kicker">Contact</span><h1>It starts with a hello.</h1><p>Have a project, a stubborn problem, or an idea you want to make real? Send the rough version. We can make it clearer together.</p></div>{availableSocials.length > 0 && <aside><strong>Elsewhere</strong><SocialLinks links={availableSocials} /></aside>}</section><section className="site-container contact-form-section"><div className="inner-section-heading"><span>Send a note</span><h2>What are you thinking about?</h2></div><ContactForm /></section></main>;
}
