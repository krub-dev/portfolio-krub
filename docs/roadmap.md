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

## Step 12 — Publish

`npm run build`, GitHub repository, deploy to Vercel or Netlify, `krub.dev` pointing at it.
