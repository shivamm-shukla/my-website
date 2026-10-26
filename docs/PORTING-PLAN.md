# Portfolio v4 porting plan

## Audit

- Approved interactive reference: `docs/Shivam Shukla — Portfolio v4 (UI_UX demo).html`.
- Existing app is a Next.js 16 App Router site with real Supabase repository/auth boundaries, published content seed, owner-only Studio, theme provider, public routes, assistant, and existing tests.
- Owner changes present before this port: `components/sections/hero-scene.tsx`, `home-sections.tsx`, and `work-browser.tsx`. Preserve and build on these edits.
- The repository includes responsive Home captures for light and dark mode; Playwright also exercises the listed public pages at mobile and desktop widths.

## Demo-to-app mapping

| V4 feature | Existing implementation / planned target |
|---|---|
| Colour wall, glass cards, pills, responsive top nav, theme | `app/tokens.css`, `app/globals.css`, `app/design.css`, `components/layout/site-header.tsx`, theme provider |
| Laptop hero and orbit | `components/sections/hero-scene.tsx`, `app/design.css` |
| Home sections and work cards | `components/sections/home-sections.tsx`, `work-browser.tsx`, `project-art.tsx`, content repository |
| Public content pages | Existing `app/about`, `work`, `hire-me`, `contact`, `resume`, `blog`, `posts`, `not-found` routes and `app/content-pages.css` |
| Article features and share UI | Existing blog routes, `lib/markdown.ts`; add focused client components and pure share-card helper as needed |
| Site bot | `components/robot/assistant-widget.tsx`, `robot.tsx`, `lib/robot/motion.mjs` |
| Owner Studio | `components/admin/admin-studio.tsx`, server actions, existing Supabase migration; additive changes only |
| OG and metadata | `app/api/og/route.tsx`, route metadata, root layout |

## Data and security

- Keep existing Supabase tables, RLS, owner checks, and seed/repository contracts. Do not delete or rewrite stored rows. Migration `005_project_story_fields.sql` is additive to the existing schema; do not rerun or edit already-applied migrations. Public mutations still go through rate-limited server actions.
- Inspect current schema before proposing additive migrations. Missing owner content (social URLs, email, case study details) remains omitted or clearly marked for owner review.
- Treat draft demo copy as unverified and do not publish it as fact. Confirm the `brg-cli` repository link with the owner before production use.
- Validate owner-entered external URLs and sanitize Markdown using the existing safe rendering path.

## Risks and decisions

- The v4 demo is a large single-file prototype. Its visual details can be ported, but its in-memory data and hash routing must stay replaced by App Router and Supabase.
- The existing three Home component edits are user work and will be preserved.
- Implement in small buildable phases. No schema change is needed for visual foundation work; later gaps will be recorded before any migration.
- The repository's package scripts provide typecheck, build, unit and Playwright checks. Run checks after implementation phases as specified by `AGENTS2.md`.

## Phase status

- [x] Phase 0: audit and mapping.
- [x] Phase 1: foundation and navigation.
- [x] Phase 2: Home and hero scene.
- [x] Phase 3: content pages.
- [x] Phase 4: Blog.
- [x] Phase 5: share system (story, square, and link formats; article and project share entry points; OG robot mark).
- [x] Phase 6: site bot (persistent root mount, long-press chat, drag-to-pin with session persistence, idle sleep, page-aware prompts, and quick actions).
- [x] Phase 7: Owner Studio. Public profile, home copy and section order, timeline, navigation, social links, About/Hire/Contact/Resume/Footer copy, portrait, assistant visibility, share-card template, editorial placements, projects, posts, blogs, comments, subscribers, and inbox are editable through owner-only Studio controls. Content continues to use the existing `site_settings` JSON and tables; no new migration was needed for this phase.
- [ ] Phase 8: QA and cleanup. Production build, TypeScript, unit tests, responsive overflow checks, and WCAG A/AA axe checks pass locally. Latest Playwright run passed 42 of 50 checks; eight public interaction checks still fail and authenticated database writes remain unverified. Sitemap/robots/noindex behavior is checked in both Vercel Preview and Production modes. Home Lighthouse: Performance 96, Accessibility 100, Best Practices 100, SEO 100; LCP 2.4 s and CLS 0. Remaining checks are listed in `docs/QA-REPORT.md` and depend on owner Supabase/Vercel credentials.

## Owner review needed

- Verify draft case-study wording before publishing.
- Confirm the `brg-cli` GitHub repository belongs to Shivam.
- Supply real email and social URLs where absent.
- Supply approved profile and project screenshots where the demo currently implies them.
- Apply `supabase/migrations/005_project_story_fields.sql` after the already-applied migrations before enabling the latest editable project story fields and blog resource links. Confirm the optional comments/subscribers migration is present before enabling durable reader interactions.
