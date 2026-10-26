import type { Metadata } from "next";
import { getPublishedBlogs } from "@/lib/content/repository";
import { BlogBrowser, BlogSubscribeCard } from "@/components/sections/blog-interactions";

export const metadata: Metadata = { title: "Blog", description: "Longer thoughts from Shivam Shukla on products, developer tools, design, and language.", alternates: { canonical: "/blog", types: { "application/rss+xml": "/rss.xml" } } };

export default async function BlogPage() {
  const articles = await getPublishedBlogs();
  return <main id="main-content" className="inner-page blog-page"><section className="inner-hero site-container blog-hero"><div><span className="page-kicker">Blog</span><h1>Thinking out loud.</h1><p>Longer notes on building useful things, the details behind them, and what I learn along the way.</p></div></section><BlogBrowser articles={articles}/><BlogSubscribeCard/></main>;
}
