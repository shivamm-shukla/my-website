import { getPublishedBlogs, getSiteContent, siteUrl } from "@/lib/content/repository";

function xml(value: string) { return value.replace(/[<>&'\"]/g, (char) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[char] || char); }

export async function GET() {
  const [articles, content] = await Promise.all([getPublishedBlogs(), getSiteContent()]);
  const items = articles.map((article) => `<item><title>${xml(article.title)}</title><link>${siteUrl}/blog/${article.slug}</link><guid>${siteUrl}/blog/${article.slug}</guid><description>${xml(article.excerpt || "")}</description>${article.publishedAt ? `<pubDate>${new Date(article.publishedAt).toUTCString()}</pubDate>` : ""}</item>`).join("");
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${xml(`${content.profile.name} · ${content.home.writing.title}`)}</title><link>${siteUrl}/blog</link><description>${xml(content.home.writing.description)}</description>${items}</channel></rss>`, { headers: { "Content-Type": "application/rss+xml; charset=utf-8", "Cache-Control": "public, max-age=3600, s-maxage=3600" } });
}
