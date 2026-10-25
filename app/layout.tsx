import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { ClientEnhancements } from "@/components/client-enhancements";
import { getSiteContent, isPreview, siteUrl } from "@/lib/content/repository";
import { themeInitialiser } from "@/lib/theme";
import "./globals.css";
import "./design.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "Shivam Shukla — Products for real people", template: "%s — Shivam Shukla" },
  description: "Shivam Shukla is a computer science student at Sitare University, building Thravia and useful products for real people. Open for freelance projects.",
  alternates: { canonical: "/" },
  robots: isPreview ? { index: false, follow: false } : { index: true, follow: true },
  openGraph: { type: "website", siteName: "Shivam Shukla", locale: "en_IN", title: "Shivam Shukla — Products for real people", description: "A student. A builder. Products for real people.", url: siteUrl },
  twitter: { card: "summary_large_image" },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const content = await getSiteContent();
  return <html lang="en" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{ __html: themeInitialiser }} /></head><body id="top"><ThemeProvider><a href="#main-content" className="skip-link">Skip to content</a><SiteHeader name={content.profile.name} navigation={content.navigation} allPages={content.footerNavigation} />{children}<SiteFooter content={content} preview={isPreview} /><ClientEnhancements /></ThemeProvider></body></html>;
}
