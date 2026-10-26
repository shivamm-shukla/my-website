# AGENTS.md: Port the v4 demo into the real codebase

You are a coding agent working in the repository for **shivamshukla.site** (Shivam Shukla's portfolio, blog and Owner Studio). Your job is to update the real codebase so that it matches the approved UI, UX and animation of the reference demo, while keeping everything wired to real data (Supabase) and the existing Owner Studio.

Read this whole file before touching code. Work in phases, commit after each phase, and keep the site buildable at every commit.

---

## 0. Source of truth

| What | Where |
|---|---|
| Approved reference (single file, interactive, dummy data) | `docs/shivam-site-v4.html` |
| Brand assets (robot logo, favicons, default OG image) | `docs/brand/` (`icon.svg`, `icon-512.png`, `icon-192.png`, `favicon-48.png`, `apple-touch-icon.png`, `og-default.png`) |
| Older reference for hero colour and robot movement | `docs/claude-home.html` and `docs/screenshots/hero-from-claude-light|dark` |

The demo is a **visual and behavioural spec, not code to paste**. It uses string templates, `innerHTML`, in-memory arrays and a hash router. Re-implement everything as proper React/Next.js components using the repo's own conventions. Open the demo in a browser and use it side by side with the real site while you work. Where the demo and this file disagree, this file wins; where this file is silent, the demo wins.

Useful anchors inside the demo script (search for these comments or function names): `/* SHARE CARDS */`, `/* HERO SCENE */`, `/* ADMIN */`, `/* RENDER */`, `/* site bot: roam, pin, chat */`, `drawCard`, `robotC`, `laptop`, `scene`, `bp` (blog post), `cs` (case study), `shItem`, `listen`, `admin`.

## 1. Non-negotiables

1. **Do not paste the demo's HTML or scripts into the app.** Port to components, hooks, CSS and server code that fit the repo.
2. **Audit first.** Do not assume file names. The repo is known to contain, among others: `app/` routes (about, blog, work, hire-me/contact, admin), `app/api/og/route.tsx`, `components/sections/` (`hero-scene.tsx`, `home-sections.tsx`, `work-browser.tsx`, `project-art.tsx`, `editorial-art`), `components/admin/` (`admin-studio.tsx`, `markdown-editor.tsx`, `actions.ts`), `components/ui/icon`, `lib/`, `content/`, and CSS files such as `design.css`, `core-pages.css`, `content-pages.css`, `admin.css`. Verify what exists and reuse it before creating anything new.
3. **No data loss.** Do not delete existing posts, projects, subscribers, inbox messages or Supabase rows. Migrations must be additive and reversible.
4. **Keep auth and admin protection intact.** Owner Studio stays owner-only. Public visitors never get write access to content tables.
5. **No emoji and no star or sparkle decorations anywhere** in UI, copy, commit messages or seed content. Use the SVG icons, type, colour and the robot.
6. **No fake data in production.** The demo shows `2.4k visits`, example emails, sample comments and Thravia/Jeetlo draft text. Replace with real data or hide the element when there is no data (see section 9).
7. **Accessibility and performance are requirements**, not polish (section 10).
8. **Security:** the demo's `md()` helper and `innerHTML` use are unsafe. In production render Markdown through the repo's existing pipeline or a sanitising renderer (for example `react-markdown` with `rehype-sanitize`). Validate and escape every owner-entered URL and string. Only allow `http(s):`, `mailto:` and `tel:` links.
9. Do not add heavy dependencies for what CSS, SVG, canvas or small hooks can do. Justify any new package in the PR notes.

## 2. Phase plan

Create `docs/PORTING-PLAN.md` first (audit, mapping from demo features to repo files, schema changes, risks). Then execute:

1. **Phase 1, Foundation:** design tokens, background, glass, buttons, motion utilities, navigation, theme toggle, footer, metadata, favicon and brand assets.
2. **Phase 2, Home:** hero scene (laptop and orbit), sections, project cards with real links.
3. **Phase 3, Content pages:** Work list, case study page, About, Resume, Contact/Hire, 404.
4. **Phase 4, Blog:** list with search and filters, post reader features, comments, subscribe, ad slot, thought card.
5. **Phase 5, Share system:** share designer (story, post, link), server OG route, metadata per page.
6. **Phase 6, Site bot:** roaming robot with pin, chat panel, sleep, reading-aware docking.
7. **Phase 7, Owner Studio 2.0:** everything on the public site editable, backed by Supabase.
8. **Phase 8, QA and cleanup:** accessibility, performance, responsive screenshots, remove dead code and old styles.

After each phase run lint, typecheck and build, and capture screenshots at 390, 768, 1024 and 1440 px, light and dark.

## 3. Design system (Phase 1)

Implement as CSS custom properties on `:root` with a dark override under `@media (prefers-color-scheme: dark)` guarded by `:root:not([data-theme="light"])`, plus explicit `:root[data-theme="dark"]`. The theme toggle must persist (cookie or localStorage) and must not flash the wrong theme on first paint (inline script or cookie-based SSR).

Light tokens: `--fg #12142e`, `--mut rgba(18,20,46,.62)`, `--gl rgba(255,255,255,.55)`, `--gl2 rgba(255,255,255,.8)`, `--st rgba(255,255,255,.75)`, `--sh 0 24px 50px -22px rgba(48,34,140,.38)`, `--acc #0a7aff`, `--base #e9eeff`, wall blobs `--w1 #7cc8ff`, `--w2 #c7a6ff`, `--w3 #ff9ccc`, `--w4 #ffd37a`.

Dark tokens: `--fg #f4f4ff`, `--mut rgba(244,244,255,.68)`, `--gl rgba(30,26,64,.5)`, `--gl2 rgba(48,42,92,.75)`, `--st rgba(255,255,255,.14)`, `--sh 0 24px 50px -22px #000b`, `--base #080819`, blobs `#1f4fb8 #5a2fb8 #a01f6e #a8641a`.

Easing: `--sp cubic-bezier(.34,1.56,.64,1)` (spring, for hover, press, popovers) and `--sm cubic-bezier(.22,1,.36,1)` (smooth, for reveals and transitions).

Rules:

- **Page canvas is colourful.** A fixed `.wall` layer holds four large blurred gradient blobs (55, 48, 46 and 32 vmax) that drift slowly (18 s alternate). Colour must live on the page, not only inside cards.
- **Glass surfaces:** `background: var(--gl)`, `backdrop-filter: blur(28px) saturate(190%)`, 1px `--st` border, `--sh` shadow, inset top highlight, radius 28px. Pills use radius 99px.
- **Typography:** system stack (`-apple-system, BlinkMacSystemFont, "SF Pro Display", Inter, "Segoe UI", Roboto, sans-serif`). H1 `clamp(42px, 7vw, 82px)`, line-height 1.02, letter-spacing `-.045em`, weight 700. H2 `clamp(30px, 4.4vw, 52px)`. Gradient text for emphasis: `--acc` to `#a15cff` to `#ff5fa2`.
- **Buttons (`.pill`):** spring scale to 1.06 on hover and .95 on press. On devices with hover, a small magnetic pull toward the cursor (about 12% horizontal, 20% vertical of the offset from centre), cleared on leave. Primary pill uses `--acc` with a soft coloured shadow.
- **Reveals:** sections fade and rise (translateY 30px) with `--sm` over about 1 s when 10% visible (IntersectionObserver, observe once).
- **Route transitions:** incoming page content animates from `opacity 0, translateY(26px), scale(.985), blur(10px)` over .8 s with `--sm`. Prefer the View Transitions API where supported, with this CSS animation as the fallback.
- Respect `prefers-reduced-motion`: disable orbit, drifting, magnetic, parallax and route blur; keep instant state changes.

## 4. Navigation and layout (Phase 1)

The v3 problems to avoid: missing navigation and broken responsiveness. Required:

- **Top glass bar on every page and every viewport**, sticky, rounded pill (`max-width 1100px`, `top: 10px + safe-area-inset-top`). Contains: robot logo with "Shivam", nav links, theme toggle, "Hire me" primary pill.
- **Desktop (min 900 px):** inline links with an active pill highlight.
- **Mobile (max 899 px):** links collapse into a hamburger button that opens a glass dropdown panel under the bar, closes on route change, on outside click and on Escape. **Do not use a bottom dock or bottom tab bar.** Websites keep navigation at the top.
- Links: Home, About, Work, Blog, Resume, Contact. A Studio link appears only for the authenticated owner, never for the public.
- Footer: copyright, social links rendered from Studio data (only links that have an address), short note. No placeholder text.
- Use `viewport-fit=cover` and safe-area insets. No horizontal page scroll at any width. Wide content (code, tables) scrolls inside its own container.
- Breakpoints used by the demo: 900 (nav), 860 (hero stacks), 800 (admin sidebar becomes horizontal), 700 (two-column grids stack).

## 5. Brand: the robot is the logo (Phase 1)

- Header logo is the robot on a blue-to-violet rounded tile (`docs/brand/icon.svg`), with a small hover tilt.
- Copy assets: `app/icon.svg`, `app/icon.png` (512), `app/apple-icon.png` (180), `public/favicon-48.png`, `public/og-default.png`. Ensure a crawlable `/favicon.ico` or `<link rel="icon">` on the homepage. Favicon must be square and a multiple of 48 px.
- Add JSON-LD on the homepage (`WebSite` with `name` and `url https://shivamshukla.site/`, and `Person` with `image` pointing at the 512 icon). Set `metadataBase`, `openGraph.siteName`, `themeColor`.
- Note for the owner (put in PR notes, do not promise it): Google decides when a favicon appears in results; it can take days to weeks.

## 6. Home page (Phase 2)

Order of sections: hero, Selected work, The path so far, From the blog, CTA. Each section can be toggled from Studio (section visibility).

### 6.1 Hero

Left: "Open for freelance work" status pill (green pulsing dot, text editable in Studio), H1 headline (with gradient emphasis on the key phrase), intro paragraph, two buttons (See my work, Start a project).

Right: **hero scene**, a square, container-query based scene (`container-type: inline-size`, size units in `cqw`, max width 540 px). **Do not show project cards in the hero**; they duplicated the Selected work section and were removed on purpose.

Scene layers:

1. A large soft circle (radial gradient lavender to violet, subtle inner border, slow brightness pulse).
2. A realistic **laptop** drawn as inline SVG: dark aluminium lid, bezel with camera dot, hinge, silver deck with perspective trapezoid, four rows of keys (last row has a space bar), trackpad, front lip with notch, blurred ground shadow. Screen shows a code editor: title bar with three dots, sidebar file list, ten code lines in blue, grey, green, purple, orange and pink, an active-line highlight, blinking cursor, blue status bar, and a soft glare that slides across. Code lines "type in" (scaleX from 0, staggered, 7 s loop). Port the geometry from the demo's `laptop()` exactly, since it was visually tuned.
3. **Eight orbiting elements** that travel around the laptop on tilted ellipses: a `</>` glass card, a heart card, a plant in an orange pot, a pink squiggle, a green glowing dot, a dark terminal card (`>_`), a git-branch card and a chat-bubble card. Mixed directions and speeds (periods about 24 to 48 s). Per element parameters (rx, ry as fractions of the scene size, speed, phase, tilt in degrees) are in the demo's `scene()`. Depth effect: `dep = sin(angle)`; scale `.9 + .14*dep`; `z-index` above the laptop when `dep > 0` and below it when `dep <= 0`; small rotation `dep*8deg`; gentle vertical bob.
4. Pointer parallax: laptop `perspective(900px) rotateY(cx*7deg) rotateX(-cy*4deg)` and circle translate, eased (factor .06).

Implementation notes: one `requestAnimationFrame` loop in a client component hook (`useHeroOrbit`), cleaned up on unmount, paused when the tab is hidden or the scene is off screen (IntersectionObserver). Mark the scene `aria-hidden="true"`. Under reduced motion render elements at static phases with no loop.

### 6.2 Selected work cards

Each card (glass, radius 28, spring lift on hover):

- Top screenshot area (project image, or a generated browser-window illustration when no image; zoom 1.08 on hover).
- Type chip, title, one-line description.
- Two actions: **Case study** (internal route) and **Live site** (real external link, opens in a new tab with `rel="noopener noreferrer"`). The live label is editable ("Live site", "View package", and so on). If no live URL exists, show a disabled-style "Live link coming soon" button.

## 7. Content pages (Phase 3)

### 7.1 Work list
Grid of the same project cards (all projects from Supabase).

### 7.2 Case study page `/work/[slug]`
Sections in order, each hidden if its data is empty:

1. Back link, status chip, H1, one-line description.
2. Action row: Live site button (editable label), View source (GitHub), **Share to story** button.
3. Large screenshot or generated illustration.
4. Facts strip: Type, Status, Built with.
5. Overview and The problem (prose).
6. Feature cards (heading editable, defaults to "What it does"; data format `Title :: detail`).
7. **How to use it:** numbered steps. Each step is `Title :: detail`; when the detail starts with `$ ` render it as a code block with a **Copy** button (strip the leading `$ `).
8. **Links:** a list of every link (live site, source, plus unlimited extra links entered as `Label | URL`), each showing label and hostname with an external-link icon.
9. Share preview card (live canvas preview and "Customise and share" button), share rail (X, LinkedIn, WhatsApp, Copy link), optional sponsor slot, subscribe card, thought card, "More projects".
10. Page-level reading progress bar (3 px, gradient) fixed at the top.

### 7.3 About, Resume, Contact
- **About:** avatar (uploaded photo or initials tile), intro, fact cards, short story, project links, buttons, social links.
- **Resume:** education, projects (from data), Print or save as PDF button (`window.print()` with print CSS hiding chrome and the robot).
- **Contact:** form with name, need (select), budget (select), message. Save the submission to the existing inbox table (server action with validation, rate limiting and spam protection), and also offer "Send by email" as a `mailto:` fallback. FAQ disclosure items and social links below.
- **404:** friendly page with a link home.

## 8. Blog (Phase 4)

### 8.1 List `/blog`
Search box (title and summary), category chips generated from data (All plus each category, plus **Saved** when the visitor has saved posts), rows with category, date and reading time, subscribe card, thought card, optional sponsor slot.

### 8.2 Post `/blog/[slug]`
Features, all required (inspired by Medium, Substack, Dev.to and Hashnode):

- Header: category chip, H1, date, reading time, author, cover (image or gradient).
- **Action bar:** primary **Share to story** button, **Appreciate** (heart, count), **Save** (bookmark, stored per visitor in localStorage; later optionally per account), **Listen** (Web Speech API `speechSynthesis`; hide the button if unsupported; cancel on navigation), **A-** and **A+** (text size 15 to 26 px, via a CSS variable) and **Serif** toggle. Persist reading preferences.
- **Table of contents:** collapsible "On this page", built from `##` headings with stable slug ids; click scrolls smoothly. Sticky in a side column on wide screens, collapsed block on mobile.
- Article body typography at 19 px, 1.7 line height, 720 px measure; blockquote with accent bar; code blocks with **Copy** buttons; inline code chips.
- **Share quote:** selecting 8 or more characters inside the article shows a floating "Share quote" pill near the selection that opens an X intent with the quoted text, author and page URL.
- **Links from this post:** same list component as the case study page.
- Share rail, sponsor slot, author card with Follow (writes to `subscribers`/follows with consent, no fake state), **Discussion** (comment form and list; comments are stored in Supabase and appear after owner approval; sanitise and rate-limit), thought card, subscribe card, share preview card, **Read next** (two related posts).
- Reading progress bar at the top.

### 8.3 Subscribe and follow
Real Supabase `subscribers` rows with explicit consent text and timestamp, email validation, duplicate handling, double opt-in readiness. No public read access. External email delivery stays optional and out of scope unless it already exists.

### 8.4 Sponsor slot
Optional, clearly disclosed ("Sponsored" label), never a fake advertiser. Controlled by Studio (on/off and content). Renders nothing when disabled.

## 9. Content to seed (verify before publishing)

Seed projects and posts from the demo into the database or `content/` so the site is not empty.

**Verified facts (from the public brg README and the owner):**
- `brg-cli` is a git-style CLI that switches between AI coding CLIs (Claude Code, Codex) and carries project context in local files (`.brg` folder, `context.md`), no database or server. Install: `npm install -g brg-cli` (Node 18+). Commands: `brg setup`, `brg tools list`, `brg init`, `brg checkpoint`, `brg switch claude`, `--fresh` for a clean session. Links: `https://www.npmjs.com/package/brg-cli`, `https://github.com/brghq/brg`. Confirm with the owner that this repository is theirs.
- Owner background used on About and Resume: Sitare University (B.Tech Computer Science, AI Club, Rhetoric Club), Jawahar Navodaya Vidyalaya (class and school captain). Thravia (live at `https://thravia.app`), Jeetlo (Android, Hindi-medium exam prep, link coming soon).

**Draft copy written from one-line descriptions. Flag as "needs owner review" in `docs/PORTING-PLAN.md` and do not present as fact:** Thravia and Jeetlo overview, problem and features text, and the three non-brg blog posts (healthcare trust essay, Hindi-medium design notes, freelancer checklist). The owner will edit them in Studio. Do not invent stack details, metrics, testimonials, or visit counts.

Placeholders to replace with real values: contact email (`hello@example.com` in the demo), social URLs (empty in the demo), analytics numbers.

## 10. Share system (Phase 5)

This is the most important feature: a visitor must be able to share any post or project to a story, a feed or a chat and it must look excellent.

### 10.1 Share designer (client)
A full-screen glass sheet opened by "Share to story" / "Customise and share":

- Format tabs: **Story** (1080 x 1920), **Post** (1080 x 1080), **Link** (1200 x 630).
- Template swatches: **Aurora**, **Sunrise**, **Ocean**, **Paper** (light). Default template comes from Studio.
- Live preview image. On Story, an optional **Safe area** overlay (striped bands: top 13%, bottom 20%) showing areas covered by Instagram UI. The overlay is a preview aid and must never be baked into the exported image.
- On the Link tab show mock previews of how the link card appears in WhatsApp, LinkedIn and X.
- Actions: **Share** (Web Share API with an image file when `navigator.canShare({files})` is true), **Save image** (standard blob download via an anchor with `download`; on iOS fall back to showing the image so it can be pressed and held), **Copy caption** (title, summary, URL), **Copy link**. Provide guidance text: "Tap Share and pick Instagram, WhatsApp or Snapchat, or press and hold the image to save it."
- Close on Escape, on backdrop click and with the close button. Trap focus, lock body scroll, restore focus.
- **Remove all `window.claude` / artifact-runtime code** from the demo. It exists only for the demo sandbox.

### 10.2 Rendering
Port `drawCard(item, format, template)` from the demo into `lib/share-card.ts` as a pure function that draws on a `CanvasRenderingContext2D`. Keep these behaviours:

- Background: diagonal gradient plus four large radial-gradient blobs per template (positions differ per format).
- Brand row: robot mark plus name and domain (`shivamshukla.site`).
- Glass card with category chip, **title that auto-fits**, description (max 3 lines on Story, 2 on Post), divider, author row (initials avatar, name, meta such as "5 min read, Oct 2026"), then a white or dark **CTA pill** ("Read the full post" / "See the project") with an arrow, and the URL.
- **Adaptive layout (critical):** measure first, then fit. Loop the title font size down in 4 px steps until the whole stack (card, gap, CTA, URL line) fits the available band; only then centre it. Story band: top 430, bottom `H - 340`, title 112 down to 60, up to 6 lines. Post band: top 168, bottom `H - 56`, title 84 down to 44, up to 5 lines. Truncate with an ellipsis only at the minimum size. Never let any element leave the canvas. This was a real bug (cut-off bottom on Post); add a unit test that renders a very long title in all three formats and asserts nothing is clipped.
- Link format: brand top-left, chip, title (max 4 lines, 72 down to 38, width 700), CTA bottom-left with the URL beside it, a large robot inside a glass circle on the right.
- URL line is measured and ellipsised to fit.
- Light template uses lighter shadows and a more opaque glass fill so it does not look muddy.
- On the client use the system font stack. Do not wait for web fonts; but `await document.fonts.ready` before drawing if a web font is used elsewhere.

### 10.3 Server-rendered social previews (what link crawlers see)
Crawlers cannot run the canvas. Implement `app/api/og/route.tsx` (or the repo's existing OG route) with `ImageResponse` so every shared URL gets a 1200 x 630 image that follows the **Link** layout above (same hierarchy, tokens and robot). Load a real font (Inter or the repo's font) explicitly for the image renderer. Use `generateMetadata` on every blog post and project page to set `title`, `description`, `openGraph` (type, url, siteName, images with width and height and alt) and `twitter` (`summary_large_image`). Fall back to `public/og-default.png` for pages without a specific image. Verify with a validator or by fetching the HTML and the image URL.

## 11. Site bot (Phase 6)

A persistent client component mounted once in the root layout (not per page). It is the robot from the logo, 76 px wide, with an antenna, rounded head, dark screen face, cyan eyes that blink and follow the pointer, pink cheeks, and a body with two hands.

**Movement:** spring physics in one `requestAnimationFrame` loop (`k = 14`, damping `5.2`, dt clamped to .04 s). Every about 3.8 s it picks a new target; body tilt `clamp(vx * .03, -18, 18)` degrees; gentle bobbing. Target selection avoids the top 70 px (header) and keeps 8 px margins. On article routes (`/blog/*`, `/work/*`) it docks to the right edge, drifting only vertically so it does not cover reading text.

**Pin:**
- Dragging the robot (movement over 8 px) moves it with the pointer. On release it becomes **pinned**: it stays exactly where it is, roaming stops, the pin state is visible (accent dot and glow) and it says "Pinned here. Tap me to let me roam again."
- **A single tap on a pinned robot unpins it** and roaming resumes.
- Pinned state persists across route changes. Persist position and pin state in `sessionStorage`, and clamp to the viewport on resize.

**Chat panel:**
- Long-press (480 ms without movement) opens the panel at any time. A tap on an unpinned, roaming robot also opens it. Keyboard: Enter or Space on the focused robot opens it.
- Panel (340 px wide, glass): header with title, **Pin me here / Let me roam** toggle and close; message list; quick chips (Projects, Latest post, Read aloud, Hire Shivam, Switch theme); input with Send.
- Rule-based answers that actually navigate using `next/navigation`: project names open that case study, "hire/contact/quote" opens Contact, "resume", "about", "blog/post/read" opens the latest post, "listen/aloud" starts Listen on the current post, "story/share" opens the share designer for the latest post, "theme/dark/light" toggles theme, "pin/stay/stop" and "roam/free" control the robot. Keep it deterministic. An AI-backed chat is a possible future task and out of scope.
- The robot closes the panel on route change.

**Sleep:** after 30 s without pointer, scroll or key input it stops roaming, closes its eyes and shows "z z"; any input wakes it.

**Tips:** on route change say a short contextual line (for example on Work: "Every card has a how-to and all links").

**Rules:** `touch-action: none` and `user-select: none` on the robot only; it must not block page scroll elsewhere. Respect reduced motion (no roaming; pin and chat still work). Hide on print. Never cover the share sheet or modals (modal z-index above it). Provide a Studio switch to disable the bot site-wide.

## 12. Owner Studio 2.0 (Phase 7)

Goal from the owner: "I should have the power to edit and update everything on the website." Everything that renders on a public page must be editable here, backed by Supabase, with server-side validation (zod or the repo's validator) and admin-only RLS. Keep the existing admin auth.

Layout: left sidebar on desktop, horizontally scrolling tab strip on mobile (**tabs must never overlap content on small screens**; this was a real bug). Tabs:

1. **Overview:** counts (posts, projects, subscribers, pending comments, unread inbox) from real data; quick actions (Write a post, Add a project). Show real visit numbers only if analytics exist; otherwise omit.
2. **Site:** name, hero headline, intro, status text, contact email, **website address** (used on share cards, default `shivamshukla.site`), accent colour, logo preview note. **Social links manager:** a list where each link has an editable **Name** and **Link**, with **Move up / Move down**, **Delete** (two-step confirm), **Add a link**, and **Quick add** chips (Instagram, YouTube, GitHub, LinkedIn, X, WhatsApp, Email, Website; no duplicates by name). Only links with an address render publicly (footer, About, Contact). Auto-prefix `https://` when a scheme is missing; reject unsafe schemes.
3. **Sections:** show or hide home sections and set their order.
4. **Posts:** list with Edit and Delete (two-step confirm); status draft, scheduled, published. **Editor:** toolbar (H, B, I, Quote, List, Code, Link, Image upload), Write / Split / Preview modes, live preview using the real article styles, word count and reading time, autosave status and unsaved-change warning, cover image upload, category, summary, **links field** (`Label | URL` per line), SEO fields (title, description, share image override). Markdown remains the storage format. Publish and Save changes buttons.
5. **Projects:** list with Add, Edit, Delete. Fields: name, one-line description, type, status, live URL, live button label, source URL, **extra links** (`Label | URL` per line), built-with (comma separated), overview, problem, features heading, features (`Title :: detail` per line), how-to steps (`Step :: detail` or `$ command` per line), two accent colours, screenshot upload, slug. Saving creates or updates the case study page immediately.
6. **Share cards:** pick the default template (thumbnail previews of all four), and open the share designer for any post or project.
7. **Images / media:** profile photo and screenshots via Supabase Storage (validate type and size, generate dimensions, set alt text).
8. **Monetise:** sponsor slots on/off and content (always shows the "Sponsored" label), thought card text, newsletter copy.
9. **Audience:** subscribers (consent timestamp, export CSV, unsubscribe), comments moderation (approve, reject, delete), inbox messages.
10. **Pages:** About, Resume and Contact copy, FAQ items, navigation labels and order, footer text, SEO defaults, robot on/off.

### Suggested data model (adapt to the existing schema; migrations must be additive)
`site_settings` (single row, JSON for identity, hero, theme, nav, sections, robot flag), `social_links` (id, name, url, position), `projects` (all fields above plus `published`, `position`), `posts` (all fields above plus `status`, `published_at`), `comments` (post_id, name, body, status, created_at), `subscribers` (email, consent_text, consented_at, source, status), `media` (path, alt, width, height). RLS: public can read published content only; public can insert into `comments` (status pending), `subscribers` and inbox with validation; everything else owner-only.

## 13. Quality bars (apply to every phase)

**Accessibility:** semantic landmarks, one H1 per page, visible focus rings, full keyboard operation (menu, modal, robot chat, studio), `aria-label` on icon buttons, `aria-modal` and focus trap on dialogs, `aria-live` for toasts, alt text for images, WCAG AA contrast on both themes, reduced-motion support everywhere.

**Performance:** keep animations on `transform` and `opacity`; one rAF loop per animated system; cancel loops on unmount; lazy-load the share designer and the bot chat panel; use `next/image` for uploaded images; no layout shift in the hero (reserve the scene's aspect ratio); Lighthouse targets on the homepage: Performance 90+, Accessibility 95+, SEO 100, CLS under 0.05.

**Responsive:** verify at 360, 390, 768, 1024, 1440 px. No horizontal scroll, no overlapping elements, tap targets at least 44 px, the hero scene scales fluidly with `cqw`.

**Code quality:** TypeScript strict, no `any` without a comment, small focused components, server actions with validation, error and loading states, no dead CSS left over from the old theme after Phase 8, tests for pure helpers (`fitTitle`, URL sanitising, slugging, TOC extraction, link and step parsers).

## 14. Definition of done

- [ ] Public pages match the demo's look, spacing, colour and motion in light and dark.
- [ ] Top navigation exists on every page; mobile uses the hamburger panel; no bottom dock.
- [ ] Hero shows the animated laptop scene with eight orbiting elements; no project cards in the hero.
- [ ] Home, Work, case studies, About, Resume, Contact and Blog use real Supabase data; no dummy numbers or example emails remain.
- [ ] Project cards have separate Case study and Live site actions with real links.
- [ ] Blog post has TOC, appreciate, save, listen, text size, serif, copy code, share quote, comments with moderation, follow/subscribe, read next, progress bar.
- [ ] Share designer produces Story, Post and Link images with four templates, safe-area guide, Web Share, Save, Copy; nothing is ever clipped, including for very long titles (unit tested).
- [ ] Every blog post and project page has correct Open Graph and Twitter metadata and a generated 1200 x 630 image.
- [ ] Robot is the logo (header, favicon, apple icon, JSON-LD); site bot roams, pins on drag, unpins on tap, opens chat on long-press, sleeps when idle, docks on article pages.
- [ ] Owner Studio edits every public element, including adding, renaming, reordering and deleting social links, adding and editing projects, and writing posts with the full editor; the mobile layout has no overlaps.
- [ ] RLS verified: public cannot write content; owner-only routes remain protected.
- [ ] Lint, typecheck, tests and production build pass; screenshots at all breakpoints attached to the PR; `docs/PORTING-PLAN.md` updated with decisions and open questions.

## 15. How to work

- Make reasonable decisions yourself and record assumptions in `docs/PORTING-PLAN.md`; stop to ask only when blocked by missing credentials, a destructive migration, or a conflict this file cannot resolve.
- Commit per phase with clear messages. No emoji in commits.
- Keep the old site working until the phase that replaces each piece is complete; delete old styles and components only in Phase 8.
- When finished, summarise what changed, what needs owner review (draft copy, real email and social URLs), and any follow-ups (email delivery, AI-backed chat, analytics).
