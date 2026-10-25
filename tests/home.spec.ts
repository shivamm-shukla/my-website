import { test, expect } from "playwright/test";
import { source as axeSource } from "axe-core";
import { mkdirSync } from "node:fs";

for (const theme of ["light", "dark"] as const) {
  for (const width of [320, 360, 390, 768, 1024, 1440, 1920, 2560]) {
    test(`Home fits ${width}px in ${theme} mode`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ colorScheme: theme, reducedMotion: "reduce" });
      await page.goto("/");
      await page.evaluate(() => document.fonts.ready);
      await expect(page.locator("h1")).toContainText("people actually need.");
      await expect(page.locator("html")).toHaveClass(theme === "dark" ? /dark/ : /^(?!.*dark)/);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
      expect(overflow).toBe(false);
      expect(await page.locator(".project-card").count()).toBe(3);
      mkdirSync("docs/screenshots", { recursive: true });
      await page.screenshot({ path: `docs/screenshots/home-${theme}-${width}.png`, fullPage: true, animations: "disabled" });
    });
  }
  for (const width of [390, 1440]) {
    test(`Home has no WCAG A/AA axe violations at ${width}px in ${theme}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ colorScheme: theme, reducedMotion: "reduce" });
      await page.goto("/");
      await page.addScriptTag({ content: axeSource });
      const violations = await page.evaluate(async () => {
        const axe = (window as unknown as { axe: { run: (options: object) => Promise<{ violations: unknown[] }> } }).axe;
        return (await axe.run({ runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] } })).violations;
      });
      expect(violations).toEqual([]);
    });
  }
}

test("theme changes persist without changing the hero's geometry", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light", reducedMotion: "reduce" });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  const before = await page.locator("h1").boundingBox();
  await page.getByRole("button", { name: "Switch to dark theme" }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);
  expect(await page.locator("h1").boundingBox()).toEqual(before);
  await page.reload();
  await expect(page.locator("html")).toHaveClass(/dark/);
});

test("the companion answers, traps focus, and closes with Escape", async ({ page }) => {
  await page.goto("/");
  const opener = page.locator(".assistant-launcher");
  await opener.click();
  const dialog = page.getByRole("dialog", { name: "Meet my little sidekick." });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "What is Shivam building?" }).click();
  await expect(dialog.locator(".assistant-answer")).toContainText("Thravia");
  for (let index = 0; index < 12; index++) {
    await page.keyboard.press("Tab");
    expect(await dialog.evaluate(element => element.contains(document.activeElement))).toBe(true);
  }
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(opener).toBeFocused();
});

test("mobile menu exposes the sitemap and returns keyboard focus", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const opener = page.getByRole("button", { name: "Open menu", exact: true });
  await opener.click();
  const dialog = page.getByRole("dialog", { name: "Make yourself at home." });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("link", { name: /Contact/ })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(opener).toBeFocused();
});

test("quick navigation focuses search and supports an empty result", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-command-ready", "true");
  await page.keyboard.press("Control+k");
  const input = page.getByRole("searchbox", { name: "Search pages" });
  await expect(input).toBeFocused();
  await input.fill("this-page-does-not-exist");
  await expect(page.locator(".command-empty")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(input).not.toBeVisible();
});

test("motion can be paused and the choice survives reload", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  await page.locator(".footer-bottom").getByRole("button", { name: "Pause motion" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-motion", "paused");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-motion", "paused");
});

for (const width of [390, 1440]) {
  test(`the header stays flush and the companion remains visible while scrolling at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    const robot = page.locator(".assistant-launcher");
    await expect(robot).toBeVisible();
    const before = await robot.boundingBox();
    for (const top of [500, 1400, 2400, 0]) {
      await page.evaluate(y => window.scrollTo({ top: y, behavior: "instant" }), top);
      await expect(robot).toBeVisible();
      expect(await robot.boundingBox()).toEqual(before);
      expect((await page.locator(".site-header").boundingBox())?.y).toBe(0);
    }
    expect(await page.locator(".hero-section button, .hero-section [data-open-assistant]").count()).toBe(0);
  });
}
