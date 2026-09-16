# Design specification

The visual contract for krub.dev. Every colour, size, easing curve and copy string here is
final and measured — none of it is an approximation. When something is not written down, it
gets measured against the reference prototypes rather than guessed.

---

## 1. Page structure

A single page, bilingual (English / Spanish), with a dark and a light theme, in this
vertical order:

| # | id | Name | Content |
|---|----|------|---------|
| — | `top` | Hero | Name, headline, paragraph, two CTAs, square stage holding the logo |
| — | — | Marquee | Yellow band with two looping phrases |
| 00 | `me` | About | Three paragraphs, experience/education tabs, CV button, photo |
| 01 | `projects` | Projects | Card grid; clicking a card opens a detail modal |
| 02 | `stack` | Stack | Four groups of technology icons |
| — | `testimonials` | Testimonials | Two quotes. **Optional section**, toggled by config |
| 03 | `contact` | Contact | Large headline, email CTA, three social icons |
| — | — | Footer | Pinned to the bottom: credit, copyright, TOP button, city and Madrid clock |

Floating above all of the above: the fixed navigation bar, the custom cursor, the vertical
scroll indicator, the "Limonacho" mascot (a lemon with eyes) and the mobile menu. The mascot and
the scroll indicator only appear where the route has a hero — not on the 404.

---

## 2. Design tokens

These live in one global stylesheet and are the only source of colour in the project.

### Dark theme (default, `:root`)

```css
--ink:       #0C0C0D;              /* page background */
--surface:   #141416;              /* card and panel background */
--surface-2: #1C1C1F;              /* icon tile and chip background */
--line:      rgba(255,255,255,.11);/* every border */
--fg:        #F2F0EA;              /* primary text */
--fg-2:      #A3A29D;              /* secondary text */
--fg-3:      #868580;              /* tertiary text, mono labels — raised for contrast */
--acc:       #FFC800;              /* brand yellow — FILLS only */
--acc-2:     #E6B400;              /* yellow on filled-button hover */
--acc-text:  #FFC800;              /* accent TEXT on --ink | --surface */
--acc-text-2:#E6B400;              /* hover of the above */
--on-acc:    #0C0C0D;              /* text on yellow */
--mark:      #FFC800;              /* logo and footer heart colour */
--grid:      rgba(255,255,255,.045);/* background grid lines */
--sec-idx:   .16;                  /* opacity of the giant section number */
```

### Light theme (`[data-theme="light"]` on `<html>`)

```css
--ink:       #F5F3EE;
--surface:   #FFFFFF;
--surface-2: #EDEAE2;
--line:      rgba(12,12,13,.13);
--fg:        #141416;
--fg-2:      #5A5955;
--fg-3:      #706F6B;   /* the spec's #8A8985 scored 3.16:1 — see decisions.md */
--acc:       #FFC800;   /* the fill yellow does NOT change between themes */
--acc-2:     #B98C00;
--acc-text:  #8A6A00;   /* accent text darkens: #FFC800 scores 1.40:1 here */
--acc-text-2:#6B5200;
--on-acc:    #0C0C0D;
--mark:      #8A6A00;   /* logo, heart and cursor ring follow the accent, denser here */
--grid:      rgba(12,12,13,.05);
--sec-idx:   .62;       /* the section number needs more opacity in light mode */
```

`--acc-text`, `--mark` and `--sec-idx` all exist for the same reason: `#FFC800` does not have
enough contrast on the light background. Three different answers, because there are three
different jobs:

| Token | Job | Light-theme behaviour |
|---|---|---|
| `--acc` | **Fills** — a yellow surface with `--on-acc` text on it | stays `#FFC800` |
| `--acc-text` | **Accent text** sitting on `--ink` or `--surface` | darkens to `#8A6A00` |
| `--mark` | The logo, footer heart and cursor ring — graphic, not text | takes `--acc-text`'s dense value |

With an accent palette chosen, both `--acc-text` and `--mark` take that palette's light-theme
value instead of the yellow's (see Accent palettes below).

Contrast against `--ink`, measured:

| | dark | light |
|---|---|---|
| `#FFC800` as text | 12.58:1 ✅ | **1.40:1 ❌** |
| `--acc-text` | 12.58:1 ✅ | 4.57:1 ✅ AA at any size |

So: a yellow button keeps `--acc`. The accent word in the hero headline, the active navbar
link, the current-period years in the timeline, the `[0N]` indices and the project type labels
all use `var(--acc-text)` — they are text, and several of them are 10–12px, where the 3:1
large-text allowance does not apply. The giant section number keeps `--acc`, since it is
decorative, `aria-hidden` and already governed by `--sec-idx`.

### Accent palettes

`data-accent` on `<html>` chooses which colour paints the accent, independently of the theme.
The default is the brand yellow, which is what the tokens above already hold; the others live in
the same stylesheet. A palette swaps the accent tokens and nothing else:

| Token | Job |
|---|---|
| `--acc` | the fill, with `--on-acc` on top |
| `--acc-2` | the fill on hover |
| `--acc-text` | the accent as text on the page background |
| `--acc-text-2` | that, on hover |
| `--on-acc` | the text painted on the fill |
| `--mark` | the logo, footer heart and cursor ring |

Each palette's identity colour is a `--pal-*` token declared once — the palette points `--acc` at
it — so the hex exists in one place.

The four non-default palettes — aqua `#C3FFFC`, rose `#FB7185`, mint `#9AFFC9`, violet `#D8C7FF` —
are pastels made for a dark background: as text they read straight away (aqua 17.7:1, mint 16.3:1
on `--ink`). On the light theme those pastels are nearly invisible **as fills** (`#C3FFFC` is
1.00:1 on the cream page), so each has a more saturated light-theme counterpart for `--acc`, and
every palette's accent text darkens in light exactly as the yellow's does. See decisions.md.

### Typography

- **Space Grotesk** — weights 400, 500, 600, 700. Body text, headlines, buttons.
- **JetBrains Mono** — weights 400, 500, 700. UI labels, section numbers, paths
  (`/projects`), technical data, footer, clock.

Every `clamp` below is a literal from the design. They do not get rounded.

| Use | Value |
|---|---|
| Hero headline | `clamp(38px, 6.4vw, 82px)`, weight 700, `letter-spacing:-.04em`, `line-height:.98` |
| Contact headline | `clamp(26px, 4vw, 52px)`, weight 700, `letter-spacing:-.03em`, `line-height:1.06` |
| Section title (`/about`) | mono, `clamp(22px, 2.6vw, 30px)`, weight 500 |
| Giant section number | mono, `clamp(48px, 6vw, 74px)`, weight 700, `letter-spacing:-.05em` |
| Lead paragraph | `clamp(18px, 2vw, 24px)`, `line-height:1.5` |
| Body paragraph | 17px, `line-height:1.65`, colour `--fg-2` |
| Card body | 15px, `line-height:1.55` |
| Card title | 19px, weight 600 |
| Small mono label | 10–11px, `letter-spacing:.12em`, uppercase, colour `--fg-3` |

Reading widths: paragraphs carry a `max-width` in `ch` (46ch in the hero, 52ch and 58ch in
about, 60ch in the timeline, 22ch in the contact headline) and `text-wrap: pretty`
(`balance` on the contact headline).

### Spacing, borders, shadows

- Scale: 4 · 8 · 12 · 20 · 32 · 56 · 96 · 144.
- Maximum content width: **1180px**, centred.
- Section padding: `clamp(56px,8vw,110px)` vertical, `clamp(20px,5vw,64px)` horizontal.
- Section inner spacing: `gap: 34px`. Card padding: 24–26px.
- Radii: **8px** chips and labels · **10–12px** icon tiles and square buttons · **14px**
  lemon speech bubble · **18px** cards and images · **20–22px** panels and modal · **999px**
  pill buttons.
- Borders: always `1px solid var(--line)`. No coloured shadows anywhere.
- Shadows (two in the whole site — the compact navbar's was removed, see decisions.md): lemon
  bubble `0 14px 34px rgba(0,0,0,.32)`, mobile menu `0 24px 60px rgba(0,0,0,.45)`.
- Background grid: a 72×72px pattern with 1px lines in `var(--grid)`.

### Motion

| What | Duration and curve |
|---|---|
| Colour and border hover | `.16s ease` |
| Footer TOP button | `.18s ease` |
| Navbar capsule (width, padding, gap) | `.55s cubic-bezier(.22,1,.36,1)` |
| Navbar background/border | `.45s ease` |
| Footer entrance | `.4s cubic-bezier(.4,0,.2,1)` |
| Lemon entrance | `.55s cubic-bezier(.22,1,.36,1)` |
| Grid crossfade | `.35s ease` |
| Cursor ring | opacity `.22s ease`, scale `.28s cubic-bezier(.22,1,.36,1)` |

Required `@keyframes`: `marquee`, `lemonShake`, `dotHalo`, `bubbleIn`.

```css
@keyframes marquee   { from{transform:translateX(0)} to{transform:translateX(-50%)} }
@keyframes dotHalo   { 0%{opacity:0;transform:scale(.34)} 18%{opacity:.6} 100%{opacity:0;transform:scale(1)} }
@keyframes bubbleIn  { from{opacity:0;transform:translateY(6px) scale(.94)} to{opacity:1;transform:translateY(0) scale(1)} }
@keyframes lemonShake{ 0%,100%{transform:translate(0,0) rotate(0)}
                       15%{transform:translate(-3px,1px) rotate(-7deg)}
                       30%{transform:translate(3px,-1px) rotate(7deg)}
                       45%{transform:translate(-3px,0) rotate(-5deg)}
                       60%{transform:translate(2px,1px) rotate(4deg)}
                       80%{transform:translate(-1px,0) rotate(-2deg)} }
```

---

## 3. Screens and components in detail

### 3.1 Navigation bar (fixed, `z-index:100`)

A `position:fixed` container at the top, `padding:14px clamp(14px,4vw,40px)`, centred.
Inside it a **capsule** with `max-width:1180px`, `padding:12px 16px`, transparent border,
transparent background and `border-radius:16px`.

Contents, left to right: logo (the logo image applied as a mask over
`background: var(--mark)`, height 22px, `aspect-ratio:1.682`) + the text `.dev` (mono 15px,
weight 500) · 1px vertical separator · links `/about` `/projects` `/stack` `/contact`
(mono 13px, `gap:24px`) · separator · the appearance control, dark / light / accent (3.18) ·
language button (36px tall, `padding:0 12px`) · CTA "Let's talk ↗" (background `--acc`, radius 10,
14px, weight 600).

**Compact state** — triggered at `scrollY > 60`:

- `padding` becomes `8px 12px`; the logo height becomes 18px.
- `max-width` becomes the **natural width of the content** (measured once on mount and on
  every resize: the compact state is cloned with `width:auto` and the resulting width is
  read), so the capsule shrinks around its own elements.
- Background `color-mix(in srgb, var(--surface) 84%, transparent)`,
  `backdrop-filter: blur(14px)`, border `var(--line)`. No shadow — the compact capsule's was
  removed, and the border is what separates it (see decisions.md).
- The two vertical separators go from `opacity:0` to `1`.

**Active section (scroll spy).** Walk `["top","me","projects","stack","contact"]` and treat
as active the last one whose top edge is at `<= 35%` of the viewport height. That link is
painted `var(--acc-text)`; the rest, `--fg-2`. Note: the inactive colour has to be set
explicitly rather than cleared, because the global link rule is yellow.

Below 900px the desktop navigation and controls hide, and a menu button appears (36×36,
background `--acc`) next to the appearance control and the language button.

### 3.2 Hero

A wrapper with `height: 100svh` (minimum 640px) in a column: the hero section grows and the
marquee sits flush at the bottom. At `max-width:900px` **or** `max-height:700px` the wrapper
switches to auto height — width is the honest trigger, because below 900px the hero is one
column and needs the room.

Two-column grid `1.1fr .9fr`, `gap: clamp(32px,5vw,64px)`, vertically centred,
`max-width:1180px`. One column on mobile.

Left column: top mono label, a three-line headline with the key word in `--acc`, a paragraph
(`--fg-2`, 46ch) and two buttons — primary "Let's talk ↗" (background `--acc`, radius 999,
`padding:11px 24px`, 18px, weight 600, hover to `--acc-2`) and secondary "/projects" (border
`--line`, radius 999, `padding:14px 26px`, mono 15px, hover turns border and text yellow).

Right column, the **square stage**: `aspect-ratio:1/1`, `max-height:min(58vh,520px)`,
`max-width:520px`, border `--line`, radius 24, a `radial-gradient` from `--surface` to `--ink`,
and a **40px** inner grid — not the page's 72px, which reads as noise inside a 520px box. The
whole stage is magnetic; only the logo inside it tilts. Inside:

- The logo at 58% of the width, as a mask over `var(--mark)`, with **3D parallax**: it
  follows the mouse with `perspective(700px) rotateY(±14deg) rotateX(∓10deg)`, proportional
  to the cursor's distance from the centre of the stage.
- **Availability indicator**, top left (`top:14px; left:22px`): a mono row of 10px uppercase,
  `letter-spacing:.14em`, colour `--fg-3`, `gap:7px`, preceded by a dot. The dot is two
  layers inside a 5×5px container:
  - core: a solid `#39D98A` circle filling the container, **not animated**;
  - ring: `inset:-5px`, `border:1px solid #39D98A`, `border-radius:50%`, animation
    `dotHalo 2.6s cubic-bezier(.15,.6,.3,1) infinite` — born small, appears, grows and fades
    out completely before restarting.
  - Text: "Available for work" / "Disponible para trabajar".

The stage is a reserved slot for a future 3D scene: it carries **no label and no explanatory
text**.

### 3.3 Marquee

A full-bleed band, background `--acc`, text `--on-acc`, `padding:13px 0`, top and bottom
borders in the same yellow. Mono text 13px, weight 700, `letter-spacing:.22em`, uppercase.
Two identical blocks in a row (`gap:38px`, `padding-right:38px`) animated with
`marquee 26s linear infinite`, which translates `-50%`: the loop is seamless because the
content is duplicated. Phrases: "Fullstack developer → backend" and "From Murcia, based in
Barcelona · Spain", separated by `//`.

### 3.4 Section heading (reusable pattern)

A `position:relative` container with the giant number behind it (`[00]`…`[03]`, mono, weight
700, `color: var(--acc)`, `opacity: var(--sec-idx)`, `position:absolute`, `left:-8px`,
`bottom:-.14em`, `pointer-events:none`, `z-index:0`, `white-space:nowrap`) and the `<h2>` in
front (`z-index:1`). The overlap is deliberate: the number is decorative and reads behind the
title.

In projects the `<h2>` also carries the project count as a superscript (`font-size:.4em`,
weight 700, yellow, `vertical-align:super`).

### 3.5 About

Grid `1.3fr .7fr` (one column on mobile). Left: lead paragraph + two secondary paragraphs +
**tabs** `/experience` and `/education` (mono 12px; active: background `--acc`, text
`--on-acc`, border `--acc`; inactive: transparent, text `--fg-2`, border `--line`) + the
matching timeline + a "Download CV (PDF)" button (outlined pill).

Each timeline row: `display:grid`, columns `minmax(90px,130px) 1fr`,
`gap: clamp(14px,3vw,32px)`, `padding:22px 0`, `border-top:1px solid var(--line)` (the last
one also gets `border-bottom`). Left column: the year range in mono 12px — yellow if it is the
current period, `--fg-3` if it is past. Right: title 18px weight 600 + description 15px
`--fg-2` at 60ch. On mobile it collapses to one column with `gap:8px`.

Right: photo `aspect-ratio:1/1`, `object-fit:cover`, radius 18, border `--line`, filter
`grayscale(1) contrast(1.05)`. **No caption.** On mobile it is capped at 210px wide with
`aspect-ratio:4/5`.

### 3.6 Projects

`display:grid; grid-template-columns: repeat(auto-fit, minmax(280px,1fr)); gap:20px`. The
grid distributes itself according to how many projects there are: **no filler cards, no
reserved gaps**, and no "click to open" hint (the card design says it already).

Card (a clickable `<article>`, `cursor:pointer`): border `--line`, radius 18, background
`--surface`, `overflow:hidden`, column. Hover: border `--acc-text`
(`transition: border-color .16s ease`).

1. Screenshot frame: `aspect-ratio:16/10`, diagonal stripe background
   `repeating-linear-gradient(135deg, var(--surface-2) 0 12px, var(--ink) 12px 24px)`, with a
   centred 10px mono label. It is a placeholder: swap it for the real image once there is one.
2. Body (`padding:24px`, `gap:11px`): a row with the 19px/600 title and the type label in
   yellow 10px mono; 15px `--fg-2` summary.
3. Footer, pinned to the bottom (`margin-top:auto`, `padding-top:16px`, `border-top`): the
   first three technologies joined by `·` in mono 11px `--fg-3`, and on the right a 30px
   circular button with a `--line` border and the **`↗`** arrow (diagonal, not horizontal);
   on hover it fills yellow with the arrow in `--on-acc`.

### 3.7 Project detail modal

Opens on card click. Backdrop `color-mix(in srgb, var(--ink) 82%, transparent)` with
`backdrop-filter: blur(10px)`, `z-index:250`, vertical scroll,
`padding: clamp(12px,4vw,48px)`. Closes on backdrop click (only when the click is on the
backdrop itself), on the ✕ button, and on the Escape key. While open,
`body { overflow: hidden }` and focus is trapped inside the panel. The backdrop carries
`data-hide-cursor`, so the custom cursor replaces the native one inside the dialog as it does
everywhere else — without it the browser's own cursor shows there, since the teleport puts the
dialog outside `.app`.

Panel: `width: min(1000px,100%)`, `max-height: calc(100svh - clamp(24px,8vw,96px))`,
radius 22, background `--surface`, border `--line`.

- Header (`padding:18px 22px`, bottom border): the `[0N]` index in yellow mono 11px, the path
  `/projects/<slug>` in mono 13px `--fg-2`, and a 38×38 radius-10 ✕ button.
- Carousel: `aspect-ratio:16/9`, `max-height:40svh`, the same diagonal stripes, label
  "IMAGE n / total · SLUG"; ← → arrows at 44×44 radius 12 with background
  `color-mix(in srgb, var(--ink) 70%, transparent)`; 7px dots centred at the bottom (active
  yellow, the rest `--line`). Indices wrap around (modulo).
- Body: grid `1.4fr .6fr` (one column on mobile), `padding: clamp(22px,4vw,40px)`. Left: name
  `clamp(26px,3.4vw,40px)` weight 700, lead 18px, two 16px `--fg-2` paragraphs, and two
  buttons (repository outlined, demo in yellow). Right: a mono definition list with Role, Year
  and Stack; each block with a `border-top` and the stack as 11px chips, radius 8, border
  `--line`.

### 3.8 Stack

`grid; repeat(auto-fit, minmax(240px,1fr)); gap:32px`. Four groups: Languages, Backend,
Frontend, Tools & workflow. Each group: an uppercase mono 11px `--fg-3` label with a
`border-bottom` and `padding-bottom:10px`, and the icons below in `flex-wrap` with `gap:10px`.

Icon tile: 44×44, radius 10, background `--surface-2`, border `--line`, `padding:8px`,
`box-sizing:border-box`. The dark monochrome icons (Express, Prisma, Three.js, GitHub, Linux)
render at 28×28 inside a flex tile and are inverted **in dark theme only** with
`filter: invert(1) hue-rotate(180deg)`; no filter in light. Every icon carries `alt` and
`title` with the technology name.

This section has **no footnote**.

### 3.9 Testimonials (optional)

Shown or hidden by config. Two cards: border `--line`, radius 18, background `--surface`,
`padding:26px`, `gap:18px`. Quote 17px `line-height:1.55` in `--fg`; footer with a 36px avatar
circle (placeholder), 14px/600 name and the company in mono 11px `--fg-3`. The current content
is filler: replace it with real quotes or leave the section off. **No "optional section" note**
in the interface.

### 3.10 Contact

A large headline (`clamp(26px,4vw,52px)`, 22ch, `text-wrap:balance`), and a row with the main
CTA "Let's talk ↗" (yellow, radius 999, `padding:12px 26px`, 19px, weight 600) and three 46×46
social icons, radius 12, border `--line`, 17–19px icon in `--fg-2`; hover turns border and
colour yellow, active fills yellow. On mobile the row becomes a column and the section takes
`padding-bottom:34px` so it does not collide with the fixed footer.

Links: `mailto:krubioillan@gmail.com`, `github.com/krub-dev`, `linkedin.com/in/krub`,
`x.com/krub_dev`.

### 3.11 Footer (fixed)

`position:fixed; bottom:0; z-index:95`, background `--ink`,
`border-top:1px solid var(--line)`, `padding: 9px clamp(20px,5vw,64px)`, three blocks in
`space-between`:

1. `DESIGNED & BUILT WITH ♥ BY` + logo (mono 10px, `letter-spacing:.12em`, `--fg-3`; the heart
   is an 11px SVG filled with **`var(--mark)`** so it turns black in light theme) · `·`
   separator · `©2026 KRUB.DEV`.
2. A "TOP" button with an up arrow (30px-tall pill, mono 10px, `letter-spacing:.16em`), filled
   with `--acc` and `--on-acc` on top so it does not disappear into the footer's own background.
   Hidden on mobile.
3. `BARCELONA, SPAIN · hh:mm:ss CET (UTC+1)` — a live clock, `Europe/Madrid`, updated every
   second; the label alternates between `CET (UTC+1)` and `CEST (UTC+2)` with daylight saving.

**Key behaviour.** The footer slides in: it starts at `translateY(102%)` and moves to
`translateY(0)` once the bottom of the hero wrapper has passed the top of the viewport — the
same moment as Limonacho, owned by `usePastHero` (decisions.md). The marquee is the line the
visitor reads as "the page has started", which is why the trigger is the wrapper and not a
fraction of the viewport. Its real height is measured on mount, on resize and on language
change, and written to the CSS variable `--footer-h`; the root container reserves that space
with `padding-bottom: var(--footer-h)`. Below 900px it is centred with the TOP button hidden,
using `var(--gutter-l)` / `var(--gutter-r)` and the bottom safe-area inset where one exists.

### 3.12 Background grids

Two layers, always `pointer-events:none`, `z-index:0`, 72px pattern:

- **Hero layer**: `position:absolute`, `height:100svh`, no fade, visible on load.
- **Global layer**: `position:fixed`, from the top down to `var(--footer-h)`, with a
  `linear-gradient(#000 0%, #000 15%, transparent 65%)` mask fading it downwards.

When the top edge of the "about" section reaches 60% of the viewport, a `.35s` crossfade runs:
the hero layer drops to 0 and the global one rises to 1.

### 3.13 Custom cursor

Pointer devices only (`@media (hover:hover)`) and above 900px. The native cursor is hidden
**along with the pointer hand on clickable elements**, via
`[root], [root] * { cursor: none !important }` — it has to reach descendants because links and
buttons bring their own `cursor:pointer`.

Two `position:fixed` elements follow the mouse through `transform: translate3d(x, y, 0)`
updated every frame with `requestAnimationFrame`:

1. **Dot** — 10×10px, `margin:-5px 0 0 -5px`, filled `var(--acc)`, radius 50%, `z-index:301`.
   It never changes size.
2. **Ring** — 40×40px, `margin:-20px 0 0 -20px`, `border:1.5px solid var(--mark)`, no fill,
   `z-index:300`. At rest `opacity:0` and `scale(.55)`; over an interactive element it goes to
   `opacity:1` and `scale(1)`.

"Interactive element" resolves through `document.elementFromPoint(x, y)` and
`closest('a,button,[role="button"],input,select,textarea,[data-magnetic]')`.

### 3.14 Magnetic hover

Any element marked as magnetic drifts slightly towards the cursor. Every frame, for all
visible marked elements, compute `reach = max(width,height)*0.75 + 70` and
`score = distance / reach`; **only the lowest score below 1** gets pushed, with
`pull = (1-score)^2 * 10` (10px maximum). The offset is interpolated with a `0.07` factor per
frame, inside a 12px dead zone around the resting centre, and resets to zero on release, so it
never jumps. The pull and the easing are softer than the spec's original 16px and 0.14, which
read as too eager; see decisions.md. On mobile the TOP button is excluded.

Magnetic elements: hero CTAs, hero stage, CV button, project cards, modal links, contact CTA
and icons, and the TOP button.

### 3.15 Scroll indicator

The word "Scroll" set vertically (mono 10px, `letter-spacing:.28em`, `--fg-3`) above a 1px line
96px tall in `--line`, filled with the accent in proportion to the scroll. It is `position:fixed`
on the right (`right:20px`, vertically centred, `z-index:95`), fades out at 98% of the page,
hides below 900px, and is only rendered on a route with a hero — on the 404 there is nothing to
scroll.

### 3.16 Limonacho (mascot)

Optional by config, and only rendered on a route with a hero. Fixed container `right:24px`,
`bottom: calc(24px + var(--footer-h))`, `z-index:120` — the vertical offset is layout so it
tracks the footer in the same frame, and it is not part of the transform (decisions.md). It
enters **in a straight line from the right** at the same time as the footer: from
`translateX(160%)` to `translateX(0)` with `.55s cubic-bezier(.22,1,.36,1)`; no tilt.

The lemon is drawn in CSS: a 58×48px body with
`border-radius: 50% 50% 48% 48% / 58% 58% 42% 42%` and a **flat `var(--acc)` fill, no
gradient**; an 11×12px nub centred on top; a 21×12px leaf in `#3EA34B` outlined `#2C7A36`,
rotated `-24deg`; four texture dots in a darkened yellow at opacities between .35 and .55; and
two 16px white eyes with 7px `#0C0C0D` pupils that **follow the cursor**, shifting 4px in its
direction.

On click: a `lemonShake .5s ease` shake and a speech bubble above it (max 230px, radius 14,
background `--surface`, `bubbleIn .28s`) reading "Welcome! I'm Limonacho" / "¡Bienvenido! Soy
Limonacho", which hides itself after 4 seconds.

### 3.17 Mobile menu

A panel below the menu button (`top:74px; right:16px`, `z-index:150`),
`width: min(300px, calc(100vw - 40px))`, radius 20, background `--surface`, `padding:16px`,
`gap:12px`, shadow `0 24px 60px rgba(0,0,0,.45)`. It holds: a header with "Menu" + a mono
subtitle and a "DIR" label; a 2×2 grid with Github, LinkedIn, X and "Let's talk ↗" (this last
one in yellow); a list of four navigation links, each with its `[00]`…`[03]` mono index (the
active section's in yellow) and its path; and a full-width "↑ back to top" button. Every link
closes the menu when pressed.

### 3.18 Appearance control (theme + accent)

One control in the navbar, in both the desktop and the mobile group, where the old dark/light
button was. A 36px-tall rounded box (radius 10, 1px `--line`) with two segments and a 1px divider:

- **◐** is the theme toggle it always was: one click alternates dark and light.
- **The accent disc** — 16px, split diagonally between `--acc` and `--acc-2`, so the current
  colour and its variation share one face — advances one palette per click, wrapping at the end.
  The `aria-label` and `title` name the current palette ("Accent colour: Aqua").

It is a global setting and stays on every route, the 404 included. The language button beside it
is a separate control and is unchanged.

---

## 4. Application state

| State | Values | Where it lives | Notes |
|---|---|---|---|
| Theme | `dark` \| `light` | `data-theme` attribute on `<html>` | absent = dark |
| Language | `en` \| `es` | global + `localStorage["krub-lang"]` | restored on load; sets `<html lang>` |
| Accent | a palette id | `data-accent` attribute on `<html>` | absent = yellow |
| About tab | `exp` \| `edu` | local to the section | defaults to `exp` |
| Open project | index \| `null` | global or local to projects | `null` = modal closed |
| Carousel image | integer | local to the modal | resets to 0 on open |
| Mobile menu | boolean | global | |
| Lemon bubble | boolean | local to the lemon | turns itself off after 4s |
| Show testimonials | boolean | config | |
| Show lemon | boolean | config | only on a route with a hero |
| Show CV | boolean | config | currently off — no file yet |

Derived effects: while the modal is open, `body { overflow:hidden }`; on a language change the
footer and the navbar capsule must be re-measured, because the text changes width.

Global listeners to register on mount and **remove on unmount**: `scroll` (passive), `resize`,
`mousemove` (passive), the `requestAnimationFrame` loop and the clock interval.

---

## 5. Content and data

None of this belongs inside a template, and there are two homes for it (decision 12):

- **Prose** — everything I wrote — lives in `src/data/`, both languages side by side in the
  entry.
- **Interface strings** — nav paths, button labels, aria-labels — live in `src/locales/en.json`
  and `es.json`, nested rather than flat, so `t('hero.badge')` resolves as a path.

- **Copy** (`copy.js`): `hero`, `about`, `marquee`, `contact`, `lemon`, `notFound`.
- **Projects** (`projects.js`): each entry has `slug`, `shotLabel`, `image`, `slides` (image
  count), `repo`, `live`, `stack`, and an `en` / `es` object with `name`, `tag`, `role`, `year`,
  `repoLabel`, `liveLabel`, `summary`, `lead`, `body`, `body2`. Three today:
  `creandomientras`, `showroom`, `sideforge`.
- **Timelines** (`experience.js`, `education.js`): two and four entries. Each has `from`, `to`
  (`null` for "still going"), a `current` flag that paints the years in `--acc-text`, and an
  `en` / `es` object with `title` and `body`.
- **Stack** (`stack.js`): four groups with a name and a list of technologies; each technology
  with a name, an icon file and whether it needs inverting in dark theme.
- **Socials** (`socials.js`): name, URL and icon, plus `email`, `cvPath` and `photoPath`.
- **Testimonials** (`testimonials.js`): quote, name, role, avatar. Placeholders; the section is
  off by default.

---

## 6. Assets

- `public/assets/img/krub-mark.png` — the logo. Used **as a CSS mask** (`-webkit-mask` /
  `mask`, `center/contain no-repeat`) over a `var(--mark)` background, so it follows the theme.
  Aspect ratio **1.682**.
- `public/assets/img/krub-pfp.jpeg` — profile photo.
- `public/icons/<technology>/<file>.svg` — technology icons (Devicon).
- `public/uploads/cv-es.pdf` — the CV linked from About. Not shipped yet: `config.showCv` is off
  until the ATS-friendly rewrite exists, so the file is absent and the button is hidden.
- `public/fonts/<family>-latin.woff2` — the two self-hosted variable fonts, with their OFL
  licences beside them.

Fonts, self-hosted rather than loaded from Google: Space Grotesk (variable, 300–700) and
JetBrains Mono (variable, 100–800), latin subset only. See decisions.md.

---

## 7. Accessibility and details not to lose

- `scroll-behavior: smooth` on `html`, and `scroll-margin-top: var(--navbar-h, 96px)` on
  sections with an `id` so the fixed navbar does not cover headings on jump. The navbar measures
  itself; 96px is the fallback for the frames before it mounts.
- Under `prefers-reduced-motion: reduce`, scrolling falls back to `auto`. This extends to the
  decorative animations too (dot halo, marquee, lemon).
- Every decorative element carries `aria-hidden="true"`: grids, cursor, dot, marquee, lemon
  texture dots, separators.
- Text-free buttons (theme, language, menu, close, carousel arrows) carry an `aria-label`.
- Touch targets: 44px or more on mobile (carousel arrows 44px, social icons 46px, navbar
  buttons 36px with spacing).
- External links get `target="_blank"` and `rel="noopener"`.

---

## 8. Responsive

A single breakpoint: **900px**. Below it: one column in every two-column grid, navigation
replaced by the menu, the custom cursor and scroll indicator disabled, the hero stage dropped
(the badge moves into the text column), the footer centred with the TOP button hidden, a smaller
4/5 photo, and the lemon at `right:18px` and `bottom: calc(16px + var(--footer-h))`.

---

## 9. Settled decisions

These are deliberate. They are not rough edges to be tidied up later:

- The yellow `#FFC800` is identical in both themes **as a fill**; what changes is whatever is
  painted with `--mark` or `--acc-text`.
- The giant section number **overlaps** the title on purpose.
- The square hero stage is empty on purpose: it is the slot for a future 3D scene. No
  explanatory text goes inside it.
- There are no filler cards in projects and no user hints ("click to open", "optional
  section", photo captions). They were removed deliberately.
- The lemon enters in a straight line from the right, with no tilt, and its body is flat
  yellow with no gradient.
- The project card arrow is `↗` (diagonal), not `→`.
- The availability dot does not blink: the core is fixed and the outer ring is what pulses.
- The footer reads `DESIGNED & BUILT WITH ♥ BY [logo]`.
