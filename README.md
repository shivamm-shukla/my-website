# Shivam Shukla's personal website

Next.js App Router, TypeScript, Tailwind, and a lightweight SVG companion.

The Home design is ready for review. Inner pages, CMS, and live AI are subsequent phases. [Current progress](docs/PROGRESS.md) records what is implemented and what remains.

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

Playwright requires Chromium and permission to start a localhost server. Install its browser with `npx playwright install chromium` if necessary. Browser results are currently pending; the constrained agent environment could run build and unit checks only.

## Portable Home preview

```sh
npm run preview:export
```

Open `docs/preview/home.html` directly in your browser. It includes both themes, the robot, menu, command navigation, and profile-answer panel. It needs no network connection. It is a design-review artifact; links to future pages explain their phase status.

Sample posts and articles are labelled and omitted from the live content repository when `NEXT_PUBLIC_SITE_MODE=live`. Confirmed project facts come from `AGENTS.md`; missing profile links, screenshots, and content are tracked in [owner TODOs](docs/TODO-OWNER.md).
