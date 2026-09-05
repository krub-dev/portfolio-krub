# Decisions

A running log of choices that are not obvious from reading the code, with the reasoning
behind them. Newest at the bottom. If a decision here contradicts
[`design-spec.md`](design-spec.md), this file wins — the spec is the visual contract, this is
the record of where I have moved away from it.

---

### 1. Static assets live in `public/`, not `src/assets/`

**Date:** 2026-09-05 · **Status:** active

Stack icons and project images are referenced by name from the files in `src/data/`, and the CV
is a plain link. Under `public/` the paths are stable literals
(`/icons/vuejs/vuejs-original.svg`) that a data file can hold as a string. Going through the
bundler would mean importing each of the 24 icons individually or resolving them with a glob,
for a caching benefit that does not matter at this size.

**Trade-off:** these files are not fingerprinted, so a changed icon needs a cache bust. Acceptable
for assets that essentially never change.

---

### 2. Default language is English

**Date:** 2026-09-05 · **Status:** active

`index.html` ships `lang="en"`, and vue-i18n will use `en` as both the initial locale and the
`fallbackLocale` in step 3. Spanish is available through the toggle and is persisted in
`localStorage["krub-lang"]`.

The reasoning is audience: this is a portfolio, and most of the people opening the link will not
read Spanish. There is no browser-language detection on purpose — I would rather know exactly
what a recruiter sees when they open the link than have it depend on their machine.

This overrides the original spec, which assumed Spanish first.

---

### 3. The site title is `krub — Fullstack Developer`

**Date:** 2026-09-05 · **Status:** active

The design spec never fixed a `<title>`. This one uses the handle rather than the full name
because the domain, the GitHub account and the logo all read `krub`, and the tab is one more
place for that to be consistent.

---

### 4. Text is LF everywhere, enforced by `.gitattributes`

**Date:** 2026-09-05 · **Status:** active

`* text=auto eol=lf` overrides Git for Windows' `core.autocrlf=true`, so the working copy is LF
on Windows too, matching the Linux build machine. Without it every checkout rewrites line
endings and diffs show whole files as changed. Binary assets are marked `binary` so nothing
tries to normalise inside them.

---

### 5. Reference prototypes stay out of the repository

**Date:** 2026-09-05 · **Status:** active

The `.dc.html` prototypes and their `support.js` runtime are gitignored, along with the
root-level `assets/`, `icons/` and `uploads/` copies that only exist so those prototypes open
straight from disk. They are ~190 KB of files that are explicitly not production code, and the
shipped copies already live in `public/`.

They are still needed locally: when the spec does not state a value, it gets measured there.

---

### 6. No global `box-sizing: border-box`

**Date:** 2026-09-05 · **Status:** active

Every measurement in the design spec was taken against the browser default, `content-box`.
Switching the whole project to `border-box` would silently change what `max-width` plus
`padding` resolves to — the navbar capsule and the 44px icon tile being the obvious cases —
and each of those would then need re-measuring against the prototype.

The few elements that genuinely want `border-box` declare it themselves, which is what the
spec already does for the icon tile.

**Trade-off:** this goes against the common modern default, so it needs stating out loud
rather than being discovered later.

---

### 7. `/preview` is a dev-only route

**Date:** 2026-09-05 · **Status:** active

A visual sheet for the token layer — swatches, type scale, radii, shadows, the four keyframes
running live, and a theme switch — lives at `/preview`, registered only under
`import.meta.env.DEV` and lazily imported, so it is absent from the production bundle
(verified: no chunk for it, no strings from it in `dist/`).

It is the one file allowed to contain literal strings in its template, because the strings are
the subject rather than content. It grows in step 5 to cover the base components, and is
deleted before launch.
