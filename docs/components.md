# Component tree

Conventions that apply to every component:

- No visible string is written inside a component: it either arrives as a prop or is resolved
  from the translation key it was handed.
- No literal colours: always `var(--token)`.
- Props declare a type and a default. Events go upward through `emit`.
- A component that only paints does not own state; state lives in the parent or in a composable.

```
App
├─ TheNavbar
│   ├─ BrandLogo
│   ├─ NavLinks
│   ├─ ThemeToggle
│   ├─ LangToggle
│   └─ BaseButton (the "Let's talk" CTA)
├─ TheMobileMenu
├─ BackgroundGrid  ×2  (hero / global variants)
├─ CursorFx
├─ ScrollProgress
├─ LemonPet
│   └─ SpeechBubble
├─ main
│   ├─ HeroSection
│   │   ├─ AvailabilityBadge
│   │   ├─ LogoStage        (3D logo parallax)
│   │   └─ BaseButton ×2
│   ├─ MarqueeBar
│   ├─ AboutSection
│   │   ├─ SectionHeading
│   │   ├─ TabSwitch
│   │   ├─ TimelineList → TimelineItem
│   │   └─ BaseButton (CV)
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
| `href` | string | — | renders an `<a>` when present, a `<button>` otherwise |
| `external` | boolean | `false` | adds `target="_blank" rel="noopener"` |
| `magnetic` | boolean | `false` | opts into magnetic hover |

Default slot: the content. Emits `click`.

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
`label`, `href`, `icon` (icon component name or slot).

### TimelineItem
`period`, `current` (boolean → years in yellow), `title`, `body`, `isLast` (adds the bottom
border).

### TabSwitch
`options` (array of `{ value, label }`), `modelValue`. Emits `update:modelValue`.

### AvailabilityBadge
`label` (string), `color` (defaults to `#39D98A`). Wraps the fixed core and the pulsing ring.

### SpeechBubble
`text`. Presentation only.

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

Emits `close`. Locks body scroll while open. Contains `MediaCarousel` (props `slides`,
`label`; owns its own index state, wrapping around) and `SpecList` (props `role`, `year`,
`stack`, plus the translated labels).

### TestimonialCard
`quote`, `name`, `role`, `avatar`.

### MarqueeBar
`items` (array of strings), `separator` (defaults to `//`), `duration` (defaults to `26s`).
Duplicates the list internally so the loop is seamless.

---

## Chrome components (these carry behaviour)

### TheNavbar
Props: `sections` (array of `{ id, labelKey }`), `activeId` (string). No text props: labels
come from the dictionary. Emits `toggle-theme`, `toggle-lang`, `toggle-menu`. Owns the compact
scroll state and the natural-width measurement of the capsule.

### TheMobileMenu
Props: `open`, `sections`, `activeId`, `socials`. Emits `close`, `go-top`.

### TheFooter
Props: `place` (translated string), `timezone` (defaults to `Europe/Madrid`), `showTopButton`.
Emits `go-top`. Publishes its own height in `--footer-h` (observing its size) and controls its
scroll entrance.

### CursorFx
Props: `dotSize` (10), `ringSize` (40), `interactiveSelector` (the "hot" element selector).
No dependency on the rest of the app; mount it and forget it.

### LemonPet
Props: `bubbleText`, `offsetBottom` (24). Emits `poke`. Needs the footer height (or reads
`--footer-h`) to sit above it.

### BackgroundGrid
Props: `variant` (`'hero' | 'global'`), `size` (72), `visible` (boolean, for the crossfade).

### ScrollProgress
Props: `label` (defaults to "Scroll"), `progress` (0–1).

---

## Composables (shared logic, no interface)

| Composable | What it exposes |
|---|---|
| `useTheme()` | `theme`, `toggle()`; writes `data-theme` on `<html>` and persists |
| `useLang()` | `lang`, `toggle()`; persists in `localStorage["krub-lang"]` |
| `useScrollSpy(ids, threshold = 0.35)` | reactive `activeId` |
| `useScrollProgress()` | `progress` 0–1 and `atEnd` |
| `useMagnetic()` | registers the magnetic hover loop for `[data-magnetic]` |
| `usePointer()` | shared mouse position (used by the cursor, the lemon and the logo) |
| `useFooterHeight()` | measures the footer and maintains `--footer-h` |
| `useBodyScrollLock(active)` | locks scrolling while the modal is open |

One single `requestAnimationFrame` drives everything that follows the mouse (cursor, lemon
pupils, logo parallax, magnetic hover). No per-component loops.

---

## Data and translation files

```
src/
├─ data/               everything I wrote — both languages per file
│   ├─ index.js          re-exports, and the "start here" explanation
│   ├─ copy.js           hero headline, About paragraphs, marquee, contact line
│   ├─ projects.js
│   ├─ experience.js
│   ├─ education.js
│   ├─ stack.js
│   ├─ socials.js        + email + cvPath
│   ├─ testimonials.js
│   └─ config.js         on/off switches for the optional sections
├─ locales/            strings the interface needs, not prose
│   ├─ en.json
│   └─ es.json
└─ styles/
    └─ tokens.css        (:root + [data-theme="light"] + @keyframes + resets)
```

The split is deliberate and it is the rule to keep:

    sentences I wrote   ->   src/data/
    labels the UI needs ->   src/locales/

Content collections carry their own `en` / `es` objects rather than pointing at translation
keys, so adding a project or reworking a paragraph is one file, not three, and no dictionary
key can go stale. Components read the right half with
`computed(() => entry[lang.value])`.
