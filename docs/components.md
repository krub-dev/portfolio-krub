# Component tree

Conventions that apply to every component:

- No visible string is written inside a component: it either arrives as a prop or is resolved
  from the translation key it was handed.
- No literal colours: always `var(--token)`.
- Props declare a type and a default. Events go upward through `emit`.
- A component that only paints does not own state; state lives in the parent or in a composable.

This started as a proposal before anything was built and is kept in step with the code. Where
the two disagree, the code is right and this file is the bug.

```
App
├─ BackgroundGrid  ×2  (hero / global, crossfading)
├─ TheNavbar
│   ├─ BrandLogo         (theme and language buttons are inline, not components)
│   └─ AccentButton     (icon, desktop only)
├─ TheMobileMenu
│   ├─ SocialLink ×n
│   └─ AccentButton     (row)
├─ ScrollProgress       (only where the route has a hero)
├─ CursorFx
├─ LemonPet             (only where the route has a hero)
│   └─ SpeechBubble
├─ main (HomeView)
│   ├─ HeroSection
│   │   ├─ BrandName     (the animated KIKO / RUBIO reveal)
│   │   ├─ LogoStage     (3D logo parallax; slot holds the badge — desktop only)
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
│   │   └─ ProjectCard ×n
│   ├─ StackSection
│   │   ├─ SectionHeading
│   │   └─ StackGroup → TechIcon
│   ├─ TestimonialsSection      (optional)
│   │   └─ TestimonialCard ×n
│   └─ ContactSection
│       ├─ SectionHeading
│       ├─ BaseButton
│       └─ SocialLink ×n
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
`name`, `src`, `invertOnDark` (boolean). Paints the 44px tile; with `invertOnDark` the SVG
drops to 28px and inverts in dark theme only.

### StackGroup
`label` (string), `items` (array of TechIcon).

### SocialLink
`name` (becomes the aria-label), `href`, `icon` (key into its own inline SVG paths).

### TimelineItem
`period`, `current` (boolean → years in yellow), `title`, `body`, `isLast` (adds the bottom
border).

### TabSwitch
`options` (array of `{ value, label }`), `modelValue`. Emits `update:modelValue`.

### AvailabilityBadge
`label` (string), `color` (defaults to `#39D98A`). Wraps the fixed core and the pulsing ring.

### SpeechBubble
`text`. Presentation only.

### AccentButton
Prop: `layout` (`'icon' | 'row'`, default `'icon'`). Reads `useAccent()` and cycles to the next
palette on click. The face is a 16px disc split diagonally between `--acc` and `--acc-2`; the
`aria-label` and `title` name the current palette. `icon` is the navbar square (desktop), where
there is no visible text; `row` is the small centred pill in the mobile menu, disc and name
together.

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
`quote`, `name`, `role`, `avatar`.

### MarqueeBar
`items` (array of strings), `separator` (defaults to `//`), `duration` (defaults to `26s`).

Repeats the list enough times to be at least as wide as the viewport, then renders that twice —
the keyframe translates -50%, so one copy has to fill the screen or a gap scrolls past. The
repeat count is measured, since it depends on the viewport, the font and the language.

---

## Chrome components (these carry behaviour)

### TheNavbar
Props: `activeId` (string), `menuOpen` (boolean). Publishes its own height as `--navbar-h`, which the hero pads past and anchored sections use for `scroll-margin-top`. Emits `toggle-menu`; theme and language are
handled directly through their composables, and the `AccentButton` sits beside them on desktop;
the mobile menu carries its `row` layout. Sections come from `src/data/sections.js`, labels
from the dictionary. Owns the compact scroll state and the natural-width measurement. Its links
are absolute (`/#id`, `/#top`), so the shared chrome works from the 404, where the sections do not
exist; on the home page the path is unchanged and the jump stays in-page.

### TheMobileMenu
Props: `open`, `activeId`. Emits `close`, `go-top`. Sections and socials come from `src/data`.
Closes on Escape and on a click outside as well as on any link.

### TheFooter
No props. Emits `go-top`. Reads the timezone from `config.js`, publishes its own height in
`--footer-h` by observing its size, and owns its scroll entrance. Contains `LiveClock`.

### CursorFx
Props: `interactiveSelector` (the "hot" element selector). Sizes are in its own stylesheet, not
props. Subscribes to `usePointer()` and refuses to mount on touch or below 900px. No dependency
on the rest of the app.

### LemonPet
No props: the bubble text comes from `copy.lemon`, and it reads `--footer-h` from CSS to sit on
top of the footer. Owns its own shake and bubble timers.

### BackgroundGrid
Props: `variant` (`'hero' | 'global'`), `size` (72), `visible` (boolean, for the crossfade).

### ScrollProgress
Props: `label` (defaults to "Scroll", rendered uppercase). Reads the progress from
`useScroll()` rather than taking it as a prop.

---

## Composables (shared logic, no interface)

| Composable | What it exposes |
|---|---|
| `useTheme()` | `theme`, `toggle()`; writes `data-theme` on `<html>` and persists |
| `useLang()` | `lang`, `toggle()`; persists in `localStorage["krub-lang"]` |
| `useAccent()` | `accent`, `set(id)`, `cycle()`; writes `data-accent` on `<html>` and persists |
| `useScrollSpy(ids, threshold = 0.35)` | reactive `activeId` |
| `useScroll()` | `y`, `progress` 0–1 and `atEnd`, from one shared listener |
| `useFocusTrap(el, active)` | keeps keyboard focus inside the open modal |
| `useMagnetic()` | registers the magnetic hover loop for `[data-magnetic]` |
| `usePointer()` | shared mouse position (used by the cursor, the lemon and the logo) |
| `useFooterHeight(el)` | thin wrapper that publishes the footer's `--footer-h` |
| `useElementHeight(el, prop)` | the mechanism behind it, shared with the navbar's `--navbar-h` |
| `usePastHero()` | true once the hero wrapper has been scrolled past; the footer and the lemon share it, and it is true from the start on a route with no hero (the 404) |
| `useBodyScrollLock(active)` | locks scrolling while the modal is open |

One single `requestAnimationFrame` drives everything that follows the mouse (cursor, lemon
pupils, logo parallax, magnetic hover). No per-component loops.

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
│   ├─ sections.js       the scrollable sections: id, label key, index
│   ├─ testimonials.js
│   └─ config.js         on/off switches for the optional sections
├─ locales/            strings the interface needs, not prose
│   ├─ en.json
│   └─ es.json
├─ styles/
│   └─ tokens.css        (:root + [data-theme="light"] + @keyframes + resets)
└─ utils/
    └─ format.js         pure helpers, unit-tested: formatPeriod, wrapIndex
```

The split is deliberate and it is the rule to keep:

    sentences I wrote   ->   src/data/
    labels the UI needs ->   src/locales/

Content collections carry their own `en` / `es` objects rather than pointing at translation
keys, so adding a project or reworking a paragraph is one file, not three, and no dictionary
key can go stale. Components read the right half with
`computed(() => entry[lang.value])`.
