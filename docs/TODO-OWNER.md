# Owner content and setup checklist

Status: implementation phases 0–8 are complete in the repository. Production launch is still waiting on owner-supplied identity/content, Supabase and Vercel configuration, migration application where needed, and live verification.

## Design approval

- [x] Owner requested continuation and authorised realistic dummy data for the preview. Initial implementation can proceed.
- [x] Owner approved moving on from the revised Phase 1 Home design.
- [ ] TODO(owner): Review the core pages at `/about`, `/work`, `/hire-me`, `/contact`, and `/resume` on the deployed preview.
- [ ] TODO(owner): Review Posts, Blog/article, Owner Studio, and the assistant on the deployed preview.

## Identity and contact

- [ ] TODO(owner): Provide the actual WhatsApp number, including country code, and public contact email.
- [ ] TODO(owner): Provide LinkedIn, Instagram, and Twitter/X profile URLs. No guessed profiles will be published.
- [ ] TODO(owner): Supply a real portrait for About/Home when ready. `public/images/shivam.jpg` is currently absent.
- [ ] TODO(owner): Supply the current résumé PDF and verify any résumé skills or experience beyond AGENTS.md.
- [ ] TODO(owner): Confirm or edit optional expanded About copy before publishing. Confirmed education, leadership, and scholarship facts can be seeded from AGENTS.md.

## Work

- [ ] TODO(owner): Provide actual screenshots, approved technology lists, roles, and outcomes for Thravia, brg-cli, and Jeetlo. Existing illustrations do not establish implementation details or measured results.
- [ ] TODO(owner): Provide any desired repository/demo/store links beyond the confirmed Thravia domain and brg-cli npm package identity.
- [ ] TODO(owner): Confirm the visual material for Jeetlo. `public/images/jeetlo.png` is currently absent; a labelled placeholder can be used in review.
- [ ] TODO(owner): Explicitly approve details and publication of DoodhKhata, TalentScope, PharmaPay, and any coaching-institute/client project before they become public. They will not be seeded as published work.

## Writing and services

- [ ] TODO(owner): Add real social post links/captions. For LinkedIn inline embeds, supply the platform's embed code; a normal link can be shown as a link card.
- [ ] TODO(owner): Add actual blog articles when ready. Sample articles, dates, and titles from the old demos are not confirmed content.
- [ ] TODO(owner): Review freelance services and process wording. Rates, deadlines, client names, and testimonials remain unspecified unless supplied.
- [ ] TODO(owner): Approve any additional assistant FAQs about availability, process, or preferences beyond the confirmed knowledge base.

## Services, supplied through appropriate secure configuration

- [ ] TODO(owner): Choose the owner login email and connect a Supabase project for Auth, database, and Storage. Private keys go in environment configuration, not this document or source control.
- [ ] TODO(owner): Connect the Vercel project and production environment variables when deployment is ready.
- [ ] TODO(owner): Select the chat provider/model and configure its server-only key before live AI verification. Canned assistance remains available without it.
- [ ] TODO(owner): Choose an email notification provider only if inbox notifications are wanted; the admin inbox is the baseline.
- [ ] TODO(owner): If migration 005 has not already been applied, apply it after migrations 001–004 as described in `docs/DEPLOY.md`. Do not rerun migration 004.
- [ ] TODO(owner): Apply the project-specific DNS records described in `docs/DEPLOY.md` at the registrar. The agent will not change registrar or social-account settings.
- [ ] TODO(owner): Verify the daily keep-alive run after production services are connected and agree a regular content-export habit.
- [ ] TODO(owner): Verify the live site in Google Search Console and Bing Webmaster Tools when ready; submit the generated sitemap and review real indexing reports. Setup instructions will be documented.

## Asset preparation owned by implementation

These tasks do not require the owner to edit files or rename assets.

- Completed: inspected the supplied mascot character sheet and implemented a lightweight SVG robot with waving, typing, lightbulb, resting, and thumbs-up poses. Source raster files are preserved.
- Completed after owner review: a simpler hero using the supplied `home.png` and `home-dark.png`, with the extra Ask/dock controls removed. Article cards use the existing supplied artwork. Optimised WebP derivatives in `public/images/optimized/` are 17–43 KiB each; source files remain intact.
- Completed: production image optimisation, responsive delivery, theme-aware fallbacks, default article covers, and dynamic page Open Graph images. Source files remain preserved.
- No fake product screenshots or fabricated portrait were added.

## Review policy for missing content

The owner has authorised realistic dummy data for design review. Mark sample records explicitly and keep them out of production publication, indexing, feeds, AI grounding, and public MCP retrieval until replaced. Use `TODO(owner)` placeholders or honest empty states where real personal details are missing. Do not treat either new samples or the old demo's content as verified facts.
