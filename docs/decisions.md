# Decisions

A running log of choices that are not obvious from reading the code, with the reasoning
behind them. Newest at the bottom. If a decision here contradicts
[`design-spec.md`](design-spec.md), this file wins — the spec is the visual contract, this is
the record of where I have moved away from it.

## Index

A map, not a second copy — the log stays chronological and newest-last. Add the
new number to its range when a decision is appended.

- **Foundations — 1–13.** Assets in `public/`, language, title, line endings, `box-sizing`,
  `/preview`, no HTML in the dictionaries, the theme bootstrap, the accent tokens, `data/` vs
  `locales/`, and `config.js`.
- **Chrome and motion — 14–26.** The hero's height escape, the single rAF loop, the cursor,
  Limonacho's colours, the scroll spy, the two grid layers, the modal, focus and reduced motion.
- **Accessibility and build — 27–34.** Contrast, the card's semantics, Lighthouse, the icons, Open
  Graph, and why there are two test runners.
- **Responsive, mobile and the 404 — 35–46.** The footer's height, safe areas, landscape, the compact
  navbar, self-hosted fonts, and the soft 404.
- **Interaction, theme and Limonacho — 47–53.** The softer magnetic pull, accent as its own axis, the
  iOS toolbar, the "acho", the stage glow and the menu dots.
- **Sections and copy — 54–68.** The contact band, testimonials inside Projects and then below the
  Stack, the contact endpoint, the Stack spotlight, the projects rail, the navbar's click band, em
  dashes, the fade, the pager, the grid cell under the pointer, the way back to the top, and the CV
  pipeline.
- **The CV tool and its themes — 69.** The generator moved out of the repository, and the dark PDF.
- **A UI pass — 70.** The testimonial dots, the grid cell off, scrollable tabs and the CTAs.
- **Polish and accessibility — 71–74.** The cooler light grey and the glow gone, the one-quote
  vertical pager, the `/me` tabs as a real tablist, and the 24px dots with the live region.
- **The hero's 3D stage — 75–85.** The mark as a real WebGL object, the room and its rig, the snap to
  the page's grid, the frame and the glow, the mark's motion and light, the tube's ignition, the
  shadow the frame casts into the tunnel, and how the render is finished.

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

### 3. The site title is `krub · Fullstack Developer`

**Date:** 2026-09-05 · **Status:** active

The design spec never fixed a `<title>`. This one uses the handle rather than the full name
because the domain, the GitHub account and the logo all read `krub`, and the tab is one more
place for that to be consistent. The separator is a middle dot rather than a dash, the same one the
footer uses — see decision 62.

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

**Follow-up (2026-09-16):** the same teleport is what let the native cursor back in. The
`cursor: none` rule is scoped to `[data-hide-cursor]` on `.app`, and teleporting the dialog to
`<body>` puts it outside that subtree — so the browser's own cursor appeared over the modal
alongside the custom one. The backdrop carries `data-hide-cursor` too now.

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

---

### 33. A purpose-built Open Graph banner

**Date:** 2026-09-05 · **Status:** active

`banner-krub.png` came from the previous site: 1500×500, which is a Twitter-header ratio, not
the 1.91:1 that Open Graph cards are laid out for. It was getting cropped, and it did not look
like this site.

`og-banner.png` is the hero rendered at 1200×630 — the page background with its 72px grid, the
square stage with the mark, the three-line headline with `backend` in `--acc`, the 104×3 yellow
rule, and a mono footer line. Drawn on a canvas with the site's real fonts loaded, so the
typography matches rather than approximates.

`og:image:width` and `og:image:height` are declared so a crawler can lay out the card before
the image finishes downloading.

**Known duplication:** the headline is written into the image, so it is the one place besides
`src/data/copy.js` where that sentence lives. Changing the hero copy means regenerating the
banner. That is inherent to social images — they are rendered artifacts — but it is worth
knowing rather than discovering.

**Where the generator lives (2026-09-23):** `build-og.mjs`, in the cv tool beside this repository
(`../cv/`), not here — it is a personal document tool that borrows the site's fonts, mark and
tokens, and the owner copies the PNG in by hand. The banner itself is unchanged in behaviour: the
hero rendered at 1200x630 by a real Chromium, because the typography has to be the site's own.

Unused assets removed along the way: `krub-icon.png` (replaced by the new favicon),
`krub-logo.webp` (referenced by nothing), and `banner-krub.png`.

---

### 34. Tests: Vitest for logic, Playwright for what only a browser can answer

**Date:** 2026-09-06 · **Status:** active

Twenty unit tests and five end-to-end flows. Deliberately small — the point is a safety net and
a working setup, not coverage.

**Vitest** covers pure logic and the two composables that touch storage: the timeline period
formatter, the carousel's index wrapping, and that `useTheme` / `useLang` persist, restore,
reject junk values, share one state between callers, and survive `localStorage` throwing.

Both composables keep state at module scope, which is what makes every caller share one source
of truth — and also means a plain import would leak state between tests. Each test calls
`vi.resetModules()` and imports a fresh copy.

**Playwright** covers the five things that could not be verified any other way, because they
depend on scroll events, animation frames and CSS transitions actually advancing: the navbar
going compact and shrinking to its contents, the footer sliding in without covering the last
section, exactly one nav link being highlighted, the modal trapping focus and returning it, and
theme and language surviving a reload. It runs against the production build, not the dev server.

It paid for itself immediately — see the next entry.

---

### 35. `--footer-h` was 18px short: `contentRect` is the content box

**Date:** 2026-09-06 · **Status:** active · **Bug found by the E2E suite**

`useFooterHeight` measured the footer with `entry.contentRect.height` from its ResizeObserver.
`contentRect` is the **content** box: it excludes padding and border. The footer has 9px of
vertical padding and a 1px top border, so a 49px element was reported as 31px, and the page
reserved 18px too little — the fixed footer sat on top of the end of the contact section.

Two things made it hard to see. The initial measurement, taken with
`getBoundingClientRect()`, was already correct; the observer then **overwrote** the right number
with the wrong one, so the bug only appeared once something triggered a resize. And in the
tooling browser used during development the observer never fired at all, so a manual check
measured the correct initial value and passed.

Fixed by using `getBoundingClientRect().height` in the observer too — the border-box height,
which is what the page actually has to reserve.

Two of the three initial E2E failures were bugs in the tests rather than the app:
`scrollIntoViewIfNeeded` does not scroll when an element is already partly visible, so sections
never crossed the spy's threshold; and a `.icon-btn` locator was matching the desktop control,
which exists in the DOM but is hidden at mobile widths.

---

### 36. `.vscode/` is ignored, including `extensions.json`

The Vite scaffold ships a `.gitignore` that ignores `.vscode/*` with one exception:
`extensions.json` stays versioned, so that anyone cloning the repository is offered the Volar
extension when they open it and gets Vue language support instead of a plain text file.

That exception is written for a team. On a repository with one developer it buys nothing: I
already have Volar, and VS Code suggests it by itself the first time it opens a `.vue` file.
What it costs is an editor's configuration folder sitting in the tree of a project that has
nothing to do with which editor anyone uses — and the folder is a directory entry on GitHub, so
it is the first thing above `docs/` in the listing.

So the exception is dropped and `.vscode/` is ignored whole. The file still exists locally and
still does its job; it is simply not versioned.

The general rule this follows: a file belongs in the repository when it changes what the
*project* is or how it *builds*. `vercel.json` and `playwright.config.js` qualify. An editor
hint does not.

---

### 37. No stage on a phone, and the navbar publishes its own height

Two mobile bugs, found on a real device and not in an emulator, which is the same lesson as
decision 35 and worth repeating: below 900px the hero grid becomes one column, so the text and
the square stage stack. At 375x667 that is 883px of content in a 667px viewport. The wrapper
gives up its fixed height, and the marquee — which on desktop sits exactly on the fold, and is
the first thing the page does — ends up 216px below it.

The stage is what does not fit, and it is not rendered below 900px. Every way of keeping it was
worse: sized to fit, it became a ~130px square framing a logo that is already in the navbar
directly above it, with the availability badge wrapping onto two lines inside it. The empty box
earns its space on a desktop, where it is half the composition and reserved for a scene worth
looking at. On a phone it was taking the marquee's place to show a smaller copy of the logo.

Two consequences, both good. The badge moves into the text column under the buttons, which is
where the desktop reading order puts it anyway. And `LogoStage` never mounts on a phone, so the
parallax never subscribes — which settles the open question of what a WebGL scene would cost on
a mid-range device.

The second bug was underneath the first. The hero cleared the fixed navbar with a hardcoded
88px, and the bar is 90px tall — so the name was already touching it in production, and
tightening the padding to fit the stage turned that into a visible overlap. The fix is the one
this codebase already uses for the footer: the element measures itself and publishes the number.
`useFooterHeight` was generalised into `useElementHeight`, the navbar publishes `--navbar-h`, and
the hero and `scroll-margin-top` both read it instead of repeating a guess that was wrong in two
places.

Verified across ten viewports from 320x600 to 1280x800. Everything from 360x640 up lands the
marquee on the fold with the name clear of the bar. A 320x600 viewport still overflows; that is
an iPhone 5 and it is not worth further compromise.

---

### 38. `viewport-fit=cover` and safe-area insets

The fixed footer was being cut in half on an iPhone. It is `position: fixed; bottom: 0`, and
when the browser collapses its own toolbar the viewport reaches past the home indicator — so
"the bottom of the viewport" and "the bottom of what you can see" stop being the same place.

iOS exposes that strip as `env(safe-area-inset-bottom)`, but the values are all zero unless the
page opts in with `viewport-fit=cover`. Adding that solves the footer and creates a second
problem: opting in also lets ordinary content run under the notch in landscape, which iOS was
handling by itself before. So the insets are put back explicitly — horizontally on `body`, and
on the two fixed bars, which position against the viewport and are not affected by the body's
padding.

Everything reads `env(..., 0px)`, so on a device without insets this is the same box it was.

Measuring pays off again here: because the footer publishes its real height, growing it by the
inset also moves the page's reserved bottom padding and the lemon's resting position. Neither
had to be told.

It did not work on the first attempt, and the reason is worth keeping. The phone block further
down the same file set `padding: 9px 20px`. A shorthand is one declaration, so that quietly threw
away all four inset paddings — on phones, the only place they matter. The change was in the file
and had no effect on the device, which is the most expensive kind of wrong. The insets are now
longhand, and the phone block overrides only the two sides it means to.

Separately, `App.vue` was the last `100vh` in a codebase that otherwise uses `100svh`. On iOS
those are different numbers — `vh` is the height with the toolbar hidden, `svh` with it visible
— so half the page was measuring against one and half against the other, and they stopped
moving together when the toolbar collapsed. That collapse cannot be prevented; making every
measurement agree is the part that was ours to fix.

---

### 39. Landscape on a phone: fix what is broken, do not design for it

A phone held sideways is about 390px tall. The site is not laid out for that and will not be:
a one-page portfolio read in landscape is a rounding error, and designing a third layout for it
would cost more than it returns.

Broken is a different thing from unoptimised, though, and two things were actually broken:

The mobile menu is a fixed panel with no height limit, so in landscape its lower half — the
social links and the back-to-top — was simply off the bottom of the screen with no way to reach
it. It now has a `max-height` in `svh` and scrolls. `box-sizing: border-box` on that panel too,
since this project has no global one and the padding was landing outside the limit.

And Limonacho, from a mistake made an hour earlier: adding `env(safe-area-inset-right)` to his
resting position moved it inward without moving the parked position, so `translateX(160%)` was
no longer far enough to hide him and he hung off the right edge from the first frame. The bottom
inset was double-counted for the same reason — it is already inside `--footer-h`, which is what
he stands on. He takes no insets at all now; the footer owns them.

---

### 40. The gutter is a token, and the safe area does not belong on `body`

Putting `padding-left/right: env(safe-area-inset-*)` on `body` looked like the tidy way to keep
text clear of the notch after `viewport-fit=cover`. It is not: it insets *everything*, and some
things are full-bleed by design. In landscape the marquee — a band that has to touch both edges
— became a stripe with black margins either side.

The inset belongs where the page's own gutter is, so the gutter became a token:

    --gutter-l: max(clamp(20px, 5vw, 64px), env(safe-area-inset-left, 0px))
    --gutter-r: max(clamp(20px, 5vw, 64px), env(safe-area-inset-right, 0px))

`max()` rather than a sum, so a device with no notch gets exactly the gutter it always had.
Two of them because in landscape the notch is on one side only and which side depends on which
way the phone was turned. Every section now uses these instead of repeating the same `clamp` —
which it did in six files — and the marquee, which never had a gutter, is untouched and reaches
the edges again.

The footer's bottom padding is `max(9px, env(...))` for the same reason: added on top, the inset
pushed the credit further from the edge than it needs to be.

### 41. Limonacho: position on `bottom`, animate on `transform`

He stands on the footer and slides in from the right, and both used to be one `transform` with a
0.55s transition on it. That was fine until the footer started changing height on its own: when
iOS collapses its toolbar the safe-area inset appears and the footer grows ~34px in a single
frame, while the lemon took half a second to catch up — overlapping it the whole way down.

A transition cannot animate one axis of a transform and not the other. So the two jobs are split
by property: the vertical offset is `bottom: calc(24px + var(--footer-h))`, which is layout and
lands in the same frame as the footer it follows, and the transform only ever moves him
sideways. The entrance is unchanged.

### 42. The compact navbar shadow was removed

**Date:** 2026-09-16 · **Status:** active · **Overrides the design spec**

The spec's shadow list has three entries, and the compact navbar's `0 14px 40px rgba(0,0,0,.28)`
was one of them. It is gone.

Nothing replaces it: the compact capsule is now a translucent blurred surface with a `1px solid
var(--line)` border and no shadow at all. The border is what separates it from the page. The
now-dead `box-shadow` entry was also dropped from the capsule's `transition` list, since there
is nothing left to animate.

The design spec was updated in the same pass — its shadow list is down to two, and the motion
table no longer names a shadow transition.

### 43. The fonts are self-hosted

**Date:** 2026-09-16 · **Status:** active · **Closes the font half of decision 30**

Decision 30 measured the mobile Lighthouse gap and named self-hosting as the better of two ways
to close it, deferred until after deployment. Done:

- `Space Grotesk` and `JetBrains Mono` load from `public/fonts/`, one **variable** `.woff2` per
  family (300–700 and 100–800), declared with `@font-face` in `tokens.css`. One file per family
  replaces the six static weights the site used, so the whole typeface is two requests of
  ~22 KB and ~40 KB.
- The Google Fonts `<link>` and both `preconnect` hints are out of `index.html`. Two
  `<link rel="preload">` take their place, so the download starts before the stylesheet is
  parsed; the fallback still paints first and swaps, which is what `display=swap` already did.
- Only the **latin** subset is downloaded. It covers Spanish and English — the accents, `ñ`, `¿`
  and `¡` are all inside `U+0000–00FF` — and the cyrillic, greek and vietnamese subsets would
  have tripled the payload for characters this site never renders.
- The files keep their names across deploys, so they take the same **one-day** cache as the
  icons in `vercel.json`, not the year that fingerprinted assets get. Replacing a font should
  take effect the same day.
- Licence and copyright: OFL 1.1, one file per family in `public/fonts/OFL-*.txt`.

The point is not only speed. It also stops a visit from making a request to a third party, which
is the part that has been the subject of GDPR rulings in the EU.

**What is left:** measure again. Every number in decision 30 came from localhost, where the
Google request looked disproportionately expensive next to assets served with zero latency, so
the real improvement has to be read off the deployed build.

### 44. The navbar measured itself before the webfont swapped in

**Date:** 2026-09-16 · **Status:** active · **Bug**

The compact capsule's `max-width` is the number `measureNatural()` reads **once, at mount**, and
that number was taken with whichever font happened to be applied at that instant. With
`font-display: swap` the first layout uses the fallback family, which is narrower than Space
Grotesk and JetBrains Mono — so the measurement could come out short. When the real font landed
the labels widened, the row no longer fitted the capsule, and because the right-hand controls
are `flex: 0 0 auto` the overflow went right: "Let's talk" stuck out past the capsule's edge and
read as cut off.

It is intermittent by nature, which is what made it hard to pin down: it only shows when the
font has not finished loading by the time the component mounts, and whether that happens depends
on the load. A scroll was required to see it too — while the capsule is not compact its
`max-width` is `1180px`, so the stale number is not in play yet.

The fix is to measure again once the fonts are ready: `document.fonts.ready.then(measureNatural)`,
next to the existing resize listener and the language watcher. `measureNatural` already returns
early if the element is gone, so a late resolution after unmount is harmless.

`MarqueeBar` measures a repeat count for the same reason — its own comment says "the font once it
loads" — and has the same gap in its triggers: it re-measures on resize and on a language change,
but not on a font load. Left alone for now; the symptom there would be a short gap at the seam
rather than a clipped control.

### 45. The 404 is a route, and a soft one

**Date:** 2026-09-16 · **Status:** active

The 404 is a real Vue route — `/:pathMatch(.*)*`, lazy-loaded so it stays out of the initial
bundle — and not a static `404.html`. That way it inherits the whole chrome from `App.vue` (grid,
navbar, menu, cursor, lemon, footer) and its text goes through `copy.js` and the dictionaries like
every other string. Its heading is drawn in the view rather than with `SectionHeading`: the
section pattern is a small mono title with a faint number behind it, and this page wants the
opposite, so `[404]` is the page's `h1` at display size with `/not-found` as a quiet label above.
The size is a value with no prototype behind it — `clamp(72px, min(16vw, 28vh), 220px)`, in
`--acc-text` because at that size it is read as text and `#FFC800` is unreadable on the light
background — and it is recorded here for that reason. It is bounded by height as well as width: a
width-only size grew on a wide but short window, pushed the page past the viewport and put the
scrollbar back on a page that is meant to fit.

Two consequences worth recording.

**Production needed a rewrite.** Vite's dev server and `preview` fall back to the SPA on their
own, so the route works locally without touching anything; Vercel does not, so an unknown path was
answered by Vercel and the router never saw it. A catch-all `rewrites` to `/` sends it to the
bundle, and it is safe because Vercel checks the filesystem **before** applying a rewrite — the
assets, fonts and icons are served as files. The cost is the status code: the page is served
**200 with the 404 content**, a soft 404. A real 404 status with this chrome would need edge
middleware, more machinery than a portfolio 404 justifies.

**The footer and the lemon arrive on a route with no hero.** `usePastHero` used to decide from
the measured hero. But `heroBottom` is 0 both when the route has no wrapper and during the moment
before the wrapper has been measured, and those two want opposite answers. The home route now
carries `meta: { hero: true }` and the composable reads that: without a hero it returns true from
the first frame. On the 404 the page is one viewport tall and does not scroll, so a
scroll-triggered entrance would never fire and would leave the strip `App.vue` reserves for the
footer empty.

One trap, recorded because it cost time. `BaseButton` first rendered its RouterLink through a
dynamic `<component :is>`, and `to` never reached the component: the anchor came out with no
`href`, so it had no link role and no navigation. Explicit `v-if` branches fixed it and read
better. The project had never used `RouterLink` before this page.

### 46. What the 404 needed once it was on a real deploy

**Date:** 2026-09-16 · **Status:** active · **Follow-up to decision 45**

Four things only showed up once the route was opened on a phone and on a preview deployment.

- **The page scrolled, and that was enough to shrink the navbar.** `.app` had
  `min-height: 100svh` on the *content* box **plus** `padding-bottom: var(--footer-h)`, so a page
  meant to fit the viewport was one footer taller. The overflow — about 50px on desktop, more on
  a phone with the safe-area inset — crossed the navbar's 60px compact threshold. `.app` now
  declares `box-sizing: border-box`, so the reserved footer strip counts inside the `100svh` and
  the 404 fits exactly. Nothing changes on the home page: its content is far taller than the
  viewport, so `min-height` was never in play.
- **Limonacho makes no sense on a route with no hero.** He is gated on `route.meta.hero` in
  `App.vue` now. The footer stays, and `usePastHero` brings it in from the first frame.
- **The chrome's links pointed at anchors that only exist on the home page.** From `/whatever`,
  `#projects` simply appended the hash to the 404 URL. The brand and the links in the navbar and
  the mobile menu now use absolute `/#top` and `/#id`. On the home page the path is unchanged, so
  the browser still treats the click as an ordinary in-page jump — no reload. The e2e assertion on
  the active link's `href` moved with it.
- **A soft 404 has to say what it is.** `NotFoundView` adds a `robots: noindex` meta on mount and
  removes it on unmount: the server answers 200, so without it a crawler would treat any unknown
  URL as a real page. It also inherits `index.html`'s `canonical`, which points at `/`; the
  noindex keeps the URL out of the index regardless.
- **The scroll indicator pointed at a scroll that does not exist.** `ScrollProgress` — the rail
  and the `Scroll` label on the right edge — is decorative and says nothing a scrollbar does not.
  The 404 has neither scroll nor scrollbar, so it is gated on `route.meta.hero` too, alongside
  the lemon.

The last two are the kind of thing that only surfaces on a route that is not the one everything
was built around.

### 47. The magnetic pull is softer than the spec says

**Date:** 2026-09-16 · **Status:** active · **Found in the documentation audit**

The design spec §3.14 asks for a maximum pull of 16px and an easing factor of 0.14 per frame.
The code has used **10px and 0.07** for a while — that is the note `useMagnetic.js` carries. At
the spec's numbers the effect reads as too eager and too far: the element snaps at the cursor
instead of drifting toward it. Halving the easing is what makes it feel slow, because each frame
covers less of the remaining distance. There is also a **12px dead zone** around the resting
centre, which the spec does not mention, where no pull is applied: without it the direction
vector goes to zero at the exact centre and a pixel of mouse movement swings it 180°.

The spec was corrected to match the code rather than the other way round.

### 48. The accent is a separate axis from the theme

**Date:** 2026-09-16 · **Status:** active

Five accent palettes, chosen with `data-accent` on `<html>`: the brand yellow (default) plus four
pastels — aqua `#C3FFFC`, rose `#FB7185`, mint `#9AFFC9`, violet `#D8C7FF`. The dark/light theme
is untouched and orthogonal: two themes times five accents.

They are token swaps and nothing else. `useAccent()` is a copy of `useTheme()` — module-scope ref,
`localStorage["krub-accent"]`, the attribute applied by an `initAccent()` called from `main.js` —
and the inline script in `index.html` restores the accent alongside the theme and the language, or
a visitor who chose a non-yellow palette would see a yellow flash on every load (decision 10).
Yellow has no
`[data-accent='yellow']` block: with that value nothing matches and the `:root` tokens are the
palette, and the attribute still carries a value the button can name.

**The two-tier structure is the interesting part.** The reference colours are pastels made for a
black background. As text on `--ink` they read straight away (aqua 17.7:1, mint 16.3:1), so
`--acc-text` is the pastel itself. On the light theme they are nearly invisible *as fills*:
`#C3FFFC` is **1.00:1** against the cream page and `#9AFFC9` is 1.08:1. The yellow survived light
because it is saturated; pastels have no chroma to fall back on, so no opacity tweak would save
them. Each palette therefore gets a more saturated light-theme fill (aqua `#2DD4BF`, rose
`#F43F5E`, mint `#34D399`, violet `#8B5CF6`) that still takes near-black `--on-acc` text, and the
accent text darkens in light exactly as the yellow's does (aqua `#0E7490`, rose `#BE123C`, mint
`#047857`, violet `#6D28D9`). Specificity keeps the light overrides on top: `[data-theme='light']
[data-accent='x']` is two attributes against one, whatever the order.

**The logo follows the accent in both themes.** `--mark` is the palette's fill on dark and its
denser `--acc-text` value on light, so the logo, the footer heart and the cursor ring track the
accent wherever they appear — including the footer in light mode, which first shipped black and
was changed after seeing it. The favicon and og-banner are baked yellow, so they stay coherent
with the yellow default rather than with every palette; that is accepted, since they are images
rendered outside the page.

**The switcher is one control with a theme toggle and a cycling accent disc.** The first version
put a row of swatches in the right rail with the scroll indicator, and the same row in the mobile
menu; five dots exposed at once read as a settings panel, and the rail put a control in the middle
of the page's edge. The second was one cycling square in the navbar, which then read badly on a
phone. A third tried a segmented dark/light/accent control with a dropdown of swatches and a glow
on the active segment. It settled on a small two-segment box in the navbar on every screen, in the
place of the old dark/light button: the ◐ toggle it always was, beside a disc split between the
accent and its hover tone that advances one palette per click. No dropdown — five palettes is
short enough to reach in a few presses, and a panel for it was more machinery than the choice
deserves. Nothing in the site glows either, so the glow went with the moon-and-sun segments.

On desktop the box takes the language button's hover — the frame and the glyphs turn to the
accent, and the circle grows a little (reduced motion keeps the colour and drops the growth).

The controls are handed over when the capsule compacts. At the top they sit in the bar, which is
what keeps it from being just a logo; once it compacts they move out of it — to a settings button
on desktop, to the menu on a phone — and moving back up brings them back.

On desktop the compact bar folds them into one 36×36 four-dot button — the mobile menu button's
icon — that opens them in a panel (3.19); on a phone it keeps only the brand and the menu button,
and the menu's header carries them from then on.

Both those buttons show the same four dots, and on open they spread apart — each moves out along
both axes, leaving a gap in the middle — instead of the menu button turning into a cross. A cross
was a second icon to keep in step; spreading the one icon says "open" with the same shape, and the
transform transitions. Reduced motion drops the spread. A first pass made them rounded squares and
a second made the mobile ones too big; circles at 24px on mobile and 20px on the settings button
are what stayed.

The settings panel is teleported to `<body>`. Rendered inside the capsule it would not blur the
page: an element with `backdrop-filter` — the compact capsule has one — becomes a backdrop root, so
a descendant's own blur only sees that root's content and the panel would not match the bar. At the
top level, with `position: fixed` coordinates taken from the trigger's rectangle, it blurs the page
exactly as the capsule does. Both the panel and the mobile menu also close on scroll now, so a
panel does not sit open while the page moves under it.

The measurement changed twice for this. It now applies the compact layout for one frame instead of
hiding one element, so it measures the whole handed-over strip; and it measures a second number,
the capsule's full width (the viewport minus the gutters, capped at 1180), because on a narrow
screen `max-width:1180px` never binds — `width:100%` is already smaller — so the return to the top
was jumping instead of animating. A language change re-measures; a resize re-measures with the
transition off for one frame, so dragging the window does not animate the capsule.

Two palette notes from the same round. Violet's dark value is the solid `#8B5CF6`, not a pastel —
the pastel washed out, and light and dark now share the fill. And Limonacho paints himself with
`--acc-solid`, the accent's full-saturation form, in both themes: a lemon in the dark theme's pale
pastel disappeared.

### 49. The Spanish footer credit wrapped, and the footer grew with it

**Date:** 2026-09-16 · **Status:** active · **Bug**

Seen on a real iPhone 12 — WebKit — and not in Chromium. The credit is one flex row: `.made` (the
"designed & built with ♥ by krub" run) plus `©2026 KRUB.DEV`, and Spanish is wider than English. At
390px the built credit measures about 358px against 350px of room, so the browser broke it
mid-phrase — "DISEÑADO Y CONSTRUIDO / CON", with the copyright wrapping too. The footer went from
two lines to three and the block read as dislocated.

Two changes, both below 900px. The footer is a **centred column** instead of a row, so the credit
and the place are never squeezed side by side; and the **tracking is halved to `.06em`**, which is
what actually makes the Spanish credit fit on one line at 390px. The wording is untouched, and the
separator dot stays between the two blocks.

The lemon was not really displaced. `--footer-h` is measured by a ResizeObserver, so it followed
the taller footer and kept its 16px clearance — checked in both Chromium and WebKit. What the
device showed was the ragged wrap, not an overlap.

The speech bubble lost its shadow in the same pass: the mobile menu is now the only shadow in the
project, which is what the spec's list says.

### 50. The iOS toolbar collapsed and the footer grew without telling anyone

**Date:** 2026-09-16 · **Status:** active · **Bug**

On an iPhone 12 the footer is `position: fixed; bottom: 0` with
`padding-bottom: max(9px, env(safe-area-inset-bottom))`. When the browser toolbar collapses, the
bottom inset changes and the footer grows about 25px — and that growth lands in its **padding**, not
its content.

`useElementHeight` published `--footer-h` from a `ResizeObserver`, and a ResizeObserver watches the
**content** box by default, so a padding-only change did not fire it. `--footer-h` kept the old
number, the page reserved too little, and the lemon — which stands on the footer — ended up
**overlapping it by 9px**. Reproduced in both WebKit and Chromium by forcing the padding, so it is
not engine-specific; it is just that only a phone makes it happen in the wild.

Two changes, in `useElementHeight`:

- the observer asks for `box: 'border-box'`, which is the box this has always meant;
- and the height is **re-read when `visualViewport` resizes** — `resize` only, not `scroll`: the
  toolbar collapsing is a resize, and `scroll` fires continuously while the page is scrolled on
  iOS, which would mean reading layout once per frame to publish a number that has not moved.

Measured after: the footer goes 46 → 71px with the inset, `--footer-h` follows it, and the lemon's
16px clearance comes back. The same composable publishes `--navbar-h`; the navbar's own insets are
horizontal, so nothing there was affected.

### 51. The "acho" plays on the lemon, once a visit

**Date:** 2026-09-17 · **Status:** active

The easter egg is the clip in `public/assets/sound/` — one second, stereo, and 17 KB as MP3. It
arrived as a 177 KB WAV and was re-encoded at 128 kbps with a pure-JS encoder (there is no ffmpeg on
this machine); the original is kept with the brand reference material, outside the repository
(`krub brand/reference/assets/sound/`), so it is on disk but neither versioned nor served. Two things were open: what triggers it and how often it fires.

**What triggers it.** The candidates were Limonacho's own click and the word "Murcia" in the About
paragraph. The lemon won and the word was dropped:

- the lemon is already a `<button>` with an `aria-label`, so the sound adds nothing to the
  accessibility surface. A clickable "Murcia" mid-sentence would be either a `<span>` that a
  keyboard and a screen reader never reach, or a real button that gives the joke away the moment it
  takes focus — and this project scores 100 on accessibility;
- it would also mean splitting `copy.about.p3` into three parts in both languages, the way the hero
  headline already is, to hide a one-line joke in it;
- and the joke is his. The mascot saying "acho" when you poke him is the character doing its job.

**How often.** "The first time" means the first poke of a visit, not of a lifetime. The flag is
module scope in `useAcho`, not `localStorage`: Limonacho unmounts and remounts as routes change, and
a `localStorage` key would make the joke a permanent one-off instead. Nothing is written down, so
nothing can go stale.

The same flag answers the caller's "is this the first time?", because the bubble belongs to the
greeting too. "Welcome! I'm Limonacho" is a first introduction, not a line to repeat on every poke.
So the first poke is voice and bubble and every later one is only the shake: one event, one flag,
nothing to keep in step.

Two smaller calls:

- the clip is built and fetched on the first click, never preloaded. Audio behind a clip most visits
  never ask for is not worth a byte of the critical path, and the half-second shake covers its
  arrival. If it ever feels late on a phone, the knob is to warm it once the lemon is on screen — a
  documented option, not a bug;
- the flag flips on the click rather than on the playback succeeding, so a blocked `play()` or a
  missing file does not retry on every click. The cost is that a blocked first click spends the
  visit's one play, which is the cheap direction to fail in.

Measured on the encoded file: 1.045s in both engines, peak 0.35 and RMS 0.020, against 0.367 and
0.022 for the WAV — the conversion is faithful. It also confirms the recording itself is quiet, so a
gain pass is the obvious follow-up if it ever sounds thin next to other audio.

### 52. The glow around the stage, and the wrapper it needed

**Date:** 2026-09-17 · **Status:** active

The hero stage now has a rotating glow: a conic gradient painted 2px larger than the stage on every
side, so what shows is a ring and its halo — the opaque stage covers the middle — turning once every
6s.

**A gradient cannot turn on its own, and that is what `@property` is for.** Registering
`--glow-angle` as an `<angle>` is what lets the browser interpolate it, so `conic-gradient(from
var(--glow-angle), …)` rotates. Unregistered, a custom property is a string: the animation has
nothing to interpolate and jumps from 0deg to 360deg, which is to say it does nothing at all. Where
`@property` is missing (Safari before 16.4, Firefox before 128) the ring paints at its initial
angle and simply does not turn — the right way for a decoration to fail.

**It needed a wrapper.** The glow has to paint *behind* the stage: a pseudo-element on the stage
itself would land inside it, because the stage clips with `overflow:hidden`, and the stage's
background is opaque, so it would hide the very thing it was meant to show. So `.stage` now lives
inside a `.frame` that owns the box, and the magnetic pull moved up to the frame with it — the glow
has to travel with the pull, not stay put while the box moves.

**The colours are the accent's, with one new token.** The stops are `--acc-solid` and `--glow-dim`.
That second one exists because a single colour rotating on the spot is no animation at all, and the
default yellow has `--acc` and `--acc-solid` identical, so the gradient needs a darker stop to sweep
from. How dark is not the same in both themes, which is why it is a token rather than a mix written
into the component: on `--ink` the accent has to keep half of itself to stay visible at all, while on
the cream page a light touch reads as a border and a heavy one as a painted frame. The dark value
mixes toward `--on-acc`, which is near-black in both themes, so the dim stop is a dark version of the
accent whatever the palette is — and the four palettes need no work of their own.

**Two layers, one of them a blur.** The crisp copy is the border; an identical copy with `blur(10px)`
at `opacity:.35` is the bloom. That blur is re-applied every frame, because the gradient underneath
it changes every frame, and it is the most expensive thing in the component. The knob, if it ever
shows on a machine that matters, is to drop it for a static accent halo and lose the moving colour
inside the halo.

**The stage turned out to be 2px bigger than its frame.** The ring came out even on the left, top and
bottom and missing on the right, which is the giveaway. `.stage` fills the frame with
`width:100%; height:100%`, and this project deliberately has no global `box-sizing: border-box` (the
spec's measurements were taken content-box), so the 1px border was added *on top of* that 100%: the
stage overhung the frame by 2px on the right and the bottom and covered the glow there. It declares
`box-sizing: border-box` itself now — one of the few elements that has to.

**Tuned after seeing it on screen.** The first version had a dim stop that faded into the page and a
wide, strong bloom. The border then vanished everywhere except its bright arc, which read as a smudge
rather than a lit border, and the halo read as a lamp behind the box rather than a glowing edge. The
dim stop went up, to 68% of the accent over `--on-acc`, so the whole ring stays visible and the light
can be seen travelling the whole way round it, and the bloom came down to `blur(10px)` at
`opacity:.35`, hugging the edge.

Reduced motion is handled inside the component rather than through the global
`[data-motion="decorative"]` rule, because that rule can only reach elements and this animation lives
on a pseudo-element. The ring stays and stops turning.

### 53. The dots get a wave, not a goo

**Date:** 2026-09-17 · **Status:** active

The menu button's four dots were asked to melt apart and back together with the gooey trick —
`filter: blur() contrast()`, as in the reference clip. They did not get it, and the two reasons are
worth writing down so the idea does not come round again:

- **The geometry rules it out.** The dots are radius 2.8 with their centres 8px apart, so at rest
  there is a 2.4px gap, and opening moves each one only 2.5px further out. The closed state is the
  closest the group ever gets: a goo strong enough to bridge them while they move also bridges them
  at rest, and the button stops reading as four dots. A threshold low enough to keep the closed state
  crisp never merges anything while it opens. There is nothing in between to tune.
- **The colour rules out the CSS version.** `contrast()` has to be high to threshold at all, and it
  does not touch the alpha channel — the recipe only works over an opaque background whose colour
  survives it. The mobile button is `--acc`, and measured, `contrast(30)` turns the accent into a
  primary: `#FFC800` becomes `#FFFF00` and rose `#FB7185` becomes `#FF00FF`. The desktop trigger sits
  on a translucent capsule, where the opaque patch the trick needs would break the backdrop blur. The
  SVG-filter variant sharpens alpha instead and would survive the colours, but not the geometry.

So the spread got the cheap version of "alive": an overshoot curve and a 20ms stagger, so the group
ripples open clockwise. At 2.5px of travel the overshoot is a fraction of a pixel — the wave is what
reads, not the bounce.

One thing could not be verified: whether that transition runs in Safari at all. Headless WebKit does
not advance its animation clock unless a paint is forced, so every measurement of it came back as a
jump, real or not. The code path is the same one Chromium animates smoothly, but if the dots snap on
a real iPhone the fix is to move them out of the `<svg>` and into HTML elements, which is the known
weak spot for transitions on SVG children.

### 54. No fake loader, and no skeleton until something actually arrives late

**Date:** 2026-09-17 · **Status:** active

Both were considered and both are held, for the same reason: on this site nothing arrives late enough
to deserve either, and building one anyway would be decoration pretending to be a state.

**The loader.** A bar from 0 to 100 that measures nothing is a fake delay over content the browser
already has — the HTML and the CSS are in the first frame. It spends exactly the two numbers
Lighthouse is built around, the largest paint and the time to interactive, and it is worst for the
person who comes back: their copy is cached and they still sit through it. The honest version of this
is a real percentage tied to a real download, which is what the 3D model will have through
`THREE.LoadingManager` — shown inside the stage, where the thing is arriving, not over the page.

**The skeleton.** Same test, and the measurements make it concrete: the three projects have
`image: null` and their cards paint a `shotLabel` instead, the 24 stack icons come to 50 KB between
them, and the photo is local — so a shimmering placeholder would appear for about 40 ms and read as a
flicker rather than a load. A skeleton also has to be delayed (~300 ms) before it is worth showing at
all, and that only pays off against something genuinely slow. The two spots that will earn one are
the 3D model and the project images once they exist.

### 55. The contact section: a band that moves with the scroll, and the wrapper that was eating the timeline

**Date:** 2026-09-17 · **Status:** active

The section was rebuilt around a band, the networks written out, and (next) a form.

**The band is CSS and one scroll read, not GSAP, and it is two bands.** The reference does two
things, and neither needs a library: the words alternating between solid and outline is
`-webkit-text-stroke` with a transparent fill, and "passing by" is the marquee the site already has
under the hero — two copies and a `-50%` slide. What is new is only what drives it, and that took
three attempts:

1. `animation-timeline: view()` alone, with the marquee as the fallback for browsers without
   scroll-driven animations — so on those browsers the band moved **on its own**, which is exactly
   what the owner did not want.
2. The progress worked out in the component and written to a custom property. It never moved on its
   own, but the owner reported it as jerky, and the reasons are visible in the code: the value was
   computed on the main thread on every scroll tick, and a custom property inherits, so setting it on
   the band invalidated the computed style of all 216 letters — letters that carry a text stroke and
   are expensive to re-raster.
3. The `view()` timeline where the browser has it, and the hand-written progress where it does not.
   Composited, but still not right: it moved **half the track across the band's own crossing** — about
   two and a half times the scroll — and the owner still read it as not fluid. No amount of
   frame-perfect rendering makes a movement that fast feel calm; the problem was the velocity and the
   size of the layer, not the frames.
4. What ships: one track per layer, four repetitions instead of two copies of three, and the text
   travels a **fifth of its own track**, easing toward where the scroll says it should be with a
   little inertia — the loop stops the moment it has caught up. The layer is half the size it was
   (fewer stroked glyphs to rasterise), the velocity reads as drifting, and the lag is what makes it
   feel alive. It is a second `requestAnimationFrame`, against the project's one-loop rule — but that
   rule is about the pointer, which runs whenever the mouse is over the page, and this one only runs
   while the band is still moving.

GSAP would have been 50–70 KB for a keyframe and a transform, and it brings its own ticker, against a
project whose rule is one `requestAnimationFrame` for everything that moves. The band wears the accent
background the marquee wears, at display size. A second copy of the words, outline only and a step
higher, travels the other way behind the first: that is what gives the band its depth.

**The alternation is by word, not by letter.** Per letter it read as noise — an outline `l` between
two solid ones looks like a mistake rather than a pattern — and the first attempt at it was exactly
that. Per word it reads as two colours, as in the reference. The parity carries on across the
repetitions and into the second copy rather than restarting, for two reasons: the Spanish phrase is
a single word ("Hablemos"), so a per-phrase restart would paint the whole band one colour, and an odd
number of words per copy would put two solid words together at the seam where the track wraps.

**Building it found a real bug in the layout.** The band sat frozen at 26% of its travel whatever the
scroll did — the timeline reported the same progress at five different scroll positions. `.app` had
`overflow-x: hidden`, and a box with one axis hidden makes the other compute to `auto`: the app
wrapper was a **scroll container**, one that never scrolls, because its content is exactly as tall as
it is. A `view()` timeline is measured against the nearest scroll container, so it was measuring
against a box that never moves. `overflow-x: clip` keeps the guard and does not create a scroller.
The band had the same trap in its own `overflow: hidden`, fixed the same way.

**The rows replaced the three icon buttons.** The icons said where the links were; the rows say the
address as well, which is what gives the end of the page its weight, and the address is derived from
the href so a link is edited in one place. Nothing was lost: the icons are still in the mobile menu
and the footer.

**The mailto stays.** The reference keeps a direct link beside its form, and that is what this does:
the button is the mailto, and the form joins it rather than replacing it.

### 56. The testimonials go inside Projects, not beside them

**Date:** 2026-09-17 · **Status:** active — placement moved by 65

**Updated:** decision 65 moved the block out of Projects, to between the Stack and Contact. The rest of
this — no number, no destination, a `content/` piece — still stands.

The section existed with an `id` and a heading and no number, which read as an orphan: the numbering
runs 00–03 across the four permanent sections, and the testimonials can disappear entirely
(`config.showTestimonials`), so giving them a number would leave a hole in the sequence — and leaving
them without one, next to four numbered siblings, reads as an oversight.

They are now a block at the **end of the Projects grid**, with the mono label the contact rows use
instead of a heading. Three reasons:

- they are about the work, so they belong beside it rather than two sections later;
- they add no destination, so the navbar keeps its four links and the page its four numbers;
- the component stops being a section at all, which by the rule in components.md makes it a
  `content/` piece — it is one entity out of `src/data/` that could sit inside any section.

They also stopped being cards. As boxes with a border they read as a second grid of projects sitting
under the projects — the same shape twice, saying different things. The site already has a way of
listing things that are not cards: text, a mono attribution and a rule between entries, which is what
the timeline in About and the contact rows do, so the quotes use that.

**A long quote is clamped to three lines with a "read more"**, added when the first real quote
arrived and ran to four lines on a desktop and seven on a phone. The button only exists when there is
something to reveal, and that is measured rather than assumed — which needed the clamp to be on by
default: the box shows three lines while reporting the height of all of them, and the gap between
`scrollHeight` and `clientHeight` is the test. Applied the other way round, only when there was
something to hide, the box was unclamped, the two heights were equal and the button never appeared.
The client's own mark goes in the avatar circle with `object-fit:contain`, because cropping a logo
cuts away the part that says who it is.

### 57. The form posts to our own endpoint, never to Web3Forms

**Date:** 2026-09-17 · **Status:** active

The contact form sends a real message, and the service behind it is Web3Forms. What it does **not** do
is post to Web3Forms from the browser.

Web3Forms' access key is designed to be public — their docs say so, and the practical protection is
the domain restriction in their panel. Hiding it is still strictly better: no key in the bundle,
validation and rate-limiting possible on the server, and the provider becomes something that can be
swapped in one file. So the browser posts to `/api/contact`, which is a Vercel function
(`api/contact.js`) holding the key as an environment variable (`WEB3FORMS_KEY`, set in the project's
settings; `.env.local` locally, which the `*.local` rule already keeps out of git).

That file is also mounted by `vite.config.js` **in development only**, so `npm run dev` can send a
real message without the Vercel CLI — and it is the reason the handler is written as a plain
`(req, res)` and not in a Vercel-only shape. It is deliberately not mounted for `npm run preview`:
the end-to-end suite runs against a preview build, and a live endpoint would post a real message
every time the suite ran. The suite stubs the route instead.

Three smaller calls:

- **The rules live in two places, on purpose.** `src/utils/contact.js` is the browser's copy, a pure
  function so it can be unit-tested; `api/contact.js` validates again and rebuilds the payload field
  by field. A rule that only exists in the browser is not a rule — anyone can post to the endpoint
  directly.
- **A honeypot, not a captcha.** A field nobody can see, dropped by the endpoint, which answers as if
  it had worked so a bot learns nothing. A captcha would put a third party and a puzzle between the
  visitor and the message.
- **The caret is the browser's.** The reference draws one, and that is the detail that cannot be
  copied honestly: a drawn caret cannot follow the insertion point inside a textarea, so it would sit
  still while the text moved under it. `caret-color` is the real thing, coloured to the accent.

### 58. The Stack goes monochrome, and the pointer lights it

**Date:** 2026-09-17 — **Status:** active

The section was faithful to the reference and flat: thirty full-colour logos in tiles, the only
place on the site with that much colour at once. The backlog had it as "monochrome, animation,
interaction, a mask" and the mask never happened. What shipped is the first three.

- **Four blocks, two per row, and the AI inside the last.** Four groups spread across the width read
  as one continuous band of logos, so they went to two columns, and the tiles from 44px to 60px with
  the labels from 11px to 13px so a group reads as a block rather than as a swatch. AI first got a
  block of its own and then went back into Tools & AI: two icons beside a group of ten read as an
  accident, and leading that group they are the first thing in it anyway. Blender, Figma, Framer,
  GSAP, Claude and OpenCode joined the grid on the way.
- **Touch gets the light too.** No cursor means no hover, and a section that only comes alive under a
  mouse is dead on the phone it is most likely to be read on. There the scroll is the light and it
  comes on **one group at a time, in order, from a grey base**: the grid's crossing of the viewport —
  from its top at 75% of the screen to its bottom at 50% — is divided into as many slices as there are
  groups, and each owns one. Tile by tile was the first attempt and read as noise: the tiles of a group
  are read together. They do not lift either, because a block of tiles rising as one reads as the page
  jumping. Two thresholds per group came before this and **both lit everything at once** — the grid is
  646px tall against an 839px phone viewport, so every group was already past any line drawn on the
  screen by the time you could see them all. The measurement is what settled it; the numbers had been
  guessed twice.

- **Monochrome by drawing the logo twice.** Each icon renders a grey copy under a colour copy, and
  the spotlight fades the colour one in with `opacity`. The obvious version animates
  `filter: grayscale(1)` instead, and it repaints the tile on every frame; an opacity is composited.
  The grey copy also sits at `opacity:.6`, because removing the colour alone still leaves twenty-four
  full-contrast logos — quiet is the point.
- **The light is a radius, not a winner.** The magnetic hover picks a single element, because two
  elements leaning at once reads as the page wobbling. This is the opposite case: a radius of light
  that falls off with distance reads as a torch, so every tile in range lights, each by how close it
  is. Positions are cached relative to the group and the group's rect is read once per frame, so a
  section that moves down (a project added, the testimonials switched on) cannot light the wrong
  tile.
- **The name is a readout, not a caption.** A name inside the tile is impossible at a legible size
  ("IntelliJ IDEA" in 44px), and a caption under each tile would either reserve a line under
  twenty-four of them or overlap the row below. A mono label that trails the cursor is the one shape
  that costs a single node and moves nothing. It snaps on the first frame and eases after that, so it
  never flies in from where it last was.
- **`title` had to go.** Every icon carried one. With the readout, the native tooltip would appear a
  second later and print the same name somewhere else. `alt` still carries it for a screen reader.
- **It rides the existing loop.** `usePointer` is one mouse listener and one `requestAnimationFrame`
  for the cursor, the magnetic hover, the parallax and the lemon. A fifth loop for this would be a
  fifth chance to leave something running. On touch there is no pointer to subscribe with and under
  reduced motion the frame returns immediately, so there the grid is simply grey — which is the
  design, not a fallback.

### 59. Limonacho says the technology names

**Date:** 2026-09-17 — **Status:** active

The Stack used to name its tiles itself: a mono readout that followed the cursor, and a static one
placed next to a tapped tile on touch. The owner did not like the tap version, and asked for the
lemon to say it instead — he is already there, in the corner, with a bubble and a voice.

- **He does the naming, and the readout becomes the fallback.** He says the name of the tile the
  cursor is on, and on touch a tap hands him one for a moment. The readout comes back on its own when
  he is not on the page — `showLemon` off, a route with no hero, the lemon removed some day. The
  Stack does not check `config` for that: the lemon **registers itself** with `useLemonVoice()` on
  mount, and the Stack reads the count. One source of truth instead of the same condition written
  twice, and it stays right if the reason he is missing changes.
- **The cursor says clickable, but only in the fallback.** Without the lemon the only way to get a
  name is to click a tile, so the tiles carry `data-interactive` and the custom cursor opens its ring
  over them. With him the name arrives on hover and clicking does nothing, so there is nothing to
  promise.
- **The bubble is not a live region for names.** It is `role="status"` for the greeting, which a
  screen reader should hear. Names change as the pointer sweeps the grid, and announcing twenty of
  them is not help — and they say nothing the tiles' own `alt` does not.
- **The four groups needed an owner.** Each group runs the same per-frame loop, so on any frame one
  has the cursor and three do not: the first attempt had the three clear what the first had just
  said, and the bubble never appeared. `say()` and `hush()` are now owner-aware and only the one who
  spoke may take it back.
- **And the owner had to be a `shallowRef`.** With a plain `ref`, Vue wraps whatever object it holds
  in a reactive proxy, so `spoken.value.by` came back as a proxy of the caller's token rather than the
  token itself. The ownership test is an identity test, so it silently never matched: the bubble
  appeared and then could not be taken down. Nothing here needs deep reactivity — the object is
  replaced whole, never mutated — so shallow is also the honest choice, not just the working one.

### 60. The projects move into a rail

**Date:** 2026-09-17 — **Status:** active

Four projects in a grid meant a second row holding one card beside an empty column — measured at
1280px: 1152px of grid, 371px cards, 3 + 1 — and on a phone four stacked cards made the section
**2319px against an 839px viewport**, nearly three screens for the part of the page a reader is most
likely to be skimming.

- **A rail, not a grid.** Three cards and the sliver of a fourth on a desktop, one and a sliver on a
  phone. The sliver is the whole affordance: it says there is more without a dot or a counter, which
  is the rule the rest of the site already follows.

- **A native scroll container came first, and it was not smooth.** It is the version that gives the
  most away for free: `scroll-snap` keeps the cards in the DOM, so the keyboard reaches them, and the
  phone gets its swipe. But the snap fights a drag — it has to be switched off while dragging, and
  switching it back on snaps without animating — and the easing of a programmatic scroll belongs to
  the browser, not to us. The owner read it as steppy and asked for the other way round.
- **So it is a track moved by `transform`.** Composited, with the same arrive-and-settle curve the
  lemon and the footer use, and a drag that can follow the pointer exactly. What that costs is the
  two things the scroll container gave away: the phone's swipe is no longer free, so the drag handles
  every pointer type and `touch-action:pan-y` keeps a vertical swipe scrolling the page; and the
  off-screen cards stay in the DOM — which is the point, the keyboard has to reach them — so they
  carry `inert` while they are fully out of the rail. A transformed carousel without that is one
  where Tab walks into the dark.
- **The drag needed a click guard.** The whole card is a click target behind an overlay, so a drag
  that ends over one would open it. The click is watched in the capture phase and swallowed once the
  drag has travelled 6px.
- **And a flick threshold.** Settling on the nearest card meant a phone swipe had to travel more than
  half a card — 160px — before anything happened: shorter than that and the rail glided back where it
  came from, which the owner read as the rail refusing to budge. A drag that moved more than a fifth
  of a card now takes the next one in the direction it was going.
- **The cut edge gets a soft one.** A `mask-image` fade on whichever side the rail continues on. A
  hard vertical edge where a card is clipped reads as a mistake rather than as "there is more this
  way" — but only on that side: at the start the first card's rounded corner sits on the edge and
  fading it would eat it. The width is **derived from the rail's own geometry**, not a flat number:
   the first attempt used `56px` and the peek is `45px` on a phone, so the fade reached 11px into the
   card you were reading and smudged its edge instead of softening the next one's.
- **The viewport keeps a room for the magnetic pull, on every side.** The pull moves a card up to `10px`
  toward the cursor, and a card at either end of the rail was pushed past the viewport's own edge, where
  the clip took its border and its rounded corner off. A few pixels, and the owner saw it. The one-line
  answer would be `overflow-clip-margin`, and it is out: **WebKit does not support it** — checked in
  Playwright's WebKit rather than assumed, `CSS.supports` says no — and WebKit is what the owner carries.
  So the room is `padding`, taken straight back with a negative margin: the content box is unchanged, so
  the cards keep the width they were measured at and still line up with the section's gutter, and only the
  clip is wider. Two consequences, both handled: the fade adds the room to its length, or the extra strip
  shows unfaded and the hard edge just moves inward, and `sync()` takes the padding back out of
  `clientWidth` when it works out `maxOffset`, or the rail stops a room short of its last card.
- **Hover is guarded by `hover: hover`, and touch gets a position marker.** A tap leaves `:hover`
  stuck on whatever it touched, so the yellow border was there or not depending on where the last
  finger landed — the owner read that as the marking being unreliable. The hover styles now live
  under `@media (hover:hover)`, and where there is no hover the same border marks the card the rail
  is parked on, moving with the rail rather than with the finger. The arrow fills with it too: the
  fill stayed behind in the hover block, so on a phone the card was marked and its arrow was not,
  which read as the marker half-applied.
- **The pointer is captured once the drag has proved itself, not on pointerdown.** Captured on
  pointerdown, the pointerup is retargeted to the viewport, and the click that follows is dispatched at
  the common ancestor of the two — the viewport — so the card's own button never received it and **no
  card opened with a mouse**. The keyboard was the only working path, which is exactly why the modal test
  never caught it: it opens with focus and Enter, and a test that never clicks is not a test of clicking.
  The same fix went into the testimonials pager, which had the same bug for the same reason.
- **Measured after:** 1010px on a phone, 1134px on a desktop.

### 61. The navbar was swallowing every click in its band

**Date:** 2026-09-17 — **Status:** active

The bar is a `position:fixed` strip across the whole viewport with 14px of vertical padding, and the
capsule inside it shrinks to hug its own contents once compact. Nothing about the strip is
interactive, but nothing said so either: it was a normal element covering a full-width band, so every
click that landed in that band went to it and stopped there. The owner found it with the project
arrows, which are simply the first thing that happened to scroll up behind the bar.

`pointer-events:none` on the strip and `pointer-events:auto` on the capsule. It is the standard fix
and it is one line, but the failure mode is worth remembering because it does not look like a bug:
nothing is visually wrong, the controls are right there, and they only stop working at the scroll
positions where they overlap the bar. The e2e test reads `elementFromPoint` in the band but clear of
the capsule, so it fails if the strip ever takes clicks again.

### 62. No em dashes in the copy

**Date:** 2026-09-17 — **Status:** active

The owner reads the em dash as a tell — the thing that makes prose look machine-written — and asked
for it out of the copy a visitor can see: the `<title>`, the meta and Open Graph descriptions, the
project copy, the About paragraph, the 404 line, the testimonial and the year ranges in the timeline.

- **Appositives and asides became a colon, a comma or parentheses**, whichever the sentence wanted:
  "optimised in CI with Sharp: WebP and AVIF", "assets 3D (camisetas, tazas, alfombrillas) de cara a
  visualizarlos en web". The `<title>` and `og:title` take the middle dot the footer already uses.
- **The year ranges got an en dash instead.** `2018 – 2024` is a range, and the em dash was doing
  punctuation work there that it was never meant for. The en dash is the correct character and half
  the length, so it does not read as the same mark.
- **The comments and the docs keep theirs.** Nobody visiting the site reads them, they are full of em
  dashes, and rewriting them would be a diff of hundreds of lines with nothing to show for it. The
  rule is about the copy.

### 63. The rail's fade follows the live position, so the travel is a loop

**Date:** 2026-09-17 — **Status:** active

The fade on the cut edge is decided by where the rail *is*: a side is faded only while there is a card
hanging off it. Getting that right took three tries, and the first two failed for the same reason.

1. **Decided from the destination.** A CSS transition runs in the compositor, where nothing can read
   the position it is passing through, so the fade could only know where the rail was going. Travelling
   towards an end it left the arriving side unfaded, and a card stayed cut in half for the whole 0.55s
   of the animation.
2. **Both edges for the length of the movement.** That covered the travel and broke the ends: for the
   window it lasted, the card sitting flush against the rail's edge — the first at the start, the last
   at the end — was itself faded, which is the one thing the rule exists to avoid.
3. **What ships: the travel is a loop in the script.** Easing at `0.16` per frame, stopping when it
   settles, and jumping straight to the target under `prefers-reduced-motion`. The fade reads the live
   offset, so it is correct at every frame, and it only writes its class when the answer changes — a
   handful of times per movement, not sixty times a second. It is also one less thing to synchronise:
   no transition, no `transitionend`, no timer guessing how long the animation lasts.

The lesson is the same one the band taught: **a compositor animation cannot be observed from the main
thread**, and anything that has to react to it frame by frame has to be driven frame by frame.

### 64. The testimonials became a pager

**Date:** 2026-09-17 — **Status:** active

The block was a column, and the column grew: measured, one entry is `214px` on a phone, so three of them
made the block `678px` and the section nearly two screens. That is the same arithmetic that killed the
projects grid, and it got the same answer — one at a time.

- **A pager, not a rail.** The movement is vertical because the entries are: a horizontal rail of quotes
  is harder to read than a card, and the arrows point the way the content moves. Down brings the next
  quote up from below while the one showing leaves upwards.
- **The arrows moved to the side, and the label moved into the box.** The rail already has a pair of
  horizontal arrows over its head, and two pairs in one column of the page read as one control that lost
  its way. The `n / total` went with them, out from between the two arrows: with a counter wedged in the
  middle the pair read as two separate things, one of them pushed right. The mono label went inside the
  box — since then a filled band, see below — because floating above
  an empty box it said nothing about what the box was.
- **The clamp came back, and it is what makes the height predictable.** Removing it was right for a
  moment: with one quote at a time there is nothing hidden. But a real quote is long, and on a phone the
  first one made the window most of a screen. Four lines, and a "read more" when there is more of it, so
  every quote that overflows is the same height and the block stays the size it was designed to be.
- **The travel is measured, and so is the drag.** The entries are different lengths, so a uniform step
  would be wrong the moment one quote is longer than another: each entry's own offset and height are read
  from the DOM. The drag is the rail's, on the other axis — a fifth of the window to take the next one,
  and a drag that ends over the "read more" swallows the click rather than pressing it.
- **The window is as tall as the tallest entry, not as tall as the one showing.** Sized to the current
  quote it changed height every time you paged, and everything under it moved with it. It is the kind of
  thing a screenshot cannot show and a scroll position can.
- **And every entry fills the window.** Sizing the window to the tallest was only half of it: the entries
  were still their own height, so a short quote left its share of the window empty and the next entry
  showed through the gap. The height goes on the entries as a `min-height` fed by a variable the window
  sets — two lines, and the stack comes out uniform, which is also what makes the offsets a plain
  multiple of it.
- **Two heights, not one, and the second one is read only from the closed entries.** The window and the
  floor the entries are padded to were the same variable, so opening a quote raised the floor of every
  entry and nothing could ever shrink again: the block stayed at the expanded size for good. The window is
  still the tallest entry; the floor leaves out the open one. Paging closes whatever was open before it
  moves, for the same reason — an open entry holds the window at the expanded size, and a short quote
  under it would leave the gap that lets the next one show through. `nextTick` before re-measuring there,
  because the offsets come from the DOM and it is Vue that puts the clamp back.
- **The pane captures the pointer only once the gesture has proved itself a drag.** Captured on
  `pointerdown`, the `pointerup` is retargeted to the pane and the click that follows is dispatched at
  the common ancestor of the two — the pane — so the "read more" under the finger never received it. It
  worked with a programmatic click and not with a real one, which is what pointed at capture rather than
  at the button. And the paging only closes the open quote when the index actually moves: a tap reaches
  the same handler on its `pointerup`, before the click, and closing there collapsed the quote the click
  was about to toggle, so "read less" reopened it.
- **The box got a mark and the counter got the accent.** A large `”` in `--acc` at `opacity:.08`, below
  the header's rule in the window's top right, and the `n / total` in `--acc-text`. The mark is the box's,
  not an entry's, so it stays put while the quotes slide through it — the one thing in the block that
  does not move. `--acc` and not `--acc-text` for it: it is a fill, not text, and at this opacity the
  legible variant reads as a grey smudge on the dark theme rather than as the palette's colour. Placed
  below the rule on purpose — above it, the two glyphs on top of each other read as a mistake.
- **And the settle compares offsets.** The first version worked the target index out as
  `offset / height`, which is right only while every entry is the same height: with one long quote and a
  short one, a drag that was too small to count as a flick landed on the wrong quote — the counter
  jumped to `2 / 3` on the first quote. Comparing the live offset against each entry's own offset is
  correct whatever the lengths are, and it is the same measurement the paging already uses.
- **The vertical drag has a cost the horizontal one did not.** The rail could leave the vertical axis to
  the page and take only the horizontal; a vertical pager cannot, so the pane claims both and the page is
  scrolled by starting the touch anywhere else. Worth watching: if it reads as a trap, the arrows are the
  fallback and the drag goes back to the mouse only.
- **It reverses decision 56 on boxes — for one box.** 56 said no cards, because a grid of them read as a
  second set of projects. One window is not a grid: there is nothing to mistake it for, and the box is
  what makes a single quote feel like an object rather than a stray paragraph.
- **And the quotes are quoted.** A testimonial is a quote, and the marks are what say so before anyone
  reads the attribution. The placeholders had them and the first real one did not, which is the tell
  that gave it away.
- **The mark stays a font glyph, and an SVG of it was tried and dropped.** The `”` from the site's own
  face, large and faint in the box's top right, is not the most beautiful quote mark that could be
  drawn — a calligraphic comma is. So Material Symbols' `format_quote` was inlined as a path, tilted and
  hung under the counter. It read as clutter and the owner asked for the glyph back, which is the
  answer: at `opacity:.08` the mark is a watermark, and the difference between a good comma and a
  mediocre one is not worth a third typeface, a new licence to track, or the extra rules that came with
  positioning it. The system serif that would have given the better shape for free varies by platform,
  so it is not a candidate either.
- **The header became a filled band.** It was a rule and two grey strings, then two accent strings; the
  owner asked for the whole strip in the theme colour, and the answer was already in the project — the
  marquee and the contact band are `background: var(--acc)` with `--on-acc` on top, so the header took the
  same treatment rather than a new one. It also gives the block a proper opening: the box now starts with
  the accent instead of with a hairline. On a fill there is one text colour, so the label and the counter
  are separated by opacity (`.62`) and not by a second token — a second colour on the accent would have
  meant inventing a value, and the palette has none.
- **The mark moves for the phone.** `44px`/`16px`/`104px` became `74px`/`6px`/`112px` under `900px`: lower,
  further right and bigger. In a window that narrow it lands behind the quote rather than behind the name,
  which is what a watermark should do — sit under the text, not beside the attribution.
- **The arrows moved inside the box.** They were beside it, which on a desktop left a pair of buttons
  hanging off the edge of a wide box with nothing to belong to. They now sit in the box's bottom right
   corner, `12px` from the bottom and `16px` from the right, in a row: stacked in a corner they read as a
   strip down the side. The room is the pane's `--pane-room` (`56px`), spent as bottom padding on the
   entries and not on the pane: overflow clips at the padding edge, so padding on the window left the next
   entry inside the clip and its attribution showed through the empty strip — and more height would not
   have fixed it either, for the same reason. On the entry it is part of the measured height, so the next
   quote starts exactly where the window ends. Desktop only, because on a phone they are clipped and the
   room would be an empty strip for nothing.
- **On a phone the arrows go, and nothing replaces them.** The swipe is the gesture there and the
  buttons only took width from the quote. An icon was tried in the header as a cue — four of them, at
  real size — and it read as clutter, so the header went back to two items. Clipped, not removed: the
  drag is not something a screen reader or a keyboard can do, and the entries that are not showing are
  `inert`, so removing them from the accessibility tree as well would leave quotes 2 and 3 with no way
  in. They come back on `:focus-within`.

### 65. The testimonials moved out of Projects, below the Stack

**Date:** 2026-09-18 · **Status:** active

Since 56 the block sat at the end of the Projects rail. Tried and kept: between the Stack and Contact
it reads as a beat of its own before the closing section, instead of as an afterthought of a rail that
has already scrolled past.

The reasons 56 gave still hold — no number, no navbar destination, a `content/` piece — so this is a
move, not a reversal of the shape. Two consequences:

- The block no longer inherits the page gutter and the `1180px` cap from `ProjectsSection`, so it
  carries them itself, plus its own `margin-top` on top of the Stack's bottom padding.
- The e2e selectors moved from `#projects .pane` to `.testimonials .pane`, which is the more honest
  scope anyway: the block is not part of Projects.

The scroll spy has no link for it, so while it is on screen the Stack stays active until Contact
crosses the line. Accepted: it is an unnumbered block, and the alternative would be inventing a
destination for something that can disappear.

### 66. The grid cell under the pointer lights up

**Date:** 2026-09-18 · **Status:** active

The background grid was pure texture. Now the 72px cell the pointer is over is outlined with a 1px
`--acc` border at `opacity:.45`, snapped with `Math.floor` so it reads as part of the pattern rather
than as a second cursor. An outline and not a fill: tried as a filled square first, and the fill read
as a tile laid on top of the grid instead of the grid lighting up.

- **The cell, not the ripple.** A click ripple was the other candidate. It was dropped because it
  needs a listener on a page full of real buttons and links, and it only exists for the instant
  after a click; the cell is passive and always there.
- **The cell, not the glow.** A radial spotlight on the grid lines was the cheapest version, but
  the cell is more distinctive and costs the same: one element, one `transform` per frame.
- **A fixed element of its own, not a child of a grid.** The hero grid is absolute and scrolls
  away, so a cell inside it would drift off the cursor the moment the page moved. Fixed to the
  viewport it is always the cell the pointer is really over, whichever of the two grids is showing.
- **It snaps to the grid that is actually on screen.** Fixed to the viewport, it was snapping to the
  viewport's lines — which are the global layer's, and only line up with the hero layer at scroll
  zero. Scrolled a little, the cell sat between the hero layer's lines and read as "descuadrado".
  `masked` is the switch: while the hero layer is the visible one the cell snaps in page
  coordinates (`-scrollY + floor((y + scrollY) / 72) * 72`), and once the fixed layer takes over it
  snaps to the viewport. That is also why a scroll does **not** take it away: the page-coordinate
  snapping keeps it on the hero layer's lines while that layer slides up under it. The touch mark is
  the exception — it is not following anything, so a scroll clears it.
- **It takes the global grid's mask**, and the field is cut to the same box the grid covers
  (`bottom: var(--footer-h)`), because the grid fades out toward the bottom of its own box and a cell
  masked over the full viewport would fade later than the lines behind it and outlive them. Without
  it, a cell still glowed in the strip where the grid was already gone.
- **It goes when the pointer sits still.** `usePointer` publishes `active`, false after two seconds
  without activity — a `mousemove` **or a scroll**, and a scroll also wakes it. Both halves are
  needed and neither is obvious: a wheel fires no mouse event, so without counting the scroll the
  cell went while the page was still moving, and without letting the scroll wake it the cursor
  stayed gone while the page moved under it. The first version watched the window instead —
  `mouseleave` on the document, `blur` on the window — and it was not reliable: the cursor stayed
  parked wherever it had last been inside the page and only went on the next click. An idle timeout
  needs no window boundary at all, and it is deliberately not instant, so the cursor does not vanish
  the moment you stop to read.
- **On touch it lights where you tap, and stays.** No cursor to follow, so the cell is placed on the
  tap and a scroll clears it — staying is deliberate, because a cell that fades on a timer reads as
  a glitch, and clearing on scroll is what stops it being left behind, marked, while the page moves
  under it. A **tap and not a press**: the first version lit it on `pointerdown`, so every scroll
  flashed a cell at the finger before the page moved; now it waits for `pointerup` and only lights if
  the finger travelled less than 10px, and a `pointercancel` (the browser taking the gesture for a
  scroll) never lights anything. It also sits back on touch (`opacity:.22` against the pointer's
  `.45`): with no cursor it is a mark left on the paper, and at the pointer's weight it shouted over
  a grid whose lines are about 4% white.
- **The magnet is still on the table, and still expensive.** CSS cannot bend a line, so pulling the
  grid lines toward the cursor means rebuilding the grid as DOM or SVG and transforming each line
  per frame. Not done: the cell was the 80/20, and it can be revisited if it is not enough.
- **Multi-cell selection is not the next step.** The Windows-style rubber band was tried in a lab.
  It works, but on the site it would need a full-viewport layer claiming `pointerdown` — which steals
  clicks from every button and fights text selection and the rails' own drags — for something with no
  function. The cheap cousin, painting cells by sweeping with the button held, has the same problem in
  smaller form. Left in the backlog.

It rides `usePointer`, the app's single rAF loop, and never subscribes to it on touch or below
900px, where the tap path takes over instead.

### 67. The way back to the top lands exactly at zero

**Date:** 2026-09-18 · **Status:** active

The footer's TOP button and the logo both go back to the top of the page, and on a phone the smooth
scroll could stop a few pixels short, leaving a sliver of the next section visible under the hero.

- **`goTop` waits and snaps.** A smooth scroll can end early when the layout settles under it — the
  fixed footer sliding out, the iOS toolbar coming back — so after starting it, `goTop` watches the
  scroll position and, once it stops changing, forces the last of it with `behavior:'auto'`. It lets
  the animation finish instead of cutting it, and it costs one short-lived rAF loop.
- **The hero wrapper got an `id="top"`.** The logo points at `/#top` and the router's
  `scrollBehavior` returns `{ el: '#top' }`; with no element by that name, the selector matched
  nothing. Now the hero wrapper is the anchor and it sits at zero.

Not reproduced in the emulator — there the scroll already ended at zero — so this is the fix for the
phone case the owner hit, and it should be re-checked on the device.

### 68. The CV is plain text in `cv/`, built with tectonic

**Date:** 2026-09-18 · **Status:** active

The About button links to a CV, and `public/uploads/` held no file: it downloaded a 404. The CV is
now two plain-text files in `cv/` — `cv-es.txt` and `cv-en.txt` — and `npm run build:cv` turns each
into LaTeX and compiles it with tectonic to `public/uploads/cv-es.pdf` and `cv-en.pdf`.

- **Plain text as the source, not `.tex`.** The first version was LaTeX the owner was expected to
  edit, and before that HTML. Neither is what he wants to touch. The `.txt` is words and a few line
  markers (`#`, `## Title @@ Dates`, `~`, `-`), so he edits sentences and the generator handles the
  escaping (`&`, `_`, `%`…) and the layout. It never changes the case: what is typed is printed.
- **The generated `.tex` is disposable.** The generator writes it into `node_modules/.cache/cv`, so
  the tree carries only the sources and the PDFs.
- **tectonic, not a full TeX distribution.** One binary that fetches only the packages a document
  needs, so there is no multi-gigabyte install. It runs XeTeX, so the font comes through `fontspec`.
- **Arial, ligatures off, hyphenation off, ragged right.** Arial is on the ATS safe list.
  `Ligatures=NoCommon` stops `fi`/`fl` extracting as an empty glyph; `hyphenat`'s `none` stops LaTeX
  breaking *documentación* into *docu-mentación*, which a parser searching the word would miss; and
  the text is left-aligned, not justified, because justification stretched lines into wide gaps.
- **One column, standard headings, no tables or graphics, no photo, no phone number and no home
  address.** The original carried a phone and an address and was purged from the history.
- **The extraction is the test.** `pdfjs-dist` in a scratch folder reads the compiled PDF back the
  way a parser would. That is how the ligature, the middle-dot codepoint and the hyphenation were
  caught — each one silently breaks a keyword the ATS is looking for.
- **One file per language.** The owner edits the Spanish; the English is kept in step by hand. Both
  go through the same generator, so the two never drift in layout.
- **The path is per language.** `cvPath` in `src/data/socials.js` is an object, and About links to
  `cvPath[lang]`, so an English visitor gets the English CV.

Needs tectonic installed (see the README). The wording is drafted from the site's data and the CV he
sent, and it is his document to approve.

### 69. The CV tool moved out of the repository, and the CV now comes in two themes

**Date:** 2026-09-20 · **Status:** active

Decision 68 put the CV's plain-text sources in `cv/` and its generator in `scripts/build-cv.mjs`.
Both are gone from the repository. They live in a sibling folder outside it — `../cv/`, next to the
repository rather than inside it — and the generator is run directly with `node build-cv.mjs`.

**Why out.** The generator is a small, self-contained text-to-PDF tool: a parser for a handful of
line markers and a LaTeX preamble. It is not part of the website, and keeping it here mixed a
personal document tool into a public front-end repository. Nothing about the site depends on it at
build or run time — the site only ever ships the compiled PDFs.

**What stayed.** The four compiled PDFs, in `public/uploads/`: the light pair (`cv-es.pdf`,
`cv-en.pdf`) for print and email, and the dark pair (`cv-es-dark.pdf`, `cv-en-dark.pdf`) to match
the site on screen. They are still committed, because they are what the visitor downloads. The
generator writes to its own `out/` folder and never touches the repository; the owner copies the
four files in when they change.

**The dark variant.** The CV's only colour is the brand rule, and a PDF's colours are baked in, so a
themed CV means one file per theme. The dark page reuses the site's own values — `#0C0C0D` for the
page (`--ink`) and `#F2F0EA` for the text (`--fg`), with the brand yellow unchanged — via the
`pagecolor` package. Two files per language, four in total, all produced in one run.

**Served by theme and language.** `cvPath` in `src/data/socials.js` is now
`{ dark: { en, es }, light: { en, es } }`, and About links to `cvPath[theme][lang]`. The light file
keeps its original name so nothing that pointed at it breaks.

**Rejected: generating on the fly.** Colouring a PDF at request time would need a LaTeX toolchain on
the server, which a Vercel deploy does not have, and a viewer cannot recolour what is already baked
in. Build-time variants are the only option that stays static.

**Trade-off:** the dark PDF is heavier on ink and pointless to print, which is why the light pair
stays the default for anything but the site itself.

### 70. A UI pass: testimonial dots, the grid cell off, scrollable tabs and the CTAs

**Date:** 2026-09-22 · **Status:** active

Five changes from one review, none of them in the spec as it stood. Where this contradicts the
design spec, this wins.

- **The testimonials' arrows are dots, and so are the projects'.** Both pagers now share one
  indicator: a dot per position, the one you are on a longer pill in `--acc`. The testimonials'
  is a vertical column on the window's right edge, centred on the window and not on the whole box
  (which includes the header, and pushed it high); the projects' is a horizontal row under the
  rail. Each dot is a `20px` button with an `8px` mark drawn inside it, so it stays tappable on a
  phone. The `--pane-room` the testimonial arrows needed is gone, and so are the projects' arrow
  buttons.
- **The projects' dot count follows the width.** The rail has two parking spots on a desktop
  (three cards and a peek) and four on a phone (one card and a peek), so the dots are recomputed
  on every measure rather than fixed to the number of projects.
- **The grid cell under the pointer is off**, behind `config.showGridCell`. With the marquee, the
  glow, the cursor and the lemon all moving, the cell read as busy. `GridCell` mounts and
  subscribes on its own, so flipping the flag back on is the whole change; its six e2e flows skip
  while it is off and come back with it.
- **The `/me` tabs stack on a phone.** Three pills do not fit a phone's width — `/certificaciones`
  alone is wider than a third of it — and both wrapping and a sideways scroll left the third cut
  off or orphaned, which read as broken. Stacked, one full-width row each, all three are visible
  and easy to tap.
- **Every "Let's talk" goes to the contact section, not to `mailto:`.** The address is already in
  Contact, as a row and behind the form, so the CTA scrolling there is one action instead of a
  mail client opening. The navbar, the mobile menu and the hero all point at `#contact` now.
- **The `/me` photo is in colour.** It was grayscale; the new photo is the 42 portrait and its
  colour is the point.

### 71. The light theme is a cooler grey, and the stage glow is gone

**Date:** 2026-09-23 · **Status:** active

Two reversals from the same review, both of them things the spec still described the old way.

- **The light page is `#F2F3F2`, not the cream `#F5F3EE`.** The cream was warm and read as a paper
  tint next to the accent; the cool grey is neutral, so the yellow and the pastel palettes are the
  only colour on the page. `--surface-2` moves with it, to `#E9E9E7`. Every contrast figure in the
  spec was re-measured against the new value and still clears AA — `--fg-3` light on `--ink` is the
  tightest at 4.52:1.
- **The rotating glow around the hero stage is gone.** Decision 52 built it and this takes it back:
  with the marquee, the cursor and the lemon all moving, the stage was the fourth thing turning and
  it read as noise around an empty box. The stage keeps its border, its radius, its radial gradient
  and its magnetic pull. `--glow-dim`, `--glow-angle` and `@keyframes glowSpin` are deleted; the
  `.frame` wrapper the glow needed stays, because the magnetic pull and the clip still live on it.

### 72. The testimonials are one quote at a time, sliding vertically

**Date:** 2026-09-23 · **Status:** active

The pager decision 65 built — a reel of entries in a window, dragged with any pointer type — was
replaced. It worked, but it was a scroll container in disguise: the drag, the wheel and the page's
own scroll kept colliding, and the window needed two measured heights (`--pane-h` for the floor, its
own for the ceiling) to behave.

- **One quote in the DOM.** The current one, swapped on change. Nothing is stacked, so there is no
  scroll to fight, no window to keep a fixed height and no entry sliding past the one on show.
- **The height is animated to the card on show.** `fit()` measures the incoming card and writes it
  onto the pane; a `ResizeObserver` on the card re-measures when the fonts land and the clamp
  resolves.
- **The swap is vertical** — forward carries the old quote up and brings the next one in from below
  — and `mode="out-in"` keeps the two from sitting on top of each other.
- **The arrows are gone**, replaced by the vertical dot column decision 70 introduced. No mask
  either.
- **A click on the card advances, and wraps.** It is a shortcut, not the control: the dots are. It
  ignores the "read more" and a drag that selects the quote (the pointer's travel is measured), and
  the wrap is forced to slide as "next" rather than jumping back.
- **The pager never claims the page's scroll.** The wheel and a swipe belong to the page. Two
  earlier attempts — a wheel pager and a touch swipe — were tried and removed: both fought the
  scroll and neither earned its keep.

### 73. The `/me` tabs are a row again, and a real tablist

**Date:** 2026-09-23 · **Status:** active

Decision 70 stacked the three tabs on a phone, because three pills did not fit. The pills were the
problem, not the row: as plain folder labels on a hairline track the three fit a phone at 12px with
no tracking, so they are a row at every width again — a short rule in `--acc-text` under the active
label, no capsule, no scroll container.

**And the tablist is real now, not just the roles.** It had `role="tablist"` and `role="tab"` with
nothing behind them, so a screen reader announced "tab" and the arrow keys did nothing. It has roving
`tabindex` (only the selected tab is in the tab order), ArrowLeft/ArrowRight with wrap, Home/End,
`aria-controls` on each tab, and the panel is a `role="tabpanel"` with `aria-labelledby`.

**The `tabpanel` role goes on a wrapper, not on the `<ol>`.** A non-list role on the list itself takes
the list role off it and its `<li>` rows stop being list items — Lighthouse's `listitem` audit caught
it. The panel is a `<div role="tabpanel">` around the `<ol>`.

### 74. The dots are 24px, and the pagers announce themselves

**Date:** 2026-09-23 · **Status:** active

An accessibility pass — axe, a manual contrast sweep and Lighthouse — came back with one real finding
on each pager.

- **The dots were 20px, under WCAG 2.2's 24px minimum.** Lighthouse's `target-size` audit flagged
  both sets. They are 24px now, with the mark still 8px: the inset grows from 6 to 8 so the target can
  grow without the dot changing, and the active pill keeps its 16px by ending 4px in from each side.
- **The testimonial pager had no live region.** Swapping the quote changed the DOM with nothing to
  announce it, so the pane is now `aria-live="polite"`. The dots already carried `aria-current`.
- **Everything else passed.** axe reported no violations, and every text pair clears AA against the
  new light background (measured: `--fg` 16–17:1, `--fg-2` 6.3–7.7:1, `--fg-3` 4.52–5.29:1,
  `--acc-text` 4.56–12.6:1). Lighthouse is 100 on accessibility and best practices in both themes;
  the only audit still red is `bf-cache`, which Chrome reports as "not actionable".

### 75. The hero stage is a real 3D logo, and it is metal only

**Date:** 2026-09-24 · **Status:** active

The stage stopped being a slot. `LogoStage` still owns the box, the inner grid and the pointer
gestures, but the mark inside it is a WebGL scene now: the same vector path as the favicon
(`public/assets/img/krub-logo.svg`), parsed by Three's `SVGLoader` and extruded, so the logo has
real depth instead of the flat mask. TresJS renders it, lazy through `defineAsyncComponent`, and
never below 900px (decision 37).

Four calls shaped it:

- **Metal, and only metal.** A crystal finish (`MeshPhysicalMaterial` with `transmission`) was
  built and then removed. Transmission refracts what is *behind* the object, and the mark is a
  flat extrusion: at normal incidence its Fresnel is about 5%, so it read as a dark mass, and the
  only way to make glass legible was a detailed backdrop — which is the whole of decision 76. It
  also forces a per-frame `ReadPixels` (`GPU stall`), the cost that was making the e2e suite
  flaky. The polished `MeshStandardMaterial` is the finish that earned its place.
- **The walls are welded and re-normalled.** `ExtrudeGeometry` does not share vertices between the
  segments of a curve, so every facet carries its own normal and the polished metal showed each
  polygon. Dropping the normals, `mergeVertices` by position and `computeVertexNormals` averages
  them across the curve without rounding the edges.
- **The drag is a magnetic snap.** Hover tilts it a little; a drag takes over completely and spins
  it with the pointer; on release it eases back to the front, in the scene's own loop.
- **The loop is paused off-screen** (IntersectionObserver at 60%), framed at 24fps and capped at
  1.5x DPR. The wheel zooms the camera, clamped, and only while it can still move — at either end
  the page keeps its scroll.

The 2D mask is not gone: it is the fallback (decision 77).

### 76. The 3D scene is only the mark; the box stays CSS

**Date:** 2026-09-24 · **Status:** active

The first attempt at depth built a second copy of the stage *inside* the scene: a back wall
carrying the gradient and the grid, and a receding floor whose lines converged toward a vanishing
point, with the camera lifted and tilted so the floor read as a floor. It was painted from the CSS
tokens (`--surface`, `--ink`, `--grid`) and rebuilt on `data-theme`, so it was light in the light
theme.

It was removed. Two reasons. It duplicated what the stage already paints, so the box had two
grids to keep in step. And the canvas is not clipped to the stage's radius — it is the stage's
`overflow:hidden` that rounds the corners — so the wall and the floor spilled past the radius and
the box's corners read wrong. The canvas is transparent now, the CSS stage shows through, and the
scene is only the mark. The straight-on camera (`[0, 0, camZ]`, `fov 40`) came back with it.

### 77. The 2D mark is the fallback, and it fades

**Date:** 2026-09-24 · **Status:** active

The PNG mask over `var(--mark)` paints first and is what a browser without WebGL, a failed fetch
or a rejected shader falls back to. The scene reports readiness with a `ready` emit, and the mark
is not removed: it fades (`opacity`, 0.4s) so the hand-off from the flat mark to the scene is a
crossfade instead of a pop.

One trap, learned the hard way: `ready` is emitted by the scene's geometry build, not by the model
that draws it, so a `LogoModel` that throws still leaves the mark fading onto an empty stage. The
fade only makes sense while the scene is actually there — the two have to stay in step.

### 78. The room comes back, as one box and a rig

**Date:** 2026-09-24 · **Status:** active

Decision 76 took the backdrop out. This brings a backdrop back, deliberately, done so it does not
repeat either of the two mistakes that sent it out the first time.

- **The room is a box open at the front.** The camera sits outside it, looking in: the near face
  is left out of the geometry, so the four walls run away from the frame and close on a far wall
  that is only a fraction of the frame. Ten triangles and one unlit material. A first pass had the
  camera *inside* a large box — it filled the view, but no wall was ever visible, so the room read
  as a flat grid.
- **The far wall sits close to the frame.** A deep box read as a corridor; the far wall was pulled
  in (`ROOM_DEPTH` 280 → 160) so it lands near the stage's edge — a shallow recess, not a tunnel.
- **The grid draws the box's edges.** No separate outline: the cell is chosen so a whole number
  of them (eight) lands across each face, so the lines meet exactly on the box's edges and carry
  from one face to the next. An earlier pass added a `LineSegments` outline for the same job, but
  a 1px WebGL line antialiases badly and the grid does it better.
- **The walls render double-sided.** With `BackSide` the far wall was culled and the box stood open
  at both ends — the page showed through. The opening has no face, so there is nothing to cull.
- **The grid is world-uniform.** The walls are built by hand, with their UVs taken from the world
  position — a `BoxGeometry` maps each face to 0..1, which would stretch the grid on the deeper
  walls — so a cell is the same size on every face. It is drawn at `--line` and a 20-unit cell: it
  is the walls' own texture, not a faint wash, and it is sized to sit close to the page's own 72px
  grid where the box meets the frame. The CSS grid the slot used to carry is gone — with the box
  drawing a grid on every face, a second one behind it had no sense.
- **The opening is sized to survive the camera.** It stays wider than the view at every zoom with
  the full lean, so the page never shows past the box's edges.
- **The camera peeks.** `SceneRig` leans the camera with the pointer — the same `tilt` the mark
  uses — and always looks back at the mark, so the mark stays centred and the room parallaxes
  around it. The lean is a lerp in the scene's own loop, not a new rAF. The outer frame is CSS and
  does not move.
- **The window is a square.** The stage dropped its 24px radius: the opening is square, like the
  box behind it. The canvas fills it and `overflow: hidden` clips it to the frame; the stage keeps
  its single `--line` border, and the inset mat and the inner rim an earlier attempt added are gone.
- **No fog and no glow.** The fog was fading the very grid that gives the walls their perspective,
  and the glow never earned its place — a strong one reflected on the metal, and the owner did not
  want it. Both removed, `LogoModel`'s `material.fog = false` with them.
- **The mark's tilt is softer** (0.5 → 0.34 rad on y, 0.32 → 0.22 on x): the camera leans too now,
  and the two must not add up to a lurch.

`SceneRig` is the new child of the canvas that owns the camera and the room; `LogoModel` keeps the
mark. The values are first-pass and meant to be tuned: `ROOM_HALF` 80 (wide enough to stay past the
view at every zoom and lean), `ROOM_DEPTH` 160 with the opening 120 in front of the camera, a
20-unit cell (eight across each face, so the lines land on the edges), and `PEEK` 16/11 world
units.

> An earlier version of this entry had a fog and an accent glow on the far wall. Both were removed
> in review; this is the state that shipped.

**One cost, recorded:** the scene now weighs enough that the e2e suite goes from two to four
failures when Playwright runs its four workers in parallel — each worker holds a WebGL context and
the GPU stalls. With `--workers=1` the whole suite is green. That is the testing item in the
backlog, not a product problem.

### 79. The stage snaps to the page's grid

**Date:** 2026-09-24 · **Status:** active

The box sat centred in its column, which put it on no line of the page's 72px background grid: at
1280×800 its left edge fell 6px past a line and it was 490×464, not a whole number of cells. Moving
it "one cell right" would have carried the same 6px along.

It is now a **square of whole cells** — seven by seven, 504×504 — with all four edges on grid
lines, moved to the next cell to the right of where it landed naturally, or one back when that
would run it off the screen (as at 1280, where 7×7 only fits starting at 720).

This is measured, not computed: the column width, the viewport height and the centring all move, so
`LogoStage` reads the box's natural size, rounds it to whole 72px cells, sets it, and translates it
onto the grid — on mount, on resize, and once the fonts land. It is the only element on the page
placed by script; everything else is still layout. `width`, `height`, `max-width`, `max-height` and
`transform` are the only properties it touches; the maxes because the stylesheet's own cap would
otherwise clip the box below a whole number of cells.

### 80. The opening is cut to the stage, and the grid meets the page's

**Date:** 2026-09-24 · **Status:** active

- **The opening is cut to the stage** — its half-size is `d * tan(fov/2)` at its distance — and
  divided into the stage's own **seven cells** (decision 79), so its grid lines land on the page's at
  the frame. The lines are drawn on the **half cell** (`(i + 0.5) * step`): a line on every edge and
  none through the middle, which is what makes the two grids meet instead of running a cell out of
  phase. The interior still converges — a uniform perspective grid cannot match a flat one anywhere
  but the frame — and that is the backlog item.
- **The wheel zooms, and the box scales with it** so its opening stays on the stage at any zoom; a
  fixed box would take the grid off the page's the moment you scrolled. The camera also leans a
  little with the pointer (6/4) and reads the pointer only while it is over the stage.
- **The fog falls off to `--ink`** so the tunnel has no bottom to see, and the **backlight** is the
  theme's own background — dark in the dark theme, light in the light one — placed each frame on the
  camera's axis behind the mark, so it clears the grid there rather than lighting it in a colour. Its
  mask ends at the tunnel's half-width rather than at the plane's edge, and it scales with the zoom to
  keep it so: fading out past the walls meant the outer band was hidden and the halo ended on a hard
  cut where the tunnel closed.

### 81. The frame is a slim brushed-metal band, and the badge hangs outside it

**Date:** 2026-09-24 · **Status:** active

- **The frame is a slim brushed-metal band** — 12px, opaque, over the canvas — drawn in the theme's
  own greys (`--fg` mixed into `--ink`) rather than a colour, with a hairline on its inner edge. The
  ridge and the wider bands were tried and dropped: it reads better thin. Being opaque, it also masks
  the box's edges and whatever the camera's small lean would show past them.
- **The entrance glow is CSS, not WebGL.** The ring was built in the scene twice — a hard annulus,
  then a blurred mask — and both sat one rectangle inside the frame and cost a plane and a texture.
  It is an `inset` shadow on a wrapper inside the frame now: hard on the frame's inner edge, fading
  inward, for nothing.
- **The badge lives under the photo in `/me`.** It was tried inside the frame, over the headline, and
  outside the frame's top-left corner; under the photo is where it settled.

### 82. The mark's motion and light

**Date:** 2026-09-24 · **Status:** active

- **The idle breathes on both axes** — a wider, quicker sway than the single slow one it had — so the
  mark never looks parked.
- **The drag is constrained on both axes**, the vertical capped harder (0.45 rad against the
  horizontal's 1.1), and **cleared on release**: leaving the angles in place is what made a plain
  click snap the mark back to wherever it had last been orbited.
- **The light is a generated environment, not an HDRI**: Three's `RoomEnvironment` through a PMREM,
  plus one directional light at intensity 1. The metal's roughness is 0.25, which spreads the
  environment's hot spots instead of pointing them at one angle.

### 83. The tube strikes once the scene is up

**Date:** 2026-09-25 · **Status:** active

- **The glow is dark until the scene has reported ready and the flat fallback has faded**, then it
  strikes — a flick, a pause, two flicks, then it holds — and only then starts to breathe. Igniting
  on load struck an empty box, or the 2D logo: the scene builds asynchronously, so the ignition has
  to wait for it rather than for the document.
- **The strike is held back by two frames**, not counted straight from `ready`: the geometry build
  blocks the main thread for a moment just after, so the fallback's crossfade starts late, and a
  delay measured from `ready` landed on top of the fade.
- **The frame's inner hairline is gone** — the one 81 put there. The glow's own hard edge is the line
  at that boundary, and a faint `--line` rule on top of it read as two, one of them pulsing, since it
  sits inside the glow that breathes.

### 84. The frame casts a shadow into the tunnel

**Date:** 2026-09-25 · **Status:** active

- **A soft dark vignette sits inside the frame**, fading the room's grid out before it reaches the
  metal. The grid ran right up to the band and stopped dead against it, which read as a picture pasted
  into the frame rather than a cavity behind it.
- **It is its own layer, inside the scene.** Not a shadow on the glow — the glow is dark until the
  scene is up (83), and this is part of the tunnel, not part of the light — and being inside the
  scene wrapper is what makes it arrive with the scene instead of painting a shadow into the empty
  slot while the scene is still building. It is CSS, on the compositor, not a post-processing pass.
- **It fades to `--ink`**, the same value the scene's fog fades to, so the effect continues the fog
  rather than laying a second, unrelated darkness over it. In the light theme it fades the grid into
  the light background, which is what "dark" means there.

### 85. The render is finished with bloom, and the flat mark is the failure state

**Date:** 2026-09-25 · **Status:** active

- **The empty stage is flat `--ink`.** The `--surface`-to-`--ink` radial that used to sit behind the
  canvas read as a shadow hanging in the slot while the scene built — most visible before the glow and
  the mark were there — and it hid the entrance fade, because the room's walls are that same
  `--surface`. Flat, the slot is simply dark and the room arrives visibly.
- **The scene eases up into the frame** rather than switching on. It builds asynchronously, so
  without this it pops the instant it reports ready. Opacity alone was not enough against the old
  background, so it comes with a small scale too — from 1.03 down to rest, which keeps the box's edges
  behind the frame as it settles. The glow is held back until it is done, and reduced motion drops the
  whole thing.
- **The composer was tried and dropped.** A bloom and a film grain were built on
  `@tresjs/post-processing` and compared in `/logo-lab`; at any strength worth noticing the bloom read
  as too heavy on the polished metal, and the grain — whose only knob is `premultiply` — as sand
  rather than film. The dependency, the composer and the `effects` prop are gone. The entrance is the
  whole of the arrival now, and the lab compares only that: switching on against easing in.
- **The 2D mark is the failure state now, not the loading state.** It painted first and faded out on
  ready, which flashed the flat logo on every load. It is shown only if WebGL is missing, or if the
  scene has not reported in eight seconds; a working load never renders it at all.
- **The extrusion is deferred past the first paints.** Parsing the SVG and extruding it blocks the
  main thread for around half a second. The fetch starts immediately and only the parse, extrude and
  weld wait two frames, so the frame is up first. When the mark arrives as a glTF this goes: a glTF
  is a fetch and a parse of precomputed buffers, which does not block.
