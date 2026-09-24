# Component tree

Conventions that apply to every component:

- No visible string is written inside a component: it either arrives as a prop or is resolved
  from the translation key it was handed.
- No literal colours: always `var(--token)`.
- Props declare a type and a default. Events go upward through `emit`.
- A component that only paints does not own state; state lives in the parent or in a composable.

The components live in four folders, split by the job they do rather than by the kind of file they
are. The folder is what the component is allowed to be:

| Folder | What belongs there |
|---|---|
| `base/` | dumb and reusable: it paints what it is handed and emits upward. No data, no routing, no state |
| `content/` | paints one entity out of `src/data/` — a project, a quote — and could sit inside any section |
| `sections/` | one per block of the page, plus what belongs to that block and nowhere else |
| `chrome/` | the fixed furniture around the page (navbar, footer, menus, cursor, lemon) and the behaviour that comes with it |

A component moves down that list the moment it stops being reusable: as soon as a "content" piece
needs to know which section it is in, it is a section component. The routes that assemble them are a
separate layer, in `src/views/`.

This started as a proposal before anything was built and is kept in step with the code. Where
the two disagree, the code is right and this file is the bug.

```
App
├─ BackgroundGrid  ×2  (hero / global, crossfading)
├─ TheNavbar
│   ├─ BrandLogo
│   ├─ AppearanceControl
│   ├─ LangButton
│   ├─ DotsIcon           (the menu button, below 900px)
│   └─ SettingsMenu      (compact only)
│       ├─ DotsIcon
│       ├─ AppearanceControl
│       └─ LangButton
├─ TheMobileMenu
│   ├─ SocialLink ×n
│   ├─ AppearanceControl (compact only)
│   └─ LangButton        (compact only)
├─ ScrollProgress       (only where the route has a hero)
├─ CursorFx
├─ LemonPet             (only where the route has a hero)
│   └─ SpeechBubble
├─ main (HomeView)
│   ├─ HeroSection
│   │   ├─ BrandName     (the animated KIKO / RUBIO reveal)
│   │   ├─ LogoStage     (the stage; slot holds the badge — desktop only)
│   │   │   ├─ LogoScene  (WebGL, lazy)
│   │   │   │   ├─ SceneRig  (camera, room)
│   │   │   │   └─ LogoModel (the mark)
│   │   │   └─ AvailabilityBadge
│   │   └─ BaseButton ×2
│   ├─ MarqueeBar
│   ├─ AboutSection
│   │   ├─ SectionHeading
│   │   ├─ TabSwitch
│   │   ├─ TimelineItem ×n
│   │   └─ BaseButton (CV, behind config.showCv)
│   ├─ ProjectsSection
│   │   ├─ SectionHeading
│   │   ├─ ProjectCard ×n
│   │   └─ Testimonials         (optional, from config)
│   └─ ContactSection
│       ├─ SectionHeading
│       ├─ TalkBand
│       ├─ ContactForm
│       └─ BaseButton
├─ ProjectModal
│   ├─ MediaCarousel
│   └─ SpecList
├─ NotFoundView         (the 404 route)
│   └─ BaseButton
└─ TheFooter
    └─ LiveClock
```

---

## Base components (dumb, reusable)

### BaseButton
| Prop | Type | Default | Use |
|---|---|---|---|
| `variant` | `'solid' \| 'outline'` | `'outline'` | yellow fill / border |
| `shape` | `'pill' \| 'square'` | `'pill'` | radius 999 / radius 10–12 |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | 14 / 15–16 / 18–19px |
| `mono` | boolean | `false` | uses JetBrains Mono |
| `href` | string | — | external link; renders an `<a>` |
| `to` | string | — | internal route; renders a `RouterLink`, so no reload |
| `external` | boolean | `false` | adds `target="_blank" rel="noopener"` |
| `magnetic` | boolean | `false` | opts into magnetic hover |

Renders a `<button>` when neither `to` nor `href` is given. Default slot: the content. Emits
`click`.

### SectionHeading
| Prop | Type | Notes |
|---|---|---|
| `index` | string \| null | `'00'`…`'03'`; `null` draws no giant number |
| `title` | string | already translated, e.g. `/projects` |
| `count` | number \| null | yellow superscript (projects only) |

### TechIcon
`name`, `src`, `invertOnDark` (boolean), `wide` (boolean), `interactive` (boolean). Paints the 60px
tile (48px below 900px) and draws the logo twice — a grey, held-back copy and a colour one on top — so
the spotlight can fade the colour in with an opacity instead of animating a filter. Both copies render
at 38px (30px on mobile); `invertOnDark` puts `[data-invert-dark]` on both, and `wide` gives a
wordmark a wider box so it is not a stripe in the middle of its tile. `data-tile` and `data-name` are
what the tap handler and the readout read; `interactive` adds `[data-interactive]`, which is what
opens the custom cursor's ring.

### StackGroup
`label` (string), `items` (array of TechIcon). It also runs the light: on a pointer device it lights
the tiles the cursor passes near and lifts them, and it hands the name of the nearest one to Limonacho
— or writes it into its own mono readout when there is no lemon on the page. On touch the scroll is
the light and it comes on a whole group at a time, and a tap hands a name over the same way. It hangs
off `usePointer` and `useScroll` — one loop and one listener for the whole site — and does nothing
under reduced motion.

### SocialLink
`name` (becomes the aria-label), `href`, `icon` (key into its own inline SVG paths).

### TimelineItem
`period`, `current` (boolean → years in yellow), `title`, `body`, `isLast` (adds the bottom
border).

### TabSwitch
`options` (array of `{ value, label }`), `modelValue`, `panelId` (the id of the region the tabs
switch, for the ARIA wiring). Emits `update:modelValue`. A real tablist: roving `tabindex`,
`aria-controls` on each tab, and the arrows (with wrap) plus Home/End move the selection and the
focus. See decision 73.

### AvailabilityBadge
`label` (string), `color` (defaults to `#39D98A`). Wraps the fixed core and the pulsing ring.

### SpeechBubble
`text`, `live` (boolean, default true → `role="status"`). Presentation only: the lemon owns the timers.
Not live for a technology name, which changes as the pointer sweeps the grid.

### LangButton
No props. The ES / EN button; calls `useLang().toggle()`. Used in the navbar on desktop and in the
mobile menu header, so it is a component rather than inline markup.

### DotsIcon
Prop: `open` (boolean). The four dots the mobile menu button and the desktop settings button share.
On open they spread apart, each moving out along both axes to leave a gap in the middle, instead of
becoming a cross; the move is a CSS transform so it transitions. Reduced motion drops the spread.

---

## Content components

### ProjectCard
| Prop | Type |
|---|---|
| `name` | string |
| `tag` | string |
| `summary` | string |
| `shotLabel` | string (placeholder while there is no image) |
| `image` | string \| null |
| `stack` | array of strings (the first three are shown, joined by `·`) |

Emits `open`.

### ProjectModal
| Prop | Type |
|---|---|
| `project` | object \| null (`null` = closed) |
| `index` | number (for the `[0N]` in the header) |

Emits `close`. Locks body scroll while open. Contains `MediaCarousel` (props `slides`, `slug`;
owns its own index state, wrapping around) and `SpecList` (props `role`, `year`, `stack`; it
resolves its own Role / Year / Stack labels through i18n).

### TestimonialCard
`quote`, `name`, `role`, `avatar`, `open`. One entry as the pager's content: the attribution first, then
the quote, clamped to four lines with a read more when there is more of it. No box of its own — the
pager's pane is the box. Whether it is open belongs to the pager, which is the one that sizes the pane:
the card emits `toggle` and reads the state back as a prop. See decisions.md 56 and 72.

### Testimonials
The block between the Stack and Contact: a filled accent header carrying the label and a `n / total`,
and a vertical pager, one quote at a time. **One entry is in the DOM at all** — the current one — and
changing swaps it, so the block never grows with the number of quotes; the pane's height is animated to
the card on show. Navigation is the vertical dot column and a click on the card (which wraps); the pager
is not a scroll container, so the wheel and a swipe belong to the page. `aria-live="polite"` on the pane
so a screen reader hears the new quote. Gated by `config` in ProjectsSection. See decisions.md 72 and 74.

---

## Section components

One per block of the page, in page order, plus the two pieces that only exist inside the hero. They
take no props: each reads its own slice of `src/data/` and its own composables, which is why the page
can be reordered by moving one line in `HomeView`. Every one that is a destination owns the `id` the
nav links to.

### HeroSection
`id="top"`. The hero wrapper itself — the element `usePastHero` measures, and the reason a route
either has a hero or does not. Holds the badge, the headline, the two buttons, `BrandName` and the
stage. Below 900px the badge moves into the text column and `LogoStage` is not mounted at all
(decision 37), which is also why nothing 3D ever runs on a phone.

### MarqueeBar
`items` (array of strings), `separator` (defaults to `//`), `duration` (defaults to `26s`).

Repeats the list enough times to be at least as wide as the viewport, then renders that twice —
the keyframe translates -50%, so one copy has to fill the screen or a gap scrolls past. The
repeat count is measured, since it depends on the viewport, the font and the language.

No `id`: it is a band, not a destination.

### AboutSection
`id="me"`. Three paragraphs, the experience / education / certifications tabs with their timeline,
the CV button behind `config.showCv`, and the photo.

### ProjectsSection
`id="projects"`. A horizontal rail of `ProjectCard`: a clipped viewport holding a track moved by
`transform`, three cards and a sliver on a desktop and one on a phone, with a row of dots under it —
one per parking spot, recomputed per width, each a 24px button with an 8px mark inside. It drags with
any pointer type, and swallows the click when the drag passed 6px so a drag does not open a card. Cards
fully out of the rail are `inert`, so Tab cannot walk into one nobody can see. Emits `open` with the
project that was clicked — the modal itself lives in `HomeView`, so the section does not own it.

### StackSection
`id="stack"`. The four groups from `src/data/stack.js` in a two-column grid: `StackGroup` →
`TechIcon`. The groups carry the light; the section is just the grid and the heading.

### ContactSection
`id="contact"`. The heading, the band, the form, and one full-width row per contact (the address
written out, derived from the href; the email row is the mailto, so there is no separate button). The
section itself carries no gutter — it is the full-bleed container the band needs, so two inner
columns carry the measurements, one above the band (the heading) and one below (the rows and the
form).

### ContactForm
The panel: the three fields, the send button, the mono note with the address, the honeypot and the
live region. It paints; the state is in `useContactForm`. Every string comes from `src/locales/`.

### TalkBand
`text`. The band in Contact, between the heading and the rows: on the accent background, display type
with the words alternating between solid and outline over a second, fainter copy travelling the other
way. It moves with the scroll and only with the scroll, a fifth of its own track, and eases toward
where the scroll says it should be — the loop stops once it has caught up. Decorative
(`aria-hidden`).

### BrandName
The KIKO / RUBIO reveal at the top of the hero. A pure CSS animation — the letters are markup, not
copy, because the animation depends on where the word splits, so they are not in `src/data/`.

### LogoStage
The hero's square stage and the only thing on the page that turns in 3D. It owns the box, the 2D
fallback mask, the frame that clips the canvas and the pointer gestures — a hover tilt and a drag
spin that springs back — which it forwards to the scene as `tilt` / `spin` / `dragging`. The scene
is lazy (`defineAsyncComponent`), so Three never reaches the initial bundle, and `HeroSection` is
what decides not to mount it below 900px (decision 37). The rotating glow that used to live here is
gone (decision 71).

### LogoScene
The `<TresCanvas>`: the light, the wheel-zoom (clamped, and it only takes the gesture while it can
still move), the off-screen pause (an IntersectionObserver at 60%) and the fps and DPR caps. It
builds the mark's geometry — the favicon SVG path extruded, welded and re-normalled — and emits
`ready` when it is up. The camera and the room are `SceneRig`'s.

### SceneRig
The rig around the mark: the camera and the room. An open box — four walls converging on a far wall
kept close to the frame, built by hand so the grid is world-uniform and sized so a cell lands on
each edge — carries the grid; the camera sits outside the opening and leans with the pointer's
`tilt`, always looking back at the mark, so the room parallaxes while the mark stays centred. A
child of the canvas, because `useLoop` and `useTresContext` need the renderer. See decision 78.

### LogoModel
The mesh and everything about how it looks and moves: the polished-metal `MeshStandardMaterial`,
the generated `RoomEnvironment` (a PMREM), the accent colour read from `--acc-solid`, and the hover
sway, drag spin and magnetic return. It is a child of the canvas on purpose — `useLoop` and
`useTresContext` need the renderer the canvas provides. Built once and never rebuilt.

---

## Chrome components (these carry behaviour)

### TheNavbar
Props: `activeId` (string), `menuOpen` (boolean). Publishes its own height as `--navbar-h`, which the hero pads past and anchored sections use for `scroll-margin-top`. Emits `toggle-menu`; theme and language are
handled directly through their composables, and the `AppearanceControl` and `LangButton` sit beside
it. The measurement is taken with the compact layout applied for one frame, so the hand-over is
accounted for: once the capsule compacts those two give way to a `SettingsMenu`, and below 900px
they give way to nothing — the menu carries them from then on. Sections come from
`src/data/sections.js`, labels
from the dictionary. Owns the compact scroll state and the natural-width measurement. Its links
are absolute (`/#id`, `/#top`), so the shared chrome works from the 404, where the sections do not
exist; on the home page the path is unchanged and the jump stays in-page.

### SettingsMenu
Prop: `visible` (boolean — the compact state; the panel closes when it goes false). The 36×36
four-dot button (`DotsIcon`) the compact desktop bar shows in place of the appearance and language
controls — the same icon as the mobile menu button, which spreads on open. It opens a panel holding
both, with the capsule's translucent blur and `padding: 5px 8px`; the panel is teleported to
`<body>` and positioned from the trigger, so its blur sees the page and not the capsule. Closes on
the trigger, on a click outside, on Escape and on a scroll.

### TheMobileMenu
Props: `open`, `activeId`. Emits `close`, `go-top`. Sections and socials come from `src/data`.
Closes on Escape, on a click outside, on a scroll and on any link. Its header carries the
`AppearanceControl` and `LangButton`, but only once the navbar has compacted — before that they
are still in the bar.

### AppearanceControl
No props. The two-segment appearance control in the navbar, in both control groups: the ◐ button
calls `useTheme().toggle()`, and the accent disc calls `useAccent().cycle()`, advancing one palette
per click. The `aria-label` and `title` name the current palette, since the disc has no visible
text. On desktop the box takes the language button's hover — frame and glyphs to the accent, the
circle growing a little.

### TheFooter
No props. Emits `go-top`. Reads the timezone from `config.js`, publishes its own height in
`--footer-h` by observing its size, and owns its scroll entrance. Contains `LiveClock`.

### CursorFx
Props: `interactiveSelector` (the "hot" element selector). Sizes are in its own stylesheet, not
props. Subscribes to `usePointer()` and refuses to mount on touch or below 900px. No dependency
on the rest of the app.

### LemonPet
No props: the greeting text comes from `copy.lemon`, and it reads `--footer-h` from CSS to sit on top
of the footer. Owns its own shake and greeting timers. On mount it registers with `useLemonVoice()`,
which is how the Stack knows there is a voice on the page and hands it the technology names; the
cleanup goes with the unmount. His pupils follow the cursor, and on touch they glance at the last tap
(a transition on the pupil, only under `hover: none`). His bubble is pushed left by his own width,
because with no tail centred over him it reads as sitting on his leaf.

### BackgroundGrid
Props: `variant` (`'hero' | 'global'`), `size` (72), `visible` (boolean, for the crossfade).

### GridCell
Prop: `masked` (boolean — which layer is showing: false while the absolute hero grid is visible, true
once the fixed global one takes over; it also gates that layer's downward mask).
The 72px cell of the background grid under the pointer, outlined with a 1px `--acc` border at
`opacity:.45` (`.22` on touch). Fixed to the viewport rather than a child of a grid, because the hero
grid scrolls and a cell inside it would drift off the cursor. Subscribes to `usePointer()` and snaps
with `Math.floor` to whichever layer is visible — page coordinates for the hero layer, the viewport
for the fixed one — so a scroll keeps it on the lines instead of taking it away. The mask is applied
over the same box the grid covers (`bottom: var(--footer-h)`), or it fades later than the lines behind
it. It goes with the cursor after two seconds without a `mousemove`. On touch, where there is no
cursor, it lights on a tap (told from a scroll by the finger's travel) and stays until a scroll clears
it; the pointer subscription never happens there.

### ScrollProgress
Props: `label` (defaults to "Scroll", rendered uppercase). Reads the progress from
`useScroll()` rather than taking it as a prop.

---

## Composables (shared logic, no interface)

| Composable | What it exposes |
|---|---|
| `useTheme()` | `theme`, `toggle()`; writes `data-theme` on `<html>` and persists |
| `useLang()` | `lang`, `toggle()`; persists in `localStorage["krub-lang"]` |
| `useAccent()` | `accent`, `set(id)`; writes `data-accent` on `<html>` and persists |
| `useScrollSpy(ids, threshold = 0.35)` | reactive `activeId` |
| `useScroll()` | `y`, `progress` 0–1 and `atEnd`, from one shared listener |
| `useFocusTrap(el, active)` | keeps keyboard focus inside the open modal |
| `useMagnetic()` | registers the magnetic hover loop for `[data-magnetic]` |
| `usePointer()` | shared mouse position (used by the cursor, the lemon and the logo) and `active`, which goes false after two seconds without a `mousemove` or a scroll, and comes back on either |
| `useFooterHeight(el)` | thin wrapper that publishes the footer's `--footer-h` |
| `useElementHeight(el, prop)` | the mechanism behind it, shared with the navbar's `--navbar-h`. Observes the border box and re-reads on a `visualViewport` resize, because the iOS toolbar changes the footer's padding and a ResizeObserver can miss that |
| `usePastHero()` | true once the hero wrapper has been scrolled past; the footer and the lemon share it, and it is true from the start on a route with no hero (the 404) |
| `useAcho()` | `playOnce()`: true on the first poke of a visit — the one that says "acho" and shows the bubble — and false after. Module scope, so it is per page load and nothing is stored |
| `useLemonVoice()` | `say(text)` / `hush()` for whatever Limonacho should be saying, plus `message`, `listening` and the lemon's `listen()` registration. Owner-aware, so the four Stack groups do not talk over each other, and a `shallowRef` because the owner check is an identity check and a plain `ref` would hand back a proxy |
| `useBodyScrollLock(active)` | locks scrolling while the modal is open |

One single `requestAnimationFrame` drives everything that follows the mouse (cursor, lemon
pupils, the logo's tilt, magnetic hover). No per-component loops. The 3D logo is the one
exception: Three's renderer owns its own loop, paused while off-screen.

---

## Data and translation files

```
src/
├─ data/               everything I wrote — both languages per file
│   ├─ index.js          re-exports, and the "start here" explanation
│   ├─ accents.js        the accent palette ids the switcher offers
│   ├─ copy.js           hero headline, About paragraphs, marquee, contact, lemon, 404
│   ├─ projects.js
│   ├─ experience.js
│   ├─ education.js
│   ├─ stack.js
│   ├─ socials.js        + email, cvPath, photoPath
│   ├─ sound.js          the one audio clip: the "acho" Limonacho says once a visit
│   ├─ sections.js       the scrollable sections: id, label key, index
│   ├─ testimonials.js
│   └─ config.js         on/off switches for the optional sections
├─ locales/            strings the interface needs, not prose
│   ├─ en.json
│   └─ es.json
├─ styles/
│   └─ tokens.css        (:root + [data-theme="light"] + @keyframes + resets)
└─ utils/
    ├─ format.js         pure helpers, unit-tested: formatPeriod, wrapIndex, formatUrl
    └─ contact.js        the contact form's rules, unit-tested
```

Outside `src/`, at the repository root:

```
api/
└─ contact.js            the form's endpoint: a Vercel function holding WEB3FORMS_KEY, and
                         the same handler mounted by vite.config.js in development
```

The split is deliberate and it is the rule to keep:

    sentences I wrote   ->   src/data/
    labels the UI needs ->   src/locales/

Content collections carry their own `en` / `es` objects rather than pointing at translation
keys, so adding a project or reworking a paragraph is one file, not three, and no dictionary
key can go stale. Components read the right half with
`computed(() => entry[lang.value])`.
