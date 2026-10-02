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
mine to do by hand rather than a code change. The ideas at the end are not tasks and have no
checkbox.

This merges the pending list of 2026-09-16 with what used to live in the roadmap's "Later"
section, folded together where they overlapped.

## Where things stand — 2026-10-02

A short snapshot so resuming work does not mean reading the whole file. The checklist below is
the source of truth; this is the index into it.

`main` is what `krub.dev` serves and `dev` is where the work happens, and the two are level between
releases. Since launch the site has gained the accent palettes and the appearance control, the
reworked Stack and Contact, the testimonials pager, the 404, the self-hosted fonts, the interactive
grid cell, the CV pipeline and the performance work that took Lighthouse to 96 mobile / 100 desktop.
The repository is public.

The contact form works end to end — it sends by Resend, with Turnstile and a rate limit — and it
carries its privacy notice and a required consent box, both linking to `/privacy`. The domain carries
a real address (`contact@krub.dev`, receiving by Cloudflare Email Routing and sending as through
Resend's SMTP), and the site points at it everywhere.

**The substantial work still open:** a reread and a trim of the prose, a redeploy of Showroom, Bing
Webmaster Tools, raising the DMARC policy and the terms decision. The audit itself is closed.

---

## Contact form

The form is built and lives in Contact; it posts to `/api/contact`, a Vercel function that now sends
**by Resend**, with a best-effort per-instance rate limit and a Cloudflare Turnstile check (decision
57), and it carries the privacy notice and the consent the law asks for.

- [x] **Set Resend and Turnstile up.** Done: `krub.dev` is verified in Resend and the endpoint sends
  by it (decision 57), with the Turnstile widget live — `VITE_TURNSTILE_SITE_KEY` in the bundle and
  the secret server-side. The five variables are set in Vercel's Production environment and the
  release has gone out; a real send from krub.dev would confirm it end to end.
- [x] **A privacy notice for the form (GDPR).** Built on 2026-09-29, the three parts together: a
  required consent box under the fields, carrying the link to `/privacy`, which renders the policy
  from `src/data/privacy.js` in both languages. The box is enforced in `utils/contact.js` and again
  in `api/contact.js`, and the endpoint stamps the consent into the email. See decision 89.
- [x] **Harden the endpoint.** Done 2026-10-02: it no longer echoes the provider's error back (it is
  logged instead), a missing Turnstile secret now fails closed in production, a null body can no
  longer crash the handler, the name is stripped of newlines before it reaches the subject, the
  email check refuses display-name forms, both `fetch` calls time out, and a mismatched `Origin` is
  refused in production. The rate limit stays by-instance and best effort; Turnstile is the guard.

---

## Content, CV and SEO

- [x] **Review the CV.** Done 2026-09-20: I approved the content, and the plain-text
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
- [x] **Images for the projects.** Done 2026-09-30, all four: CreandoMientras has real screenshots,
  Showroom carries its own two covers (`desktop.jpg` / `responsive.jpg`, taken from its repository)
  until it is deployed again, sideForge shows its logo, since it is backend-only for now, and krub.dev
  has screenshots of itself. All 1280×800 JPEG, under `public/assets/img/<slug>/`. Better ones when
  there is something better to shoot.
- [x] **Sharper screenshots for krub.dev.** Done 2026-10-01: about, projects and contact recaptured
  at `deviceScaleFactor: 2` (2560×1600), and the hero at 1600×1000 from the real browser because the
  3D scene does not mount under the automated capture. A hand-recorded tour GIF and the `scripts/`
  pipeline (a Playwright tour and a video-to-GIF convertor) came with them; both were removed on
  2026-10-02, since the captures are made by hand from `/og`.
- [x] **The Open Graph image.** Done 2026-10-01: designed on a dev-only page, `/og`
  (`src/views/OgView.vue`), which draws the card at its real 1200×630 out of the site's own pieces —
  the 3D mark, lit, and Limonacho. The card and the LinkedIn cover are captured and in
  `public/assets/img/` (`og-banner.png`, `linkedin-banner.png`); the README/social-preview banner
  (1280×640) and its footer strip are designed and captured too. The page is dev-only and kept off
  the production bundle, so it stays as the tool for future artwork. Two earlier attempts are worth
  remembering: a
  hand-drawn copy of the hero, which drifts and cannot draw the 3D at all, and a capture of the built
  site, which dragged the cursor into the middle of the mark and clipped the mascot's leaf off. The
  structured data beside it is done (2026-09-23): `workLocation` is Murcia, and the X handle stays in
  `sameAs` and in the `twitter:` tags on purpose — it ties the domain to the profile even though X is
  no longer a link on the site.
- [x] **A final banner for LinkedIn and the GitHub profile README.** Done 2026-10-01, on `/og`: the
  LinkedIn cover (1584×396, its left band kept clear for the profile photo) and the README/social
  preview banner (1280×640), both out of the card's own pieces. The README one still needs its capture.
- [x] **Redo the GitHub profile README.** Done 2026-10-01: rewritten from scratch in the repo the
  README lives in (`krub-dev/krub-dev`), around the current site — a new banner and footer, the
  stack groups with Simple Icons for the three skillicons lacks, the four projects, a 42 block and a
  metrics Action.
- [x] **Fold the old hero bio into `/me`.** Done: `/me` was reworked around the LinkedIn bio and the
  old hero detail landed there — the full stack range (Java/Node/Vue), the client side and the
  AI-with-judgment line.
- [x] **Update the CV.** Done 2026-10-01: the header and profile brought in line with the site (no
  "backend focus", the AI-with-judgement line, Full Stack / Frontend / Backend), the name without
  the second surname and the domain address. The PDFs were regenerated and the one-pager and cover
  letters stored in `public/uploads/` for later.
- [x] **Finish the testimonials.** Done: the first real quote is in — Lourdes Campuzano of
  CreandoMientras, with her own mark in the avatar circle — and the pager now carries only that
  one, prepared for more to arrive. The vertical arrows went, replaced by scrollable dots. Long
  quotes are clamped to four lines with a "read more". Part of the same rework.
- [x] **Update LinkedIn to match the CV and the site.** Done: headline, location and dates aligned
  with the site, and the new banner in.
- [x] **Reread the prose.** Every sentence lives in `src/data/`, both languages side by side, one
  file per kind of content. It was always going to be iterated after launch rather than
  written once.
- [ ] **Trim the copy and the CV.** My read: the site carries a lot of content and the CV
  reads long. A pass to cut, not to reword — the prose across `src/data/` and the CV sources in the
  `cv` tool, keeping only what earns its place. Sits next to the prose pass, but the goal here is
  subtraction.
- [x] **Bing Webmaster Tools.** Done 2026-10-02: the domain is verified, the sitemap submitted and a
  site scan run. Bing also feeds DuckDuckGo. Google Search Console was already set up, with the
  sitemap submitted.
- [x] **Make the repository public.** Done 2026-10-02. The v1 portfolio repository is archived and
  its links redirect here.
- [x] **Make the documentation read as published work.** Done 2026-10-02: the live `.md` files
  rewritten to the first person (the earlier drafts described the build from the outside), the
  Spanish preamble and group headings in `decisions.md` turned to English, the README's `Running it`
  cut back to the commands a visitor needs, and the em-dash rule's wording, the `LiveClock` line and
  the "where things stand" snapshot corrected.
- [x] **Check the git history for personal data.** Done 2026-10-02: every PDF blob in the history,
  the dangling blobs and the working tree were searched for a phone number and a home address and
  found clean; the only hits were PDF creation timestamps (`D:20261001214655`) and a font's own
  encoding table. The CV purge held, so no history rewrite was needed.
- [x] **A banner and a "how it's made" note for the README.** Done 2026-10-02: the banner (reused from
  the Open Graph artwork) and a row of technology chips at the top, and a short, honest note on how
  the project is built — spec and rules first, an agent that follows them, review and verification in
  a real browser, tests as the net.
- [ ] **Redeploy Showroom.** Its Railway deploy is down (404 as of 2026-10-02), so the card and the
  modal carry no live link: `projects.js` has `live: null` with the old URL in a comment. Bring the
  deploy back, or point the link somewhere else, and set the field again.
- [x] **Audit the documentation against the code.** Every `.md` here plus the README. It has
  drifted once already — four claims in the README were untrue and two files described
  components and composables that do not exist. Worth doing while the build is still fresh in
  mind, because the cost of checking a claim rises the longer it has been since it was written.
  Done on 2026-09-16: the README, `components.md` and `design-spec.md` were checked against the
  code and corrected, and the one deliberate divergence that had no record (the magnetic pull)
  went into `decisions.md` as 47.
- [x] **Review the documentation once more before the repo goes public.** Done 2026-10-02: a full
  pass over `README.md` (rewritten, with a Performance section), `components.md`, `design-spec.md`
  and `decisions.md`, checked claim by claim against the code. It is not a first reading — the
  2026-09-16 pass was the baseline. The findings and fixes are in each file; the point of the pass
  was to make the docs describe what the code actually does.

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
  in Cloudflare, where the mail records also went.
- [x] **Re-measure Lighthouse once `dev` is on `main`.** Done 2026-10-02, against the deployment:
  **95 mobile / 100 desktop**, accessibility, best practices and SEO all 100. The 96 in the README
  was the earlier run; 95 is the same result within Lighthouse's run-to-run noise. The work that got
  it there is in the Performance section below.
- [ ] **Analytics, if any.** Vercel's own (Web Analytics / Speed Insights) looks like a component to
  switch on, but the question is whether it sets a cookie: if it does, it pulls in a consent banner
  the site does not have today. Decide first — a cookieless, privacy-friendly tool (Vercel's
  cookieless mode, Plausible) or none at all.
- [x] **An address on the domain, `contact@krub.dev`.** Done: Cloudflare Email Routing receives for
  it, and Resend's SMTP sends as it (`smtp.resend.com`), so the mail is DKIM-signed for `krub.dev`.
  The DNS carries it all: the routing MX and DKIM/SPF, Resend's `send`/`rsend` and
  `resend._domainkey`, and a `_dmarc` at `p=none`. Confirmed on a fresh message: `SPF PASS`,
  `DKIM PASS` for `krub.dev` and **`DMARC PASS`** (the first tests read `FAIL` only because the
  record was not yet live).
- [ ] **Raise the DMARC policy.** The record is done and passing (`_dmarc.krub.dev` at
  `v=DMARC1; p=none`, verified on a real send). Tightening it to `p=quarantine`, then `p=reject`, is
  the next step. To do it safely: add a `rua=` first so the aggregate reports arrive somewhere, watch
  a week, then raise it. All our sending aligns — SPF and DKIM both pass for `krub.dev` — so the risk
  is low.

## Performance

Re-measured against the deployment on 2026-10-02. Accessibility, best practices and SEO were already
100; performance started at 60 mobile / 66 desktop and ended at **96 mobile / 100 desktop**. Four
fixes, in impact order. What is left in the report — image delivery (526 KB), the static assets'
one-day cache lifetime (366 KB) and a render-blocking request (300 ms) — is down here for another
day; the scores are where they should be.

- [x] **Load Turnstile only when the form is in view.** The captcha script
  (`challenges.cloudflare.com`) is 694 KB and loaded in `ContactForm`'s `onMounted`, so every visitor
  paid for it before reaching the contact section. It is now pulled in by an `IntersectionObserver`
  as the form approaches the viewport.
- [x] **Keep the `LogoScene` chunk off a phone.** Verified: at 412 px the site makes **zero**
  requests for the chunk. The `!narrow` gate in `HeroSection` was already doing its job; the mobile
  appearance in the first run was a measurement artefact.
- [x] **Lighten the card images.** `scripts/optimize-images.mjs` re-encodes them to 1600 px at a
  sane quality: the four krub.dev covers went from 1.4 MB to 0.54 MB (`npm run optimize:images`).
- [x] **Start the 3D only when the shutter is raised.** The `LogoScene` chunk (885 KB) and its WebGL
  start-up were what kept the desktop TBT high. Behind the closed shutter the scene is hidden anyway,
  so it is imported on the first reveal rather than on mount, and the failure timer moved with it.
  Desktop TBT fell from ~450 ms to 10 ms.

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
  that sends through Resend, keeping the key as a server-side environment variable so it never
  reaches the bundle; the same handler is mounted by `vite.config.js` in development, and
  `.env.local` carries the keys locally. See decision 57.
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
- [x] **Shimmering skeleton placeholders.** Closed on 2026-09-30 as not needed: nothing arrives late
  enough to earn one. The four projects paint a `shotLabel` while they have no image, the ~30 stack
  icons are about 60 KB between them, the photo is local, and the 3D model has a real percentage from
  `THREE.LoadingManager`. A placeholder would flash for about 40 ms and read as a fault. Reopen when
  real project screenshots exist, and delay it (~300 ms) so it only shows on a genuinely slow load.
  Technique, for the day: a `linear-gradient` with `background-size: 200% 100%` and a `@keyframes`
  sweeping `background-position` to `-200% 0` at 1.2s linear infinite.
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
- [x] **A backlight behind the mark, without a plane.** Closed on 2026-09-30: not doing it. The plane was
  removed (decision 80) and a flat quad cannot both cover the mark and stay behind it; anything with
  depth for it (a back-side sphere, darkening the room's material) is more scene than the effect is
  worth.
- [x] **The tunnel's far end reads as a black void.** Closed on 2026-09-30: not doing it. Fading to
  `--ink` can only darken the end by the 8/255 that separates it from `--surface`, so it lands as a hole;
  the `haze` mode that lifted it read as a square panel of mist and was dropped. Accepted as it is.
- [x] **The project modal's media is cluttered.** Done on 2026-09-30: the slides are a horizontal track
  moved by `transform`, paged by the rail's own dots and draggable, at `16/10 × 56svh` to match the
  card's frame. The arrows and the `IMAGEN 1 / 4 · NAME` label are gone. See decision 94.
- [x] **Fixed blur bands.** Closed on 2026-09-30 as **dropped**: built (a strip of `backdrop-filter`
  under the bar and another above the footer, masked at the inner edge) and it read as a smudge lying
  over the page rather than as the page going under something. Removed. The full account is in
  decisions-archive.md 100. The navbar fix it turned up stays (decision 98). Reopen only with a
  different idea for those edges.
- [ ] **Sound micro-interactions.** A quiet click for the menu and the controls, the way Limonacho
  already has his "acho" (decision 51). Fetched on first use, never preloaded.
- [x] **The selected text takes the accent.** Done: `::selection` paints `--acc` behind and `--on-acc`
  on the letters, so it follows the palette and the theme, and the pair is the same one the filled
  controls already use.
- [ ] **A card for 42.** A future home for the 42 Barcelona work: the projects, links to the repos
  and a short explanation of each. Either a slot in the projects rail or a block of its own.
- [x] **The projects rail ends on a card that leads to GitHub.** Done on 2026-09-30: a dashed slot at
  the end of the rail with the GitHub mark, a question, a line and a mono link in the accent. The mark
  and the address come from the socials, so it cannot drift from Contact. See decision 101.
- [x] **Finish the design-system page.** Rewritten on 2026-09-30 as a proper sheet rather than a patched
  one: a sticky rail over thirteen sections, then foundations (21 colour tokens grouped by use, the type
  scale, shape with the one shadow the project actually has, motion with the live keyframes), the
  components (buttons, blocks, cards, small pieces) and the pieces that belong to no section — the
  cursor, the hero's stage in a five-cell box, and the navbar, the footer and Limonacho, each in its own
  section with the real component framed inside it. **English throughout** (it belongs to the repository,
  not to the site, so only the components' own labels follow the language toggle) and every specimen fed
  **placeholders** rather than `src/data`. The route is `bare`: it documents the chrome instead of wearing
  it, and wears one grid that scrolls the whole page instead of the hero/global pair. Still dev-only
  (`import.meta.env.DEV`); whether it should ship is a separate call.

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
- [x] **The badge on /me on a phone.** Closed on 2026-09-30 the other way round from what this asked:
  under the photo it read as a third item between the photo and the CV, so it stays where a wide screen
  puts it — above the photo's right corner — and the photo takes the full width.
- [ ] **A movable navbar on a phone.** Let the compact bar be dragged: it snaps up or down and can
  also be moved sideways within the gutter, and the position is remembered in `localStorage` — so a
  visitor the bar gets in the way of can move it. Mobile only for now. Watch the footer and the
  lemon, which already own the bottom of the screen.
- [ ] **The rail's hover sticks on a touch pan on iPad.** Dragging the projects rail sideways marks
  the card under the finger, but the row stops a card or two short of the end — the last card never
  lights. Low priority. The hover follows the pointer position, so a touch pan has to move it the way
  a mouse does and still reach the last card; worth checking on the real device, not only in the
  emulator.

All three were real when the roadmap's "Later" list was written and are closed now; the group is
kept as the record rather than deleted.

## Testing

- [x] **The e2e suite went flaky while the hero was on screen.** Explained: Playwright runs several browsers at once, and each Chromium worker holding the hero's WebGL context made the frames stall, so tests that depend on animation timing failed at random. Fixed by skipping the 3D scene under `navigator.webdriver` (Playwright sets that flag), so no worker opens a WebGL context. The suite is run with `--workers=1` by habit; parallel workers are still occasionally flaky, and that part is deferred — it costs time, not correctness.
- [x] **`never covers the last section` is flaky.** Fixed 2026-10-02: the footer test now runs under reduced motion and polls the settled geometry, so it no longer races the 0.4s entrance. The privacy-link test got the same treatment, centring its target before clicking, because the fixed footer sat over the row it landed on.

## Final audit

The pre-publication pass over the whole thing. The list below is mine; most of it is already in
place, a few entries do not apply to a static portfolio, and a few are real work. The point is also
to turn it into a reusable checklist — see the skill.

**In place already (verify, do not rebuild):**

- Privacy notice (the `/privacy` route, linked from the form).
- No frontend secrets: everything sensitive is server-side (`RESEND_API_KEY`, `CONTACT_TO`,
  `CONTACT_FROM`, `TURNSTILE_SECRET_KEY`); only `VITE_TURNSTILE_SITE_KEY` is public, and it is meant
  to be.
- HTTPS, with the apex redirect.
- SEO: canonical, `sitemap`, `robots.txt`, structured data, meta titles and descriptions, the social
  preview (the OG image) and the favicon.
- Image alt text and compression; colour contrast (the `--fg-3` pass); mobile responsiveness.
- A real 404; form validation; spam protection (Turnstile plus a rate limit).
- One primary CTA in the hero — the secondary one is a shortcut to the projects, not a second ask.

**To do or to debate:**

- [x] **Broken links.** Swept 2026-10-02: every outbound link and internal anchor checked.
  Showroom's Railway deploy was the one casualty — the card hides the link and the no-JS fallback
  now points at its repository. `creandomientras.com` answers a 308 the browser follows.
- [x] **PageSpeed / Lighthouse, axe and `npm audit`.** Lighthouse is 96 mobile / 100 desktop, with
  accessibility, best practices and SEO at 100. `npm audit` is clean. Axe runs as
  `tests/e2e/a11y.spec.js` — the home page in both themes and languages, plus `/privacy` and the 404
  — and is green.
- [x] **Re-measure Lighthouse once more** after the header and rewrite changes: done 2026-10-02,
  95 mobile / 100 desktop, everything else 100.
- [ ] **Terms & conditions.** A portfolio sells nothing, so decide whether it needs them at all.
- [x] **Cookie consent.** There are none today, so no banner; it only appears if analytics brings one.
- [x] **The audit itself.** Run the checklist end to end and record the result — done 2026-10-02.
- [ ] **A CSP.** Deliberately deferred: a real one has to account for the inline theme script,
  Turnstile and the 3D worker, so it is its own piece of work, not a line in `vercel.json`.

## Ideas (future)

Not tasks. No urgency and no order — written down so they do not evaporate.

- Stickers.
- Pet Grok / Limonacho.
- A guest section: a counter and a dedication.
- 3D Limonacho, rubber-hose style.
- Stickers stuck on a 3D shape, movable. A sphere (or something else) wearing stickers of the
  logo, 42, a technology, a lemon.
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
