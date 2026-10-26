# Deploy and connect shivamshukla.site

## 1. Create Supabase

1. Create a Supabase project and open **SQL Editor**.
2. For a new database, run the SQL files in `supabase/migrations/` in numeric order. If migrations through 004 have already been applied, apply only `005_project_story_fields.sql`; it safely ensures the owner-editable public settings table and adds editable project feature headings and blog resource links.
3. In **Authentication → Users**, create the owner user with the same email that will be placed in `OWNER_EMAIL`.
4. Copy the Project URL, anon key, and service-role key from **Project Settings → API**. Keep the service-role key server-only.

Supabase free projects may pause after inactivity. The daily Vercel cron calls a real database query to keep the project active. Export blog Markdown periodically from the studio or Supabase as an independent backup.

## 2. Create the Vercel project

1. Import this repository into Vercel with the Next.js preset.
2. Add every variable from `.env.example` to Production and Preview environments.
3. Set `NEXT_PUBLIC_SITE_MODE=live` only after Supabase is connected and the public content has been reviewed.
4. Generate a long random `CRON_SECRET`. Vercel Cron sends it as a bearer token automatically.
5. Choose `CHAT_PROVIDER` (`openai`, `anthropic`, or `gemini`), set a supported `CHAT_MODEL`, and add its server-only `CHAT_API_KEY`.
6. Deploy, open `/admin`, sign in with the owner account, and verify that a post, draft blog, and project edit can be saved.

## 3. Verify the keep-alive

After the production deployment, run:

```sh
curl -i -H "Authorization: Bearer YOUR_CRON_SECRET" https://shivamshukla.site/api/keep-alive
```

A successful response is HTTP 200 with `{"ok":true,...}`. Check **Vercel → Project → Settings → Cron Jobs** for the daily schedule and execution history.

## 4. Connect the domain

Add `shivamshukla.site` and `www.shivamshukla.site` in **Vercel → Project → Settings → Domains**. Make the apex domain primary and redirect `www` to it.

Vercel now provides project-specific DNS targets. Use the exact A and CNAME values shown beside these two domains in the Vercel dashboard. If Vercel shows its general-purpose targets, add these records at the current DNS provider:

| Type | Name | Value | TTL |
| --- | --- | --- | --- |
| A | `@` | `76.76.21.21` | Auto / 300 |
| CNAME | `www` | `cname.vercel-dns-0.com` | Auto / 300 |

Remove conflicting A, AAAA, or CNAME records for `@` and `www`. Preserve MX/TXT records used for email. If the zone already has restrictive CAA records, allow `letsencrypt.org` so Vercel can issue SSL.

Verify after propagation:

```sh
dig A shivamshukla.site +short
dig CNAME www.shivamshukla.site +short
```

Vercel provisions HTTPS after DNS verification. The dashboard or `vercel domains verify shivamshukla.site --project YOUR_PROJECT` is the source of truth for the exact project-specific targets.

## 5. Launch checks

- Submit the contact form and confirm the message appears in `/admin`.
- Publish one post and one blog, then check `/posts`, `/blog`, `/rss.xml`, and `/sitemap.xml`.
- Ask the robot a question in English, Hindi, and Hinglish; confirm unknown facts are declined.
- Run `pnpm build`, `pnpm test:unit`, and `pnpm test:e2e`.
- Add the domain to Google Search Console and Bing Webmaster Tools, then submit `https://shivamshukla.site/sitemap.xml`.
