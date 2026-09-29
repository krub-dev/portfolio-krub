# Working rules for this repository

Read [`docs/design-spec.md`](docs/design-spec.md) before touching anything visual and
[`docs/components.md`](docs/components.md) before creating a component. Follow
[`docs/roadmap.md`](docs/roadmap.md) for the order of work. When a decision in
[`docs/decisions.md`](docs/decisions.md) contradicts the spec, the decision wins — the spec is the
visual contract, the log is the record of where the build has moved away from it.

Content lives in `src/data/` (every sentence and project, both languages side by side); interface
strings live in `src/locales/`. The directory layout is in the README.

## Commands

```bash
npm run dev        # dev server; binds to the LAN too, so a phone can open it
npm run build      # production bundle into dist/
npm run preview    # serve that bundle
npm run test       # unit tests (Vitest)
npm run test:e2e   # end-to-end tests (Playwright)
```

There is no lint or typecheck step. `npm run build`, `npm run test` and `npm run test:e2e` are the
whole verification — run all three before calling a change done.

On this machine PowerShell blocks the unsigned `npm.ps1` shim, so `npm.cmd` and `npx.cmd` are the
workaround there. Commands handed to the owner must run in both a bash terminal and Windows
PowerShell 5.1: no `&&`, no `printf`, no POSIX heredocs.

The CV is not built from this repository. Its plain-text sources and the generator live outside it
(a sibling `cv/` folder, run with `node build-cv.mjs`, writing to its own `out/`); the only CV
artefacts here are the four compiled PDFs in `public/uploads/` — light and dark, one per language —
copied in by hand when they change.

`api/contact.js` is the same handler Vercel runs; `vite.config.js` mounts it in development. It sends
through Resend and reads `RESEND_API_KEY`, `CONTACT_TO`, `CONTACT_FROM` and `TURNSTILE_SECRET_KEY`
from `.env.local` — deliberately **not** `VITE_`-prefixed, so the key never reaches the bundle. Only
`VITE_TURNSTILE_SITE_KEY` is public. Production sets them all in Vercel.

## Tests

- **Vitest** (`tests/unit/`) runs in jsdom and covers pure functions and the composables that touch
  `localStorage`.
- **Playwright** (`tests/e2e/`) runs against the production build: its webServer builds and previews
  it. `E2E_BASE_URL` points the same suite at a deployment. Projects: desktop and a Pixel 7 (Chromium),
  and an iPhone (WebKit). The CDP finger drag is Chromium-only and skips on WebKit.
- **Verify in WebKit, not only Chromium.** Several real bugs here only show there — pointer capture
  retargeting a click, `overflow-clip-margin` being unsupported, Safari leaving links out of the tab
  order (which broke the modal's focus trap).
- `html { scroll-behavior: smooth }` is global, so a test that scrolls before asserting must scroll
  with `behavior: 'instant'`.
- Decorative animation opts into `prefers-reduced-motion` with `data-motion="decorative"` on the
  animated element itself, not on an ancestor.
- **Screenshots are a last resort.** Every image the assistant reads stays in its conversation, and
  its provider refuses a request once there are more than thirty — which cuts the work off mid-step
  and is expensive to recover from. Diagnose with text first (the console, `getBoundingClientRect`,
  computed styles); when a picture is genuinely needed, read one, once, and never re-read it.
  Deleting the temporary files afterwards is tidiness, not what keeps the count down. **Keep a
  running count aloud and say when it passes about twenty**, so the owner can `/compact` before it
  reaches thirty.

## Non-negotiable

1. **Nothing hardcoded.** No visible string, URL or data literal inside a `.vue` template. It comes
   from a prop, from `src/locales/`, or from `src/data/`. If you are typing a literal into a
   template, stop and move it.
2. **No literal colours.** Always `var(--token)`; `src/styles/tokens.css` is the only file that
   declares a colour. The documented exceptions are colours that belong to a specific element rather
   than to the theme, and the design spec names each one: the availability dot's green `#39D98A`
   (spec §3.2) and Limonacho's palette (spec §3.16). The test is whether the colour should follow the
   theme — a white eye that turned dark in the light theme would be a bug, not a feature.
3. **Do not invent values.** Every measurement is in the design spec. If one is missing, measure it
   in the reference prototypes (`krub brand/reference/`, outside this repo) — never approximate.
4. **JavaScript, not TypeScript.**
5. **Do not port the prototype's HTML.** The reference runs on a prototyping runtime (`support.js`,
   `<x-dc>`, `<sc-for>`, inline styles); rewrite as idiomatic Vue with `<script setup>` and
   `<style scoped>`.
6. **One `requestAnimationFrame` for everything that follows the mouse** — cursor, lemon pupils,
   magnetic hover. Never one loop per component. (The 3D logo is the exception: Three's renderer
   owns its own loop, and it is paused while off-screen.) Every listener registered on mount is
   removed on unmount.

## Language, comments, commits

- The repository is written in **English**: identifiers, comments, commit messages and the `.md`
  files. Conversation with the owner happens in Spanish.
- The owner is learning Vue on this project. Composables and blocks of scroll or animation logic get
  a short comment explaining *why*, not *what*. Do not comment the obvious.
- **Do not run `git commit`.** Stage the work and hand over a ready-to-run command; the owner
  commits. One commit per roadmap step, subject in the imperative.

## Working rhythm

Finish a step, then stop and summarise what changed and which files were touched, so it can be
reviewed in the browser before the next one starts. Record any decision that is not obvious from the
code in [`docs/decisions.md`](docs/decisions.md).

## Settled design decisions — do not "improve" these

- The yellow `#FFC800` is the same in both themes; what changes is what is painted with `--mark`.
- The giant section number overlaps the title on purpose.
- The square hero stage holds the 3D logo and carries no explanatory text inside it. The scene is
  the mark and the room behind it; the frame around it is CSS.
- No filler project cards, no user hints ("click to open", "optional section", photo captions).
- The lemon enters in a straight line from the right, no tilt, flat yellow body, no gradient.
- The project card arrow is `↗`, not `→`.
- The availability dot does not blink: the core is fixed, the outer ring pulses.
