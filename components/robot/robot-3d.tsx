"use client";

import { useEffect, useRef } from "react";
import { Robot as RobotFallback } from "./robot";
import type { RobotSceneHandle } from "@/lib/robot/create-scene.mjs";

export function Robot({ className = "", pose = "wave", follow = false }: { className?: string; pose?: "wave" | "rest" | "think"; follow?: boolean }) {
  const host = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const element = host.current;
    if (!element) return;
    let cancelled = false, starting = false;
    let scene: RobotSceneHandle | undefined;
    let timer: ReturnType<typeof setTimeout>;
    const observer = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting || starting) return;
      starting = true;
      observer.disconnect();
      timer = setTimeout(async () => {
        try {
          const { createRobotScene } = await import("@/lib/robot/create-scene.mjs");
          if (!cancelled) scene = createRobotScene(element, { pose, follow });
        } catch { /* The SVG remains visible when WebGL is unavailable. */ }
      }, 500);
    }, { rootMargin: "80px" });
    observer.observe(element);
    return () => { cancelled = true; clearTimeout(timer); observer.disconnect(); scene?.dispose(); };
  }, [pose, follow]);
  return <span ref={host} className={`robot-container ${className}`} data-robot3d data-pose={pose} data-follow={follow ? "true" : "false"} aria-hidden="true"><RobotFallback pose={pose} /></span>;
}
