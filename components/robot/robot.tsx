"use client";

import { useEffect, useId, useRef } from "react";
import { attachEyes } from "@/lib/robot/motion.mjs";

export type RobotPose = "wave" | "rest" | "think" | "type" | "thumbs-up";

export function Robot({ className = "", pose = "wave", follow = false }: { className?: string; pose?: RobotPose; follow?: boolean }) {
  const id = useId().replace(/:/g, "");
  const svg = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (svg.current) return attachEyes(svg.current);
  }, [follow]);

  return <svg ref={svg} className={`robot-art ${className}`} viewBox="0 0 240 290" fill="none" aria-hidden="true" focusable="false" data-follow={follow ? "true" : undefined} data-pose={pose}>
    <defs>
      <linearGradient id={`${id}-shell`} x1="70" y1="52" x2="191" y2="186" gradientUnits="userSpaceOnUse"><stop stopColor="var(--robot-white)" /><stop offset=".44" stopColor="var(--robot-shell)" /><stop offset="1" stopColor="var(--robot-edge)" /></linearGradient>
      <linearGradient id={`${id}-face`} x1="74" y1="88" x2="169" y2="164" gradientUnits="userSpaceOnUse"><stop stopColor="var(--robot-visor-light)" /><stop offset="1" stopColor="var(--robot-visor)" /></linearGradient>
      <linearGradient id={`${id}-body`} x1="90" y1="179" x2="154" y2="268" gradientUnits="userSpaceOnUse"><stop stopColor="var(--robot-lilac-light)" /><stop offset=".57" stopColor="var(--robot-lilac)" /><stop offset=".72" stopColor="var(--robot-peach)" /><stop offset="1" stopColor="var(--robot-orange)" /></linearGradient>
      <linearGradient id={`${id}-antenna`} x1="112" y1="14" x2="128" y2="33" gradientUnits="userSpaceOnUse"><stop stopColor="var(--robot-white)" /><stop offset=".5" stopColor="var(--robot-eye)" /><stop offset="1" stopColor="var(--robot-blue)" /></linearGradient>
      <radialGradient id={`${id}-glow`}><stop stopColor="var(--robot-eye)" stopOpacity=".5" /><stop offset="1" stopColor="var(--robot-eye)" stopOpacity="0" /></radialGradient>
      <radialGradient id={`${id}-shine`} cx=".32" cy=".13" r=".9"><stop stopColor="var(--robot-white)" stopOpacity=".8" /><stop offset=".5" stopColor="var(--robot-white)" stopOpacity="0" /><stop offset="1" stopColor="var(--robot-lilac)" stopOpacity=".35" /></radialGradient>
      <radialGradient id={`${id}-visor-shine`} cx=".3" cy="0" r="1"><stop stopColor="var(--robot-white)" stopOpacity=".32" /><stop offset=".65" stopColor="var(--robot-white)" stopOpacity="0" /></radialGradient>
    </defs>
    <ellipse className="robot-shadow" cx="120" cy="278" rx="52" ry="7" fill="var(--robot-shadow)" opacity=".12" />
    <g className="robot-float">
      <path d="M118 33v25" stroke="var(--robot-edge)" strokeWidth="8" strokeLinecap="round" />
      <circle cx="118" cy="24" r="17" fill={`url(#${id}-glow)`} /><circle cx="118" cy="24" r="9" fill={`url(#${id}-antenna)`} /><circle cx="115" cy="20" r="3" fill="var(--robot-white)" opacity=".8" />
      <rect x="76" y="173" width="91" height="90" rx="43" fill={`url(#${id}-body)`} />
      <path d="M84 186c7-7 18-10 29-9" stroke="var(--robot-white)" strokeWidth="4" strokeLinecap="round" opacity=".5" />
      <circle cx="122" cy="213" r="11" fill="var(--robot-lilac-shadow)" opacity=".35" /><circle cx="121" cy="211" r="8" fill="var(--robot-blue)" /><circle cx="119" cy="208" r="2.5" fill="var(--robot-white)" opacity=".65" />
      {pose === "thumbs-up" ? <path d="M45 202c-4-8-1-21 6-26l4-18c2-8 10-6 10 2v17c13-1 16 9 11 23-4 12-24 13-31 2Z" fill={`url(#${id}-shell)`} /> : <ellipse cx="59" cy="206" rx="15" ry="28" transform="rotate(21 59 206)" fill={`url(#${id}-shell)`} />}
      <g className={pose === "wave" ? "robot-hand-wave" : undefined} style={{ transformOrigin: "178px 180px" }}>
        {pose === "wave" ? <><ellipse cx="184" cy="156" rx="15" ry="29" transform="rotate(32 184 156)" fill={`url(#${id}-shell)`} /><path d="m191 119 4-10m6 16 9-5" stroke="var(--robot-blue)" strokeWidth="3" strokeLinecap="round" opacity=".65" /></> : <ellipse cx="184" cy={pose === "think" ? "180" : "206"} rx="15" ry="27" transform={pose === "think" ? "rotate(-28 184 180)" : "rotate(-20 184 206)"} fill={`url(#${id}-shell)`} />}
      </g>
      <rect x="36" y="53" width="170" height="132" rx="61" fill="var(--robot-edge)" />
      <rect x="35" y="49" width="168" height="130" rx="61" fill={`url(#${id}-shell)`} />
      <rect x="35" y="49" width="168" height="130" rx="61" fill={`url(#${id}-shine)`} />
      <path d="M60 74c13-15 30-19 50-18" stroke="var(--robot-white)" strokeWidth="7" strokeLinecap="round" opacity=".7" />
      <rect x="52" y="81" width="135" height="83" rx="37" fill="var(--robot-visor-border)" />
      <rect x="56" y="83" width="127" height="76" rx="34" fill={`url(#${id}-face)`} />
      <rect x="57" y="84" width="125" height="74" rx="33" fill={`url(#${id}-visor-shine)`} />
      <path d="M68 102c4-9 12-12 24-12" stroke="var(--robot-white)" strokeWidth="3" strokeLinecap="round" opacity=".11" />
      <g className="robot-eyes"><g className="robot-blink"><ellipse cx="96" cy="114" rx="9" ry="13" fill="var(--robot-eye)" /><ellipse cx="144" cy="114" rx="9" ry="13" fill="var(--robot-eye)" /><ellipse cx="94" cy="109" rx="3" ry="5" fill="var(--robot-eye-light)" opacity=".7" /><ellipse cx="142" cy="109" rx="3" ry="5" fill="var(--robot-eye-light)" opacity=".7" /></g><path d="M110 136q10 11 20 0" stroke="var(--robot-eye)" strokeWidth="3" strokeLinecap="round" /></g>
      <ellipse cx="78" cy="135" rx="7" ry="4" fill="var(--robot-cheek)" opacity=".85" /><ellipse cx="162" cy="135" rx="7" ry="4" fill="var(--robot-cheek)" opacity=".85" />
      {pose === "type" && <g className="robot-laptop"><path d="m76 231 25-50h91l-19 63H85Z" fill="var(--robot-lilac)" stroke="var(--robot-white)" strokeWidth="2" /><path d="m55 236 117 8 15-5-99-14Z" fill="var(--robot-edge)" /><path d="m101 182-17 53 87 7 18-60Z" fill={`url(#${id}-shell)`} /><ellipse cx="138" cy="208" rx="6" ry="8" transform="rotate(15 138 208)" fill="var(--robot-cheek)" /></g>}
      {pose === "think" && <g className="robot-idea"><circle cx="186" cy="187" r="25" fill="var(--yellow)" /><path d="M179 209v-20c-9-13-10 3 1 0m12 20v-20c10-13 10 3-1 0" stroke="var(--robot-white)" strokeWidth="2.5" strokeLinecap="round" /><rect x="175" y="208" width="22" height="15" rx="6" fill="var(--robot-lilac)" /><path d="m177 213 17 2m-17 3 14 2" stroke="var(--robot-lilac-shadow)" strokeWidth="2" strokeLinecap="round" /></g>}
    </g>
  </svg>;
}
