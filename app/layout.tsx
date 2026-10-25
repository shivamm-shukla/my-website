import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { ClientEnhancements } from "@/components/client-enhancements";
import { getSiteContent, isPreview, siteUrl } from "@/lib/content/repository";
import { themeInitialiser } from "@/lib/theme";
import "./tokens.css";
import "./globals.css";
import "./design.css";
import "./project-art.css";
import "./interactions.css";
import "./core-pages.css";
import "./content-pages.css";
import "./admin.css";

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover" };
const blockIndexing = process.env.VERCEL_ENV === "preview" || process.env.NEXT_PUBLIC_SITE_MODE === "preview";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "Shivam Shukla — Products for real people", template: "%s — Shivam Shukla" },
  description: "Shivam Shukla is a computer science student at Sitare University, building Thravia and useful products for real people. Open for freelance projects.",
  alternates: { canonical: "/" },
  robots: blockIndexing ? { index: false, follow: false } : { index: true, follow: true },
  openGraph: { type: "website", siteName: "Shivam Shukla", locale: "en_IN", title: "Shivam Shukla — Products for real people", description: "A student. A builder. Products for real people.", url: siteUrl, images: [{ url: "/api/og?title=Products%20for%20real%20people.", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", images: ["/api/og?title=Products%20for%20real%20people."] },
  manifest: "/manifest.webmanifest",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const content = await getSiteContent();
  const person = { "@context": "https://schema.org", "@type": "Person", name: content.profile.name, url: siteUrl, description: content.profile.description, alumniOf: [{ "@type": "CollegeOrUniversity", name: "Sitare University" }, { "@type": "EducationalOrganization", name: "Jawahar Navodaya Vidyalaya" }], knowsAbout: ["Product development", "Web development", "Mobile applications", "Artificial intelligence"] };
  return <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth"><head><script dangerouslySetInnerHTML={{ __html: themeInitialiser }} /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(person).replace(/</g, "\\u003c") }} /></head><body id="top"><ThemeProvider><a href="#main-content" className="skip-link">Skip to content</a><SiteHeader name={content.profile.name} navigation={content.navigation} allPages={content.footerNavigation} />{children}<SiteFooter content={content} preview={isPreview} /><ClientEnhancements /></ThemeProvider></body></html>;
}
