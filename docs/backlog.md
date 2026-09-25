# Backlog

What comes after the roadmap. Steps 1–12 got the site live; this is everything still
outstanding, plus the ideas that are not tasks yet. The roadmap is the record of what was
built and does not change; this file is the live list.

Nothing here is in build order, and the order inside a group is not a priority either. Each
entry is a sketch, not a plan: the detail, the file-level decisions and the acceptance check
are worked out when the task starts. Groups are roughly ordered by how close they are to
being picked up — content and deployment first, mobile after, ideas last.

**How progress is tracked:** every task is a checkbox. Unticked is outstanding, ticked is
done, so the file — not memory — says where things stand when work resumes. A few entries are
mine to do by hand rather than a code change; those carry **(owner)**. The ideas at the end are
not tasks and have no checkbox.

This merges the pending list of 2026-09-16 with what used to live in the roadmap's "Later"
section, folded together where they overlapped.

## Where things stand — 2026-09-23

A short snapshot so resuming work does not mean reading the whole file. The checklist below is
the source of truth; this is the index into it.

`main` is what `krub.dev` serves: the step-12 build. `dev` is well ahead of it and holds
everything built since launch — the accent palettes and the appearance control, the reworked
Stack and Contact, the contact form, the projects rail, the testimonials pager, the 404, the
self-hosted fonts, the interactive grid cell, the CV pipeline (four PDFs, light and dark), and
the refreshed site content with the certifications tab. None of it is published yet
(`git log main..dev` lists it).

**Before `dev` can become `main`:**

1. Replace or delete the two placeholder testimonials, or turn `config.showTestimonials` off. The
   pager itself is reworked now (one quote at a time, dots instead of the arrows, read-more); only
   the content is left.
2. The pre-publication documentation review.
3. Re-measure Lighthouse against the merged deployment.

`WEB3FORMS_KEY` is set in Vercel, so the contact form works in production.

**The substantial work still open:** the real glTF model for the 3D logo (the extruded SVG mark
ships, but the Blender export and its loading percentage do not), the structured-data refresh, the
LinkedIn update, the GitHub profile README, the prose reread, Bing Webmaster Tools, the Vercel DNS
change, and making the repository public.

---

## Content, CV and SEO

- [x] **Review the CV.** Done 2026-09-20: the owner approved the content, and the plain-text
  sources and generator were moved out of this repository (decision 69). The four compiled PDFs
  (light and dark, per language) stay in `public/uploads/`. ATS-friendly: one column, Arial,
  standard headings, no phone number and no home address.
- [x] **Enrich the CreandoMientras case.** Done 2026-09-23: the summary leads with the
  no-subscription angle and the modal body carries the rest — a self-hosted Sveltia CMS on Git (no
  subscription, the client owns the content), a panel Lourdes runs herself, images optimised in CI
  with Sharp (WebP and AVIF at three widths, hash-skipping what has not changed), the contact form
  stack, and the pieces built for the business: the events calendar, the gallery and the link
  manager.
- [x] **A base cover letter.** Done 2026-09-23: `cover-es.txt` / `cover-en.txt` in the external cv
  tool, built by `node build-cv.mjs` to `cover-{es,en}.pdf` (one page, light, verified). A base to
  tailor per application — the date, the role and the addressee are placeholders.
- [x] **A compact one-page CV.** Done 2026-09-23: `cv-1p-es.txt` / `cv-1p-en.txt` in the cv tool,
  built to `cv-1p-{es,en}.pdf` (one page, light, verified). The generator now builds three documents
  from six sources; the wording is iterated on demand.
- [x] **A new photo for /me.** Done: the current one is the 42 portrait, in colour — the grayscale
  filter was dropped with it (decision 70). `photoPath` in `src/data/socials.js` points at
  `public/assets/img/krub-pfp.jpeg` (540×540 JPEG, ~110 KB).
- [ ] **Real screenshots for the projects.** CreandoMientras, Showroom, sideForge (backend only, so
  its logo will do) and krub.dev, dropped into the `image` and `slides` fields the model already
  has. **(owner)**
- [ ] **A final banner for LinkedIn and the GitHub profile README.** Same artwork as the Open Graph
  refresh below, so it comes with it.
- [ ] **Redo the GitHub profile README.** Bring it in line with the CV and the site, and fix the bug
  in it. **(owner)**
- [ ] **Finish the testimonials.** The first real quote is in — Lourdes Campuzano of
  CreandoMientras, with her own mark in the avatar circle — but the pager still carries **two
  bracketed placeholders** ("Name Surname"), kept so it could be seen with more than one entry.
  **Replace or delete them before this reaches `main`**, or turn `config.showTestimonials` off.
  Long quotes are clamped to four lines with a "read more", which is what makes the length a
  non-issue. Part of the same rework: the vertical arrows should go, replaced by scrollable dots.
- [ ] **Refresh the Open Graph image.** `og-banner.png` is from the first build and predates the
  sections that exist now, so it is the owner's artwork to regenerate. The structured data beside it
  is done (2026-09-23): `workLocation` is Murcia, and the X handle stays in `sameAs` and in the
  `twitter:` tags on purpose — it ties the domain to the profile even though X is no longer a link
  on the site. **(owner)**
- [ ] **Update LinkedIn to match the CV and the site.** The headline, the location (it says
  Barcelona, the owner is in Murcia) and the dates should agree with the CV and the site. Also the
  new banner. **(owner)**
- [ ] **Reread the prose.** Every sentence lives in `src/data/`, both languages side by side, one
  file per kind of content. It was always going to be iterated after launch rather than
  written once. **(owner)**
- [ ] **Bing Webmaster Tools.** The same five minutes as Google Search Console, which is done and
  has the sitemap submitted. Bing also feeds DuckDuckGo. **(owner)**
- [ ] **Make the repository public.** When the pending work is done. The v1 portfolio repository is
  archived and its links redirect here. **(owner)**
- [x] **Audit the documentation against the code.** Every `.md` here plus the README. It has
  drifted once already — four claims in the README were untrue and two files described
  components and composables that do not exist. Worth doing while the build is still fresh in
  mind, because the cost of checking a claim rises the longer it has been since it was written.
  Done on 2026-09-16: the README, `components.md` and `design-spec.md` were checked against the
  code and corrected, and the one deliberate divergence that had no record (the magnetic pull)
  went into `decisions.md` as 47.
- [ ] **Review the documentation once more before the repo goes public.** The same sweep, as the
  last step before the repository is made public, because the code moves between now and then
  and this file is only as good as its last check. It is not a first reading: the 2026-09-16
  pass is the baseline it starts from.

## Config, performance and deployment

- [x] **Self-host the two fonts.** Lighthouse on production is 98 desktop / 88 mobile, and the
  whole gap is the Google Fonts stylesheet in `index.html`: it blocks the first paint for
  834 ms and makes a chain three hops deep, since the browser has to fetch the stylesheet
  before it learns which `.woff2` files to ask for. Two `.woff2` in `public/` and an
  `@font-face` block in `tokens.css` collapse the chain to one hop — and stop sending
  visitors' IPs to Google.
- [x] **Remove the navbar shadow.** The compact capsule casts `0 14px 40px rgba(0,0,0,.28)`
  (`TheNavbar.vue`). A design call, not a bug.
- [x] **A real 404 page.** An unknown path falls through to Vercel's plain text. It should be the
  site's own: the grid, the type, the cursor, and a way back to the top of the page.
  Responsive. A second route also puts the router to the use it was wired up for.
- [ ] **Update Vercel's DNS records.** The domain answers on the legacy records and Vercel says
  they will keep working; the dashboard shows an amber "DNS Change Recommended". Optional,
  five minutes. **(owner)**
- [ ] **Re-measure Lighthouse once `dev` is on `main`.** The numbers so far are not the ones that
  count: the deployed `krub.dev` is an older build (still loading Google Fonts; mobile 84 / desktop
  98) and the `dev` figures came from a local preview (mobile 84–85 / desktop 99). Run it against
  the real deployment after the merge, together with the pre-publication documentation review. The
  one thing that got worse is the TBT — the bundle grew with the new sections — so it is worth a
  second look then. **(owner)**

## Design and sections

- [x] **An accent theme switcher.** Five palettes chosen with `data-accent` — the brand yellow plus
  aqua, rose, mint and violet — advanced one per click from the accent disc beside the ◐ theme
  toggle. At the top the controls sit in the bar; once it compacts, desktop folds them into one
  settings button and a phone moves them into the menu. Each palette swaps the accent tokens and
  nothing else, and each needed a light-theme counterpart because the pastels are invisible as
  fills on cream. Built on 2026-09-16; see decision 48.
- [x] **The appearance control in the navbar, and the compact hand-over.** The dark/light button
  and the accent are one control now: the ◐ toggle beside the accent disc, itself the survivor of
  four shapes (circles at 24px on a phone, 20px on desktop). At the top it sits in the bar; once
  the capsule compacts it moves out — into a four-dot settings panel on desktop, into the menu on
  a phone. The panel is teleported so its blur matches the bar. See decisions 48 and 49.
- [x] **A rotating glow border on the 3D slot.** Built on 2026-09-17: a conic gradient painted 2px
  outside the stage, turning once every 6s and drawn twice — crisp for the border, blurred for the
  bloom. It follows the accent and the theme through `--glow-dim`, and reduced motion stops the turn
  and leaves the ring. It cost the stage a wrapper, because the glow has to paint behind it. See
  decision 52.
- [x] **The 3D logo.** Built on 2026-09-24: the hero mark is a WebGL scene now — the favicon SVG
  path extruded into a polished-metal object that tilts, spins and zooms, with the 2D mask kept as
  the fallback. TresJS (github.com/Tresjs/tres), lazy and never mounted below 900px. The crystal
  finish and the in-scene backdrop were both built and then removed. See decisions 75–77. **What
  is still open is the real model:** the mark is a procedural extrusion of the SVG, not the Blender
  export (glTF/GLB), and because there is no download to report there is no `THREE.LoadingManager`
  percentage or arrival shimmer yet — see the skeleton note below and decision 54.
- [x] **Rethink the stack section.** Done on 2026-09-17: four blocks in two columns, tiles from 44px
  to 60px and labels from 11px to 13px (48px tiles on mobile, where 60px was eating the screen), the
  grid monochrome at rest — each logo drawn twice, a held-back grey copy under a colour one — and the
  light following the cursor, or coming on a whole group at a time with the scroll on touch. Limonacho
  is the one who names the tiles (a tap on touch), with the mono readout back as the fallback if he is
  not on the page. No mask, and no softened edges. It rides `usePointer` and `useScroll`, the app's
  single loop and single scroll listener. See decisions 58 and 59.
- [x] **Give the contact section more weight.** Rebuilt on 2026-09-17: a full-bleed band on the
  accent background, its words alternating solid and outline over a second, fainter copy travelling
  the other way, and moving with the scroll and only with the scroll. One full-width row per contact
  (the address first, then LinkedIn and GitHub — X is gone), and the mailto is now the email row,
  with no separate button. The band's phrase
  is translated ("Hablemos"), and so is the CTA. It turned up a real bug on the way: `.app`'s
  `overflow-x: hidden` made the wrapper a scroll container that never scrolls, which froze the
  band's CSS timeline. See decision 55.
- [x] **A simple contact form**, in addition to the mailto. Built on 2026-09-17: name, email and
  message in a panel above the rows, with validation, the four states, `aria-live`, a honeypot and
  the theme's border colour with the accent caret. It posts to `/api/contact`, a Vercel function
  holding `WEB3FORMS_KEY` as an environment variable, so the key never reaches the bundle; the same
  handler is mounted by `vite.config.js` in development, and `.env.local` carries the key locally.
  See decision 57. **Still to do by hand: set `WEB3FORMS_KEY` in the Vercel project settings**, or
  production answers 500 and the form falls back to its error state. **(owner)**
- [x] **The projects grid with four cards.** Closed on 2026-09-17 by turning the grid into a rail: a
  native scroll container with snap, three cards and the sliver of a fourth on a desktop and one and a
  sliver on a phone, with arrows that page one card and a mouse drag with a click guard. It came from
  the same measurement that killed the guesses elsewhere: four stacked cards were 2319px against an
  839px phone viewport, and the rail is 1010px. See decision 60.
- [ ] **Turn Limonacho into something that answers.** A small chat backed by a model, given
  `src/data/` as its context, so a visitor can ask about a project instead of reading for it —
  with a bit of Murcian in the voice, because a mascot that talks like documentation is not a
  mascot. Wants its own context and a reset/clear. Needs a server-side endpoint: an API key
  cannot live in a static bundle. The speech bubble and its timers are already built and would
  become the chat surface.
- [ ] **Shimmering skeleton placeholders.** Held until something genuinely arrives late, which today
  nothing does: the four projects have `image: null` and their cards paint a `shotLabel`, the 30
  stack icons come to about 60 KB between them, and the photo is local — a placeholder would flash
  for about 40 ms and read as a fault. The two spots that will earn one: the 3D model (with a real
  percentage, not a fake bar) and real project images once they exist. Whenever it goes in, delay it
  (~300 ms) so it only shows when the load is actually slow. Technique: a `linear-gradient` with an
  oversized `background-size` and a `@keyframes` sweeping it across (`background-size: 200% 100%`
  with `background-position` running to `-200% 0` at 1.2s linear infinite). Reference: @aniakubow
  on Instagram. See decision 54.
- [x] **A simulated entry loader — no.** Closed on 2026-09-17: a 0-100 over content that is already
  in the first frame is a fake delay, it costs exactly the numbers Lighthouse is built around (the
  largest paint and the time to interactive), and on a return visit it is friction for someone whose
  copy is already cached. The honest version of it arrives with the 3D model, as a real percentage
  from `THREE.LoadingManager` shown inside the stage. See decision 54.
- [x] **Easter egg: the "Acho" audio.** Built on 2026-09-17: it plays on the first poke of Limonacho
  in a visit, and the bubble appears with it — the greeting is voice and bubble together, and every
  later poke is only the shake. He was already a button, so it costs nothing in accessibility, and
  the hidden "Murcia" word was dropped (decision 51). Once per visit from module state, fetched on
  the click, never preloaded, and covered by an e2e test that counts the `play()` calls and watches
  the bubble come and go. Re-encoded to MP3 (128 kbps, 17 KB, down from a 177 KB WAV that stays
  outside the repository, with the reference material).
- [ ] **The room's grid does not coincide with the page's inside the frame.** Its transverse lines
  are spaced uniformly in world space, so on screen they land about 20px apart near the frame while
  the page's grid is 72px: only the lines *at* the frame coincide (decision 82), which is why one
  shows just inside it. A uniform perspective grid cannot do better. The fix is to space the
  transverse lines in perspective — map the depth axis to the screen projection in the UVs, or draw
  the grid as lines at the computed positions — so the whole interior lands on the page's grid.
- [ ] **The mark as a glTF.** The mesh is built in the browser from the SVG and that blocks the main
  thread for around half a second (deferred past the first paints, decision 85). A GLB exported from a
  modelling app is a fetch and a parse of precomputed buffers instead: nothing to parse, extrude or
  weld, a better mesh if it is modelled, and it takes the SVG loader and the buffer utilities out of
  the bundle. `LogoModel` already builds from `props.geometry` with a note to take the mesh from a
  loaded scene. Watch the scale and the orientation (the SVG's y-down flip disappears) and keep our
  own material, light and environment.
- [ ] **The tunnel's far end reads as a black void.** Fading to `--ink` can only darken the end by the
  8/255 that separates it from `--surface` in the dark theme, so `near` and `far` differ by about
  1.5/255 and the end lands as a hole rather than as depth (measured). The `haze` fog mode answers it —
  the same fog built from `--fg` mixed into `--ink` sits above the background, and the end rises to a
  grey mist (12 to 33 on the same measurement) — but its boundary is still a fairly square cut where
  the walls have not fogged yet, and how strong the mix should be is unsettled. Tune `HAZE_MIX` and the
  mode's reach, or find a shape that does not read as a lit panel at the end of the tunnel.

## Mobile and responsive

- [x] **The footer grew when the iOS toolbar collapsed, and the lemon overlapped it.** The inset
  lands in the footer's padding, and the ResizeObserver watched the content box, so `--footer-h`
  went stale. `useElementHeight` observes the border box now and re-reads on a `visualViewport`
  move. Reproduced and fixed in WebKit; see decision 50.
- [x] **The footer credit wrapped in Spanish.** On an iPhone 12 the Spanish credit is a few pixels
  wider than the English one at 390px, so it broke mid-phrase and the footer grew to three lines.
  Below 900px the footer is now a centred column and the tracking is halved to `.06em`, so both
  languages hold two lines. The lemon's clearance was already right — `--footer-h` is measured. See
  decision 49.
- [x] **Rework the hero on a phone.** Settled by decision 37 and verified on 2026-09-16: the stage
  is not rendered below 900px, the badge moves into the text column, and the marquee lands on the
  fold in both languages from 360x640 up — 412x915, 390x844, 375x667 and 360x640 all measure a
  one-viewport wrapper with the band flush to the bottom. A 320x568 window still overflows; that
  is an iPhone 5 and decision 37 accepted it rather than compromise. Reopen this only if the
  mobile hero is redesigned as a whole, because the functional symptom is gone.
- [x] **Decide whether the 3D scene runs on a phone.** Answered by decision 37: `LogoStage` does
  not mount below 900px, so the WebGL scene is never created and costs nothing. The scene is built
  now (decisions 75–77).
- [x] **The footer slides in on a phone too.** Fixed in `9df04e8` (decision 37), before this was
  ever written down as pending: the footer no longer sits in the layout from the first frame
  below 900px, and it shares `usePastHero` with the lemon, so the two arrive together at the end
  of the hero wrapper.
- [x] **The certifications tab on a phone.** Done: the pills were the problem, not the row. As
  folder labels on a hairline track the three tabs fit a phone at 12px with no tracking (decision
  73), and the long certification names wrap in the single-column timeline below 900px.

All three were real when the roadmap's "Later" list was written and are closed now; the group is
kept as the record rather than deleted.

## Testing

- [ ] **The e2e suite goes flaky while the hero is on screen.** In a full parallel run several
  `desktop` tests fail — the count moves with the machine's load (one to four, and the room in
  decision 78 took it from two to four). They are timing tests that scroll or measure with the hero
  visible: the nav link following the scroll, the modal's Escape-and-focus-return, and the reload
  flows. The real cause is not the tests' logic but the GPU: `fullyParallel` runs four workers, each
  holding a WebGL context, and they stall each other (`ReadPixels`, the PMREM environment). The
  proof is `--workers=1`: the whole suite is green, and the four that failed in parallel pass
  alone. So the fix is to stop the desktop project from holding four WebGL contexts at once — fewer
  workers for it, or gating the scene off under `navigator.webdriver` — and, second, to make those
  flows wait on a condition rather than on the clock.

## Ideas (future)

Not tasks. No urgency and no order — written down so they do not evaporate.

- Stickers.
- Pet Grok / Limonacho.
- A guest section: a counter and a dedication.
- 3D Limonacho, rubber-hose style.
- Stickers stuck on a 3D shape, movable. DIMTECH built exactly this for products — images placed
  on clothing or an object. The idea here is a sphere (or something else) wearing stickers of
  the logo, 42, a technology, a lemon.
- Logo appearance animation.
- A 3D business card with my details.
- A blog?
- **Migrate the source to TypeScript.** Vue 3 supports it first-class (`<script setup lang="ts">`,
  `defineProps` by type, `vue-tsc` for the check), and because the types are erased at build the
  runtime — and with it the performance and the accessibility — would not change at all. It is not a
  big-bang rewrite: with `allowJs: true` the files move over one at a time, keeping build + unit +
  e2e green at every step. The real work is typing the props and emits, `src/data/`, the composables
  (`useLang`, `useTheme`, the `localStorage` ones), the i18n messages and `api/contact.js`; under
  `strict` it surfaces assumptions that are implicit today, which is the point. Rough size: about a
  day of careful work across several commits. **It reverses non-negotiable #4 of `AGENTS.md`
  ("JavaScript, not TypeScript"), so it is a deliberate decision and not a neutral refactor** — that
  rule and a `decisions.md` entry would have to change with it.
- A photo that follows the cursor, like Limonacho but my profile picture.
- Frosted glass on the 3D slot, with the grid behind it.
- An interactive background grid. **The cell under the pointer is built** (decision 66): a 72px
  outline in `--acc` at `opacity:.45`, snapped to the grid, riding the app's single rAF loop and
  hiding with the cursor when the pointer leaves the page. What is left of the idea is the rest:
  multi-cell selection (the Windows-style rubber band, or painting cells by sweeping with the button
  held) needs a full-viewport layer claiming `pointerdown`, which steals clicks from every button and
  fights text selection and the rails' own drags, so it waits for a reason to exist. The glow is
  cheap (an accent copy of the pattern under a radial mask that follows the pointer, two custom
  properties, no new listeners); the magnet is not (CSS cannot bend a line, so pulling the lines
  toward the cursor means rebuilding the grid as ~33 DOM or SVG lines and transforming them per
  frame, plus a decision about the two crossfading instances and the mask).
