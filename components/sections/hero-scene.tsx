"use client";

import { useEffect, useRef } from "react";
import { Icon } from "@/components/ui/icon";

type OrbitSpec = { key: string; rx: number; ry: number; speed: number; phase: number; tilt: number; className: string };

const orbitSpecs: OrbitSpec[] = [
  { key: "code", rx: .47, ry: .36, speed: 38, phase: 3.6, tilt: -10, className: "orbit-code" },
  { key: "heart", rx: .47, ry: .36, speed: 38, phase: .5, tilt: -10, className: "orbit-heart" },
  { key: "plant", rx: .43, ry: .3, speed: -30, phase: 5.2, tilt: 8, className: "orbit-plant" },
  { key: "wave", rx: .4, ry: .33, speed: -30, phase: 2.2, tilt: 8, className: "orbit-wave" },
  { key: "glow", rx: .35, ry: .42, speed: 52, phase: 1.4, tilt: 0, className: "orbit-glow" },
  { key: "terminal", rx: .49, ry: .26, speed: 26, phase: 4.6, tilt: -18, className: "orbit-terminal" },
  { key: "branch", rx: .38, ry: .22, speed: -44, phase: .9, tilt: 14, className: "orbit-branch" },
  { key: "chat", rx: .45, ry: .4, speed: 34, phase: 2.9, tilt: 20, className: "orbit-chat" },
];

function Laptop() {
  const rows = [218, 225, 232].map((y) => {
    const left = 30 - 22 * ((y - 214) / 48) + 14;
    const right = 370 + 22 * ((y - 214) / 48) - 14;
    const keyWidth = (right - left - 13 * 2) / 14;
    return Array.from({ length: 14 }, (_, index) => ({ x: left + index * (keyWidth + 2), y, width: keyWidth }));
  }).flat();
  const bottomLeft = 30 - 22 * ((239 - 214) / 48) + 14;
  const bottomRight = 370 + 22 * ((239 - 214) / 48) - 14;
  const bottomWidth = bottomRight - bottomLeft;
  const bottomKeys = [[0, .08], [.09, .17], [.18, .26], [.28, .72], [.74, .82], [.83, .91], [.92, 1]];
  const codeLines = [[0, 70, "#5ac8ff"], [12, 120, "#8a8f9c"], [12, 96, "#30d158"], [24, 140, "#bf5af2"], [24, 84, "#ff9f0a"], [12, 60, "#8a8f9c"], [0, 40, "#5ac8ff"], [0, 110, "#ff6fa8"], [12, 130, "#30d158"], [12, 70, "#bf5af2"]] as const;
  const sidebarLines = [26, 34, 22, 30, 28, 36, 24];

  return <svg className="hero-laptop" viewBox="0 0 400 290" role="img" aria-label="A laptop with a code editor open">
    <defs>
      <linearGradient id="laptop-lid" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#4a4d57"/><stop offset="1" stopColor="#1c1e24"/></linearGradient>
      <linearGradient id="laptop-deck" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f4f6fb"/><stop offset="1" stopColor="#bcc2d0"/></linearGradient>
      <linearGradient id="laptop-hinge" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#9096a3"/><stop offset="1" stopColor="#40444f"/></linearGradient>
      <linearGradient id="laptop-trackpad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#d9dde8"/><stop offset="1" stopColor="#c2c8d6"/></linearGradient>
      <linearGradient id="laptop-glare" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#fff" stopOpacity=".16"/><stop offset="1" stopColor="#fff" stopOpacity="0"/></linearGradient>
      <clipPath id="laptop-screen"><rect x="64" y="30" width="272" height="166" rx="6"/></clipPath>
      <filter id="laptop-shadow" x="-20%" y="-200%" width="140%" height="500%"><feGaussianBlur stdDeviation="6"/></filter>
    </defs>
    <ellipse cx="200" cy="277" rx="176" ry="8" fill="#140a3c" opacity=".4" filter="url(#laptop-shadow)"/>
    <rect x="50" y="16" width="300" height="194" rx="15" fill="url(#laptop-lid)" stroke="#5a5e6a"/>
    <circle cx="200" cy="21" r="1.8" fill="#2f333d"/><rect x="60" y="26" width="280" height="174" rx="9" fill="#06080c"/>
    <g clipPath="url(#laptop-screen)">
      <rect x="64" y="30" width="272" height="166" fill="#0f1320"/><rect x="64" y="30" width="272" height="16" fill="#171b28"/>
      <circle cx="74" cy="38" r="2.6" fill="#ff5f57"/><circle cx="84" cy="38" r="2.6" fill="#febc2e"/><circle cx="94" cy="38" r="2.6" fill="#28c840"/><rect x="108" y="33" width="52" height="10" rx="3" fill="#232838"/>
      <rect x="64" y="46" width="44" height="150" fill="#131724"/>
      {sidebarLines.map((width, index) => <rect key={`side-${index}`} x="72" y={58 + index * 12} width={width} height="4" rx="2" fill={index === 2 ? "#5ac8ff" : "#343a4d"}/>)}
      <rect x="110" y="84" width="226" height="13" fill="#fff" opacity=".05"/>
      {codeLines.map(([indent, width, fill], index) => <g key={`code-${index}`} className="hero-code-line" style={{ animationDelay: `${index * .35}s` }}>
        <rect x="116" y={61 + index * 13} width="6" height="4" rx="2" fill="#4b5060"/><rect x={130 + indent} y={60 + index * 13} width={width} height="6" rx="3" fill={fill}/>
      </g>)}
      <rect className="hero-cursor" x="246" y="86" width="2" height="9" fill="#fff"/><rect x="64" y="188" width="272" height="8" fill="#0a84ff" opacity=".9"/>
      <polygon className="hero-screen-glare" points="64,30 170,30 112,196 64,196" fill="url(#laptop-glare)"/>
    </g>
    <rect x="34" y="208" width="332" height="7" rx="3" fill="url(#laptop-hinge)"/>
    <path d="M30 214H370L392 262H8Z" fill="url(#laptop-deck)" stroke="#c9cedb" strokeWidth="4" strokeLinejoin="round"/>
    <path d="M8 262H392L388 268Q386 271 380 271H20Q14 271 12 268Z" fill="#aeb3c0"/><rect x="172" y="262" width="56" height="3" rx="1.5" fill="#8f95a3"/>
    <g fill="#2b2e38">{rows.map((key, index) => <rect key={`key-${index}`} x={key.x} y={key.y} width={key.width} height="5.4" rx="1.4"/>)}
      {bottomKeys.map(([start, end], index) => <rect key={`bottom-${index}`} x={bottomLeft + bottomWidth * start} y="239" width={bottomWidth * (end - start)} height="5.4" rx="1.4"/>)}
    </g>
    <rect x="150" y="248" width="100" height="11" rx="3" fill="url(#laptop-trackpad)" stroke="#aab0bf" strokeWidth=".8"/>
  </svg>;
}

function OrbitArt({ name }: { name: string }) {
  switch (name) {
    case "code": return <span className="orbit-code-label">&lt;/&gt;</span>;
    case "heart": return <Icon name="heart" size={24} className="orbit-heart-icon"/>;
    case "plant": return <svg viewBox="0 0 60 70" aria-hidden="true"><path d="M30 40C30 28 22 22 12 24 14 36 20 40 30 40Z" fill="#30d158"/><path d="M30 40C30 26 38 18 50 20 48 34 40 40 30 40Z" fill="#22b84c"/><path d="M30 40C26 28 28 14 30 6 34 16 36 28 30 40Z" fill="#ffd60a"/><path d="M14 42h32l-4 24H18Z" fill="#ff8a4c"/><rect x="12" y="38" width="36" height="7" rx="3" fill="#ff7a35"/></svg>;
    case "wave": return <svg viewBox="0 0 80 36" aria-hidden="true"><path d="M4 20C12 4 20 4 28 18s16 14 24-4 16-8 24 6" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round"/></svg>;
    case "glow": return <span className="orbit-glow-core"/>;
    case "terminal": return <span className="orbit-terminal-label">&gt;_</span>;
    case "branch": return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="7" cy="6" r="2.5"/><circle cx="7" cy="18" r="2.5"/><circle cx="17" cy="8" r="2.5"/><path d="M7 8.5v7M17 10.5c0 4-6 3-9.5 6"/></svg>;
    default: return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>;
  }
}

export function HeroScene() {
  const sceneRef = useRef<HTMLDivElement>(null);
  const pointer = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visible = true;
    let frame = 0;
    let lastTime = 0;
    let currentX = 0;
    let currentY = 0;
    const onPointerMove = (event: PointerEvent) => {
      const rect = scene.getBoundingClientRect();
      pointer.current = { x: ((event.clientX - rect.left) / rect.width) * 2 - 1, y: ((event.clientY - rect.top) / rect.height) * 2 - 1 };
    };
    const onPointerLeave = () => { pointer.current = { x: 0, y: 0 }; };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; });
    observer.observe(scene);
    scene.addEventListener("pointermove", onPointerMove, { passive: true });
    scene.addEventListener("pointerleave", onPointerLeave, { passive: true });

    const animate = (time: number) => {
      frame = requestAnimationFrame(animate);
      if (!visible || document.hidden || prefersReduced.matches) return;
      const elapsed = Math.min(40, time - (lastTime || time));
      lastTime = time;
      currentX += (pointer.current.x - currentX) * .06;
      currentY += (pointer.current.y - currentY) * .06;
      const laptop = scene.querySelector<SVGSVGElement>(".hero-laptop");
      const circle = scene.querySelector<HTMLElement>(".hero-scene-circle");
      if (laptop) laptop.style.transform = `perspective(900px) rotateY(${currentX * 7}deg) rotateX(${-currentY * 4}deg)`;
      if (circle) circle.style.transform = `translate(${currentX * -10}px, ${currentY * -8}px)`;
      const width = scene.clientWidth;
      const height = scene.clientHeight;
      const seconds = time / 1000;
      scene.querySelectorAll<HTMLElement>(".hero-orbit-item").forEach((element) => {
        const spec = orbitSpecs.find((item) => item.key === element.dataset.orbit);
        if (!spec) return;
        const angle = seconds * spec.speed * .005 + spec.phase;
        const orbitX = Math.cos(angle) * spec.rx * width;
        const orbitY = Math.sin(angle) * spec.ry * height;
        const tilt = spec.tilt * Math.PI / 180;
        const x = orbitX * Math.cos(tilt) - orbitY * Math.sin(tilt);
        const y = orbitX * Math.sin(tilt) + orbitY * Math.cos(tilt);
        const depth = Math.sin(angle);
        const bob = Math.sin(seconds * 1.7 + spec.phase) * 5;
        element.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y + bob}px)) scale(${.9 + .14 * depth}) rotate(${depth * 8}deg)`;
        element.style.zIndex = depth > 0 ? "4" : "1";
      });
      if (elapsed === 0) lastTime = time;
    };
    frame = requestAnimationFrame(animate);
    const onVisibility = () => { if (!document.hidden && visible && !prefersReduced.matches) lastTime = 0; };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      scene.removeEventListener("pointermove", onPointerMove);
      scene.removeEventListener("pointerleave", onPointerLeave);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return <div className="hero-art" aria-hidden="true">
    <div className="hero-scene" ref={sceneRef}>
      <div className="hero-scene-circle"/>
      {orbitSpecs.map((spec) => <div key={spec.key} className={`hero-orbit-item ${spec.className}`} data-orbit={spec.key}><OrbitArt name={spec.key}/></div>)}
      <div className="hero-laptop-wrap"><Laptop/></div>
    </div>
  </div>;
}
