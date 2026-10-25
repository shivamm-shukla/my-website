import { test, expect } from "playwright/test";
import { source as axeSource } from "axe-core";

const publicRoutes = ["/posts", "/blog", "/blog/sample-before-the-code"];

for (const theme of ["light", "dark"] as const) {
  for (const width of [360, 1440]) {
    test(`publishing pages fit ${width}px in ${theme} mode`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ colorScheme: theme, reducedMotion: "reduce" });
      for (const route of publicRoutes) {
        await page.goto(route);
        await expect(page.locator("h1")).toBeVisible();
        expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth), route).toBe(false);
      }
    });
  }
}

test("blog renders sanitized Markdown, code, and article metadata", async ({ page }) => {
  await page.goto("/blog/sample-carrying-context");
  await expect(page.getByRole("heading", { name: "What happens to context when you switch AI tools?" })).toBeVisible();
  await expect(page.locator(".prose pre code")).toContainText("brg switch codex");
  await expect(page.locator(".sample-label")).toContainText("Sample article");
  expect(await page.locator(".prose script").count()).toBe(0);
});

test("admin stays private and shows setup guidance without credentials", async ({ page }) => {
  await page.goto("/admin");
  await expect(page.getByRole("heading", { name: "Connect Supabase to open the studio." })).toBeVisible();
  await expect(page.locator(".site-header")).not.toBeVisible();
});

test("RSS, OG image, chat fallback, and cron protection respond correctly", async ({ request }) => {
  const rss = await request.get("/rss.xml");
  expect(rss.ok()).toBe(true);
  expect(rss.headers()["content-type"]).toContain("application/rss+xml");
  expect(await rss.text()).toContain("<rss version=\"2.0\">");
  const og = await request.get("/api/og?title=Shivam%20Shukla");
  expect(og.ok()).toBe(true);
  expect(og.headers()["content-type"]).toContain("image/png");
  const chat = await request.post("/api/chat", { data: { messages: [{ role: "user", content: "Shivam kaun hai?" }] } });
  expect(chat.status()).toBe(503);
  const cron = await request.get("/api/keep-alive");
  expect(cron.status()).toBe(401);
});

for (const route of ["/posts", "/blog", "/blog/sample-before-the-code", "/admin"]) {
  test(`${route} has no WCAG A/AA axe violations`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(route);
    await page.addScriptTag({ content: axeSource });
    const violations = await page.evaluate(async () => {
      const axe = (window as unknown as { axe: { run: (options: object) => Promise<{ violations: unknown[] }> } }).axe;
      return (await axe.run({ runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] } })).violations;
    });
    expect(violations).toEqual([]);
  });
}
