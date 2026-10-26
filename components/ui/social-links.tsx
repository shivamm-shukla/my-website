import type { SocialLink } from "@/lib/content/types";
import { BrandIcon } from "./brand-icon";

export function SocialLinks({ links, compact = false }: { links: SocialLink[]; compact?: boolean }) {
  return <div className={`social-links ${compact ? "compact" : ""}`} role="group" aria-label="Social profiles">
    {links.filter((link) => link.url).map((link) => <a key={link.platform} href={link.url || undefined} aria-label={link.label} title={link.label} target={link.platform === "email" ? undefined : "_blank"} rel={link.platform === "email" ? undefined : "noopener noreferrer"}><BrandIcon platform={link.platform} /></a>)}
  </div>;
}
