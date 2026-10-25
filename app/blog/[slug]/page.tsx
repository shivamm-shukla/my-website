import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublishedBlog, getPublishedBlogs, siteUrl } from "@/lib/content/repository";
import { renderMarkdown } from "@/lib/markdown";
import { EditorialArt } from "@/components/sections/editorial-art";
import { Icon } from "@/components/ui/icon";

export async function generateStaticParams() { return (await getPublishedBlogs()).map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> { const article = await getPublishedBlog((await params).slug); if (!article) return {}; const image = article.coverUrl || `/api/og?title=${encodeURIComponent(article.title)}`; return { title: article.title, description: article.excerpt, alternates: { canonical: `/blog/${article.slug}` }, openGraph: { type: "article", title: article.title, description: article.excerpt, publishedTime: article.publishedAt, tags: article.tags, images: [image] }, twitter: { card: "summary_large_image", images: [image] } }; }

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const article = await getPublishedBlog((await params).slug);
  if (!article) notFound();
  const { html, headings } = renderMarkdown(article.contentMd || "");
  const date = article.publishedAt ? new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long", year: "numeric" }).format(new Date(article.publishedAt)) : article.isDemo ? "Sample article" : "";
  const jsonLd = { "@context": "https://schema.org", "@type": "Article", headline: article.title, description: article.excerpt, datePublished: article.publishedAt, author: { "@type": "Person", name: "Shivam Shukla", url: siteUrl }, mainEntityOfPage: `${siteUrl}/blog/${article.slug}` };
  return <main id="main-content" className="inner-page article-page"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} /><header className="article-header site-container"><Link href="/blog" className="back-link"><Icon name="arrow-left" size={16} />Back to blog</Link><div className="article-header-copy"><div className="blog-card-meta"><span>{article.tags?.[0] || article.tag || "Journal"}</span><span>{article.readingTime} min read</span></div><h1>{article.title}</h1>{article.excerpt && <p>{article.excerpt}</p>}<span className="article-date">{date}</span>{article.isDemo && <span className="sample-label">Sample article for design review</span>}</div><div className="article-cover">{article.coverUrl ? <Image src={article.coverUrl} alt="" fill priority unoptimized sizes="(max-width: 760px) 94vw, 1100px" /> : <EditorialArt treatment={article.treatment || "blue"} />}</div></header><div className="article-layout site-container">{headings.length >= 3 && <aside className="article-toc"><strong>On this page</strong>{headings.map((heading) => <a key={heading.id} href={`#${heading.id}`} className={heading.level === 3 ? "toc-sub" : ""}>{heading.text}</a>)}</aside>}<article className="prose" dangerouslySetInnerHTML={{ __html: html }} /><aside className="article-share"><strong>Share</strong><a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`${siteUrl}/blog/${article.slug}`)}`} target="_blank" rel="noopener noreferrer">LinkedIn</a><a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(`${siteUrl}/blog/${article.slug}`)}&text=${encodeURIComponent(article.title)}`} target="_blank" rel="noopener noreferrer">X / Twitter</a></aside></div></main>;
}
