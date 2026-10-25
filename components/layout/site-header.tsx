"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { NavigationItem } from "@/lib/content/types";
import { ThemeToggle } from "@/components/theme-provider";
import { Dialog } from "@/components/ui/dialog";
import { Icon } from "@/components/ui/icon";

export function SiteHeader({ name, navigation, allPages }: { name: string; navigation: NavigationItem[]; allPages: NavigationItem[] }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [search, setSearch] = useState("");
  const resultList = useRef<HTMLUListElement>(null);
  const matches = useMemo(() => allPages.filter((page) => page.label.toLowerCase().includes(search.trim().toLowerCase())), [search, allPages]);

  useEffect(() => {
    const handle = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setMobileOpen(false);
        setSearch("");
        setCommandOpen((open) => !open);
      }
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, []);

  return <>
    <header className="site-header">
      <Link href="/" className="brand" aria-label={`${name}, home`}><span className="brand-mark" aria-hidden="true">ss<span>.</span></span><span className="brand-name">{name}</span></Link>
      <nav className="desktop-nav" aria-label="Main navigation">{navigation.map((item) => <Link key={item.label} href={item.href}>{item.label}</Link>)}</nav>
      <div className="header-actions">
        <button type="button" className="icon-button header-assistant" aria-label="Open Shivam’s assistant" aria-haspopup="dialog" title="Meet my sidekick" data-open-assistant onClick={() => window.dispatchEvent(new Event("site:assistant"))}><Icon name="message" size={19} /></button>
        <button type="button" className="icon-button command-trigger" aria-label="Open quick navigation" title="Quick navigation (⌘ / Ctrl K)" onClick={() => { setSearch(""); setCommandOpen(true); }}><Icon name="command" size={17} /></button>
        <span className="header-divider" aria-hidden="true" />
        <ThemeToggle />
        <Link href="/#hire" className="button button-small header-hire">Hire me <Icon name="arrow-up-right" size={15} /></Link>
        <button type="button" className="icon-button mobile-menu-trigger" aria-label="Open menu" aria-expanded={mobileOpen} aria-haspopup="dialog" onClick={() => setMobileOpen(true)}><Icon name="menu" size={23} /></button>
      </div>
    </header>
    <Dialog open={mobileOpen} onClose={() => setMobileOpen(false)} title="Make yourself at home." className="mobile-nav-dialog">
      <nav aria-label="Mobile navigation"><ul>{allPages.map((item, index) => <li key={item.href}><Link href={item.href} onClick={() => setMobileOpen(false)}><span className="menu-index">0{index + 1}</span>{item.label}<Icon name="arrow-up-right" size={22} /></Link></li>)}</ul></nav>
      <p className="menu-footer">A student. A builder. A work in progress.</p>
    </Dialog>
    <Dialog open={commandOpen} onClose={() => setCommandOpen(false)} title="Where would you like to go?" className="command-dialog">
      <div className="command-search"><Icon name="search" /><input type="search" data-dialog-autofocus aria-label="Search pages" placeholder="Find a page…" value={search} onChange={(event) => setSearch(event.target.value)} autoComplete="off" onKeyDown={(event) => { if (event.key === "ArrowDown") { event.preventDefault(); resultList.current?.querySelector("a")?.focus(); } }} /></div>
      <ul className="command-results" ref={resultList}>{matches.map((page) => <li key={page.href}><Link href={page.href} onClick={() => setCommandOpen(false)}><Icon name={page.label === "Home" ? "globe" : "file"} size={18} /><span>{page.label}</span><Icon name="arrow-up-right" size={16} /></Link></li>)}</ul>
      {!matches.length && <p className="command-empty">No page by that name. Try “work” or “blog”.</p>}
      <div className="command-hint"><span>Use Tab to explore</span><span><kbd>esc</kbd> to close</span></div>
    </Dialog>
  </>;
}
