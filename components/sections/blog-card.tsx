import Image from "next/image";
import Link from "next/link";
import type { BlogArticle } from "@/lib/content/types";
import { EditorialArt } from "./editorial-art";
import { Icon } from "@/components/ui/icon";

export function BlogCard({ article }: { article: BlogArticle }) {
  const tag = article.tags?.[0] || article.tag || "Journal";
  const date = article.publishedAt ? new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(new Date(article.publishedAt)) : article.isDemo ? "Sample article" : "Draft date";
  return <article className="blog-list-card"><Link href={`/blog/${article.slug}`}>
    <div className="blog-list-cover">{article.coverUrl ? <Image src={article.coverUrl} alt="" fill sizes="(max-width: 700px) 94vw, 40vw" unoptimized /> : <EditorialArt treatment={article.treatment || "blue"} />}</div>
    <div className="blog-list-body"><div className="blog-card-meta"><span>{tag}</span><span>{article.readingTime} min read</span></div><h2>{article.title}</h2>{article.excerpt && <p>{article.excerpt}</p>}<div className="blog-card-bottom"><span>{date}</span><span className="writing-open"><Icon name="arrow-up-right" size={19} /></span></div></div>
  </Link></article>;
}
