"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Dialog } from "@/components/ui/dialog";
import { Icon } from "@/components/ui/icon";
import { MotionToggle } from "@/components/motion-toggle";
import { Robot } from "./robot";
import { attachRoaming } from "@/lib/robot/motion.mjs";
import { quickAnswers as answers } from "@/content/assistant";

export default function AssistantWidget({ initiallyOpen = false }: { initiallyOpen?: boolean }) {
  const [open, setOpen] = useState(initiallyOpen);
  const [answer, setAnswer] = useState<number | null>(null);
  const [question, setQuestion] = useState("");
  const [liveAnswer, setLiveAnswer] = useState("");
  const [asking, setAsking] = useState(false);
  const [bubble, setBubble] = useState<string | null>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const openRef = useRef(open);
  const answerRegion = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const bubbleId = useId();
  const pathname = usePathname();
  const router = useRouter();
  const lastPath = useRef(pathname);
  openRef.current = open;

  useEffect(() => {
    const theme = (event: Event) => {
      setBubble((event as CustomEvent<string>).detail === "dark" ? "Raat ho gayi." : "Subah ho gayi. Hello, sunshine!");
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setBubble(null), 3200);
    };
    const show = () => { setBubble(null); setOpen(true); };
    window.addEventListener("site:theme", theme);
    window.addEventListener("site:assistant", show);
    const pinState = (event: Event) => setBubble((event as CustomEvent<boolean>).detail ? "Pinned here. Tap me to let me roam again." : "Free to roam again.");
    window.addEventListener("site:robot-pin-state", pinState);
    return () => {
      window.removeEventListener("site:theme", theme);
      window.removeEventListener("site:assistant", show);
      window.removeEventListener("site:robot-pin-state", pinState);
      clearTimeout(timer.current);
    };
  }, []);

  useEffect(() => {
    if (lastPath.current === pathname) return;
    lastPath.current = pathname;
    setOpen(false);
    window.dispatchEvent(new Event("site:route"));
    setBubble(pathname.includes("work") ? "Have you seen Thravia?" : pathname.includes("blog") ? "Grab something to read." : pathname.includes("contact") ? "Got an idea? You’re in the right place." : null);
  }, [pathname]);

  useLayoutEffect(() => {
    if (trigger.current) return attachRoaming(trigger.current, { isOpen: () => openRef.current });
  }, []);

  useEffect(() => {
    if (answer !== null) answerRegion.current?.scrollIntoView({ block: "nearest", behavior: "instant" });
  }, [answer]);

  const greeting = pathname.includes("work") ? "Have you seen Thravia?" : pathname.includes("blog") ? "Grab something to read." : pathname.includes("contact") ? "Got an idea? You’re in the right place." : "Psst. I can show you around.";

  async function ask(event: React.FormEvent) {
    event.preventDefault(); const clean = question.trim(); if (!clean || asking) return;
    setAnswer(null); setLiveAnswer(""); setAsking(true);
    const lower = clean.toLowerCase();
    const intent = lower.match(/thravia|brg[ -]?cli|jeetlo/);
    if (intent) { const name = intent[0].replace("brg cli", "brg-cli").replace("brgcli", "brg-cli"); setLiveAnswer(`Here’s ${name}: a confirmed project by Shivam.`); setAsking(false); router.push(`/work/${name}`); return; }
    if (/hire|contact|quote|freelance/.test(lower)) { setAsking(false); router.push("/contact"); return; }
    if (/resume|cv/.test(lower)) { setAsking(false); router.push("/resume"); return; }
    if (/about|story|journey/.test(lower)) { setAsking(false); router.push("/about"); return; }
    if (/dark|light|theme|raat|subah/.test(lower)) { document.querySelector<HTMLButtonElement>(".theme-toggle")?.click(); setLiveAnswer("I changed the page theme."); setAsking(false); return; }
    if (/pin|stay|stop/.test(lower)) { window.dispatchEvent(new CustomEvent("site:robot-pin", { detail: true })); setLiveAnswer("I’ll stay right here. Tap me when you want me to roam again."); setAsking(false); return; }
    if (/roam|free/.test(lower)) { window.dispatchEvent(new CustomEvent("site:robot-pin", { detail: false })); setLiveAnswer("Back to wandering around."); setAsking(false); return; }
    if (/latest post|blog|article|read/.test(lower)) { setAsking(false); router.push("/blog"); return; }
    if (/listen|aloud/.test(lower)) { [...document.querySelectorAll<HTMLButtonElement>(".article-toolbar button")].find((button) => button.textContent?.includes("Listen"))?.click(); setLiveAnswer("I started the article read aloud."); setAsking(false); return; }
    if (/share|story/.test(lower)) {
      const title = document.querySelector(".article-header-copy h1")?.textContent;
      if (title) window.dispatchEvent(new CustomEvent("share:open", { detail: { kind: "blog", title, description: document.querySelector(".article-header-copy > p")?.textContent || "A note from Shivam Shukla.", path: pathname, url: window.location.href } }));
      setLiveAnswer(title ? "The article share card is ready." : "Open an article first and I can make a share card for it."); setAsking(false); return;
    }
    try {
      const response = await fetch("/api/chat", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ messages: [{ role: "user", content: clean }] }) });
      if (!response.ok || !response.body) throw new Error();
      const reader = response.body.getReader(); const decoder = new TextDecoder();
      while (true) { const { done, value } = await reader.read(); if (done) break; setLiveAnswer((current) => current + decoder.decode(value, { stream: true })); }
    } catch { setLiveAnswer("The live guide is resting right now. Try one of the quick questions below, or send Shivam a note on the Contact page."); }
    finally { setAsking(false); }
  }

  return <>
    <button ref={trigger} className="assistant-launcher" type="button" data-state="idle"
      aria-label="Open Shivam’s assistant" aria-haspopup="dialog" aria-expanded={open}
      aria-describedby={bubble && !open ? bubbleId : undefined}
      onClick={() => { setBubble(null); setOpen(true); }}
      onPointerEnter={() => setBubble(greeting)} onPointerLeave={() => setBubble(null)}
      onFocus={() => setBubble(greeting)} onBlur={() => setBubble(null)}>
      <Robot pose="wave" follow />
      {bubble && !open && <span id={bubbleId} className="assistant-bubble" role="tooltip">{bubble}</span>}
    </button>
    <Dialog open={open} onClose={() => setOpen(false)} title="Meet my little sidekick." className="assistant-dialog">
      <div className="assistant-intro"><Robot pose={answer === null ? "wave" : "think"} /><div><p>Hi, curious human.</p><span>I know a little about Shivam.<br />What would you like to know?</span><button type="button" className="assistant-pin-toggle" onClick={() => window.dispatchEvent(new CustomEvent("site:robot-pin"))}>{trigger.current?.dataset.pinned === "true" ? "Let me roam" : "Pin me here"}</button></div></div>
      <div className="assistant-quick-actions" aria-label="Quick actions">{["Projects", "Latest post", "Read aloud", "Hire Shivam", "Switch theme"].map((label) => <button key={label} type="button" onClick={() => { setQuestion(label); if (label === "Projects") router.push("/work"); else if (label === "Latest post") router.push("/blog"); else if (label === "Hire Shivam") router.push("/contact"); else if (label === "Switch theme") document.querySelector<HTMLButtonElement>(".theme-toggle")?.click(); else [...document.querySelectorAll<HTMLButtonElement>(".article-toolbar button")].find((button) => button.textContent?.includes("Listen"))?.click(); }}>{label}</button>)}</div>
      <form className="assistant-form" onSubmit={ask}><label htmlFor="assistant-question">Ask in English, Hindi, or Hinglish</label><div><input id="assistant-question" value={question} onChange={(event) => setQuestion(event.target.value.slice(0, 1000))} placeholder="Shivam kya build kar raha hai?" autoComplete="off" /><button type="submit" aria-label="Send question" disabled={asking || !question.trim()}><Icon name="send" size={17} /></button></div></form>
      <div className="assistant-choices" aria-label="Quick questions">{answers.map((item, index) =>
        <button type="button" key={item.question} data-dialog-autofocus={index === 0 ? true : undefined}
          aria-pressed={answer === index} onClick={() => { setLiveAnswer(""); setAnswer(index); }}>
          {item.question}<Icon name="arrow-up-right" size={16} />
        </button>)}
      </div>
      <div ref={answerRegion} className="assistant-answer-region" aria-live="polite" aria-atomic="true">
        {(liveAnswer || asking) && <div className="assistant-answer"><p>{liveAnswer || "Thinking…"}</p>{!asking && <Link className="assistant-answer-link" href="/contact" onClick={() => setOpen(false)}>Contact Shivam<Icon name="arrow-up-right" size={16} /></Link>}</div>}
        {!liveAnswer && answer !== null && <div className="assistant-answer"><p>{answers[answer].answer}</p><Link className="assistant-answer-link" href={answers[answer].href} onClick={() => setOpen(false)}>{answers[answer].link}<Icon name="arrow-up-right" size={16} /></Link></div>}
      </div>
      <div className="assistant-bottom"><span><Icon name="lock" size={13} />Nothing you ask is saved.</span><MotionToggle compact /></div>
      <p className="assistant-privacy">Questions are used only to generate this reply and are not stored by the site.</p>
    </Dialog>
  </>;
}
