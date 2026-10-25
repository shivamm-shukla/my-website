import { getPublishedBlogs, siteUrl } from "@/lib/content/repository";

function xml(value: string) { return value.replace(/[<>&'\"]/g, (char) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[char] || char); }

export async function GET() {
  const articles = await getPublishedBlogs();
  const items = articles.map((article) => `<item><title>${xml(article.title)}</title><link>${siteUrl}/blog/${article.slug}</link><guid>${siteUrl}/blog/${article.slug}</guid><description>${xml(article.excerpt || "")}</description>${article.publishedAt ? `<pubDate>${new Date(article.publishedAt).toUTCString()}</pubDate>` : ""}</item>`).join("");
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Shivam Shukla</title><link>${siteUrl}/blog</link><description>Thoughts on building products for real people.</description>${items}</channel></rss>`, { headers: { "Content-Type": "application/rss+xml; charset=utf-8", "Cache-Control": "public, max-age=3600, s-maxage=3600" } });
}
