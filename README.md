# krub.dev

Live at **[krub.dev](https://krub.dev)**.

My personal portfolio. One page plus a 404, bilingual (English / Spanish), dark and light themes
with five accent palettes, built with Vue 3 and Vite.

Kiko Rubio — fullstack developer in Murcia, leaning toward backend.

## Stack

- **Vue 3** with `<script setup>`. Plain JavaScript, no TypeScript.
- **Vite** for the dev server and the build.
- **vue-router** — two routes: the page and a catch-all 404. There are also two dev-only screens,
  `/preview` (the components sheet) and `/logo-lab` (the hero stage, plain against its bloom and
  grain), lazy-loaded and kept out of the production bundle.
- **vue-i18n** — nested dictionaries, English by default.
- **Vitest** and **Playwright** for tests.
- No CSS framework and no preprocessor. Design tokens are CSS custom properties in one global
  stylesheet; everything else is `<style scoped>`.

## Running it

```bash
npm install
npm run dev
```

| | |
|---|---|
| `npm run dev` | dev server, hot reload |
| `npm run build` | production bundle into `dist/` |
| `npm run preview` | serve that bundle locally |
| `npm run test` | unit tests (Vitest) |
| `npm run test:watch` | the same, in watch mode |
| `npm run test:e2e` | end-to-end tests (Playwright, real Chromium) |

The CV is not built from this repository. Its plain-text sources and generator live in a sibling
`cv/` folder outside it, run with `node build-cv.mjs`; that script turns each file into LaTeX and
compiles it with [tectonic](https://tectonic-typesetting.github.io), a single binary rather than a
full TeX distribution. Put it on your `PATH`; on Windows the script also looks in
`%LOCALAPPDATA%\Programs\tectonic`. It builds three documents — the full CV in light and dark, a
one-page CV and a base cover letter, both light — into its own `out/` folder; copy the four `cv-*`
PDFs into this repository's `public/uploads/` to publish a change. The same folder holds
`build-og.mjs`, which renders the Open Graph banner.

## Tests

Forty-one unit tests and around forty end-to-end flows, the latter run across two viewports.

Vitest covers the pure functions — how a timeline period is formatted, how the carousel index
wraps, how a URL is tidied — the contact validation and its endpoint, and the composables that
touch storage: theme, language and accent survive a reload, reject junk values and cope with
`localStorage` throwing.

Playwright exists for a narrower reason. Scroll events, animation frames and CSS transitions
cannot be verified by reading the DOM — you need a browser that actually paints. So it covers the
chrome (the navbar compacting, the footer sliding in, the scroll spy), the projects rail paging and
dragging, the testimonials pager, the stack lighting up and Limonacho naming a tile, the contact
form validating and sending, the 404 fitting one viewport, and the custom cursor. It runs against
the production build.

It earned its keep on the first run by finding a real bug: the footer was measured with the
content box instead of the border box, so the page reserved 18px too little and the fixed
footer sat on top of the end of the contact section.

The same suite can be pointed at a deployment instead of the local build, which is how a
release gets checked before a domain is moved onto it:

```bash
E2E_BASE_URL=https://example.vercel.app npx playwright test
```

## Layout

```
public/            served as-is: logo, photo, og banner, stack icons, self-hosted fonts
                   (with their OFL licences), the acho clip, the CV PDFs, favicon,
                   apple touch icon, robots, sitemap
docs/              the spec, the component contracts, the roadmap, the decision log, the backlog
tests/
├─ unit/           Vitest
└─ e2e/            Playwright
src/
├─ components/
│  ├─ base/        stateless and reusable (BaseButton, SectionHeading, TechIcon…)
│  ├─ chrome/      fixed UI that owns behaviour (navbar, footer, cursor, background grid)
│  ├─ content/     project card and modal, carousel, spec list, testimonials
│  └─ sections/    one component per page section, plus the hero's logo stage and marquee
├─ composables/    shared logic, no markup (theme, language, scroll, pointer, focus trap)
├─ data/           every sentence and every project — start at src/data/index.js
├─ locales/        en.json / es.json — interface strings only
├─ router/
├─ styles/         tokens.css — the only file allowed to declare a colour
├─ utils/          small pure functions
└─ views/
```

## Rules the whole codebase follows

- **No visible string inside a component.** It comes from a prop, from `src/locales/`, or from
  `src/data/`.
- **No literal colours.** Always `var(--token)`. The documented exceptions are colours that
  belong to a specific element rather than to the theme — the availability dot's green and
  Limonacho's palette — and the design spec names each one.
- **One `requestAnimationFrame`** for everything that follows the mouse: the custom cursor, the
  magnetic hover and the lemon's pupils all subscribe to a single loop. The 3D logo is the one
  exception — Three's renderer owns its own loop, paused while off-screen.
- **Content and interface are separate.** Sentences I wrote live in `src/data/`, with both
  languages side by side in one file. Strings the interface needs live in `src/locales/`.

## Documentation

- [`docs/design-spec.md`](docs/design-spec.md) — the visual contract. Every colour, size, easing
  curve and behaviour, section by section.
- [`docs/components.md`](docs/components.md) — the component tree and the props of each one.
- [`docs/roadmap.md`](docs/roadmap.md) — the build order. Steps 1–12 are the record of what was
  built, kept as it was.
- [`docs/backlog.md`](docs/backlog.md) — what comes after the roadmap: the pending tasks and the
  ideas that are not tasks yet.
- [`docs/decisions.md`](docs/decisions.md) — every choice that is not obvious from reading the
  code, and the reasoning behind it. Including the ones where I went against the original spec,
  and why.

## Deployment

Vercel, from `main`. The reasoning behind `vercel.json` lives here because JSON has no comments
and Vercel validates the file against a strict schema — an unrecognised key fails the deploy.

Cache headers are split by one question: **does the filename change when the contents do?**

- `/assets/*.js` and `*.css` are fingerprinted by Vite, so a new build produces a new name.
  Immutable for a year, safely.
- `/assets/img/*`, `/icons/*` and `/fonts/*` come straight out of `public/` and keep their names
  across deploys. One day — long enough to be worth caching, short enough that replacing the
  banner (or a font) takes effect the same afternoon rather than in 2027.
- `/` is never cached hard. `index.html` is what points at the current bundle; a stale copy pins
  a visitor to an old build.

The one rewrite sends every unmatched path to `/`, so the SPA's own 404 route renders instead of
Vercel's plain-text page. Vercel checks the filesystem **before** applying a rewrite, so
`/assets`, `/icons` and `/fonts` are served normally. The catch-all answers HTTP 200 with the 404
content — a soft 404 — which is the trade-off for keeping the site's chrome (grid, cursor,
navbar, footer) around the message. A real 404 status would need edge middleware, so the 404 view
adds its own `robots: noindex` meta instead: an unknown URL is not indexed despite the 200.

Plus `nosniff`, `Referrer-Policy` and `X-Frame-Options` on everything.

## Licence

No licence, which means default copyright: the code is here to be read, not reused wholesale.
The content, the brand, the logo and the photographs are mine and are not reusable at all. If a
particular piece is useful to you, ask me.
