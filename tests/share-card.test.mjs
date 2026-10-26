import test from "node:test";
import assert from "node:assert/strict";
import { drawShareCard, fitTitle, SHARE_FORMATS } from "../lib/share-card.mjs";

function makeContext(width, height) {
  const calls = [];
  const gradient = () => ({ addColorStop() {} });
  const ctx = {
    canvas: { width, height }, font: "16px system-ui", textAlign: "left", textBaseline: "alphabetic",
    measureText(text) { const size = Number(this.font.match(/([\d.]+)px/)?.[1] || 16); return { width: String(text).length * size * .55 }; },
    fillText(text, x, y) { calls.push({ text: String(text), x, y, width: this.measureText(text).width, font: this.font, align: this.textAlign, baseline: this.textBaseline }); },
    createLinearGradient: gradient, createRadialGradient: gradient,
    beginPath() {}, moveTo() {}, lineTo() {}, arcTo() {}, closePath() {}, arc() {}, ellipse() {}, quadraticCurveTo() {},
    fill() {}, stroke() {}, fillRect() {}, save() {}, restore() {}, translate() {}, scale() {},
  };
  return { ctx, calls };
}

test("fitTitle wraps and truncates at the requested width and line count", () => {
  const { ctx } = makeContext(1080, 1080);
  const result = fitTitle(ctx, "A very long title ".repeat(30), 620, 5, 84, 44);
  assert.ok(result.lines.length <= 5);
  assert.ok(result.lines.every((line) => ctx.measureText(line).width <= 620));
  assert.ok(result.lines.at(-1).endsWith("…"));
});

test("long titles keep all rendered text inside Story, Post, and Link canvases", () => {
  const title = "How building for real people changes every product decision ".repeat(18);
  const item = { kind: "blog", title, description: "A practical reflection on clear products and thoughtful work. ".repeat(5), category: "Product thinking", meta: "8 min read · Oct 2026", path: "/blog/a-long-article-title", site: "shivamshukla.site" };
  for (const [format, size] of Object.entries(SHARE_FORMATS)) {
    const { ctx, calls } = makeContext(size.width, size.height);
    const result = drawShareCard(ctx, item, format, "aurora");
    assert.deepEqual(result, { width: size.width, height: size.height });
    assert.ok(calls.length > 0, `${format} should render text`);
    for (const call of calls) {
      const left = call.align === "center" ? call.x - call.width / 2 : call.align === "right" ? call.x - call.width : call.x;
      const top = call.baseline === "middle" ? call.y - Number(call.font.match(/([\d.]+)px/)?.[1] || 16) / 2 : call.baseline === "top" ? call.y : call.y - Number(call.font.match(/([\d.]+)px/)?.[1] || 16) * .8;
      const fontSize = Number(call.font.match(/([\d.]+)px/)?.[1] || 16);
      assert.ok(left >= -1, `${format} text starts before the canvas: ${call.text}`);
      assert.ok(left + call.width <= size.width + 1, `${format} text ends after the canvas: ${call.text}`);
      assert.ok(top >= -1, `${format} text starts above the canvas: ${call.text}`);
      assert.ok(top + fontSize <= size.height + 1, `${format} text ends below the canvas: ${call.text}`);
    }
  }
});
