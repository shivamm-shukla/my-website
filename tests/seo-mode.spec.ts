import { test, expect } from "playwright/test";

const preview = process.env.VERCEL_ENV === "preview"
  || (process.env.VERCEL_ENV !== "production" && process.env.NEXT_PUBLIC_SITE_MODE !== "live");

test(`sitemap, robots, and index directives match ${preview ? "preview" : "live"} mode`, async ({ request, page }) => {
  const [robotsResponse, sitemapResponse] = await Promise.all([request.get("/robots.txt"), request.get("/sitemap.xml")]);
  expect(robotsResponse.ok()).toBe(true);
  expect(sitemapResponse.ok()).toBe(true);
  const robots = await robotsResponse.text();
  const sitemap = await sitemapResponse.text();

  await page.goto("/");
  const homeRobots = await page.locator('meta[name="robots"]').getAttribute("content");

  if (preview) {
    expect(robots).toContain("Disallow: /");
    expect(robots).not.toContain("Sitemap:");
    expect(sitemap).toContain("<urlset");
    expect(sitemap).not.toContain("<url>");
    expect(homeRobots).toContain("noindex");
    return;
  }

  expect(robots).toContain("Allow: /");
  expect(robots).toContain("Disallow: /admin");
  expect(robots).toContain("Sitemap: https://shivamshukla.site/sitemap.xml");
  expect(homeRobots).not.toContain("noindex");

  const locations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  const required = ["/", "/about", "/work", "/blog", "/posts", "/resume", "/hire-me", "/contact"];
  for (const route of required) expect(locations).toContain(`https://shivamshukla.site${route}`);
  expect(locations.every((location) => location.startsWith("https://shivamshukla.site/"))).toBe(true);
  expect([...sitemap.matchAll(/<lastmod>[^<]+<\/lastmod>/g)]).toHaveLength(locations.length);

  await page.goto("/admin");
  expect(await page.locator('meta[name="robots"]').getAttribute("content")).toContain("noindex");
});
