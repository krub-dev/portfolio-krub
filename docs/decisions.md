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

---

### 8. No HTML inside translation files, and no `v-html` anywhere

**Date:** 2026-09-05 · **Status:** active

Two strings in the prototype's dictionary carried markup: the hero headline (`<br>` plus a
`<span style="color:var(--acc)">` around one word) and the footer credit (an inline heart SVG).
The obvious port is `v-html`, and it would work — the dictionary is ours and static, so there is
no injection risk here.

They are split into parts instead. The headline became five keys (`line1`, `line2`, `line3pre`,
`line3accent`, `line3post`) and the credit became `madePre` / `madePost`, with the markup living
where markup belongs: in the template. The heart becomes a real inline SVG in `TheFooter`.

The reason is not security, it is ownership. `style="color:var(--acc)"` inside a JSON file is a
styling decision hiding in a data file, invisible to anyone grepping the stylesheet. The same
goes for an SVG path. It also means the project contains no `v-html` at all, so the rule "we do
not use `v-html`" needs no exceptions to remember.

**Trade-off:** more keys per sentence, and a translator has to keep the fragments consistent.
Acceptable for two strings.

---

### 9. Dictionaries are nested JSON, not flat dotted keys

**Date:** 2026-09-05 · **Status:** active

The prototype used flat keys (`"hero.badge": "..."`). vue-i18n resolves `t('hero.badge')` as a
*path* into nested objects, so a literal flat key is not what it looks for. The JSON is nested
instead; templates are unaffected, since `t('hero.badge')` reads identically either way.

Timeline entries use `e1`, `e2`… rather than `1`, `2`, because numeric keys in a path are
ambiguous with array indices.

---

### 10. Theme and language are restored by an inline script in `index.html`

**Date:** 2026-09-05 · **Status:** active

`main.js` loads as a module, which is deferred, so the browser paints once before Vue runs. A
visitor who chose light would see a dark flash on every load. A small blocking script in
`<head>` reads the same two `localStorage` keys and sets `data-theme` and `lang` before the
first paint; `initTheme()` / `initLang()` then take over.

**Trade-off:** the two storage key names are written in two places. Worth it — the alternative
is a visible flash on every page load.

---

### 11. Accent fills and accent text are separate tokens

**Date:** 2026-09-05 · **Status:** active · **Overrides the design spec**

The spec said the brand yellow is identical in both themes. That holds for fills, but as *text*
on the light background `#FFC800` measures **1.40:1** against `#F5F3EE` — not a tight pass, an
unreadable one. It fails even the 3:1 large-text allowance, by a factor of two.

This was not only the hero headline. Every place the design uses yellow text on the page
background had it: the active navbar link, the current-period years in the timeline, the `[0N]`
indices, the project type labels, the project count superscript. Most of those are 10–12px mono,
where 3:1 does not apply and the requirement is 4.5:1.

Rejected alternatives:

- **`--acc-2` (`#B98C00`)** — 2.78:1. Still fails, even for large text.
- **`--mark` (`#0C0C0D`)** — passes at 17.63:1, but `--fg` is `#141416`, so the accent word would
  be visually identical to the rest of the headline. The emphasis disappears exactly where the
  design wants it most.

So `--acc-text` (and `--acc-text-2` for hover) were added: `#FFC800` in dark, `#8A6A00` in light
(4.57:1, AA at any size). It still reads as gold rather than brown, and it keeps the word
distinct from the near-black body text.

`--acc` keeps its job — yellow **fills** with `--on-acc` on top — and does not change between
themes, exactly as the spec intended. The giant section number also keeps `--acc`: it is
decorative, `aria-hidden`, and its opacity is already handled by `--sec-idx`.

The global `a` / `a:hover` rules moved to the new tokens for the same reason.

**Owner signed off on overriding the closed decision** after seeing the two themes side by side.

---

### 12. Content lives in `src/data/`, interface strings in `src/locales/`

**Date:** 2026-09-05 · **Status:** active

The roadmap left this open: do translatable project strings stay inside the entry or move to the
dictionary? Answer: they stay in the entry — and the same rule was extended to every piece of
prose on the site.

    sentences I wrote     ->  src/data/    (both languages side by side in one file)
    labels the UI needs   ->  src/locales/ (nav paths, button labels, aria-labels)

So the hero headline, the About paragraphs, the marquee phrases and the contact line moved out
of `en.json` / `es.json` into `src/data/copy.js`, next to the collections.

The reason is editing, not purity. This content evolves for years: projects get added, the About
text gets reworked, testimonials become real. With the dictionary approach, changing a paragraph
means opening `en.json`, finding the right nesting, then doing it again in `es.json` — and adding
a project means editing three files with nothing to stop you leaving an orphan key behind. With
both languages in one file, a rewording is one edit in one place, and deleting an entry deletes
its translations with it.

`src/data/index.js` re-exports everything and carries the explanation, so there is one obvious
file to open first.

**Trade-off:** a real translation workflow (a translator, a TMS) wants all strings in one
extractable format. Not the situation here — one bilingual author, editing prose in context.
If that ever changes, the collections are still structured enough to extract mechanically.

---

### 13. `src/data/config.js` for the optional sections

**Date:** 2026-09-05 · **Status:** active

Design spec §4 lists "show testimonials" and "show lemon" as configuration. They live in
`config.js` as plain booleans, alongside the footer clock's timezone, rather than becoming
magic constants inside components. `showTestimonials` ships **off**, because the quotes in
`testimonials.js` are still placeholders.
