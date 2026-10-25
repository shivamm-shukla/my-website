import Link from "next/link";
import type { SiteContent } from "@/lib/content/types";
import { Icon } from "@/components/ui/icon";
import { BrandIcon } from "@/components/ui/brand-icon";
import { SocialLinks } from "@/components/ui/social-links";
import { EditorialArt, Sculpture } from "./editorial-art";
import { HeroScene } from "./hero-scene";
import { ProjectArt } from "./project-art";

export function HeroSection({ content }: { content: SiteContent }) {
  const { hero } = content.home;
  const availableSocials = content.socials.filter((social) => social.url);
  return <section className="hero-section site-container" aria-labelledby="hero-heading">
    <div className="hero-copy">
      <span className="availability hero-availability"><span className="availability-dot" />{content.profile.availability}</span>
      <h1 id="hero-heading"><span>{hero.title}</span><span className="hero-emphasis">{hero.emphasis}</span></h1>
      <p className="hero-description">{hero.description}</p>
      <div className="hero-actions"><a href="#work" className="button">See my work <Icon name="arrow-right" size={17} /></a><a href="#hire" className="button button-secondary">Hire me</a></div>
      {availableSocials.length > 0 && <SocialLinks links={availableSocials} />}
    </div>
    <HeroScene />
  </section>;
}

function SectionHeader({ title, description, href, linkText }: { title: string; description: string; href?: string; linkText?: string }) {
  return <div className="section-heading"><div><h2>{title}</h2><p>{description}</p></div>{href && <Link href={href} className="section-link">{linkText}<Icon name="arrow-up-right" size={18} /></Link>}</div>;
}

export function WorkSection({ content }: { content: SiteContent }) {
  return <section className="work-section section-space site-container" id="work" aria-label="Selected work">
    <SectionHeader {...content.home.work} href="/work" linkText="All projects" />
    <div className="project-grid">{content.projects.map((project) => <article key={project.id} className={`project-card project-${project.treatment}`}><Link href={`/work/${project.slug}`} className="project-link" aria-label={`Explore ${project.title}: ${project.summary}`}>
      <div className="project-copy"><div className="project-topline"><span className="project-category">{project.category}</span><span className="project-open"><Icon name="arrow-up-right" size={18} /></span></div><h3>{project.title}</h3><p className="project-tagline">{project.headline}</p><p className="project-description">{project.summary}</p></div>
      <ProjectArt treatment={project.treatment} />
      <div className="project-status"><span className={project.id === "thravia" ? "status-dot" : "status-symbol"}>{project.id === "brg-cli" ? <Icon name="code" size={14} /> : project.id === "jeetlo" ? <Icon name="book" size={13} /> : null}</span>{project.status}</div>
    </Link></article>)}</div>
  </section>;
}

export function FocusSection({ content }: { content: SiteContent }) {
  return <section className="focus-strip site-container" aria-label="Currently building"><span className="focus-icon"><Icon name="heart" size={23} /></span><div className="focus-copy"><span>{content.home.focus.label}</span><p><strong>{content.home.focus.title}.</strong> {content.home.focus.description}</p></div><a href="https://thravia.app" target="_blank" rel="noopener noreferrer" className="focus-link">Take a look <Icon name="arrow-up-right" size={17} /></a></section>;
}

export function JourneySection({ content }: { content: SiteContent }) {
  return <section className="journey-section section-space site-container" id="journey" aria-label="Journey">
    <SectionHeader {...content.home.journey} href="/about" linkText="More about me" />
    <div className="journey-grid">{content.timeline.map((entry, index) => <article className="journey-item" key={entry.title}><div className={`journey-icon journey-icon-${index}`}><Icon name={entry.icon} size={27} /></div><span className="journey-subtitle">{entry.subtitle}</span><h3>{entry.title}</h3><p>{entry.description}</p><span className="journey-number" aria-hidden="true">0{index + 1}</span></article>)}</div>
    <div className="scholarship-note"><span className="scholarship-mark"><Icon name="sparkles" size={16} /></span><span>Reliance Foundation Scholar</span><span className="scholarship-divider" /><span>Sitare Foundation scholarship recipient</span></div>
  </section>;
}

export function PostsSection({ content }: { content: SiteContent }) {
  if (!content.posts.length) return null;
  return <section className="posts-section section-space" id="posts"><div className="site-container">
    <SectionHeader {...content.home.posts} href="/posts" linkText="All posts" />
    <div className="posts-grid">{content.posts.map((post) => <article className="post-card" key={post.id}><div className="post-author"><span className="post-avatar">s<span>.</span></span><span><strong>{content.profile.name}</strong><small>{post.platform === "linkedin" ? "On LinkedIn" : "On X"}</small></span><BrandIcon platform={post.platform} size={19} /></div><p className="post-caption">{post.caption}</p><div className="post-bottom"><span>{post.topic}</span><span className="sample-label">Sample post</span></div></article>)}</div>
    <p className="sample-explanation">A preview of the feed. These sample posts will be replaced with my own.</p>
  </div></section>;
}

export function WritingSection({ content }: { content: SiteContent }) {
  if (!content.articles.length) return null;
  return <section className="writing-section section-space site-container" id="writing" aria-label="Blog">
    <SectionHeader {...content.home.writing} href="/blog" linkText="Visit the blog" />
    <div className="writing-grid">{content.articles.map((article) => <article className="writing-card" key={article.slug}>
      <Link href={"/blog/" + article.slug} className="writing-link">
        <EditorialArt treatment={article.treatment} />
        <div className="writing-body">
          <div className="writing-meta"><span>{article.tag}</span><span>{article.readingTime} min read</span></div>
          <h3>{article.title}</h3>
          <div className="writing-bottom"><span className="sample-label">Sample article</span><span className="writing-open" aria-hidden="true"><Icon name="arrow-up-right" size={20} /></span></div>
        </div>
      </Link>
    </article>)}</div>
  </section>;
}

export function HireSection({ content }: { content: SiteContent }) {
  return <section className="hire-section site-container" id="hire" aria-label="Work with Shivam"><div className="hire-banner"><div className="hire-copy"><span className="hire-availability"><span />Good ideas are always welcome.</span><h2>{content.home.hire.title}</h2><p>{content.home.hire.description}</p><Link className="button button-on-blue" href="/contact">{content.home.hire.action}<Icon name="arrow-up-right" size={18} /></Link></div><div className="hire-art" aria-hidden="true"><Sculpture /></div></div></section>;
}
