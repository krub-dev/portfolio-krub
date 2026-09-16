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
  address the original carried. Drop the file in `public/uploads/` and set `showCv: true` in
  `src/data/config.js`. The button and its wiring are already built; the original PDF was
  pulled from the deployment and purged from the git history. **(owner)**
- [ ] **Real testimonials.** The section, the cards and the layout are built and reviewed — they
  ship hidden because the quotes in `src/data/testimonials.js` are bracketed placeholders.
  Replace them and flip `showTestimonials` in `src/data/config.js`. One quote is enough: the
  grid closes up on its own. **(owner)**
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
  toggle (desktop navbar; menu header on a phone). Each palette swaps the accent tokens and
  nothing else, and each needed a light-theme counterpart because the pastels are invisible as
  fills on cream. Built on 2026-09-16; see decision 48.
- [ ] **The 3D logo.** The hero stage is the slot reserved for it — that is why it is empty and
  carries no explanatory text. `LogoStage.vue` already owns the mask, the parallax and the
  inner grid, so a Three.js scene replaces the `.mark` element and nothing else has to move.
  Needs the model out of Blender first, exported as glTF/GLB. Read the mobile note below
  before starting.
- [ ] **Rethink the stack section.** The icon grid is faithful to the spec but flat. Ideas so far:
  monochrome, animation, interaction, a mask, softened edges.
- [ ] **Give the contact section more weight.** It is the end of the page and should land like it —
  more impact, a shape of its own.
- [ ] **A simple contact form**, in addition to the mailto. Needs somewhere to send it — Web3Forms
  is already proven on CreandoMientras.
- [ ] **Turn Limonacho into something that answers.** A small chat backed by a model, given
  `src/data/` as its context, so a visitor can ask about a project instead of reading for it —
  with a bit of Murcian in the voice, because a mascot that talks like documentation is not a
  mascot. Wants its own context and a reset/clear. Needs a server-side endpoint: an API key
  cannot live in a static bundle. The speech bubble and its timers are already built and would
  become the chat surface.
- [ ] **Shimmering skeleton placeholders.** A loading state made from a `linear-gradient` with an
  oversized `background-size` and a `@keyframes` sweeping it across (`background-size: 200% 100%`
  with `background-position` running to `-200% 0` at 1.2s linear infinite). Reference: @aniakubow
  on Instagram. Where it goes is open — the site is fast and mostly static, so it needs a spot
  where something genuinely arrives late; project images are the obvious candidate.
- [ ] **A simulated entry loader — or not.** An open decision. If it happens it must not become a
  fake delay over content that is already there.
- [ ] **Easter egg: the "Acho" audio.** A hidden clip somewhere on the page. Detail still open.

## Mobile and responsive

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
- A rotating glow border on the 3D slot.
- Frosted glass on the 3D slot, with the grid behind it.
