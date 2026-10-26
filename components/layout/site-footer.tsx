import Link from "next/link";
import type { SiteContent } from "@/lib/content/types";
import { Icon } from "@/components/ui/icon";
import { SocialLinks } from "@/components/ui/social-links";
import { MotionToggle } from "@/components/motion-toggle";

export function SiteFooter({ content, preview }: { content: SiteContent; preview: boolean }) {
  return <footer className="site-footer site-container">
    <div className="footer-main">
      <div className="footer-intro"><Link href="/" className="footer-name">{content.profile.name}<span className="name-dot">.</span></Link><p>Thanks for stopping by.<br />There’s always something taking shape.</p><SocialLinks links={content.socials} compact /></div>
      <div className="footer-links"><h2>Take a look around</h2><nav aria-label="Footer navigation">{content.footerNavigation.map((link) => <Link href={link.href} key={link.href}>{link.label}</Link>)}</nav></div>
      <div className="footer-hello"><h2>Have something in mind?</h2><Link href="/contact" className="text-link">Let’s hear it <Icon name="arrow-up-right" size={18} /></Link><span className="availability footer-availability"><span className="availability-dot" />{content.profile.availability}</span></div>
    </div>
    <div className="footer-bottom"><p>© {new Date().getFullYear()} {content.profile.name}</p><div>{preview && <span className="preview-label">Design preview</span>}<MotionToggle /><a href="#top" className="back-to-top">Back to top <Icon name="arrow-up" size={15} /></a></div></div>
  </footer>;
}
