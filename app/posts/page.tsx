import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import { getPublishedPosts } from "@/lib/content/repository";
import { sanitizePostEmbed } from "@/lib/markdown";
import { BrandIcon } from "@/components/ui/brand-icon";
import { Icon } from "@/components/ui/icon";

export const metadata: Metadata = { title: "Posts", description: "Short notes and updates from Shivam Shukla on LinkedIn and X.", alternates: { canonical: "/posts" } };

export default async function PostsPage() {
  const posts = await getPublishedPosts();
  const hasTwitterEmbed = posts.some((post) => post.platform === "twitter" && post.url && !post.isDemo);
  return <main id="main-content" className="inner-page posts-page">{hasTwitterEmbed && <Script src="https://platform.twitter.com/widgets.js" strategy="lazyOnload" />}<section className="inner-hero site-container compact-inner-hero"><span className="page-kicker">Posts</span><h1>Notes from the internet.</h1><p>Small thoughts, product updates, and things I’m learning in public.</p></section><section className="site-container posts-wall">{posts.length ? posts.map((post) => <article className={`social-post ${post.pinned ? "social-post-pinned" : ""}`} key={post.id}><div className="social-post-head"><span><BrandIcon platform={post.platform} size={18} />{post.platform === "twitter" ? "X / Twitter" : "LinkedIn"}</span>{post.pinned && <small>Pinned</small>}</div>{post.embedHtml ? <div className="social-embed" dangerouslySetInnerHTML={{ __html: sanitizePostEmbed(post.embedHtml) }} /> : post.platform === "twitter" && post.url && !post.isDemo ? <blockquote className="twitter-tweet"><a href={post.url}>{post.caption || "View post on X"}</a></blockquote> : <><p>{post.caption || "A post from Shivam."}</p>{post.url && <a href={post.url} target="_blank" rel="noopener noreferrer" className="text-link">View post<Icon name="arrow-up-right" size={16} /></a>}</>} {post.isDemo && <span className="sample-label">Sample post</span>}</article>) : <div className="public-empty"><h2>The wall is getting ready.</h2><p>Published posts will appear here from Shivam’s owner studio.</p><Link href="/contact" className="button button-secondary">Say hello instead</Link></div>}</section></main>;
}
