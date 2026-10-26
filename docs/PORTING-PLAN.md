# Portfolio v4 porting plan

## Audit

- Approved interactive reference: `docs/Shivam Shukla — Portfolio v4 (UI_UX demo).html`.
- Existing app is a Next.js 16 App Router site with real Supabase repository/auth boundaries, published content seed, owner-only Studio, theme provider, public routes, assistant, and existing tests.
- Owner changes present before this port: `components/sections/hero-scene.tsx`, `home-sections.tsx`, and `work-browser.tsx`. Preserve and build on these edits.
- No v4 screenshot capture is included. Use the HTML's design and behavior as the source of truth and the repo's existing preview screenshots as regression references.

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

- Keep existing Supabase tables, RLS, owner checks, and seed/repository contracts. Do not delete or rewrite stored rows.
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
- [ ] Phase 2: Home and hero scene.
- [ ] Phase 3: content pages.
- [ ] Phase 4: Blog.
- [ ] Phase 5: share system.
- [ ] Phase 6: site bot.
- [ ] Phase 7: Owner Studio.
- [ ] Phase 8: QA and cleanup.

## Owner review needed

- Verify draft case-study wording before publishing.
- Confirm the `brg-cli` GitHub repository belongs to Shivam.
- Supply real email and social URLs where absent.
- Supply approved profile and project screenshots where the demo currently implies them.
