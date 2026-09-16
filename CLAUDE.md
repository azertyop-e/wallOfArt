# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project

Creative museum website built with Next.js (App Router), Tailwind CSS, GSAP and Lenis (smooth scroll), consuming a public paintings API. Site content is in French (`lang="fr"`); `src/app/page.tsx` is currently a placeholder home page.

This is a school project (ECV, Next.js module). The full brief is in `doc/brief.md` and the API documentation in `doc/api.md` — read them before building a feature. Key points are summarized in the **Brief** and **API** sections below.

**Always target the latest Next.js version with the App Router** (`src/app/`). Do not use the Pages Router (`pages/`, `getServerSideProps`, `getStaticProps`, `_app`, `_document`) or APIs deprecated in recent releases. When in doubt about an API, check the App Router docs bundled with the installed version in `node_modules/next/dist/docs/01-app/` rather than relying on memory.

Stack status:
- `next` 16.3.5, `react` 19.2.8 — installed
- Tailwind CSS v4 — installed (CSS-first config, no `tailwind.config.js`)
- `gsap` + `@gsap/react` — installed
- `lenis` 1.3.x — installed and wired up
- `zustand` — required by the brief (global store, preloader), **not installed yet**

## Brief (`doc/brief.md`)

Goal: a museum site that makes people want to learn about art, with a solid, logical Next.js architecture that stays usable. The project is graded on correct use of Next.js, not just visuals:

- Use Next components (`Image`, `Link`, …) appropriately; build reusable components, deliberately choosing Server vs Client.
- Logical internal routing (`params` / `searchParams`), good SEO (metadata), and a deliberate mix of rendering strategies (SSG, SSR, ISR).
- A global store for cross-page state (Zustand — not installed yet).

Expected features:
- **Header / Footer** with a real-time search bar (results refresh as you type; autocomplete optional).
- **Home**: hero, selection of paintings, about section.
- **Tableaux** (`/tableaux`): hero, list of all paintings, active filters to sort/filter them.
- **Tableau** (single artwork page): shows all of the artwork's data + links to similar paintings.
- **Billetterie** (ticketing; the header currently labels this page « Boutique » at `/boutique`): ticket list with a "total" sidebar that updates on every ticket/option change. Prices:
  - Adulte 24€ · -12 ans 12€ · Jeune 12-25 18€ · Demandeur d'emploi 18€ · PMR 18€ · Senior 18€ · Moins de 5 ans gratuit
  - Groupe (+10 personnes) 15€ / personne
  - Options: audioguide 2€ / personne, guide papier 4€ / personne, plan du musée gratuit (remis à l'accueil)

Expected animations:
- A page transition (TransitionLink-style).
- A reusable wrapper component applying one animation to many elements (text reveal, parallax…) — `src/components/reveal.tsx` is the starting point.
- An entrance animation on at least one page (home or single artwork).
- A preloader shown only on first load, using an `isFirstRender` flag in the Zustand store.
- Optional tools mentioned: HTML-string parser, custom cursor with mouse follow.

Deliverables: deployed on Vercel, git repo with clean commits, written critical review of Next.js.

## API (`doc/api.md`)

Base URL: `https://api-museum.vercel.app`. No auth. 29 artworks at the time of writing. `doc/api.md` is partly inaccurate — the behavior below was verified against the live API:

- **`GET /objects`** returns a **paginated wrapper**, not a bare array:
  `{ objects: Artwork[], totalCount, currentPage, totalPages, hasNextPage, hasPrevPage }`
  - `?page=N&limit=N` paginate (without `limit`, all objects are returned on one page).
  - `?search=term` does a full-text search (matches title, artist and description content).
  - Other filters (e.g. `?movement=`) are **ignored** — filtering by movement/type/year/artist must be done on our side.
- **`GET /objects/{slug}`** returns a single artwork plus `relatedObjects: Artwork[]` (use it for "similar paintings"). Lookup is by `slug` only (`/objects/1` → 404). Unknown slug → `404 { "error": "Object not found" }`; server errors → `500 { "error": "..." }`.
- **Artwork fields:** `id` (number), `slug`, `title`, `year` (number), `type` (`painting`, `fresco`, `mural`, `triptych`, `woodblock print`), `description`, `image`, `gallery` (string[]), `artist`, `location`, `locationLink`, `movement` (French label, e.g. « Impressionnisme »), `color` (French text, e.g. « Bleu cobalt profond »). The doc warns some fields may be missing — type optional fields defensively.
- **`description` is an HTML string** (`<p>`, `<strong>`, `<i>`, `<em>`): it must be parsed/rendered as HTML, not printed as text.
- **Remote images** are hosted on `upload.wikimedia.org`, `www.metmuseum.org` and `www.moma.org`; these hosts must be allowed in `images.remotePatterns` in `next.config.ts` before using `next/image` (not configured yet).
- The API responds with `cache-control: max-age=0`, so caching/revalidation must be decided on the Next.js side.

## Commands

```bash
npm run dev      # dev server on http://localhost:3000 (Turbopack)
npm run build    # production build
npm run start    # serve the production build
npm run lint     # biome check (lint + format check + import sorting)
npm run format   # biome format --write
npx biome check --write   # apply safe lint fixes + format + organize imports
```

There is no test framework configured.

## Tooling specifics

- **Biome, not ESLint/Prettier.** Config in `biome.json`: 2-space indent, recommended rules plus the `next` and `react` domains, import organizing on, Tailwind directives enabled in the CSS parser.
- **React Compiler is enabled** (`reactCompiler: true` in `next.config.ts`). Avoid manual `useMemo`/`useCallback` unless there is a specific reason; keep components pure so the compiler can optimize them.
- **Tailwind v4:** theme tokens live in `src/app/globals.css` under `@theme inline` (CSS variables such as `--color-background`, `--font-sans`). Add design tokens there rather than in a JS config.
- **Path alias:** `@/*` → `./src/*`.
- **Typed route props:** layouts/pages use the global `LayoutProps<"/">` / `PageProps<"/">` helpers generated by Next (see `next-env.d.ts` / `.next/types`).
- Fonts: Clash Display (Fontshare, self-hosted woff2 in `src/app/fonts/`, weights 400/500) via `next/font/local` is the main `font-sans`; Geist Mono via `next/font/google` is `font-mono`. Both are exposed as CSS variables consumed by `@theme`.

## Layout & design system

Visual reference: https://ard.ac/list (white background, small uppercase medium-weight type, muted gray `text-muted` #828282).

- **Fluid 6-column grid defined in `src/app/globals.css`**, based on a 1500px canvas: gutter = `--spacing-gutter` (32/1500 × 100vw), 7 gutters + 6 columns = 100vw. Use these instead of fixed spacing so layouts scale with the viewport:
  - `p-gutter`, `px-gutter`, `gap-gutter`, … (Tailwind spacing token `gutter`)
  - `span-w-N`: width of N columns + the gutters between them
  - `span-pl-N`: left offset of N columns
- **Site header** (`src/components/site-header.tsx`): fixed, `mix-blend-difference` with white text so it stays readable over any content; rendered in the root layout outside `SmoothScroll`. Brand « Musée » on the left links home (there is no separate Home link); Tableaux `/tableaux`, Boutique `/boutique`, À propos `/a-propos` are grouped on the right, 10px uppercase. Inactive links are `text-muted` and turn white (black after blending) on hover; the active link (via `usePathname`) is white with `aria-current="page"`. No blur effect.

## Animation / smooth-scroll integration notes

GSAP and Lenis only run in the browser, so any file using them must be a Client Component (`"use client"`), while pages and layouts stay Server Components by default.

- Use `useGSAP()` instead of `useEffect` for GSAP code — it handles cleanup (`gsap.context` revert) automatically, which matters with React Strict Mode double-mounting in dev.
- **Always import `gsap`, `ScrollTrigger` and `useGSAP` from `@/lib/gsap`**, never from the packages directly: that module registers the plugins once. Register any new GSAP plugin there.
- Smooth scroll lives in `src/components/providers/smooth-scroll.tsx`, rendered once around `children` in `src/app/layout.tsx` (which also imports `lenis/dist/lenis.css`). It mounts `<ReactLenis root options={{ autoRaf: false }} />`, drives Lenis from `gsap.ticker` (`lenis.raf(time * 1000)`, `lagSmoothing(0)`) and calls `ScrollTrigger.update()` on every Lenis scroll. Don't create a second Lenis instance or a separate RAF loop.
- Use `useLenis()` from `lenis/react` for programmatic scrolling (`lenis.scrollTo(...)`) instead of `window.scrollTo`.
- `src/components/reveal.tsx` is the reference pattern for a scroll-triggered animation: a small client component wrapping server-rendered children, animating in `useGSAP` with `{ scope: ref }`. Pages stay Server Components and compose these wrappers.
