# krub.dev

My personal portfolio. A single-page site, bilingual (English / Spanish), with a dark and a
light theme, built with Vue 3 and Vite.

Live at [krub.dev](https://krub.dev) · Kiko Rubio, fullstack developer in Barcelona.

## Stack

- **Vue 3** with `<script setup>`, plain JavaScript
- **Vite** for dev server and build
- **vue-router** — one route today, wired up so a second one does not mean restructuring
- **vue-i18n** — flat-key dictionaries, English by default
- No CSS framework. Design tokens are CSS custom properties in a single global stylesheet;
  everything else is `<style scoped>`.

## Running it

```bash
npm install
npm run dev
```

Then `npm run build` for a production bundle and `npm run preview` to serve it locally.

## Layout

```
public/            static assets served as-is (logo, photo, stack icons, CV)
src/
├─ components/
│  ├─ base/        stateless, reusable (BaseButton, SectionHeading, TechIcon…)
│  ├─ chrome/      fixed UI that owns behaviour (navbar, footer, cursor, mobile menu)
│  ├─ content/     project cards, modal, testimonials, marquee
│  └─ sections/    one component per page section
├─ composables/    shared logic, no markup (theme, language, scroll spy, pointer)
├─ data/           projects, experience, education, stack, socials, testimonials
├─ locales/        en.json / es.json
├─ router/
├─ styles/         tokens.css — the only source of colour in the project
└─ views/
```

Two rules the whole codebase follows: **no visible string lives inside a component** (it comes
from a prop or from the dictionary), and **no component declares a literal colour** (always
`var(--token)`).

## Documentation

- [`docs/design-spec.md`](docs/design-spec.md) — the visual contract. Every colour, size,
  easing curve and behaviour, section by section.
- [`docs/components.md`](docs/components.md) — component tree and the props of each one.
- [`docs/roadmap.md`](docs/roadmap.md) — the build order, with an acceptance check per step.
- [`docs/decisions.md`](docs/decisions.md) — decisions that are not obvious from the code, and
  why I made them.

## Licence

The code is mine to reuse; the content, the brand and the images are not. If something in here
is useful to you, take it.
