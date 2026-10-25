# Architecture

The site is a Next.js App Router application deployed to Vercel. Public pages are statically generated whenever possible. Supabase provides Auth, Postgres, Row Level Security, and a public `site-media` storage bucket.

## Content flow

- `lib/content/repository.ts` is the public content boundary. Preview mode uses confirmed seed data and clearly labelled samples. Live mode reads published projects, posts, and blogs from Supabase.
- `/admin` is server-rendered and checks the authenticated user against `OWNER_EMAIL` on the server before loading any private data or accepting mutations.
- Admin mutations use the service-role client only after `requireOwner()` passes. The service key never reaches the browser.
- Blog Markdown is rendered on the server, highlighted with `highlight.js`, and sanitized before HTML is returned.
- Contact submissions validate on the server, use a honeypot and durable IP-hash rate limit, then write to the private `messages` table.

## Assistant

- `/api/chat` caps input, rate-limits an irreversible IP hash, and grounds replies in `content/knowledge.md` plus published project and blog titles.
- `lib/chat/provider.ts` is the provider boundary. It supports OpenAI Responses API streaming, Anthropic Messages streaming, and Gemini streaming based on environment variables.
- The application does not store chat messages. If the provider is missing or unavailable, the UI shows confirmed canned answers and Contact.

## Operations

- `vercel.json` runs `/api/keep-alive` every day at 03:17 UTC.
- The endpoint requires Vercel's `Authorization: Bearer $CRON_SECRET` header and executes a real uncached database query.
- Public database reads are protected by RLS. Private tables have no public policies; the authenticated studio uses server-side owner checks and the service role.
