"use client";

import Link from "next/link";
import { useState } from "react";
import { Robot, type RobotPose } from "@/components/robot/robot";
import { Icon } from "@/components/ui/icon";

export function HeroScene({ caption }: { caption: string }) {
  const [pose, setPose] = useState<RobotPose>("wave");
  const greet = () => window.dispatchEvent(new Event("site:assistant"));
  return <div className="hero-scene studio-scene">
    <div className="studio-orbit" aria-hidden="true" />
    <span className="studio-day" aria-hidden="true"><Icon name="sun" size={26} /></span>
    <span className="studio-night" aria-hidden="true"><Icon name="moon" size={26} /><i /><i /></span>
    <div className="studio-context" aria-hidden="true"><span className="studio-context-icon"><Icon name="heart" size={23} /></span><div><span>On my desk</span><strong>Thravia</strong><small>A little care, a little closer.</small></div></div>
    <div className="scene-robot"><Robot pose={pose} follow /></div>
    <button className="studio-greeting" type="button" onClick={greet} data-open-assistant><span>Meet my little sidekick.</span><span>Say hello <Icon name="arrow-up-right" size={14} /></span></button>
    <nav className="studio-dock" aria-label="Explore my desk">
      <Link className="dock-app dock-thravia" href="/work/thravia" aria-label="Explore Thravia" onPointerEnter={() => setPose("thumbs-up")} onFocus={() => setPose("thumbs-up")} onPointerLeave={() => setPose("wave")} onBlur={() => setPose("wave")}><Icon name="heart" size={27} /><span className="dock-tooltip">Thravia</span></Link>
      <Link className="dock-app dock-brg" href="/work/brg-cli" aria-label="Explore brg-cli" onPointerEnter={() => setPose("type")} onFocus={() => setPose("type")} onPointerLeave={() => setPose("wave")} onBlur={() => setPose("wave")}><Icon name="code" size={27} /><span className="dock-tooltip">brg-cli</span></Link>
      <Link className="dock-app dock-jeetlo" href="/work/jeetlo" aria-label="Explore Jeetlo" onPointerEnter={() => setPose("think")} onFocus={() => setPose("think")} onPointerLeave={() => setPose("wave")} onBlur={() => setPose("wave")}><span lang="hi" aria-hidden="true">अ</span><span className="dock-tooltip">Jeetlo</span></Link>
      <span className="dock-separator" aria-hidden="true" />
      <button className="dock-app dock-chat" type="button" aria-label="Ask Shivam’s sidekick" onClick={greet} data-open-assistant><Icon name="message" size={24} /><span className="dock-tooltip">Ask me</span></button>
    </nav>
    <p className="studio-caption">{caption}</p>
  </div>;
}
