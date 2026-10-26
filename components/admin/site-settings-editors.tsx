"use client";

import { useState } from "react";
import type { HomeSection, SocialLink, SocialPlatform, TimelineEntry } from "@/lib/content/types";

const platforms: Array<{ id: SocialPlatform; label: string }> = [
  { id: "linkedin", label: "LinkedIn" }, { id: "twitter", label: "X" },
  { id: "instagram", label: "Instagram" }, { id: "whatsapp", label: "WhatsApp" },
  { id: "email", label: "Email" }, { id: "youtube", label: "YouTube" },
  { id: "github", label: "GitHub" }, { id: "website", label: "Website" },
];
const sectionNames: Record<HomeSection["type"], string> = {
  hero: "Hero", work: "Selected work", focus: "Current focus", journey: "Journey",
  posts: "Posts", writing: "Blog", hire: "Hire me",
};

export function SocialLinksEditor({ initial }: { initial: SocialLink[] }) {
  const [links, setLinks] = useState(initial);
  const update = (index: number, patch: Partial<SocialLink>) => setLinks((current) => current.map((link, i) => i === index ? { ...link, ...patch } : link));
  const add = (platform: SocialPlatform) => {
    if (links.some((link) => link.platform === platform)) return;
    setLinks((current) => [...current, { platform, label: platforms.find((item) => item.id === platform)?.label || platform, url: null }]);
  };
  const move = (index: number, delta: number) => setLinks((current) => {
    const next = [...current]; const target = index + delta;
    if (target < 0 || target >= next.length) return current;
    [next[index], next[target]] = [next[target], next[index]]; return next;
  });
  return <div className="site-settings-editor">
    <input type="hidden" name="social_links_json" value={JSON.stringify(links)} />
    <div className="admin-link-rows">{links.map((link, index) => <div className="admin-link-row" key={`${link.platform}-${index}`}>
      <label>Platform<select aria-label="Social platform" value={link.platform} onChange={(event) => update(index, { platform: event.target.value as SocialPlatform, label: platforms.find((item) => item.id === event.target.value)?.label || event.target.value })}>{platforms.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
      <label>Name<input aria-label="Social link name" value={link.label} maxLength={40} onChange={(event) => update(index, { label: event.target.value })}/></label>
      <label>Link<input aria-label={`${link.label} URL`} value={link.url || ""} maxLength={300} placeholder="https://…" onChange={(event) => update(index, { url: event.target.value || null })}/></label>
      <div className="admin-link-actions"><button type="button" aria-label={`Move ${link.label} up`} disabled={index === 0} onClick={() => move(index, -1)}>Up</button><button type="button" aria-label={`Move ${link.label} down`} disabled={index === links.length - 1} onClick={() => move(index, 1)}>Down</button><button type="button" aria-label={`Remove ${link.label}`} onClick={() => setLinks((current) => current.filter((_, i) => i !== index))}>Remove</button></div>
    </div>)}</div>
    <div className="admin-quick-add"><span>Quick add</span>{platforms.filter((item) => !links.some((link) => link.platform === item.id)).map((item) => <button key={item.id} type="button" onClick={() => add(item.id)}>{item.label}</button>)}</div>
  </div>;
}

export function HomeSectionsEditor({ initial }: { initial: HomeSection[] }) {
  const [sections, setSections] = useState(initial);
  const move = (index: number, delta: number) => setSections((current) => {
    const next = [...current]; const target = index + delta;
    if (target < 0 || target >= next.length) return current;
    [next[index], next[target]] = [next[target], next[index]]; return next;
  });
  return <div className="home-sections-editor">
    <input type="hidden" name="home_sections_json" value={JSON.stringify(sections)} />
    {sections.map((section, index) => <div className="home-section-row" key={section.id}>
      <label><input type="checkbox" checked={section.visible} onChange={(event) => setSections((current) => current.map((item, i) => i === index ? { ...item, visible: event.target.checked } : item))}/>{sectionNames[section.type]}</label>
      <div><button type="button" disabled={index === 0} aria-label={`Move ${sectionNames[section.type]} up`} onClick={() => move(index, -1)}>Move up</button><button type="button" disabled={index === sections.length - 1} aria-label={`Move ${sectionNames[section.type]} down`} onClick={() => move(index, 1)}>Move down</button></div>
    </div>)}
  </div>;
}

export function TimelineEditor({ initial }: { initial: TimelineEntry[] }) {
  const [entries, setEntries] = useState(initial);
  const update = (index: number, patch: Partial<TimelineEntry>) => setEntries((current) => current.map((entry, i) => i === index ? { ...entry, ...patch } : entry));
  const move = (index: number, delta: number) => setEntries((current) => {
    const next = [...current]; const target = index + delta;
    if (target < 0 || target >= next.length) return current;
    [next[index], next[target]] = [next[target], next[index]]; return next;
  });
  return <div className="timeline-admin-editor"><input type="hidden" name="timeline_json" value={JSON.stringify(entries)}/>
    {entries.map((entry, index) => <fieldset key={`${entry.title}-${index}`}><legend>Journey item {index + 1}</legend><label>Title<input value={entry.title} maxLength={80} onChange={(event) => update(index, { title: event.target.value })}/></label><label>Subtitle<input value={entry.subtitle} maxLength={80} onChange={(event) => update(index, { subtitle: event.target.value })}/></label><label className="wide">Description<textarea rows={2} value={entry.description} maxLength={280} onChange={(event) => update(index, { description: event.target.value })}/></label><label>Icon<select value={entry.icon} onChange={(event) => update(index, { icon: event.target.value as TimelineEntry["icon"] })}><option value="book">Book</option><option value="graduation">Graduation</option><option value="code">Code</option><option value="sparkles">Sparkles</option></select></label><div className="admin-link-actions"><button type="button" disabled={index === 0} onClick={() => move(index, -1)}>Move up</button><button type="button" disabled={index === entries.length - 1} onClick={() => move(index, 1)}>Move down</button><button type="button" onClick={() => setEntries((current) => current.filter((_, i) => i !== index))}>Remove</button></div></fieldset>)}
    <button type="button" className="admin-editor-add" onClick={() => setEntries((current) => [...current, { title: "", subtitle: "", description: "", icon: "code" }])}>Add a journey item</button>
  </div>;
}
