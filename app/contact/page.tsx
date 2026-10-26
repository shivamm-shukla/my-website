import type { Metadata } from "next";
import { ContactForm } from "@/components/contact-form";
import { SocialLinks } from "@/components/ui/social-links";
import { getSiteContent } from "@/lib/content/repository";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getSiteContent();
  return { title: "Contact", description: content.pages.contact.introduction, alternates: { canonical: "/contact" } };
}

export default async function ContactPage() {
  const content = await getSiteContent();
  const availableSocials = content.socials.filter((social) => social.url);
  return <main id="main-content" className="inner-page contact-page"><section className="inner-hero site-container contact-hero"><div><span className="page-kicker">Contact</span><h1>{content.pages.contact.title}</h1><p>{content.pages.contact.introduction}</p></div>{availableSocials.length > 0 && <aside><strong>Elsewhere</strong><SocialLinks links={availableSocials} /></aside>}</section><section className="site-container contact-form-section"><div className="inner-section-heading"><span>Send a note</span><h2>{content.pages.contact.formHeading}</h2><p>{content.pages.contact.formDescription}</p></div><ContactForm /></section></main>;
}
