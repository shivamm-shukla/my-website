import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedBlogs } from "@/lib/content/repository";
import { BlogCard } from "@/components/sections/blog-card";

export const metadata: Metadata = { title: "Blog", description: "Longer thoughts from Shivam Shukla on products, developer tools, design, and language.", alternates: { canonical: "/blog", types: { "application/rss+xml": "/rss.xml" } } };

export default async function BlogPage() {
  const articles = await getPublishedBlogs();
  return <main id="main-content" className="inner-page blog-page"><section className="inner-hero site-container blog-hero"><div><span className="page-kicker">Blog</span><h1>Thinking out loud.</h1><p>Longer notes on building useful things, the details behind them, and what I learn along the way.</p></div></section><section className="site-container blog-list">{articles.length ? articles.map((article) => <BlogCard key={article.slug} article={article} />) : <div className="public-empty"><h2>Nothing published yet.</h2><p>New writing will appear here when it is ready.</p><Link href="/posts" className="button button-secondary">Read short posts</Link></div>}</section></main>;
}
