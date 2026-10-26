# Portfolio v4 QA report

Last checked: 2026-10-26

## Automated checks

- `pnpm build`: passed on Next.js 16.3.5.
- `pnpm exec tsc --noEmit --incremental false`: passed.
- `pnpm test:unit`: 3 test groups passed.
- `pnpm test:e2e`: latest run completed 42 of 50 checks. Eight public interaction checks failed for work filtering, theme persistence, assistant visibility, mobile navigation, quick navigation, and motion controls. Admin database writes still need an authenticated Supabase environment to verify.
- Sitemap and robots browser checks passed in both Vercel Preview mode (empty sitemap, site-wide disallow, noindex) and Vercel Production mode (required canonical pages, absolute HTTPS URLs, `lastmod` on every entry, sitemap directive, and `/admin` blocked/noindex).
- Home screenshots are captured for light and dark mode at 320, 360, 390, 768, 1024, 1440, 1920, and 2560 px in `docs/screenshots/`.

## Lighthouse

Measured against the local production build at `/`:

| Category | Score |
| --- | ---: |
| Performance | 96 |
| Accessibility | 100 |
| Best Practices | 100 |
| SEO | 100 |

Largest Contentful Paint was 2.4 s, Cumulative Layout Shift was 0, and Total Blocking Time was 150 ms in this local Lighthouse run. Lab results can vary by machine; Interaction to Next Paint is not measured by Lighthouse's lab run.

## Awaiting live configuration

Production Auth, database access, Storage uploads, daily cron execution, chat provider behavior, DNS, indexing, and published owner copy still require the owner's Supabase/Vercel accounts and real content. These are listed in `docs/TODO-OWNER.md` and the launch steps are in `docs/DEPLOY.md`. Apply migration 005 after 004 before saving projects or blog links if it has not already been applied.
