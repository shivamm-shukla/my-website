import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import type { EditorialPromotions } from "@/lib/content/types";

type Context = "article" | "project" | "blog" | "posts";

export function EditorialPromotions({ settings, context }: { settings: EditorialPromotions; context: Context }) {
  const showSponsor = settings.sponsor.enabled && Boolean(settings.sponsor.label && settings.sponsor.title && settings.sponsor.body && settings.sponsor.cta && settings.sponsor.url);
  const showFocus = context !== "blog" && settings.focus.enabled && Boolean(settings.focus.label && settings.focus.title && settings.focus.description && settings.focus.projectSlug);
  const showThought = !["blog", "article", "project"].includes(context) && settings.thought.enabled && Boolean(settings.thought.label && settings.thought.body && settings.thought.byline);
  const hasEnabled = showSponsor || showFocus || showThought;
  if (!hasEnabled) return null;
  return <section className={`site-container editorial-promo-grid editorial-promo-${context}`}>
    {showFocus && <CurrentFocusCard focus={settings.focus}/>}
    {showThought && <ThoughtCard thought={settings.thought}/>}
    {showSponsor && <SponsorCallout sponsor={settings.sponsor} context={context}/>}
  </section>;
}

function SponsorCallout({ sponsor, context }: { sponsor: EditorialPromotions["sponsor"]; context: Context }) {
  if (!sponsor.label || !sponsor.title || !sponsor.body || !sponsor.cta || !sponsor.url) return null;
  const cta = <>{sponsor.cta}<Icon name="arrow-up-right" size={17}/></>;
  return <aside className={`sponsor-callout sponsor-callout-${context}`} aria-label={sponsor.label}>
    <div><span className="sponsor-label">{sponsor.label}</span><h2>{sponsor.title}</h2><p>{sponsor.body}</p></div>
    {sponsor.url.startsWith("/") ? <Link href={sponsor.url} className="button button-secondary">{cta}</Link> : <a href={sponsor.url} target="_blank" rel="noopener noreferrer" className="button button-secondary">{cta}</a>}
  </aside>;
}

function CurrentFocusCard({ focus }: { focus: EditorialPromotions["focus"] }) {
  if (!focus.label || !focus.title || !focus.description || !focus.projectSlug) return null;
  return <aside className="current-focus-card">
    <span className="focus-orbit" aria-hidden="true"><i/><i/><i/></span>
    <div><span className="page-kicker">{focus.label}</span><h2>{focus.title}</h2><p>{focus.description}</p><Link href={`/work/${focus.projectSlug}`} className="text-link">{focus.title}<Icon name="arrow-up-right" size={17}/></Link></div>
  </aside>;
}

export function ThoughtCard({ thought }: { thought: EditorialPromotions["thought"] }) {
  if (!thought.label || !thought.body || !thought.byline) return null;
  return <aside className="thought-card"><span className="page-kicker">{thought.label}</span><blockquote>{thought.body}</blockquote><span className="thought-byline">{thought.byline}</span></aside>;
}

export function WriterCard({ name, description, initials }: { name: string; description: string; initials: string }) {
  return <aside className="writer-card"><div className="writer-mark" aria-hidden="true">{initials}</div><div><span className="page-kicker">A note from</span><h2>{name}</h2><p>{description}</p><Link href="/about" className="text-link">A little about me<Icon name="arrow-up-right" size={16}/></Link></div></aside>;
}
