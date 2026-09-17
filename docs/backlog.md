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

---

## Content, CV and SEO

- [ ] **Rewrite the CV.** ATS-friendly, in both languages, without the phone number and home
  address the original carried. The button is now **on** (`config.showCv` is true, since
  2026-09-17) so it can be seen, but `public/uploads/` holds no file, so it currently downloads
  nothing: **drop the PDF at the path below, or turn the switch off again, before this reaches
  `main`.** The original was pulled from the deployment and purged from the git history. **(owner)**
- [ ] **Real testimonials.** The section, the cards and the layout are built and reviewed, and the
  section is now **on** (`config.showTestimonials` is true, since 2026-09-17) so the real quotes can
  be dropped in one at a time. Until that happens it shows the bracketed placeholders in
  `src/data/testimonials.js`, which is why the switch was off: **turn it off again, or replace the
  quotes, before this reaches `main`.** One quote is enough: the grid closes up on its own. **(owner)**
- [ ] **Reread the prose.** Every sentence lives in `src/data/`, both languages side by side, one
  file per kind of content. It was always going to be iterated after launch rather than
  written once. **(owner)**
- [ ] **Bing Webmaster Tools.** The same five minutes as Google Search Console, which is done and
  has the sitemap submitted. Bing also feeds DuckDuckGo. **(owner)**
- [ ] **Make the repository public.** When the pending work is done. **(owner)**
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
- [ ] **The 3D logo.** The hero stage is the slot reserved for it — that is why it is empty and
  carries no explanatory text. `LogoStage.vue` already owns the mask, the parallax and the
  inner grid, so a Three.js scene replaces the `.mark` element and nothing else has to move.
  Needs the model out of Blender first, exported as glTF/GLB. Read the mobile note below
  before starting. When it lands, its download is the only one on this site worth reporting: a real
  percentage from `THREE.LoadingManager` inside the stage, and a delayed shimmer while it arrives —
  see the skeleton note below and decision 54.
- [x] **Rethink the stack section.** Done on 2026-09-17: the grid is monochrome at rest — each logo
  drawn twice, a held-back grey copy under a colour one — and the pointer lights the tiles it passes
  near and names the nearest one in mono. No mask, and no softened edges. It rides the existing
  pointer loop, so it costs no second `requestAnimationFrame`, and on touch it stays grey. See
  decision 58.
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
- [ ] **Turn Limonacho into something that answers.** A small chat backed by a model, given
  `src/data/` as its context, so a visitor can ask about a project instead of reading for it —
  with a bit of Murcian in the voice, because a mascot that talks like documentation is not a
  mascot. Wants its own context and a reset/clear. Needs a server-side endpoint: an API key
  cannot live in a static bundle. The speech bubble and its timers are already built and would
  become the chat surface.
- [ ] **Shimmering skeleton placeholders.** Held until something genuinely arrives late, which today
  nothing does: the three projects have `image: null` and their cards paint a `shotLabel`, the 24
  stack icons come to 50 KB between them, and the photo is local — a placeholder would flash for
  about 40 ms and read as a fault. The two spots that will earn one: the 3D model (with a real
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
  not mount below 900px, so the parallax never subscribes and a WebGL scene would cost nothing
  because it would not be there. The scene itself is still the 3D logo task above.
- [x] **The footer slides in on a phone too.** Fixed in `9df04e8` (decision 37), before this was
  ever written down as pending: the footer no longer sits in the layout from the first frame
  below 900px, and it shares `usePastHero` with the lemon, so the two arrive together at the end
  of the hero wrapper.

All three were real when the roadmap's "Later" list was written and are closed now; the group is
kept as the record rather than deleted.

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
- A photo that follows the cursor, like Limonacho but my profile picture.
- Frosted glass on the 3D slot, with the grid behind it.
