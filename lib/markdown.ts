import { Marked } from "marked";
import sanitizeHtml from "sanitize-html";
import hljs from "highlight.js";

export type TocItem = { id: string; text: string; level: number };

function slugify(value: string) {
  return value.toLowerCase().replace(/<[^>]+>/g, "").replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").slice(0, 72) || "section";
}

export function renderMarkdown(source: string) {
  const headings: TocItem[] = [];
  const used = new Map<string, number>();
  const marked = new Marked({ gfm: true, breaks: false });
  marked.use({ renderer: {
    heading({ tokens, depth, text }) {
      const label = text || this.parser.parseInline(tokens).replace(/<[^>]+>/g, "");
      const base = slugify(label);
      const seen = used.get(base) || 0;
      used.set(base, seen + 1);
      const id = seen ? `${base}-${seen + 1}` : base;
      if (depth <= 3) headings.push({ id, text: label.replace(/<[^>]+>/g, ""), level: depth });
      return `<h${depth} id="${id}">${this.parser.parseInline(tokens)}</h${depth}>`;
    },
    code({ text, lang }) {
      const language = lang && hljs.getLanguage(lang) ? lang : "plaintext";
      const highlighted = hljs.highlight(text, { language }).value;
      return `<pre><code class="hljs language-${language}">${highlighted}</code></pre>`;
    },
  } });
  const raw = String(marked.parse(source || ""));
  const html = sanitizeHtml(raw, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img", "figure", "figcaption"]),
    allowedAttributes: { ...sanitizeHtml.defaults.allowedAttributes, "*": ["id"], code: ["class"], a: ["href", "title", "target", "rel"], img: ["src", "alt", "width", "height", "loading"] },
    allowedSchemes: ["http", "https", "mailto"],
    transformTags: { a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer" }, true), img: sanitizeHtml.simpleTransform("img", { loading: "lazy" }, true) },
  });
  return { html, headings };
}

export function sanitizePostEmbed(value: string) {
  return sanitizeHtml(value, { allowedTags: ["iframe"], allowedAttributes: { iframe: ["src", "width", "height", "frameborder", "allowfullscreen", "title", "loading"] }, allowedSchemes: ["https"], allowedIframeHostnames: ["www.linkedin.com", "platform.twitter.com", "twitter.com"] });
}
