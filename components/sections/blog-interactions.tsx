"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import type { BlogArticle } from "@/lib/content/types";
import type { PublicBlogComment } from "@/lib/content/repository";
import { submitBlogComment, subscribeToBlog, type ReaderActionState } from "@/app/blog/actions";
import { Icon } from "@/components/ui/icon";

const savedKey = "shivam-saved-posts";
const initialActionState: ReaderActionState = { status: "idle", message: "" };
function readSaved(): string[] {
  try { const value: unknown = JSON.parse(localStorage.getItem(savedKey) || "[]"); return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : []; }
  catch { return []; }
}

function BlogPlaceholderArt({ treatment }: { treatment: "blue" | "lilac" | "peach" }) {
  return <div className={`editorial-art editorial-art-${treatment}`} aria-hidden="true"><div className={`sculpture sculpture-${treatment}`}><span className="sculpture-shadow"/><span className="sculpture-plinth"/><span className="sculpture-arch"/><span className="sculpture-orb"/><span className="sculpture-bead"/></div></div>;
}

export function BlogBrowser({ articles }: { articles: BlogArticle[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [saved, setSaved] = useState<string[]>([]);
  useEffect(() => {
    const sync = () => setSaved(readSaved());
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("blog:saved", sync);
    return () => { window.removeEventListener("storage", sync); window.removeEventListener("blog:saved", sync); };
  }, []);
  const categories = Array.from(new Set(articles.map((article) => article.tags?.[0] || article.tag || "Notes")));
  const visible = articles.filter((article) => {
    const matchesCategory = category === "All" || (category === "Saved" ? saved.includes(article.slug) : (article.tags?.[0] || article.tag || "Notes") === category);
    return matchesCategory && `${article.title} ${article.excerpt || ""}`.toLowerCase().includes(query.trim().toLowerCase());
  });
  const toggleSaved = (slug: string) => {
    const next = saved.includes(slug) ? saved.filter((item) => item !== slug) : [...saved, slug];
    try { localStorage.setItem(savedKey, JSON.stringify(next)); } catch { /* Saving remains available for this view. */ }
    setSaved(next);
    window.dispatchEvent(new Event("blog:saved"));
  };
  return <>
    <div className="blog-controls site-container">
      <label className="blog-search"><Icon name="search" size={18}/><span className="sr-only">Search articles</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search articles" /></label>
      <div className="blog-filters" aria-label="Filter articles">{["All", ...categories, ...(saved.length ? ["Saved"] : [])].map((item) => <button key={item} type="button" aria-pressed={category === item} onClick={() => setCategory(item)}>{item}</button>)}</div>
    </div>
    <section className="site-container blog-list" aria-label="Articles" aria-live="polite">
      {visible.length ? visible.map((article) => {
        const tag = article.tags?.[0] || article.tag || "Notes";
        const date = article.publishedAt ? new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(new Date(article.publishedAt)) : article.isDemo ? "Sample article" : "";
        return <article className="blog-list-card" key={article.slug}>
          <Link href={`/blog/${article.slug}`} className="blog-row-link">
            <div className="blog-list-cover">{article.coverUrl ? <Image src={article.coverUrl} alt="" fill sizes="(max-width: 700px) 94vw, 40vw" unoptimized/> : <BlogPlaceholderArt treatment={article.treatment || "blue"}/>}</div>
            <div className="blog-list-body"><div className="blog-card-meta"><span>{tag}</span><span>{article.readingTime} min read</span></div><h2>{article.title}</h2>{article.excerpt && <p>{article.excerpt}</p>}<div className="blog-card-bottom"><span>{date}</span><span className="writing-open" aria-hidden="true"><Icon name="arrow-up-right" size={19}/></span></div></div>
          </Link>
          <button className="blog-save-button" type="button" aria-pressed={saved.includes(article.slug)} aria-label={saved.includes(article.slug) ? `Remove ${article.title} from saved articles` : `Save ${article.title}`} onClick={() => toggleSaved(article.slug)}><Icon name="bookmark" size={17}/></button>
        </article>;
      }) : <div className="public-empty"><h2>{query || category !== "All" ? "No articles match that view." : "Nothing published yet."}</h2><p>Try another search or choose a different topic.</p></div>}
    </section>
  </>;
}

export function ArticleProgress() {
  useEffect(() => {
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const scrollable = document.documentElement.scrollHeight - window.innerHeight;
        const progress = scrollable > 0 ? Math.min(1, window.scrollY / scrollable) : 0;
        document.documentElement.style.setProperty("--reading-progress", `${progress * 100}%`);
      });
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });
    return () => { cancelAnimationFrame(frame); window.removeEventListener("scroll", update); window.removeEventListener("resize", update); };
  }, []);
  return <div className="reading-progress" aria-hidden="true"/>;
}

export function ArticleToolbar({ slug, title, content }: { slug: string; title: string; content: string }) {
  const [saved, setSaved] = useState(false);
  const [appreciated, setAppreciated] = useState(false);
  const [fontSize, setFontSize] = useState(19);
  const [serif, setSerif] = useState(false);
  const [canSpeak, setCanSpeak] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [copied, setCopied] = useState(false);
  const speech = useRef<SpeechSynthesisUtterance | null>(null);
  useEffect(() => {
    setCanSpeak("speechSynthesis" in window && "SpeechSynthesisUtterance" in window);
    try {
      const ids: unknown = JSON.parse(localStorage.getItem(savedKey) || "[]");
      setSaved(Array.isArray(ids) && ids.includes(slug));
      setAppreciated(localStorage.getItem(`shivam-appreciated-${slug}`) === "yes");
      const size = Number(localStorage.getItem("shivam-reading-size"));
      if (size >= 15 && size <= 26) setFontSize(size);
      setSerif(localStorage.getItem("shivam-reading-serif") === "yes");
    } catch { /* Default reading settings work if storage is unavailable. */ }
  }, [slug]);
  useEffect(() => () => { if ("speechSynthesis" in window) window.speechSynthesis.cancel(); }, []);
  useEffect(() => {
    const page = document.querySelector<HTMLElement>(".article-page");
    page?.style.setProperty("--article-font-size", `${fontSize}px`);
    page?.classList.toggle("article-serif", serif);
  }, [fontSize, serif]);
  const setSavedValue = () => {
    const ids = (() => { try { const value: unknown = JSON.parse(localStorage.getItem(savedKey) || "[]"); return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : []; } catch { return []; } })();
    const next = saved ? ids.filter((item) => item !== slug) : Array.from(new Set([...ids, slug]));
    try { localStorage.setItem(savedKey, JSON.stringify(next)); } catch { /* Saving remains available for this view. */ }
    setSaved(!saved);
    window.dispatchEvent(new Event("blog:saved"));
  };
  const toggleAppreciated = () => {
    const next = !appreciated;
    setAppreciated(next);
    try { localStorage.setItem(`shivam-appreciated-${slug}`, next ? "yes" : "no"); } catch { /* Keep the state for this visit. */ }
  };
  const toggleSpeak = () => {
    if (!canSpeak) return;
    if (speaking) { window.speechSynthesis.cancel(); setSpeaking(false); return; }
    const plain = content.replace(/```[\s\S]*?```/g, " code block ").replace(/[#>*_`\[\]()]/g, " ").replace(/\s+/g, " ").trim();
    const utterance = new SpeechSynthesisUtterance(plain);
    utterance.lang = "en-IN";
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    speech.current = utterance;
    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };
  const changeFont = (delta: number) => {
    const next = Math.min(26, Math.max(15, fontSize + delta));
    setFontSize(next);
    try { localStorage.setItem("shivam-reading-size", String(next)); } catch { /* Use the new size for this visit. */ }
  };
  const toggleSerif = () => {
    const next = !serif;
    setSerif(next);
    try { localStorage.setItem("shivam-reading-serif", next ? "yes" : "no"); } catch { /* Use the preference for this visit. */ }
  };
  return <div className="article-toolbar" aria-label="Article controls">
    <button type="button" className="article-tool-share" onClick={() => window.dispatchEvent(new CustomEvent("share:open", { detail: { type: "blog", slug, title } }))}><Icon name="share" size={17}/>Share to story</button>
    <button type="button" aria-pressed={appreciated} onClick={toggleAppreciated}><Icon name="heart" size={17}/> {appreciated ? "Appreciated" : "Appreciate"}</button>
    <button type="button" aria-pressed={saved} onClick={setSavedValue}><Icon name="bookmark" size={17}/> {saved ? "Saved" : "Save"}</button>
    {canSpeak && <button type="button" aria-pressed={speaking} onClick={toggleSpeak}><Icon name="volume" size={17}/>{speaking ? "Stop" : "Listen"}</button>}
    <button type="button" onClick={async () => { try { await navigator.clipboard.writeText(window.location.href); setCopied(true); window.setTimeout(() => setCopied(false), 1500); } catch { setCopied(false); } }}><Icon name={copied ? "check" : "link"} size={17}/>{copied ? "Copied" : "Copy link"}</button>
    <span className="article-tool-separator" aria-hidden="true"/>
    <button type="button" aria-label="Decrease text size" onClick={() => changeFont(-1)}>A−</button><button type="button" aria-label="Increase text size" onClick={() => changeFont(1)}>A+</button>
    <button type="button" aria-pressed={serif} onClick={toggleSerif}>Serif</button>
  </div>;
}

export function BlogSubscribeCard() {
  const [state, action, pending] = useActionState(subscribeToBlog, initialActionState);
  return <section className="site-container reader-card blog-subscribe-card"><span className="page-kicker">A short note, now and then</span><h2>When something’s worth sharing.</h2><p>Get an occasional email when a new article is ready. Unsubscribe any time.</p><form action={action} className="reader-form"><label>Email address<input type="email" name="email" autoComplete="email" required maxLength={160}/></label><label className="reader-consent"><input type="checkbox" name="consent" required/><span>I agree to receive occasional writing updates from Shivam.</span></label><div className="reader-honeypot" aria-hidden="true"><label>Company website<input name="company" tabIndex={-1} autoComplete="off"/></label></div><button type="submit" className="button" disabled={pending}>{pending ? "Joining…" : "Subscribe"}<Icon name="arrow-right" size={17}/></button><p className={`reader-status reader-status-${state.status}`} aria-live="polite">{state.message}</p></form></section>;
}

export function ArticleBody({ html, url, title }: { html: string; url: string; title: string }) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const [quote, setQuote] = useState("");
  const [position, setPosition] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const body = bodyRef.current;
    if (!body) return;
    const codeButtons: HTMLButtonElement[] = [];
    body.querySelectorAll("pre").forEach((block) => {
      const code = block.querySelector("code");
      if (!code) return;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "prose-copy-button";
      button.textContent = "Copy";
      button.setAttribute("aria-label", "Copy code block");
      const onCopy = async () => {
        try { await navigator.clipboard.writeText(code.textContent || ""); button.textContent = "Copied"; }
        catch { button.textContent = "Select and copy"; }
        window.setTimeout(() => { button.textContent = "Copy"; }, 1600);
      };
      button.addEventListener("click", onCopy);
      block.append(button);
      codeButtons.push(button);
    });
    const onSelection = () => {
      const selection = window.getSelection();
      const text = selection?.toString().trim() || "";
      const anchor = selection?.anchorNode;
      if (text.length < 8 || !anchor || !body.contains(anchor)) { setQuote(""); return; }
      const rect = selection?.getRangeAt(0).getBoundingClientRect();
      if (!rect) return;
      setQuote(text.slice(0, 500));
      setPosition({ x: Math.max(12, Math.min(window.innerWidth - 140, rect.left + rect.width / 2 - 70)), y: Math.max(12, rect.top - 48) });
    };
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") setQuote(""); };
    document.addEventListener("selectionchange", onSelection);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("selectionchange", onSelection);
      document.removeEventListener("keydown", onKey);
      codeButtons.forEach((button) => button.remove());
    };
  }, []);
  const shareQuote = () => {
    const text = `“${quote}” — ${title}\n${url}`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
    setQuote("");
  };
  return <>
    <article className="prose" ref={bodyRef} dangerouslySetInnerHTML={{ __html: html }}/>
    {quote && <button type="button" className="share-quote-button" style={{ left: position.x, top: position.y }} onMouseDown={(event) => event.preventDefault()} onClick={shareQuote}>Share quote</button>}
  </>;
}

export function ArticleAudience({ slug, comments }: { slug: string; comments: PublicBlogComment[] }) {
  const [subscribeState, subscribeAction, subscribePending] = useActionState(subscribeToBlog, initialActionState);
  const [commentState, commentAction, commentPending] = useActionState(submitBlogComment, initialActionState);
  return <div className="article-audience">
    <section className="reader-card subscribe-card"><span className="page-kicker">Occasional notes</span><h2>New writing, when it’s ready.</h2><p>One short email when there’s something worth sharing. Unsubscribe any time.</p>
      <form action={subscribeAction} className="reader-form"><label>Email address<input type="email" name="email" autoComplete="email" required maxLength={160}/></label><label className="reader-consent"><input type="checkbox" name="consent" required/><span>I agree to receive occasional writing updates from Shivam.</span></label><div className="reader-honeypot" aria-hidden="true"><label>Company website<input name="company" tabIndex={-1} autoComplete="off"/></label></div><button type="submit" className="button" disabled={subscribePending}>{subscribePending ? "Joining…" : "Subscribe"}<Icon name="arrow-right" size={17}/></button><p className={`reader-status reader-status-${subscribeState.status}`} aria-live="polite">{subscribeState.message}</p></form>
    </section>
    <section className="reader-card discussion-card"><span className="page-kicker">Discussion</span><h2>A thoughtful reply?</h2><p>Comments appear after review. Please keep it kind and useful.</p>
      {comments.length > 0 ? <ul className="approved-comments">{comments.map((comment) => <li key={comment.id}><strong>{comment.name}</strong><p>{comment.body}</p><time dateTime={comment.createdAt}>{new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(new Date(comment.createdAt))}</time></li>)}</ul> : <p className="no-comments">No replies yet.</p>}
      <form action={commentAction} className="reader-form"><input type="hidden" name="slug" value={slug}/><label>Your name<input name="name" autoComplete="name" required minLength={2} maxLength={60}/></label><label>Your comment<textarea name="body" required minLength={10} maxLength={2000} rows={4}/></label><div className="reader-honeypot" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off"/></label></div><button type="submit" className="button button-secondary" disabled={commentPending}>{commentPending ? "Sending…" : "Send for review"}<Icon name="send" size={16}/></button><p className={`reader-status reader-status-${commentState.status}`} aria-live="polite">{commentState.message}</p></form>
    </section>
  </div>;
}
