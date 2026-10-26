"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import type { NavigationItem } from "@/lib/content/types";
import { ThemeToggle } from "@/components/theme-provider";
import { Dialog } from "@/components/ui/dialog";
import { Icon } from "@/components/ui/icon";

export function SiteHeader({ name, navigation, allPages }: { name: string; navigation: NavigationItem[]; allPages: NavigationItem[] }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [search, setSearch] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);
  const menuTrigger = useRef<HTMLButtonElement>(null);
  const resultList = useRef<HTMLUListElement>(null);
  const links = useMemo(() => allPages.filter((page) => ["/", "/about", "/work", "/blog", "/resume", "/contact"].includes(page.href)), [allPages]);
  const matches = useMemo(() => allPages.filter((page) => page.label.toLowerCase().includes(search.trim().toLowerCase())), [search, allPages]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setMobileOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && mobileOpen) { setMobileOpen(false); menuTrigger.current?.focus(); }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        if (document.querySelector("dialog[open]:not(.command-dialog)")) return;
        event.preventDefault();
        setMobileOpen(false);
        setSearch("");
        setCommandOpen((open) => !open);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => { document.removeEventListener("pointerdown", onPointerDown); window.removeEventListener("keydown", onKeyDown); };
  }, [mobileOpen]);

  const isActive = (href: string) => href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  return <>
    <header className="site-header" ref={menuRef}>
      <div className="header-inner site-container">
        <Link href="/" className="brand" aria-label={`${name}, home`}>
          <span className="brand-mark"><img src="/icon.svg" alt="" width="38" height="38" /></span>
          <span className="brand-name">{name}</span>
        </Link>
        <nav className="desktop-nav" aria-label="Main navigation">{links.map((item) => <Link key={item.href} href={item.href} aria-current={isActive(item.href) ? "page" : undefined} className={isActive(item.href) ? "active" : undefined}>{item.label}</Link>)}</nav>
        <div className="header-actions">
          <button type="button" className="icon-button command-trigger" aria-label="Open quick navigation" title="Quick navigation (⌘ / Ctrl K)" onClick={() => { setSearch(""); setCommandOpen(true); }}><Icon name="command" size={17} /></button>
          <ThemeToggle />
          <Link href="/hire-me" className="button button-small header-hire">Hire me <Icon name="arrow-up-right" size={15} /></Link>
          <button ref={menuTrigger} type="button" className="icon-button mobile-menu-trigger" aria-label={mobileOpen ? "Close menu" : "Open menu"} aria-expanded={mobileOpen} aria-controls="mobile-nav" onClick={() => setMobileOpen((open) => !open)}><Icon name={mobileOpen ? "close" : "menu"} size={22} /></button>
        </div>
      </div>
      <nav id="mobile-nav" className={`mobile-nav-panel${mobileOpen ? " open" : ""}`} aria-label="Mobile navigation" aria-hidden={!mobileOpen}>
        {links.map((item) => <Link key={item.href} href={item.href} aria-current={isActive(item.href) ? "page" : undefined}>{item.label}<Icon name="arrow-up-right" size={17} /></Link>)}
      </nav>
    </header>
    <Dialog open={commandOpen} onClose={() => setCommandOpen(false)} title="Where would you like to go?" className="command-dialog">
      <div className="command-search"><Icon name="search" /><input type="search" data-dialog-autofocus aria-label="Search pages" placeholder="Find a page…" value={search} onChange={(event) => setSearch(event.target.value)} autoComplete="off" onKeyDown={(event) => { if (event.key === "ArrowDown") { event.preventDefault(); resultList.current?.querySelector("a")?.focus(); } }} /></div>
      <ul className="command-results" ref={resultList}>{matches.map((page) => <li key={page.href}><Link href={page.href} onClick={() => setCommandOpen(false)}><Icon name={page.label === "Home" ? "globe" : "file"} size={18} /><span>{page.label}</span><Icon name="arrow-up-right" size={16} /></Link></li>)}</ul>
      {!matches.length && <p className="command-empty">No page by that name. Try “work” or “blog”.</p>}
      <div className="command-hint"><span>Use Tab to explore</span><span><kbd>esc</kbd> to close</span></div>
    </Dialog>
  </>;
}
