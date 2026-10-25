import type { SocialLink } from "@/lib/content/types";
import { BrandIcon } from "./brand-icon";

export function SocialLinks({ links, compact = false }: { links: SocialLink[]; compact?: boolean }) {
  return <div className={`social-links ${compact ? "compact" : ""}`} aria-label="Social profiles">
    {links.map((link) => link.url ? <a key={link.platform} href={link.url} aria-label={link.label} title={link.label} target="_blank" rel="noopener noreferrer"><BrandIcon platform={link.platform} /></a> : <span key={link.platform} className="social-unavailable" tabIndex={0} aria-label={`${link.label}: link coming soon`}><BrandIcon platform={link.platform} /><span className="social-tooltip">{link.label} link coming soon</span></span>)}
  </div>;
}
