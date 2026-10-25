"use client";

import Link from "next/link";
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
  const [bubble, setBubble] = useState<string | null>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const openRef = useRef(open);
  const answerRegion = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const bubbleId = useId();
  const pathname = usePathname();
  openRef.current = open;

  useEffect(() => {
    const theme = (event: Event) => {
      setBubble((event as CustomEvent<string>).detail === "dark" ? "Raat ho gayi. ✨" : "Subah ho gayi. Hello, sunshine!");
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setBubble(null), 3200);
    };
    const show = () => { setBubble(null); setOpen(true); };
    window.addEventListener("site:theme", theme);
    window.addEventListener("site:assistant", show);
    return () => {
      window.removeEventListener("site:theme", theme);
      window.removeEventListener("site:assistant", show);
      clearTimeout(timer.current);
    };
  }, []);

  useLayoutEffect(() => {
    if (trigger.current) return attachRoaming(trigger.current, { isOpen: () => openRef.current });
  }, []);

  useEffect(() => {
    if (answer !== null) answerRegion.current?.scrollIntoView({ block: "nearest", behavior: "instant" });
  }, [answer]);

  const greeting = pathname.includes("work") ? "Have you seen Thravia?" : pathname.includes("blog") ? "Grab something to read." : pathname.includes("contact") ? "Got an idea? You’re in the right place." : "Psst. I can show you around.";

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
      <div className="assistant-intro"><Robot pose={answer === null ? "wave" : "think"} /><div><p>Hi, curious human.</p><span>I know a little about Shivam.<br />What would you like to know?</span></div></div>
      <div className="assistant-choices" aria-label="Things you can ask">{answers.map((item, index) =>
        <button type="button" key={item.question} data-dialog-autofocus={index === 0 ? true : undefined}
          aria-pressed={answer === index} onClick={() => setAnswer(index)}>
          {item.question}<Icon name="arrow-up-right" size={16} />
        </button>)}
      </div>
      <div ref={answerRegion} className="assistant-answer-region" aria-live="polite" aria-atomic="true">
        {answer !== null && <div className="assistant-answer"><p>{answers[answer].answer}</p><Link className="assistant-answer-link" href={answers[answer].href} onClick={() => setOpen(false)}>{answers[answer].link}<Icon name="arrow-up-right" size={16} /></Link></div>}
      </div>
      <div className="assistant-bottom"><span><Icon name="lock" size={13} />Nothing you ask is saved.</span><MotionToggle compact /></div>
      <p className="assistant-privacy">Profile answers for now. Free-form AI chat is coming in a later phase.</p>
    </Dialog>
  </>;
}
