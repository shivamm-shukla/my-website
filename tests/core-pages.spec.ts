import { test, expect } from "playwright/test";
import { source as axeSource } from "axe-core";

const routes = ["/about", "/work", "/work/thravia", "/work/brg-cli", "/work/jeetlo", "/hire-me", "/contact", "/resume"];

for (const theme of ["light", "dark"] as const) {
  for (const width of [360, 1440]) {
    test(`core pages fit ${width}px in ${theme} mode`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ colorScheme: theme, reducedMotion: "reduce" });
      for (const route of routes) {
        await page.goto(route);
        await expect(page.locator("h1")).toBeVisible();
        expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth), route).toBe(false);
      }
    });
  }
}

test("work filters projects without losing the case-study links", async ({ page }) => {
  await page.goto("/work");
  await expect(page.locator(".work-row")).toHaveCount(3);
  await page.getByRole("button", { name: "Education" }).click();
  await expect(page.locator(".work-row")).toHaveCount(1);
  await expect(page.getByRole("link", { name: /Explore Jeetlo/i })).toHaveAttribute("href", "/work/jeetlo");
});

test("contact form exposes useful validation and an honest inbox state", async ({ page }) => {
  await page.goto("/contact");
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.locator("#name-error")).toBeVisible();
  await page.getByLabel("Your name").fill("Shivam Visitor");
  await page.getByLabel("Email", { exact: true }).fill("visitor@example.com");
  await page.getByLabel("What do you have in mind?").fill("I would like to discuss a useful product idea with you.");
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.locator(".form-status-unavailable")).toContainText("not stored");
});

test("unknown routes show the friendly 404", async ({ page }) => {
  await page.goto("/this-page-does-not-exist");
  await expect(page.getByRole("heading", { name: "A little off the map." })).toBeVisible();
  await expect(page.getByRole("link", { name: "Back to Home" })).toHaveAttribute("href", "/");
});

for (const route of ["/about", "/work", "/contact"]) {
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
