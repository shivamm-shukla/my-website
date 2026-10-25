"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/icon";

export function MotionToggle({ compact = false }: { compact?: boolean }) {
  const [paused, setPaused] = useState(false);
  const [system, setSystem] = useState(false);
  useEffect(() => {
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => { setSystem(preference.matches); setPaused(document.documentElement.dataset.motion === "paused"); };
    const storage = (event: StorageEvent) => {
      if (event.key === "shivam-motion" || event.key === null) {
        document.documentElement.dataset.motion = event.newValue === "paused" ? "paused" : "auto";
        window.dispatchEvent(new Event("site:motion"));
      }
    };
    sync();
    preference.addEventListener("change", sync);
    window.addEventListener("site:motion", sync);
    window.addEventListener("storage", storage);
    return () => { preference.removeEventListener("change", sync); window.removeEventListener("site:motion", sync); window.removeEventListener("storage", storage); };
  }, []);
  const stopped = system || paused;
  return <button type="button" className={`motion-toggle ${compact ? "motion-compact" : ""}`} data-motion-toggle
    aria-label={system ? "Animations paused by your system setting" : paused ? "Resume animations" : "Pause animations"}
    aria-pressed={stopped} disabled={system} onClick={() => {
      const next = paused ? "auto" : "paused";
      document.documentElement.dataset.motion = next;
      try { localStorage.setItem("shivam-motion", next); } catch { /* The current visit still respects the choice. */ }
      window.dispatchEvent(new Event("site:motion"));
    }}><Icon name="sparkles" size={15} /><span>{stopped ? "Motion off" : "Pause motion"}</span></button>;
}
