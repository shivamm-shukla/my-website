"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { motionAllowed } from "@/lib/robot/motion.mjs";

type Theme = "light" | "dark";
const ThemeContext = createContext<{ theme: Theme; toggle: () => void }>({ theme: "light", toggle: () => {} });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  const applyTheme = useCallback((next: Theme) => {
    document.documentElement.classList.toggle("dark", next === "dark");
    document.documentElement.style.colorScheme = next;
    setTheme(next);
  }, []);

  useEffect(() => {
    const preference = matchMedia("(prefers-color-scheme: dark)");
    const sync = () => {
      let saved: string | null = null;
      try { saved = localStorage.getItem("shivam-theme"); } catch { /* System mode works when storage is unavailable. */ }
      applyTheme(saved === "light" || saved === "dark" ? saved : preference.matches ? "dark" : "light");
    };
    sync();
    preference.addEventListener("change", sync);
    window.addEventListener("storage", sync);
    return () => { preference.removeEventListener("change", sync); window.removeEventListener("storage", sync); };
  }, [applyTheme]);

  const toggle = useCallback(() => {
    const next = theme === "dark" ? "light" : "dark";
    try { localStorage.setItem("shivam-theme", next); } catch { /* Still change this visit's theme. */ }
    if (motionAllowed() && document.startViewTransition) {
      document.startViewTransition(() => applyTheme(next));
    } else {
      applyTheme(next);
    }
    window.dispatchEvent(new CustomEvent("site:theme", { detail: next }));
  }, [theme, applyTheme]);

  return <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>;
}

export function ThemeToggle() {
  const { theme, toggle } = useContext(ThemeContext);
  return <button type="button" className="icon-button theme-toggle" onClick={toggle} aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"} title="Change appearance"><span className="theme-moon"><Icon name="moon" size={19} /></span><span className="theme-sun"><Icon name="sun" size={19} /></span></button>;
}
