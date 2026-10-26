import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getApprovedBlogComments, getPublishedBlog, getPublishedBlogs, siteUrl } from "@/lib/content/repository";
import { renderMarkdown } from "@/lib/markdown";
import { EditorialArt } from "@/components/sections/editorial-art";
import { ArticleAudience, ArticleBody, ArticleProgress, ArticleToolbar } from "@/components/sections/blog-interactions";
import { Icon } from "@/components/ui/icon";
import { SharePreviewCard } from "@/components/sections/share-designer";

export async function generateStaticParams() { return (await getPublishedBlogs()).map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const article = await getPublishedBlog((await params).slug);
  if (!article) return {};
  const image = article.coverUrl || `/api/og?title=${encodeURIComponent(article.title)}`;
  return { title: article.title, description: article.excerpt, alternates: { canonical: `/blog/${article.slug}` }, openGraph: { type: "article", title: article.title, description: article.excerpt, publishedTime: article.publishedAt, tags: article.tags, images: [{ url: image, width: 1200, height: 630, alt: article.title }] }, twitter: { card: "summary_large_image", images: [image] } };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [article, articles] = await Promise.all([getPublishedBlog(slug), getPublishedBlogs()]);
  if (!article) notFound();
  const [{ html, headings }, comments] = await Promise.all([Promise.resolve(renderMarkdown(article.contentMd || "")), getApprovedBlogComments(slug)]);
  const date = article.publishedAt ? new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long", year: "numeric" }).format(new Date(article.publishedAt)) : article.isDemo ? "Sample article" : "";
  const jsonLd = { "@context": "https://schema.org", "@type": "Article", headline: article.title, description: article.excerpt, datePublished: article.publishedAt, author: { "@type": "Person", name: "Shivam Shukla", url: siteUrl }, mainEntityOfPage: `${siteUrl}/blog/${article.slug}` };
  const related = articles.filter((item) => item.slug !== slug).slice(0, 2);
  const articleUrl = `${siteUrl}/blog/${article.slug}`;
  return <main id="main-content" className="inner-page article-page">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}/>
    <ArticleProgress/>
    <header className="article-header site-container">
      <Link href="/blog" className="back-link"><Icon name="arrow-left" size={16}/>Back to blog</Link>
      <div className="article-header-copy"><div className="blog-card-meta"><span>{article.tags?.[0] || article.tag || "Journal"}</span><span>{article.readingTime} min read</span></div><h1>{article.title}</h1>{article.excerpt && <p>{article.excerpt}</p>}<span className="article-date">{date}{date && " · "}By Shivam Shukla</span>{article.isDemo && <span className="sample-label">Sample article for design review</span>}</div>
      <div className="article-cover">{article.coverUrl ? <Image src={article.coverUrl} alt="" fill priority unoptimized sizes="(max-width: 760px) 94vw, 1100px"/> : <EditorialArt treatment={article.treatment || "blue"}/>}</div>
    </header>
    <div className="site-container"><ArticleToolbar slug={article.slug} title={article.title} content={article.contentMd || ""}/></div>
    <div className="site-container"><SharePreviewCard item={{ kind: "blog", title: article.title, description: article.excerpt, category: article.tags?.[0] || article.tag || "Journal", meta: `${article.readingTime} min read · Shivam Shukla`, cta: "Read the article", path: `/blog/${article.slug}`, url: articleUrl }}/></div>
    <div className="article-layout site-container">
      {headings.length >= 3 && <aside className="article-toc"><details open><summary>On this page</summary>{headings.map((heading) => <a key={heading.id} href={`#${heading.id}`} className={heading.level === 3 ? "toc-sub" : ""}>{heading.text}</a>)}</details></aside>}
      <ArticleBody html={html} url={articleUrl} title={article.title}/>
      <aside className="article-share"><strong>Share this article</strong><a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(articleUrl)}`} target="_blank" rel="noopener noreferrer">LinkedIn</a><a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(articleUrl)}&text=${encodeURIComponent(article.title)}`} target="_blank" rel="noopener noreferrer">X</a><a href={`https://wa.me/?text=${encodeURIComponent(`${article.title} ${articleUrl}`)}`} target="_blank" rel="noopener noreferrer">WhatsApp</a></aside>
    </div>
    <div className="site-container"><ArticleAudience slug={slug} comments={comments}/></div>
    {related.length > 0 && <section className="site-container read-next"><div><span className="page-kicker">Keep reading</span><h2>Read next</h2></div><div>{related.map((item) => <Link key={item.slug} href={`/blog/${item.slug}`}><span>{item.tags?.[0] || "Notes"} · {item.readingTime} min read</span><strong>{item.title}</strong><Icon name="arrow-up-right" size={19}/></Link>)}</div></section>}
  </main>;
}
