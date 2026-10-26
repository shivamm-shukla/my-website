# Shivam Shukla's personal website

Next.js App Router, TypeScript, Tailwind, Supabase-backed Owner Studio, and a lightweight SVG companion.

The portfolio pages, publishing tools, assistant, and local QA are implemented. Production service setup and owner-supplied content are tracked in [the owner checklist](docs/TODO-OWNER.md); deployment steps are in [DEPLOY.md](docs/DEPLOY.md).

## Run

```sh
npm install
npm run dev
```

Open `http://localhost:3000`. Follow `.env.example` when connecting services. Never put real keys in source files.

## Check

```sh
npm run typecheck
npm run test:unit
npm run build
npm run test:e2e
```

Playwright requires Chromium and permission to start a localhost server. Install its browser with `pnpm exec playwright install chromium` if necessary. See [the QA report](docs/QA-REPORT.md) for the latest verification results.

Use `NEXT_PUBLIC_SITE_MODE=preview` for local design review. Vercel Preview is automatically noindex; Vercel Production is crawlable. Sample posts and articles are preview-only. Missing profile links, screenshots, and real articles are tracked in [owner TODOs](docs/TODO-OWNER.md).
