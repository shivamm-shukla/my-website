const { chromium } = require("playwright");
const { mkdirSync } = require("node:fs");

(async () => {
  mkdirSync("docs/screenshots", { recursive: true });
  const browser = await chromium.launch();
  const shots = [
    ["posts-dark-1440.png", "/posts", 1440, 900, "dark"],
    ["blog-light-1440.png", "/blog", 1440, 900, "light"],
    ["article-light-390.png", "/blog/sample-carrying-context", 390, 844, "light"],
    ["admin-setup-light-1440.png", "/admin", 1440, 900, "light"],
  ];
  for (const [name, route, width, height, colorScheme] of shots) {
    const context = await browser.newContext({ viewport: { width, height }, colorScheme, reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.goto(`http://127.0.0.1:3000${route}`, { waitUntil: "networkidle" });
    await page.screenshot({ path: `docs/screenshots/${name}`, fullPage: true, animations: "disabled" });
    await context.close();
  }
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, colorScheme: "light", reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:3000/", { waitUntil: "networkidle" });
  await page.locator(".assistant-launcher").click();
  await page.screenshot({ path: "docs/screenshots/assistant-mobile.png", fullPage: false, animations: "disabled" });
  await context.close();
  await browser.close();
})();
