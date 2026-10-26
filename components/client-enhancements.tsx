"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { ShareDesigner } from "@/components/sections/share-designer";

const AssistantWidget = dynamic(() => import("@/components/robot/assistant-widget"), { ssr: false });

export function ClientEnhancements() {
  const [ready, setReady] = useState(false);
  const [initiallyOpen, setInitiallyOpen] = useState(false);
  useEffect(() => {
    if (ready) return;
    const timer = window.setTimeout(() => setReady(true), 900);
    const openEarly = () => { setInitiallyOpen(true); setReady(true); };
    window.addEventListener("site:assistant", openEarly);
    return () => { clearTimeout(timer); window.removeEventListener("site:assistant", openEarly); };
  }, [ready]);
  useEffect(() => {
    const visibility = () => document.documentElement.classList.toggle("tab-hidden", document.hidden);
    visibility();
    document.addEventListener("visibilitychange", visibility);
    return () => document.removeEventListener("visibilitychange", visibility);
  }, []);
  return <><ShareDesigner />{ready ? <AssistantWidget initiallyOpen={initiallyOpen} /> : null}</>;
}
