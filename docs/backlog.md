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

## Where things stand — 2026-09-28

A short snapshot so resuming work does not mean reading the whole file. The checklist below is
the source of truth; this is the index into it.

`main` is what `krub.dev` serves; `dev` is where the work happens. Since launch the site gained the
accent palettes and the appearance control, the reworked Stack and Contact, the contact form, the
projects rail, the testimonials pager, the 404, the self-hosted fonts, the interactive grid cell, the
CV pipeline (four PDFs, light and dark), the refreshed content with the certifications tab, and the
3D hero — the GLB mark, the portal room, the roller blind and the cursor hints. The 3D branch is
merged into both; `git log main..dev` lists whatever else is on `dev` but not yet published.

**Before `dev` can become `main`:**

1. The pre-publication documentation review.
2. Re-measure Lighthouse against the merged deployment.
3. Real screenshots for the projects and the Open Graph artwork.

The contact form is mid-swap to Resend with Turnstile and a rate limit (see the **Contact form**
group below); it needs the accounts before it works in production.

**The substantial work still open:** the contact form's Resend and Turnstile setup and its privacy
notice, the backlight behind the mark without a plane, the tunnel's far end, the project screenshots
and Open Graph artwork, the LinkedIn update, the GitHub profile README, the prose reread, Bing
Webmaster Tools, the Vercel DNS change, and making the repository public.

---

## Contact form

The form is built and lives in Contact; it posts to `/api/contact`, a Vercel function that now sends
**by Resend**, with a per-IP rate limit and a Cloudflare Turnstile check (decision 57). What is left
is the accounts behind it and the law.

- [ ] **Set Resend and Turnstile up.** The endpoint is written for them (decision 57), but it answers
  `not-configured` until the settings exist: verify `krub.dev` in Resend and set `RESEND_API_KEY`,
  `CONTACT_TO` and `CONTACT_FROM` in Vercel, and create the Turnstile site and secret keys
  (`VITE_TURNSTILE_SITE_KEY` reaches the bundle, which is fine — it is the public one;
  `TURNSTILE_SECRET_KEY` stays server-side). Then the form works on both, and without them it still
  runs locally.
- [ ] **A privacy notice for the form (GDPR).** A short note under the form, a `/privacy` page, and a
  consent checkbox — the three together, since the name, email and message are personal data.

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
- [x] **Finish the testimonials.** Done: the first real quote is in — Lourdes Campuzano of
  CreandoMientras, with her own mark in the avatar circle — and the pager now carries only that
  one, prepared for more to arrive. The vertical arrows went, replaced by scrollable dots. Long
  quotes are clamped to four lines with a "read more". Part of the same rework.
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
- [x] **Update Vercel's DNS records.** Done: krub.dev resolves on the current records — `A @ →
  76.76.21.21` and `CNAME www → cname.vercel-dns.com` — checked against the live DNS. They now live
  in Cloudflare, where the mail records also went. **(owner)**
- [ ] **Re-measure Lighthouse once `dev` is on `main`.** The numbers so far are not the ones that
  count: the deployed `krub.dev` is an older build (still loading Google Fonts; mobile 84 / desktop
  98) and the `dev` figures came from a local preview (mobile 84–85 / desktop 99). Run it against
  the real deployment after the merge, together with the pre-publication documentation review. The
  one thing that got worse is the TBT — the bundle grew with the new sections — so it is worth a
  second look then. **(owner)**
- [ ] **An address on the domain, like `work@krub.dev`.** Cloudflare Email Routing forwards inbound
  mail to an existing inbox for free, so receiving needs only DNS (the domain already sits on
  Cloudflare). Sending *as* that address needs more: either Gmail's "Send mail as" over an app
  password with SPF and DKIM records in Cloudflare, or a paid sender. **(owner)**

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
- [x] **The 3D logo.** Built on 2026-09-24 and finished with the real model: the hero mark is a
  WebGL scene — the Blender GLB (`public/assets/model/krub-logo.glb`, ~6k tris) rendered as polished
  metal that tilts, spins and zooms, with the 2D mask kept as the fallback. TresJS
  (github.com/Tresjs/tres), lazy and never mounted below 900px. The crystal finish, the in-scene
  backdrop and the backlight were all built and then removed, and the loader is a real
  `THREE.LoadingManager` percentage. See decisions 75–83 and 86–87.
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
  for about 40 ms and read as a fault. The 3D model now has a real loading percentage (not a fake
  bar). Real project images once they exist would earn one. Whenever it goes in, delay it (~300 ms)
  so it only shows when the load is actually slow. Technique: a `linear-gradient` with an oversized
  `background-size` and a `@keyframes` sweeping it across (`background-size: 200% 100%` with
  `background-position` running to `-200% 0` at 1.2s linear infinite). Reference: @aniakubow on
  Instagram. See decision 54.
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
- [x] **The room's grid coincides with the page's inside the frame.** The transverse lines are
  spaced uniformly in world space, and at the frame's distance they land on the page's grid lines.
  In the logo-lab they do not coincide because the stages are not aligned with the page's grid,
  but that is expected — the lab puts stages side by side for comparison.
- [x] **The mark as a glTF.** Done: the mesh loads from `public/assets/model/krub-logo.glb` (454KB, 6k tris) instead of being extruded from SVG at runtime. Two materials: front takes the accent colour, back a dark neutral. A real loading percentage from `THREE.LoadingManager` shows while the GLB downloads. The SVG loader and buffer utilities are gone from the bundle.
- [ ] **A backlight behind the mark, without a plane.** The plane that cleared the grid behind the
  mark was removed (decision 80): near enough to project wider than the mark, the mark's corners
  crossed it when it turned; deeper, the tunnel's aperture clipped it smaller than the mark, so a
  flat quad cannot both cover the mark and stay behind it. The job — separating the mark from the
  grid behind it — wants something with depth: a back-side sphere around the mark, or a darkening
  in the room's own material.
- [ ] **The tunnel's far end reads as a black void.** Fading to `--ink` can only darken the end by the
  8/255 that separates it from `--surface` in the dark theme, so `near` and `far` differ by about
  1.5/255 and the end lands as a hole rather than as depth (measured). A `haze` mode that mixed `--fg`
  into `--ink`, so the end rose above the background, did lift it (12 to 33) but read as a square panel
  of mist at the end of the tunnel, so it was dropped. Still open: a shape that does not read as a lit
  panel — spacing the fog on the projection, or lighting the end some other way.
- [ ] **The project modal's media is cluttered.** The image is small and the carousel carries big
  arrows and an `IMAGEN 1 / 4 · NAME` label over it. Replace them with dots, as the other pagers do,
  and give the media a larger, taller slot.
- [ ] **Fixed blur bands.** A band under the navbar and another above the footer, from the hero down
  (not over the hero), that blur the content as it passes behind them. On a phone the navbar is a
  centred pill, so the band reads at its sides. Watch `backdrop-filter`: it makes the element a
  backdrop root, which is what once stopped the navbar's settings panel from matching the bar
  (decision 48).
- [ ] **Sound micro-interactions.** A quiet click for the menu and the controls, the way Limonacho
  already has his "acho" (decision 51). Fetched on first use, never preloaded.
- [ ] **Finish the design-system page.** The `/preview` page in the site's own style that documents
  the tokens, components and patterns is out of date and little iterated — the one Claude Design
  seeded. Bring it up to what the site is now. It is dev-only today (`import.meta.env.DEV`); whether
  it should also ship on `main` is a separate call, and for now it stays local.

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
- [ ] **The badge on /me on a phone.** It sits under the photo, left-aligned but with a gap that
  reads as stray. Put it bottom-left of the photo — beside it, not stamped inside — and let the photo
  take more width on a phone.
- [ ] **A movable navbar on a phone.** Let the compact bar be dragged: it snaps up or down and can
  also be moved sideways within the gutter, and the position is remembered in `localStorage` — so a
  visitor the bar gets in the way of can move it. Mobile only for now. Watch the footer and the
  lemon, which already own the bottom of the screen.

All three were real when the roadmap's "Later" list was written and are closed now; the group is
kept as the record rather than deleted.

## Testing

- [x] **The e2e suite goes flaky while the hero is on screen.** Partially fixed: the scene is now gated under `navigator.webdriver`, so Playwright workers don't hold WebGL contexts during tests. The suite passes with `--workers=1`. The remaining fix (reducing desktop workers or making flows wait on conditions rather than the clock) is deferred — the gate solves the practical problem.

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
- **A blog or case studies.** A home for the longer write-up each project wants and the modal's body
  cannot hold. Static, from `src/data/`, one file per article.
- **Rethink the background.** Keep the grid in the hero — it is now tied to the room's own grid
  (decision 80) — fade to a gradient after it, and give Contact something of its own at the close: a
  shape rather than another grid. A sketch; the grid is too woven in to move lightly.
- **Meetings (Cal.com).** An embed to book a slot, if it ever earns a place beside the form.
