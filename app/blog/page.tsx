import type { Metadata } from "next";
import { getPublishedBlogs, getSiteContent } from "@/lib/content/repository";
import { BlogBrowser, BlogSubscribeCard } from "@/components/sections/blog-interactions";
import { EditorialPromotions, ThoughtCard } from "@/components/sections/editorial-promotions";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getSiteContent();
  return { title: content.home.writing.title, description: content.home.writing.description, alternates: { canonical: "/blog", types: { "application/rss+xml": "/rss.xml" } } };
}

export default async function BlogPage() {
  const [articles, content] = await Promise.all([getPublishedBlogs(), getSiteContent()]);
  return <main id="main-content" className="inner-page blog-page">
    <section className="inner-hero site-container blog-hero"><div><span className="page-kicker">Writing</span><h1>{content.home.writing.title}</h1><p>{content.home.writing.description}</p></div></section>
    <BlogBrowser articles={articles}/>
    {(content.promotions.newsletter.enabled || content.promotions.thought.enabled) && <section className="site-container blog-promo-pair">
      {content.promotions.newsletter.enabled && <BlogSubscribeCard settings={content.promotions.newsletter} />}
      {content.promotions.thought.enabled && <ThoughtCard thought={content.promotions.thought}/>}
    </section>}
    <EditorialPromotions settings={content.promotions} context="blog"/>
  </main>;
}
