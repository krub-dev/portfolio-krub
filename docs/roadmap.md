# Build roadmap

The order I am building this in, from an HTML prototype to a Vue 3 app. One step per commit,
each with an acceptance check I run in the browser before moving on.

Read [`design-spec.md`](design-spec.md) for the values and [`components.md`](components.md) for
the component contracts.

## Ground rules

1. **One step at a time.** Each step ends with a check in the browser, not with "it compiles".
2. **No invented values.** Every colour, size and curve is in the spec. Anything missing gets
   measured against the reference prototypes, never approximated.
3. **Nothing hardcoded.** No visible string, URL or data literal inside a template. A literal
   in a `.vue` file means it belongs in `locales/` or `data/` instead.
4. **Do not port the prototype's HTML.** It runs on its own prototyping runtime (`support.js`,
   `<x-dc>` tags, `<sc-for>`, `<sc-if>`, inline styles). It gets rewritten as idiomatic Vue with
   `<script setup>` and `<style scoped>`.
5. **Comment what is not obvious.** A short comment on every composable and on every block of
   scroll or animation logic — I am learning Vue on this project and I want to be able to read
   it back in six months.
6. **JavaScript, not TypeScript.**

---

## Step 1 — Scaffolding ✅

- Vite + Vue 3, dependencies installed, dev server running.
- `vue-router` (one route for now, but the door stays open) and `vue-i18n`.
- Folder structure per `components.md`.
- `index.html`: Google Fonts link (Space Grotesk 400/500/600/700, JetBrains Mono 400/500/700),
  `lang`, title and meta description.
- `assets/`, `icons/` and `uploads/` copied to `public/`.

**Check:** the page loads blank, no console errors, fonts available.

## Step 2 — Tokens and global styles ✅

- `src/styles/tokens.css` with both variable blocks from the spec (`:root` and
  `[data-theme="light"]`), the `@keyframes` (`marquee`, `dotHalo`, `bubbleIn`, `lemonShake`),
  the `body` reset, the default `a` and `a:hover` styles, `scroll-behavior:smooth`,
  `scroll-margin-top:96px` on sections with an `id`, the `prefers-reduced-motion` rule and the
  `cursor:none` rule (root **and descendants**).
- Imported once, in `main.js`.

**Check:** flipping `data-theme="light"` by hand in the inspector changes the page colours.

## Step 3 — Language and theme ✅

- `useTheme()`: reads the saved preference, writes `data-theme` on `<html>`, persists.
- `vue-i18n` with `en.json` and `es.json`, **defaulting to English**. Dictionaries are nested
  rather than flat, which is the shape vue-i18n resolves natively. The two prototype strings
  that carried HTML were split into parts instead of using `v-html`, so no markup lives in a
  translation file (decisions 8 and 9).
- `useLang()`: persists in `localStorage["krub-lang"]` and updates `<html lang>`.

**Check:** two throwaway buttons switch theme and language, and both survive a reload.

## Step 4 — Data ✅

Extract projects, experience, education, stack, socials and testimonials to `src/data/`, shaped
as described in §5 of the spec. Resolved: **all** prose — the hero headline and the About
paragraphs included — lives in `src/data/` with `en` / `es` side by side in one file, and
`src/locales/` keeps only the strings the interface needs (decision 12).

**Check:** a `console.log` of each collection with the expected shape.

## Step 5 — Base components ✅

`BaseButton`, `SectionHeading`, `TechIcon`, `StackGroup`, `SocialLink`, `TimelineItem`,
`TabSwitch`, `AvailabilityBadge`, `SpeechBubble`. All stateless, with the props from
`components.md`.

**Check:** a scratch route showing every variant of each one in both themes, compared against
the design system prototype.

## Step 6 — Sections, top to bottom ✅

One per commit, in this order: `HeroSection`, `MarqueeBar`, `AboutSection`, `ProjectsSection`,
`StackSection`, `TestimonialsSection`, `ContactSection`. Layout and data only; no scroll
behaviour yet.

**Check:** the full static page matches the prototype on desktop and mobile, in both themes and
both languages.

## Step 7 — Fixed chrome ✅

`TheNavbar` (compact state and the natural-width measurement), `TheFooter` (scroll entrance and
publishing `--footer-h`), `TheMobileMenu`, `ScrollProgress`.

**Check:** scrolling down shrinks the navbar and brings the footer in; content is never covered
by the footer; on mobile the footer is there from the start.

## Step 8 — Pointer interaction ✅

- `usePointer()`: one source of mouse position and one `requestAnimationFrame`.
- `CursorFx` (10px dot + 40px ring, per §3.13 of the spec).
- `useMagnetic()` over `[data-magnetic]`.
- 3D logo parallax in `LogoStage`.
- `LemonPet` with cursor-following pupils, a shake on click and a timed speech bubble.

**Check:** with a mouse, the native cursor and the pointer hand are hidden everywhere; on touch
none of it mounts. No animation loop survives unmount.

## Step 9 — Scroll navigation ✅

- `useScrollSpy()` and the yellow highlight on the active link (navbar and mobile menu).
- Crossfade between the two `BackgroundGrid` layers on reaching "about".
- TOP button and "back to top" with smooth scrolling.

**Check:** while scrolling, the link for the section I am in is the only yellow one.

## Step 10 — Project modal ✅

`ProjectModal` with `MediaCarousel` and `SpecList`. Body scroll lock, close on backdrop, on the
button and **on Escape** (the prototype does not have this; it gets added). Focus trapped inside
the modal while open.

**Check:** open and close each project, navigate images with the arrows, close with Escape.

## Step 11 — Final pass ✅

- Accessibility: `aria-label` on every text-free button, `aria-hidden` on everything
  decorative, correct tab order, visible focus.
- `prefers-reduced-motion`: disables marquee, dot halo and sliding entrances.
- Lighthouse on desktop and mobile; the target is 100 on accessibility and best practices.
- Open Graph metadata and favicon.
- Verify not one literal string remains in a `.vue` file.

## Step 11.5 — Tests ✅

Deliberately small. The point is that the project has a safety net and that the testing setup
exists, not to chase coverage. After step 11, because that step still moves things.

**Vitest** — the Vite-native JUnit. Pure logic only, no browser, fast:

- the timeline period formatter: `2024 — now`, `2018 — 2024`, and a single year printed once;
- the carousel's wrap-around, including that going back from the first slide lands on the last
  (JavaScript's `%` keeps the sign, so `-1 % 4` is `-1` — that is the bug the test guards);
- `useTheme` / `useLang`: they persist, they restore, and they survive `localStorage` throwing.

**Playwright** — a real Chromium, a handful of flows. Worth it for one specific reason: these
are exactly the things that could not be verified during development, because the tooling
browser ran no frames, so `requestAnimationFrame`, scroll events and CSS transitions never
advanced. A real browser runs all three.

- the navbar goes compact on scroll and shrinks to its content;
- the footer slides in and never covers the last section;
- exactly one nav link is highlighted while scrolling through the page;
- the modal opens, traps focus, closes on Escape, and returns focus to the card;
- theme and language survive a reload.

**Check:** `npm run test` and `npm run test:e2e` both green from a clean checkout.

## Step 12 — Publish ✅

Live at [krub.dev](https://krub.dev), on Vercel, deployed from `main`. `www` 308s to the apex,
which is the canonical address. Verified against production rather than against localhost: the
Playwright suite passes over the real domain, and Lighthouse scores 98 desktop / 88 mobile with
100 in accessibility, best practices and SEO.

The CV was pulled from the deployment first — it carried a phone number and a home address — and
the blob was purged from the git history before the repository went anywhere.

---

## Later

Not needed to get the site live. Written down so they do not evaporate.

### Mobile

Seen on a real phone after launch. The first three are one problem wearing three hats.

- **Rework the hero on a phone.** Below 900px the hero grid collapses to a single column, so the
  text and the square stage stack and the section needs roughly two viewports. Everything else
  follows from that: `.hero-wrap` gives up its fixed `100svh` and switches to `height: auto`, so
  **the marquee is pushed below the fold** instead of landing on it the way it does on desktop,
  and the stage is what gets cut. The fix is not a nudge to the marquee — it is making the hero
  fit a phone screen, at which point the wrapper can keep its one-viewport height and the band
  lands at the fold on its own. Wants designing: what the hero shows on a narrow screen, and
  whether the stage belongs there at all.
- **Decide whether the 3D scene runs on a phone.** Related but separate, and it is a budget
  question rather than a layout one: a WebGL canvas on a mid-range phone costs battery and main
  thread, and mobile performance is already the weaker of the two Lighthouse scores. Options are
  render it, drop to the flat mark below some width, or gate it behind
  `prefers-reduced-motion` and a device check. Decide before the scene is built, not after.
- **The footer should slide in on a phone too.** It is currently present from the first frame
  below 900px — a deliberate call, on the reasoning that a phone is always near the bottom of
  something and the slide would read as a glitch. On a real device that turned out wrong: it
  takes fixed space before the visitor has scrolled anything, and it arrives before the lemon,
  which does animate in. Both should appear together, and the trigger should be **the end of the
  hero wrapper** rather than today's `0.55 × innerHeight` — the marquee is the line the visitor
  reads as "the page has started". `HomeView.vue` already carries a `data-hero-wrap` attribute
  with nothing reading it; that is the handle.

### Content

Nothing here is a code problem. The switches and the layout are already built and waiting.

- **Rewrite the CV.** ATS-friendly, in both languages, without the phone number and home address
  the original carried. Drop it in `public/uploads/` and set `showCv: true`.
- **Real testimonials.** Switched off in `config.js` until the quotes I am asking for arrive.
  Placeholders were never going to ship.
- **Reread my own prose.** All of it is in `src/data/`, in both languages, one file per kind of
  content. It was always going to be iterated after launch rather than written once.
- **Bing Webmaster Tools.** Google Search Console is done and the sitemap submitted. Bing is the
  same five minutes and also feeds DuckDuckGo.

### Technical

- **Self-host the two fonts.** Lighthouse on production: 98 desktop, 88 mobile, and the whole
  gap is the Google Fonts stylesheet — it blocks the first paint for 834 ms and makes a chain
  three hops deep, since the browser has to fetch the stylesheet before it learns which `.woff2`
  files to ask for. The server itself answers in 38 ms and blocking time is 0. Two `.woff2` in
  `public/` and an `@font-face` block in `tokens.css` collapse the chain to one hop.
- **A real 404 page.** Right now an unknown path falls through to Vercel's plain text. It should
  be the site's own: the grid, the type, the cursor, and a way back to the top of the page. A
  second route also puts the router to the use it was wired up for.
- **Audit the documentation against the code.** Every `.md` here plus the README. It has drifted
  once already — four claims in the README were untrue and two files described components and
  composables that do not exist. Worth doing while the build is still fresh in mind, because the
  cost of checking a claim rises the longer it has been since it was written.
- **Vercel's newer DNS records.** The domain answers on the legacy ones and Vercel says they will
  keep working; the dashboard shows an amber "DNS Change Recommended". Optional, five minutes.

### Design and features

Each of these wants deciding before it gets built.

- **The 3D logo.** The hero stage is the slot reserved for it — that is why it is empty and
  carries no explanatory text. `LogoStage.vue` already owns the mask, the parallax and the inner
  grid, so a Three.js scene replaces the `.mark` element and nothing else has to move. Needs the
  model out of Blender first, exported as glTF/GLB. See the mobile note above before starting.
- **Rethink the stack section.** The icon grid is faithful to the spec but flat. Ideas so far:
  animation, no colour, a mask, softened edges.
- **Give contact more weight** as the end of the page, and consider a simple form instead of only
  a mailto. A form needs somewhere to send it — Web3Forms is already proven on CreandoMientras.
- **Turn Limonacho into something that answers.** A small chat backed by a model and given the
  contents of `src/data/` as its context, so a visitor can ask about a project instead of reading
  for it — with a bit of Murcian in the voice, because a mascot that talks like documentation is
  not a mascot. Needs a server-side endpoint: an API key cannot live in a static bundle. The
  speech bubble and its timers are already built and would become the chat surface.

The site is live, so anything that touches code goes on a `dev` branch and `main` keeps matching
what is published.
