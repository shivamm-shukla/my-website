export const SHARE_FORMATS = {
  story: { width: 1080, height: 1920, name: "Story" },
  post: { width: 1080, height: 1080, name: "Post" },
  link: { width: 1200, height: 630, name: "Link" },
};

export const SHARE_TEMPLATES = {
  aurora: { name: "Aurora", bg: ["#0a0e2e", "#26115f"], blobs: ["#4aa8ff", "#a15cff", "#ff5fa2", "#ffd37a"], ink: "#ffffff", muted: "rgba(255,255,255,.76)", glass: "rgba(255,255,255,.13)", line: "rgba(255,255,255,.3)", button: "#ffffff", buttonInk: "#12142e" },
  sunrise: { name: "Sunrise", bg: ["#2b0f3d", "#8a1f5c"], blobs: ["#ff9a5c", "#ff4f8b", "#ffd37a", "#8a5cff"], ink: "#ffffff", muted: "rgba(255,255,255,.78)", glass: "rgba(255,255,255,.14)", line: "rgba(255,255,255,.32)", button: "#ffffff", buttonInk: "#3a0f3d" },
  ocean: { name: "Ocean", bg: ["#04182a", "#0b4f6f"], blobs: ["#2ee6c5", "#4aa8ff", "#7a5cff", "#8ff0cf"], ink: "#ffffff", muted: "rgba(255,255,255,.78)", glass: "rgba(255,255,255,.13)", line: "rgba(255,255,255,.3)", button: "#ffffff", buttonInk: "#05283c" },
  paper: { name: "Paper", bg: ["#f6f2ea", "#e8e3f7"], blobs: ["#ffb4d0", "#b9d8ff", "#ffe3a0", "#c9b8ff"], ink: "#14162e", muted: "rgba(20,22,46,.68)", glass: "rgba(255,255,255,.8)", line: "rgba(20,22,46,.14)", button: "#14162e", buttonInk: "#ffffff" },
};

const FONT = '-apple-system, BlinkMacSystemFont, "SF Pro Display", Inter, "Segoe UI", Roboto, sans-serif';

function roundRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

export function wrapText(ctx, value, maxWidth) {
  const lines = [];
  let line = "";
  for (const word of String(value || "").trim().split(/\s+/).filter(Boolean)) {
    const candidate = line ? `${line} ${word}` : word;
    if (ctx.measureText(candidate).width <= maxWidth) { line = candidate; continue; }
    if (line) lines.push(line);
    if (ctx.measureText(word).width <= maxWidth) { line = word; continue; }
    let chunk = "";
    for (const char of word) {
      if (chunk && ctx.measureText(chunk + char).width > maxWidth) { lines.push(chunk); chunk = char; }
      else chunk += char;
    }
    line = chunk;
  }
  if (line) lines.push(line);
  return lines;
}

function truncateLine(ctx, line, maxWidth) {
  let result = line.trimEnd();
  while (result && ctx.measureText(`${result}…`).width > maxWidth) result = result.slice(0, -1).trimEnd();
  return `${result}…`;
}

export function fitTitle(ctx, value, maxWidth, maxLines, startSize, minSize, weight = 800) {
  let size = startSize;
  let lines = [];
  while (true) {
    ctx.font = `${weight} ${size}px ${FONT}`;
    lines = wrapText(ctx, value, maxWidth);
    if (lines.length <= maxLines || size <= minSize) break;
    size = Math.max(minSize, size - 4);
  }
  if (lines.length > maxLines) {
    lines = lines.slice(0, maxLines);
    lines[maxLines - 1] = truncateLine(ctx, lines[maxLines - 1], maxWidth);
  }
  return { size, lines, lineHeight: size * 1.08 };
}

function fitLines(ctx, value, maxWidth, maxLines, font) {
  ctx.font = font;
  const lines = wrapText(ctx, value, maxWidth);
  if (lines.length <= maxLines) return lines;
  const clipped = lines.slice(0, maxLines);
  clipped[maxLines - 1] = truncateLine(ctx, clipped[maxLines - 1], maxWidth);
  return clipped;
}

function drawRobot(ctx, cx, cy, scale = 1) {
  ctx.save();
  ctx.translate(cx - 40 * scale, cy - 48 * scale);
  ctx.scale(scale, scale);
  const shell = ctx.createLinearGradient(0, 14, 0, 84);
  shell.addColorStop(0, "#ffffff");
  shell.addColorStop(1, "#d9deea");
  ctx.strokeStyle = "#9aa3b2";
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.beginPath(); ctx.moveTo(40, 7); ctx.lineTo(40, 16); ctx.stroke();
  ctx.fillStyle = "#2997ff"; ctx.beginPath(); ctx.arc(40, 6, 3.6, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = shell; ctx.strokeStyle = "#c4cad6"; ctx.lineWidth = 1;
  for (const [x, y, w, h, r] of [[25, 62, 30, 22, 11], [8, 14, 64, 50, 25]]) { roundRect(ctx, x, y, w, h, r); ctx.fill(); ctx.stroke(); }
  for (const [x, y] of [[18, 72], [62, 72]]) { ctx.beginPath(); ctx.arc(x, y, 6, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }
  ctx.fillStyle = "#0b1220"; roundRect(ctx, 15, 22, 50, 34, 17); ctx.fill();
  ctx.fillStyle = "#5ac8ff";
  for (const x of [30, 50]) { ctx.beginPath(); ctx.ellipse(x, 37, 5, 6.5, 0, 0, Math.PI * 2); ctx.fill(); }
  ctx.strokeStyle = "#5ac8ff"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(35, 48); ctx.quadraticCurveTo(40, 52, 45, 48); ctx.stroke();
  ctx.fillStyle = "rgba(255,122,168,.85)";
  for (const x of [21, 59]) { ctx.beginPath(); ctx.arc(x, 47, 2.4, 0, Math.PI * 2); ctx.fill(); }
  ctx.restore();
}

function drawBrand(ctx, x, y, scale, theme, item) {
  drawRobot(ctx, x + 40 * scale, y + 48 * scale, scale);
  ctx.textBaseline = "top";
  ctx.fillStyle = theme.ink;
  ctx.font = `800 ${Math.round(36 * scale)}px ${FONT}`;
  ctx.fillText(item.author || "Shivam Shukla", x + 80 * scale + 20, y + 48 * scale - 33 * scale);
  ctx.fillStyle = theme.muted;
  ctx.font = `500 ${Math.round(24 * scale)}px ${FONT}`;
  ctx.fillText(item.site || "shivamshukla.site", x + 80 * scale + 20, y + 48 * scale + 4 * scale);
}

function drawBackground(ctx, width, height, theme, format) {
  const gradient = ctx.createLinearGradient(0, 0, width * .7, height);
  gradient.addColorStop(0, theme.bg[0]); gradient.addColorStop(1, theme.bg[1]);
  ctx.fillStyle = gradient; ctx.fillRect(0, 0, width, height);
  const positions = format === "story" ? [[.05,.1,.7],[1,.32,.62],[.1,.68,.75],[.95,.92,.6]] : format === "post" ? [[.05,.05,.75],[1,.4,.62],[.1,.95,.7],[.95,.95,.6]] : [[.02,.05,.7],[1,.1,.6],[.3,1.05,.65],[.9,1,.6]];
  const extent = Math.max(width, height);
  positions.forEach(([px, py, radius], index) => {
    const x = px * width, y = py * height, r = extent * radius * .62;
    const blob = ctx.createRadialGradient(x, y, 0, x, y, r);
    blob.addColorStop(0, theme.blobs[index]); blob.addColorStop(1, `${theme.blobs[index]}00`);
    ctx.fillStyle = blob; ctx.fillRect(0, 0, width, height);
  });
}

function drawChip(ctx, x, y, height, label, theme) {
  const text = String(label || "Notes").toUpperCase();
  const fontSize = height * .38;
  ctx.font = `800 ${fontSize}px ${FONT}`;
  const width = ctx.measureText(text).width + height * .9;
  ctx.fillStyle = theme.glass; roundRect(ctx, x, y, width, height, height / 2); ctx.fill();
  ctx.strokeStyle = theme.line; ctx.lineWidth = 1.5; roundRect(ctx, x, y, width, height, height / 2); ctx.stroke();
  ctx.fillStyle = theme.ink; ctx.textBaseline = "middle"; ctx.fillText(text, x + height * .45, y + height / 2);
}

function drawButton(ctx, x, y, height, label, theme) {
  const fontSize = height * .34;
  ctx.font = `800 ${fontSize}px ${FONT}`;
  const width = Math.min(450, ctx.measureText(label).width + height * 1.6);
  ctx.fillStyle = theme.button; roundRect(ctx, x, y, width, height, height / 2); ctx.fill();
  ctx.fillStyle = theme.buttonInk; ctx.textBaseline = "middle"; ctx.fillText(label, x + height * .48, y + height / 2);
  const arrowX = x + width - height * .45, arrowY = y + height / 2;
  ctx.strokeStyle = theme.buttonInk; ctx.lineWidth = Math.max(2, height * .05); ctx.lineCap = "round";
  ctx.beginPath(); ctx.moveTo(arrowX - 8, arrowY + 8); ctx.lineTo(arrowX + 8, arrowY - 8); ctx.moveTo(arrowX - 1, arrowY - 8); ctx.lineTo(arrowX + 8, arrowY - 8); ctx.lineTo(arrowX + 8, arrowY + 1); ctx.stroke();
  ctx.textBaseline = "top";
  return width;
}

function drawAuthor(ctx, x, y, size, item, theme) {
  const avatar = ctx.createLinearGradient(x, y, x + size, y + size);
  avatar.addColorStop(0, "#4aa8ff"); avatar.addColorStop(1, "#a15cff");
  ctx.fillStyle = avatar; ctx.beginPath(); ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#fff"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.font = `800 ${size * .34}px ${FONT}`;
  ctx.fillText((item.author || "Shivam Shukla").split(/\s+/).map((word) => word[0]).join("").slice(0, 2).toUpperCase(), x + size / 2, y + size / 2);
  ctx.textAlign = "left"; ctx.textBaseline = "top"; ctx.fillStyle = theme.ink; ctx.font = `700 ${size * .42}px ${FONT}`;
  ctx.fillText(item.author || "Shivam Shukla", x + size + 20, y + size * .2);
  ctx.fillStyle = theme.muted; ctx.font = `500 ${size * .32}px ${FONT}`;
  ctx.fillText(item.meta || "Products for real people", x + size + 20, y + size * .56);
}

function drawSocialCard(ctx, item, format, theme, width, height) {
  const story = format === "story";
  const spec = story
    ? { x: 84, pad: 64, chip: 58, title: 112, min: 60, lines: 6, desc: 42, descLines: 3, brandY: 270, top: 430, bottom: height - 340, cta: 104, meta: 40 }
    : { x: 72, pad: 44, chip: 48, title: 84, min: 44, lines: 5, desc: 34, descLines: 2, brandY: 60, top: 168, bottom: height - 56, cta: 84, meta: 32 };
  drawBrand(ctx, spec.x, spec.brandY, story ? .95 : .8, theme, item);
  const innerWidth = width - 2 * spec.x - 2 * spec.pad;
  const descFont = `500 ${spec.desc}px ${FONT}`;
  const description = fitLines(ctx, item.description || "", innerWidth, spec.descLines, descFont);
  const descLineHeight = spec.desc * 1.35;
  const avatarSize = story ? 72 : 64;
  const title = fitTitle(ctx, item.title, innerWidth, spec.lines, spec.title, spec.min, 800);
  const titleHeight = title.lines.length * title.lineHeight;
  const cardHeight = spec.pad * 2 + spec.chip + 36 + titleHeight + 40 + description.length * descLineHeight + 36 + 2 + 30 + avatarSize + spec.pad;
  const ctaHeight = spec.cta;
  const urlHeight = story ? 42 : 0;
  const gap = 42;
  const stackHeight = cardHeight + gap + ctaHeight + (story ? 20 + urlHeight : 0);
  const bandHeight = spec.bottom - spec.top;
  const cardY = spec.top + Math.max(0, (bandHeight - stackHeight) / 2);

  ctx.save(); ctx.shadowColor = theme === SHARE_TEMPLATES.paper ? "rgba(70,60,140,.2)" : "rgba(0,0,0,.32)"; ctx.shadowBlur = 80; ctx.shadowOffsetY = 36;
  ctx.fillStyle = theme.glass; roundRect(ctx, spec.x, cardY, width - 2 * spec.x, cardHeight, story ? 68 : 56); ctx.fill(); ctx.restore();
  ctx.strokeStyle = theme.line; ctx.lineWidth = 2; roundRect(ctx, spec.x, cardY, width - 2 * spec.x, cardHeight, story ? 68 : 56); ctx.stroke();
  const left = spec.x + spec.pad;
  let y = cardY + spec.pad;
  drawChip(ctx, left, y, spec.chip, item.category, theme); y += spec.chip + 36;
  ctx.fillStyle = theme.ink; ctx.font = `800 ${title.size}px ${FONT}`; ctx.textBaseline = "top";
  title.lines.forEach((line) => { ctx.fillText(line, left, y); y += title.lineHeight; }); y += 40;
  ctx.fillStyle = theme.muted; ctx.font = descFont;
  description.forEach((line) => { ctx.fillText(line, left, y); y += descLineHeight; }); y += 36;
  ctx.fillStyle = theme.line; ctx.fillRect(left, y, innerWidth, 2); y += 30;
  drawAuthor(ctx, left, y, avatarSize, item, theme);
  const buttonY = cardY + cardHeight + gap;
  drawButton(ctx, spec.x, buttonY, ctaHeight, item.cta || (item.kind === "project" ? "See the project" : "Read the full post"), theme);
  ctx.fillStyle = theme.muted; ctx.font = `600 ${spec.meta - 6}px ${FONT}`; ctx.textBaseline = "top";
  if (story) {
    const site = item.site || "shivamshukla.site";
    ctx.fillText(fitLines(ctx, `${site}${item.path || ""}`, width - 2 * spec.x - 16, 1, `600 ${spec.meta - 6}px ${FONT}`)[0], spec.x + 8, buttonY + ctaHeight + 24);
  } else {
    ctx.textAlign = "right";
    ctx.fillText(item.site || "shivamshukla.site", width - spec.x, buttonY + ctaHeight / 2 - 8);
    ctx.textAlign = "left";
  }
}

function drawLinkCard(ctx, item, theme, width, height) {
  const margin = 64;
  drawBrand(ctx, margin, 46, .6, theme, item);
  const chipY = 150;
  drawChip(ctx, margin, chipY, 44, item.category, theme);
  const title = fitTitle(ctx, item.title, 700, 4, 72, 38, 800);
  let y = chipY + 74;
  ctx.fillStyle = theme.ink; ctx.font = `800 ${title.size}px ${FONT}`; ctx.textBaseline = "top";
  title.lines.forEach((line) => { ctx.fillText(line, margin, y); y += title.lineHeight; });
  const buttonY = height - 128;
  const buttonWidth = drawButton(ctx, margin, buttonY, 64, item.cta || (item.kind === "project" ? "See the project" : "Read the full post"), theme);
  ctx.fillStyle = theme.muted; ctx.font = `600 24px ${FONT}`; ctx.textBaseline = "middle";
  const url = `${item.site || "shivamshukla.site"}${item.path || ""}`;
  const maxUrlWidth = Math.max(30, width - (margin + buttonWidth + 24) - margin);
  ctx.fillText(fitLines(ctx, url, maxUrlWidth, 1, `600 24px ${FONT}`)[0], margin + buttonWidth + 24, buttonY + 32);
  ctx.fillStyle = theme.glass; ctx.beginPath(); ctx.arc(width - 250, height / 2 + 10, 190, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = theme.line; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(width - 250, height / 2 + 10, 190, 0, Math.PI * 2); ctx.stroke();
  drawRobot(ctx, width - 250, height / 2 + 10, 3);
}

export function drawShareCard(ctx, item, format = "story", template = "aurora") {
  const dimensions = SHARE_FORMATS[format] || SHARE_FORMATS.story;
  const theme = SHARE_TEMPLATES[template] || SHARE_TEMPLATES.aurora;
  const { width, height } = dimensions;
  drawBackground(ctx, width, height, theme, format);
  if (format === "link") drawLinkCard(ctx, item, theme, width, height);
  else drawSocialCard(ctx, item, format, theme, width, height);
  return { width, height };
}
