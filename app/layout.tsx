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

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: [{ media: "(prefers-color-scheme: light)", color: "#e9eeff" }, { media: "(prefers-color-scheme: dark)", color: "#080819" }] };
const blockIndexing = isPreview;

export async function generateMetadata(): Promise<Metadata> {
  const content = await getSiteContent();
  const title = `${content.profile.name} — ${content.home.hero.title} ${content.home.hero.emphasis}`;
  const description = content.home.hero.description || content.profile.description;
  const image = `/api/og?title=${encodeURIComponent(`${content.home.hero.title} ${content.home.hero.emphasis}`)}`;
  return {
    metadataBase: new URL(siteUrl),
    title: { default: title, template: `%s — ${content.profile.name}` },
    description,
    alternates: { canonical: "/" },
    robots: blockIndexing ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: { type: "website", siteName: content.profile.name, locale: "en_IN", title, description, url: siteUrl, images: [{ url: image, width: 1200, height: 630, alt: title }] },
    twitter: { card: "summary_large_image", images: [image] },
    manifest: "/manifest.webmanifest",
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const content = await getSiteContent();
  const structuredData = [
    { "@context": "https://schema.org", "@type": "WebSite", name: content.profile.name, url: `${siteUrl}/` },
    { "@context": "https://schema.org", "@type": "Person", name: content.profile.name, url: siteUrl, image: `${siteUrl}/icon.png`, description: content.profile.description, alumniOf: [{ "@type": "CollegeOrUniversity", name: "Sitare University" }, { "@type": "EducationalOrganization", name: "Jawahar Navodaya Vidyalaya" }], knowsAbout: ["Product development", "Web development", "Mobile applications", "Artificial intelligence"] },
  ];
  return <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth"><head><script dangerouslySetInnerHTML={{ __html: themeInitialiser }} /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} /></head><body id="top"><ThemeProvider><a href="#main-content" className="skip-link">Skip to content</a><SiteHeader name={content.profile.name} navigation={content.navigation} allPages={content.footerNavigation} />{children}<SiteFooter content={content} /><ClientEnhancements assistantEnabled={content.assistantEnabled} shareTemplate={content.shareTemplate}/></ThemeProvider></body></html>;
}
