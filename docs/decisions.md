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

---

### 14. The hero's viewport-height escape is keyed to width, not just height

**Date:** 2026-09-05 · **Status:** active · **Fixes a prototype bug**

The hero and the marquee share a wrapper that is exactly `100svh`, so the yellow band lands at
the fold. The prototype's only escape from that was `@media (max-height: 700px)`, which switched
the wrapper to auto height.

That is the wrong axis. Below 900px the hero grid collapses to a single column, so the stage
stacks under the text and the section needs roughly twice the height. Measured at 375×812: the
content overflowed its box by 35px and the marquee covered the bottom of the logo.

It hid well. A real phone with browser chrome often reports a viewport under 700px tall, which
fired the height rule and made the page look correct — this was first noticed as "fine on a real
iPhone 12, broken in the inspector at the same device size". Emulators, taller phones, and any
browser with collapsed toolbars do not get that accidental rescue.

The rule is now `@media (max-width: 900px), (max-height: 700px)`. Width is the honest trigger:
the single-column layout is what needs the room.

Verified at 375×667, 375×812, 390×844, 412×915, 768×1024 (no overflow, nothing clipped, no
horizontal scroll) and at 901×800 and 1280×800, where the two-column layout and the
marquee-at-the-fold behaviour are unchanged.

---

### 15. The design spec's keyframe list was incomplete

**Date:** 2026-09-05 · **Status:** active

The spec lists four keyframes: `marquee`, `dotHalo`, `bubbleIn`, `lemonShake`. The prototype's
hero also runs `nameOpen` and `nameSplit` — the animation that reveals "KIKO / RUBIO" out of
"KRUB". It is the first thing a visitor sees, so it stays; both keyframes were added to
`tokens.css` and the markup lives in `BrandName.vue`, with a reduced-motion branch that shows the
finished state without moving.

Two further spec/prototype disagreements, both resolved in favour of the **prototype**, on the
grounds that it is the artefact that was reviewed and approved:

- Hero headline: spec says `clamp(38px, 6.4vw, 82px)` / `-.04em`; prototype has
  `clamp(38px, 6vw, 76px)` / `-.035em`.
- Hero stage grid: spec says the 72px page pattern; prototype uses 40px, which is what stops it
  reading as noise inside a 520px box.

The spec table looks like transcription drift rather than intent.

---

### 16. One rAF loop and a subscription list for everything that follows the mouse

**Date:** 2026-09-05 · **Status:** active

Four effects track the cursor: the custom cursor, the magnetic hover, the logo parallax and the
lemon's pupils. Each one running its own `requestAnimationFrame` would mean four callbacks per
frame competing to read layout and write styles, and four chances to leave a loop running after
unmount.

`usePointer(callback)` owns the single loop and a `Set` of subscribers. It starts when the first
subscriber arrives and stops when the last one leaves.

The pointer position is a **plain object, not a ref**. A reactive ref would re-render every
component that reads it sixty times a second, for values that never reach a template —
subscribers write to the DOM directly through their own element refs. Reactivity is for state
the user sees; this is animation.

Nothing subscribes on touch devices or below 900px, matching the design. `CursorFx` also hides
itself with a media query, because the `v-if` is evaluated once at setup and a window resized
across 900px would otherwise leave a dot frozen where the mouse last was.

---

### 17. The ring trails the dot in CSS, not in JavaScript

**Date:** 2026-09-05 · **Status:** active

Both cursor elements are given the same position every frame. The ring simply carries a 0.28s
transition on `transform`, so the browser interpolates its way there while the dot arrives
instantly. One line of CSS instead of a spring simulation, and the easing curve is the one the
design spec already specifies.

---

### 18. Limonacho's colours are element colours, not tokens

**Date:** 2026-09-05 · **Status:** active

The lemon uses literal colours: the leaf greens, white eyes, `#0C0C0D` pupils, and pores mixed
from `var(--acc)` toward black. The design spec §3.16 names each one.

The test for whether something should be a token is whether it should follow the theme. A white
eye that turned dark in the light theme would be a bug, not a feature. Same reasoning as the
availability dot's green — the exception list in `CLAUDE.md` was just incomplete and now covers
the whole mascot.

---

### 19. The scroll spy asks "has the top edge crossed a line", not "is it visible"

**Date:** 2026-09-05 · **Status:** active

The textbook answer for a scroll spy is an IntersectionObserver, and it is the wrong tool here.
An observer reports how much of an element is on screen; the design asks whether a section's
top edge has crossed a fixed line at 35% of the viewport. Those disagree exactly where it
matters — a section taller than the window is never fully visible, and two short ones are
visible at once, so an observer has to be talked into a decision the threshold makes directly.

`useScrollSpy` walks the ids in document order and keeps the **last** one past the line. That
is what makes it settle on the section you have scrolled into rather than the one still coming.

`'top'` leads the list even though the hero has no nav link. While it is active none of the four
links match, so nothing is highlighted until you have actually left the hero.

Both this and the grid crossfade ride the shared listener in `useScroll` — no new listeners.

---

### 20. Two grid layers, two thresholds

**Date:** 2026-09-05 · **Status:** active

The background is two `BackgroundGrid` instances that crossfade, not one element that changes.
They cannot be the same element: the hero layer is absolute and one viewport tall so it scrolls
away with the hero, while the global layer is fixed, stops at the footer, and carries a mask
that fades it downward.

The swap fires when `#me` reaches 60% of the viewport — a different line from the spy's 35%,
and deliberately earlier, so the background has settled before the nav link lights up.

Verified at the pixel: the crossfade flips between scrollY 318 and 322 (line at 320), the
highlight between 518 and 522 (line at 520).

---

### 21. The modal is teleported to `<body>`

**Date:** 2026-09-05 · **Status:** active

`ProjectModal` renders inside a `<Teleport to="body">`. Left where it is declared it would sit
inside `.app`, which has `position: relative` and `overflow-x: hidden` — a stacking context the
dialog would be trapped in, and a clipping box that a fixed overlay has no business being inside.
Teleport keeps the component's logic and props where they belong while putting its DOM at the
top level.

---

### 22. Escape and the focus trap were added; the prototype has neither

**Date:** 2026-09-05 · **Status:** active

The design spec's modal closes on the backdrop and on the ✕ button. Both were kept, and two
things added:

- **Escape**, on a document listener that only exists while the dialog is open. A dialog that
  cannot be dismissed from the keyboard is a trap.
- **A focus trap** (`useFocusTrap`). Without it Tab walks straight out of the dialog into the
  page behind — still there, still full of links, just invisible under a blur. It also restores
  focus to the card that opened the dialog on close, so the page does not jump.

The backdrop handler checks `event.target === event.currentTarget`, so a click that starts
inside the panel and drifts onto the backdrop — selecting text — does not close it.

---

### 23. Locking body scroll compensates for the scrollbar

**Date:** 2026-09-05 · **Status:** active

`overflow: hidden` on `<body>` removes the scrollbar, the viewport gets ~15px wider, and the
whole page visibly jumps sideways as the modal opens. `useBodyScrollLock` measures the gap
(`window.innerWidth - document.documentElement.clientWidth`) and replaces it with padding of the
same width.

The measurement is what makes it correct everywhere: on overlay-scrollbar platforms — phones,
macOS by default — the gap is 0, no padding is added and nothing moves. Verified: 15px on
desktop, none at 390px wide.

---

### 24. A visible focus ring, using `:focus-visible`

**Date:** 2026-09-05 · **Status:** active · **Not in the design spec**

The project had no focus indicator at all. That is worse here than in most sites: the custom
cursor sets `cursor: none` across everything, so a keyboard user would have had no pointer AND
no ring — nothing whatsoever to say where they were on the page.

`:focus-visible`, not `:focus`. The browser decides: a keyboard user gets the ring, someone who
clicked a button with a mouse does not. That removes the old excuse for stripping outlines
because "they look bad on click".

`outline` rather than a border or a box-shadow — it does not affect layout, it follows the
border-radius, and it is not clipped by `overflow: hidden`.

One override: on a filled yellow control the yellow ring would be invisible, so `--acc` fills
switch their ring to `--fg`. Verified on the navbar CTA: yellow background, `#F2F0EA` ring.

---

### 25. Reduced motion covers transitions, not just keyframes

**Date:** 2026-09-05 · **Status:** active

The spec asks for the marquee, the dot halo and the sliding entrances to stop under
`prefers-reduced-motion`. Half of that motion is not keyframe animation at all — the footer
sliding in, the navbar capsule resizing over 0.55s and the grid crossfade are CSS transitions,
and `animation: none` does nothing to them.

The `[data-motion="decorative"]` rule now clears both. Killing a transition still leaves the
element at its final value: the footer arrives, it just does not travel.

Six elements are marked: both background grids, the navbar capsule, the availability ring, the
marquee track and the footer. Colour and border hovers are deliberately NOT marked — a 0.16s
colour change is not what the setting is asking about.

---

### 26. The project card gets an explicit `aria-label`

**Date:** 2026-09-05 · **Status:** active

The whole card is one `<button>`, so without a label a screen reader falls back to its contents
and announces the title, the type, the summary and three technologies as the *name of a single
control*. "Open project: Showroom" is what someone needs to hear before deciding to press it —
the rest is still readable inside the card.

Audited across the rendered page: 25 interactive controls, all with an accessible name, none
longer than 70 characters.

---

### 27. `--fg-3` was raised: the spec's value failed contrast

**Date:** 2026-09-05 · **Status:** active · **Overrides the design spec**

Lighthouse's accessibility audit came back at 93, and half of that was `--fg-3`. The spec's
values scored **3.55:1** (dark, on `--surface`) and **3.16:1** (light, on `--ink`) — under the
4.5:1 that text below 18pt requires.

It matters because `--fg-3` is used almost only at 10–12px: the timeline years, the stack group
labels, the technology line on a project card, the whole footer, the availability badge. Every
one of those is small text, so none of them get the large-text allowance.

Raised to `#868580` (dark) and `#706F6B` (light) — the smallest change that clears AA against
both `--ink` and `--surface`. Measured after the change: 4.98 / 5.29 dark, 4.54 / 5.03 light.
It is still visibly the quietest text on the page.

Second token to be overridden for contrast, after `--acc-text`. The pattern is the same: the
spec was written for how the colours look, not for what they measure.

---

### 28. The project card uses the overlay pattern, not a button around everything

**Date:** 2026-09-05 · **Status:** active

The card was one `<button>` wrapping all its content. That works for mouse and keyboard, but
the control's accessible name becomes everything inside — title, type, summary, three
technologies — announced as the name of a single button. Adding an `aria-label` fixed the
announcement and broke WCAG 2.5.3 (Label in Name) instead: the visible text was no longer
contained in the accessible name, so a voice-control user saying "click Showroom" would match
nothing.

The button now wraps only the title and is stretched over the card with an `::after` overlay.
The accessible name is "Open project: Showroom", which contains the visible "Showroom"; the
summary is ordinary readable text again; the whole card surface is still clickable — verified
with `elementFromPoint` at all four corners.

The focus ring needed one extra rule: without it the outline traced the invisible overlay — the
entire card — instead of the title.

---

### 29. Other findings from the Lighthouse pass

**Date:** 2026-09-05 · **Status:** active

- **`aria-label` on a `<p>` is prohibited ARIA.** `aria-label` is only allowed on elements with
  a role that supports a name, and `<p>` has none, so the hero name's label was silently doing
  nothing. `role="img"` makes it legal and is the honest description: it is lettering, not a
  paragraph. This was also the only thing failing Lighthouse 13's new "Agentic Browsing" audit.
- **The language button's label did not contain its visible text.** It showed "EN" and was
  labelled "Switch language". Now "EN — Switch language", so voice control can address it.
- **`robots.txt` returned the SPA's `index.html`**, which Lighthouse parsed as an invalid
  robots file. Added a real `robots.txt` and a one-URL `sitemap.xml` in `public/`.

---

### 30. Lighthouse results, and what is left on performance

**Date:** 2026-09-05 · **Status:** informational

After the fixes above, measured against the production build on `localhost:4173`:

| | Desktop | Mobile |
|---|---|---|
| Performance | 98 | 82 |
| Accessibility | **100** | **100** |
| Best Practices | **100** | **100** |
| SEO | **100** | **100** |

The roadmap's target was 100 on accessibility and best practices. Met.

Performance is not a roadmap target and the remaining gap is almost entirely one thing:
**render-blocking requests, ~1,360 ms of the mobile LCP**, which is the Google Fonts stylesheet
in `<head>`. Everything else is small — 24 KiB of unused JavaScript (vue-i18n and the router,
both genuinely used) and 52 KiB from serving the profile photo as JPEG rather than WebP.
Cumulative Layout Shift is 0.

Two ways to remove the font cost, neither taken yet:

- **Load the stylesheet asynchronously** (`media="print"` + `onload`). Small change; introduces
  a flash of fallback text.
- **Self-host the fonts.** More work, removes the third-party request entirely, and avoids
  sending visitors' IPs to Google — which has been the subject of GDPR rulings in the EU.
  This is the better answer for a site on a personal domain.

Deferred on purpose until after deployment. This particular number is the one localhost
distorts most: every other asset is served with zero latency while the font request goes to the
real internet, so the fonts look disproportionately expensive here. Measure again on the
deployed site before optimising against a number that is partly an artifact.

---

### 31. No `llms.txt`

**Date:** 2026-09-05 · **Status:** active

Lighthouse 13's "Agentic Browsing" category asks for one. It was written and then removed.

The reason is maintenance, not scepticism about the idea: it is the only file in the project
where the content would be duplicated **by hand** instead of coming from `src/data/`. Everything
else on this site has exactly one source. A file that silently goes stale every time a project
changes is worse than no file, and `llms.txt` is a 2025 proposal, not a standard — so the cost
is certain and the benefit is not.

If it is ever added, it should be generated from `src/data/` at build time, not written twice.

---

### 32. The favicon is built from the vector logo, not the old raster icon

**Date:** 2026-09-05 · **Status:** active

`assets/img/krub-icon.png` came from the previous site and was a rasterised version of the logo.
Two problems: it was a PNG, and the mark sat small inside its canvas, so in a tab strip next to
twenty other favicons it read as a smudge.

`public/favicon.svg` is generated from the vector source (`krub logo.svg`), on a full-bleed
`#FFC800` circle with the mark in `#0C0C0D`. The mark is scaled to **78% of the diameter** — a
favicon has to survive at 16px, and a logo floating in whitespace does not. The path's bounding
box was measured with `getBBox()` (949.2 × 564.26, aspect 1.6822 — the documented 1.682) so the
centring is exact rather than eyeballed.

`public/apple-touch-icon.png` is the same artwork at 180×180, because iOS still will not take an
SVG for a home-screen icon. It is a **square**, not a circle: iOS applies its own rounded-corner
mask, and a circle would leave transparent corners showing.

The colours are literals inside an image file, which is not a token violation — an icon is
rendered by the browser chrome, outside the page, where CSS variables do not exist. It also has
to stay the same in both themes.
