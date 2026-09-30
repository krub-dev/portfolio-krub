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
| 01 | `projects` | Projects | Horizontal rail of cards; clicking one opens a detail modal |
| 02 | `stack` | Stack | Four groups of technology icons, two per row |
| — | `testimonials` | Testimonials | One quote at a time, in a vertical pager. **Optional section**, toggled by config |
| 03 | `contact` | Contact | Large headline, email CTA, three social icons |
| — | — | Footer | Pinned to the bottom: credit, copyright, TOP button, city and Madrid clock |

Floating above all of the above: the fixed navigation bar, the custom cursor, the vertical
scroll indicator, the "Limonacho" mascot (a lemon with eyes) and the mobile menu. The mascot and
the scroll indicator only appear where the route has a hero — not on the 404 or `/privacy`.

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

/* Element colours — a specific surface rather than a theme colour, so they are
   the same in both themes where noted. */
--acc-solid: #FFC800;              /* accent at full saturation — Limonacho and the cursor */
--specular:  rgba(255,255,255,.16);/* a metal highlight: light, same in both themes */
--cast:      rgba(0,0,0,.85);      /* a shadow: darkness, same in both themes */
--metal:     #2A2A2A;              /* the hero's brushed metal, frame and blind */
--metal-dark:#1A1A1A;
--fog-end:   #0C0C0D;              /* what the tunnel fades to */
--stage-bg:  #0C0C0D;              /* the stage's flat background */
```

### Light theme (`[data-theme="light"]` on `<html>`)

```css
--ink:       #F2F3F2;
--surface:   #FFFFFF;
--surface-2: #E9E9E7;
--line:      rgba(12,12,13,.13);
--fg:        #141416;
--fg-2:      #5A5955;
--fg-3:      #706F6B;   /* the spec's #8A8985 scored 3.16:1 — see decisions.md */
--acc:       #FFC800;   /* the fill yellow does NOT change between themes */
--acc-2:     #B98C00;
--acc-text:  #8A6A00;   /* accent text darkens: #FFC800 scores 1.40:1 here */
--acc-text-2:#6B5200;
--on-acc:    #0C0C0D;
--mark:      #8A6A00;   /* logo and footer heart follow the accent, denser here */
--grid:      rgba(12,12,13,.05);
--sec-idx:   .62;       /* the section number needs more opacity in light mode */
--metal:     #A8A8A8;   /* the metal is lighter here, not inverted */
--metal-dark:#686868;
--fog-end:   #6A6A6A;   /* the tunnel fades to a mid grey, not the white page */
--stage-bg:  #B8B8B8;
```

`--acc-text`, `--mark` and `--sec-idx` all exist for the same reason: `#FFC800` does not have
enough contrast on the light background. Three different answers, because there are three
different jobs:

| Token | Job | Light-theme behaviour |
|---|---|---|
| `--acc` | **Fills** — a yellow surface with `--on-acc` text on it | stays `#FFC800` |
| `--acc-text` | **Accent text** sitting on `--ink` or `--surface` | darkens to `#8A6A00` |
| `--mark` | The logo and footer heart — graphic, not text | takes `--acc-text`'s dense value |

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
| `--mark` | the logo and footer heart |
| `--acc-solid` | the accent at full saturation, the same in both themes — Limonacho and the cursor |

The four non-default palettes — aqua, rose, mint, violet — swap exactly these tokens. Violet is
the exception among them: its dark value is the solid `#8B5CF6`, not a pastel, because the pastel
read washed out, so light and dark share the fill and only the text and `--mark` change in light.

The four non-default palettes — aqua `#C3FFFC`, rose `#FB7185`, mint `#9AFFC9`, violet `#D8C7FF` —
are pastels made for a dark background: as text they read straight away (aqua 17.7:1, mint 16.3:1
on `--ink`). On the light theme those pastels are nearly invisible **as fills** (`#C3FFFC` is
1.00:1 on the light page), so each has a more saturated light-theme counterpart for `--acc`, and
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
- Shadow (one in the whole site — the compact navbar's and the lemon bubble's were removed, see
  decisions.md): mobile menu `0 24px 60px rgba(0,0,0,.45)`.
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
| Cursor hint (trailing the ring) | `.32s cubic-bezier(.22,1,.36,1)` |

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

A `position:fixed` container at the top, `padding:14px clamp(14px,4vw,40px)`, centred, and
`pointer-events:none` with `pointer-events:auto` on the capsule inside it. The strip is full width but
only the capsule is a control: without that, the empty half of the bar swallowed every click that
landed in its band, which is anything scrolling up behind the compact capsule — the project dots,
the appearance controls, any button. Inside it a **capsule** with `max-width:1180px`,
`padding:12px 16px`, transparent border, transparent background and `border-radius:16px`.

Contents, left to right: logo (the logo image applied as a mask over
`background: var(--mark)`, height 22px, `aspect-ratio:1.682`) + the text `.dev` (mono 15px,
weight 500) · 1px vertical separator · links `/about` `/projects` `/stack` `/contact`
(mono 13px, `gap:24px`) · separator · the appearance control, dark / light / accent (3.18) ·
language button (36px tall, `padding:0 12px`) · CTA "Let's talk ↗" (background `--acc`, radius 10,
14px, weight 600).

**Compact state** — triggered at `scrollY > 60`:

- `padding` becomes `8px 12px`; the logo height becomes 18px.
- `max-width` becomes the **natural width of the content** (measured on mount, on every resize
  and on a language change: the compact layout is applied for one frame with `width:auto` and the
  resulting width is read), so the capsule shrinks around its own elements. A second number is
  measured too — the capsule's full width, the viewport minus the gutters capped at 1180 — because
  on a narrow screen `width:100%` sits below 1180 and the return to the top would otherwise jump
  instead of animating.
- Background `color-mix(in srgb, var(--surface) 84%, transparent)`,
  `backdrop-filter: blur(14px)`, border `var(--line)`. No shadow — the compact capsule's was
  removed, and the border is what separates it (see decisions.md).
- The two vertical separators go from `opacity:0` to `1`.
- The controls are handed over. On desktop the appearance and language controls give way to a
  single settings button (3.19) beside the CTA; below 900px the bar keeps only the brand and the
  menu button, and the menu panel (3.17) carries the controls from then on. At the top nothing is
  hidden, so the bar is never just a logo.

**Active section (scroll spy).** Walk `["top","me","projects","stack","contact"]` and treat
as active the last one whose top edge is at `<= 35%` of the viewport height. That link is
painted `var(--acc-text)`; the rest, `--fg-2`. Note: the inactive colour has to be set
explicitly rather than cleared, because the global link rule is yellow.

Below 900px the desktop navigation and controls hide, and the capsule holds the brand, the
appearance and language controls, and a menu button (36×36, background `--acc`). The menu button
shows four dots, and when the menu opens they spread apart — each moves out along both axes,
leaving a gap in the middle — instead of switching to a cross. The move is `transform 0.3s
cubic-bezier(.34,1.56,.64,1)` with a 20ms stagger between dots, clockwise from the top left, so the
group ripples open. Those controls
stay in the bar until it compacts, and from then on the menu panel (3.17) carries them, so the
compact capsule is only the brand and the menu button.

### 3.2 Hero

A wrapper with `height: 100svh` (minimum 640px) in a column: the hero section grows and the
marquee sits flush at the bottom. At `max-width:900px` **or** `max-height:700px` the wrapper
switches to auto height — width is the honest trigger, because below 900px the hero is one
column and needs the room.

Two-column grid `1.1fr .9fr`, `gap: clamp(32px,5vw,64px)`, vertically centred,
`max-width:1180px`. One column on mobile.

Left column: the name, a three-line headline with the key word
in `--acc`, a paragraph (`--fg-2`, 46ch) and two buttons — primary "Let's talk ↗" (background
`--acc`, radius 999, `padding:11px 24px`, 18px, weight 600, hover to `--acc-2`) and secondary
"/projects" (border `--line`, radius 999, `padding:14px 26px`, mono 15px, hover turns border and
text yellow).

Right column, the **square stage**: a square of whole 72px cells of the page's background grid —
seven by seven (504×504) at the usual viewport, its four edges on the grid lines and nudged to the
next cell right of its natural position (or kept a cell back when that would run off the screen).
It is measured and snapped by `LogoStage`, since it depends on the viewport (decision 79). Border
`--line`, a flat `--ink` fill — only seen while the scene builds or if it fails — a slim brushed-metal
frame over the canvas, whose sheen carries round its corners, and inside it a CSS entrance glow — hard
on the frame's inner edge, fading inward (decision 81). A vignette that faded the grid into the metal
was tried and dropped (decision 84), and the opening starts closed behind a CSS roller blind that a
click lifts and a click on the coil lowers again (decision 86).
Only the logo inside the stage turns. Inside:

- **The logo is a real 3D scene** (WebGL, TresJS): the Blender GLB rendered as a polished-metal
  mark that tilts toward the cursor, spins with a drag and springs back to the front. The metal is
  PBR — a `MeshStandardMaterial` reading the scene's generated environment (decision 82). Behind it
  a deep open box recedes, its grid painted on every face and fading to the background through a
  fog, and the camera leans a little with the pointer, so the depth shifts while the mark stays
  centred. **The opening is cut to the stage** and divided into the stage's own seven cells, so its
  grid lines fall on the page's at the frame; the box scales with the wheel's zoom to keep it so. It
  is lazy, pauses off-screen and never mounts below 900px (decision 37). See decisions 78–83 and 87.
- **The 2D mark is the failure state.** The PNG mask over `var(--mark)` at 58% of the width is
  painted only if WebGL is missing or the scene never reports ready (decisions 77, 85), so a working
  load shows the 3D alone rather than a flash of the flat logo.

The stage carries **no label and no explanatory text**.

### 3.3 Marquee

A full-bleed band, background `--acc`, text `--on-acc`, `padding:13px 0`, top and bottom
borders in the same yellow. Mono text 13px, weight 700, `letter-spacing:.22em`, uppercase.
Two identical blocks in a row (`gap:38px`, `padding-right:38px`) animated with
`marquee 26s linear infinite`, which translates `-50%`: the loop is seamless because the
content is duplicated. Phrases: "Fullstack developer → backend" and "Murcia · Barcelona ·
remote · Spain", separated by `//`.

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
**tabs** `/experience`, `/education` and `/certifications` — a row of folder labels (mono 13px,
12px on a phone) on a hairline track, the active one in `--acc-text` with a 3px `--acc` rule
under it; no pills + the matching timeline. It is a real ARIA tablist: roving `tabindex`,
`aria-controls`, a `role="tabpanel"` on the panel, and the arrows move the selection and the focus.

Under the photo sits **the availability indicator**: a mono row of 10px uppercase,
`letter-spacing:.14em`, colour `--fg-3`, `gap:7px`, preceded by a dot. The dot is two layers inside
a 5×5px container: a core, a solid `#39D98A` circle filling it and **not animated**; and a ring,
`inset:-5px`, `border:1px solid #39D98A`, `border-radius:50%`, animated
`dotHalo 2.6s cubic-bezier(.15,.6,.3,1) infinite` — born small, appears, grows and fades out
completely before restarting. Text: "Available" / "Disponible".

Each timeline row: `display:grid`, columns `minmax(90px,130px) 1fr`,
`gap: clamp(14px,3vw,32px)`, `padding:22px 0`, `border-top:1px solid var(--line)` (the last
one also gets `border-bottom`). Left column: the year range in mono 12px — yellow if it is the
current period, `--fg-3` if it is past. Right: title 18px weight 600 + description 15px
`--fg-2` at 60ch. On mobile it collapses to one column with `gap:8px`.

Right: photo `aspect-ratio:1/1`, `object-fit:cover`, radius 18, border `--line`. **No caption.**
**The "Résumé/CV" button sits under it, at the photo's own width**, solid in the accent because it is
the section's one call to action, so the column closes with one block. It opens **the CV dialog**
(decision 97): the same pages as the PDF, rendered with pdf.js inside the dialog shell of §3.7, with an
icon-only download in that dialog's header. **On a wide screen that whole column travels with the
scroll**:
`position:sticky` at `top: calc(var(--navbar-h, 88px) + 20px)`, riding down while the timeline runs
past and stopping with its foot just above the section's bottom (the section's own padding). On mobile
there is no travel — the photo lands at the end of the section — and the badge stays above the photo's
right corner, as on a wide screen, with the CV closing the column.

### 3.6 Projects

A **horizontal rail**: a clipped viewport (`overflow:hidden`, `padding:20px var(--rail-room)` to leave the
magnetic pull its 10px on every side, taken back with a negative margin so the content box is unchanged,
`touch-action:pan-y`) holding a `flex` track with `gap:20px`, moved by
`transform: translate3d(-offset, 0, 0)` with `will-change:transform`. **The travel is a loop in the
script, not a CSS transition**, because the fade has to know the position it is passing through: a
transition runs in the compositor where nothing can read it, so the fade could only be decided from the
destination. It eases at `0.16` per frame, stops the moment it settles, and jumps straight to the
target under `prefers-reduced-motion`. **Three cards and the sliver of a fourth** on a desktop, **one
and a sliver** below 900px, which is the whole affordance: the sliver says there is more, without a dot
or a counter. The card width is `calc((100% - 2 * var(--rail-gap) - var(--rail-peek)) / 3)` — the two
gaps and the peek — and `calc(100% - var(--rail-peek))` on a phone.

**The room on the sides is the magnetic pull's, not the layout's.** The pull moves a card up to `10px`
toward the cursor, and a card at either end of the rail was pushed past the viewport's own edge, where
the clip took its border and its rounded corner off — a few pixels, but the eye catches a broken corner.
`overflow-clip-margin` would be the one-line answer and **WebKit does not support it** (checked, not
assumed), so the room is padding taken straight back with a negative margin: the content box is the same,
the cards keep the width they were measured at and still line up with the section's gutter, and only the
clip is wider. The fade adds the room to its length, or the extra strip would show unfaded and the hard
edge would simply move inward.

The rail travels one card per step and stops with the last card flush to the right edge, so the last
position shows cards 2–4 rather than card 4 alone. **A row of dots under the rail** marks the
parking spots — one per spot, recomputed per width, the one you are on a longer pill in `--acc` —
and each is a 24px button with an 8px mark inside it. The transform is instant under
`prefers-reduced-motion`.

**Dragging** covers every pointer type — a mouse has no horizontal gesture, and the rail is not a
scroll container so the phone has no swipe either. `touch-action:pan-y` is the whole declaration: the
browser intersects touch-action from the element the finger lands on down to the nearest scroll
container, so one rule covers every card inside. The transition is switched off while the pointer is in
charge, and on release the rail settles in the next frame, once the curve is back: a drag that moved
more than a fifth of a card takes the **next card in the direction it was going**, and anything
shorter falls back to the nearest. Without that fifth, a phone swipe had to travel more than half a
card — 160px — before anything happened, which reads as the rail refusing to budge. A drag that
travels more than `6px` swallows the click in the capture phase, because nobody means to open a card
they just dragged. The viewport takes pointer capture **once the gesture has proved itself a drag**, in
the move and not on pointerdown: captured on pointerdown, the pointerup is retargeted to the viewport and
the click that follows is dispatched at the common ancestor of the two — the viewport — so the card's own
button never sees it and no card opens with a mouse.

**The edge the clip cuts gets a soft one**, and **the fade follows the live position**: a side is faded
only while a card is actually hanging off it, which is what the offset within the current step says —
not "has the rail moved", which is true at every settled index past the first even though the card
behind is exactly off the edge. The right at the start, the left at the end, both mid-travel, none when
everything fits — and because it reads the offset rather than the destination, it is right at every
frame. A hard vertical edge where a card is cut reads as a mistake rather than as "there is more this
way", and the side with nothing to continue is left alone: at the start the first card's rounded corner
sits on the edge, and fading it would eat it. **The fade is the peek plus the room**, derived from the
same variables the card width is, so it stops exactly where the card you are reading begins. A flat `56px`
did not: the peek is `45px` on a phone, so the fade reached 11px into the visible card and smudged its
right edge instead of softening the next one.

**Cards that are fully out of the rail carry `inert`.** They stay in the DOM — the keyboard has to
reach them — and `inert` is what keeps Tab from walking into a card nobody can see, which is the trap
a transformed carousel normally sets.

Measured: `2319px` on a phone against an `839px` viewport before this and `1010px` after; `1506px` to
`1134px` on a desktop. No "click to open" hint: the card design says it already.

Card (a clickable `<article>`, `cursor:pointer`): border `--line`, radius 18, background
`--surface`, `overflow:hidden`, column. Hover — **only under `@media (hover:hover)`** — border
`--acc-text` and the arrow circle filled with `--acc`, `transition: border-color .16s ease`. A phone
has no hover: a tap leaves `:hover` stuck on whatever was touched, so the marker was there or not
depending on where the last finger went. Where there is no hover the rail marks the card it is parked
on instead, with the same yellow border, and it moves as you scroll the rail.

**The last slot is not a project.** It leads to GitHub for whatever did not fit in four cards, and it
borrows the project card's own rhythm so the two come out the same size: a media slot on top (`16/10`,
`--surface-2`, carrying the GitHub mark at 64px over a mosaic of rounded accent squares), then the body
(the question and the line) and a foot with a hairline carrying the mono label in the accent and the
arrow circle — the whole card the target, the link stretched over it with an `::after` overlay. The
border is **`2px dashed`**, which is what says "a slot in the rail, not a fifth project": two pixels
rather than the cards' one, because a browser draws its dashes longer the thicker the border is, and
`box-sizing: border-box` so the box stays the size of the cards beside it. Same radius, surface and
`inert`/`current` treatment as the cards. The copy lives in `src/data/copy.js` and the link label in
`src/locales/`; the GitHub mark and address are read from the socials, so they cannot drift from Contact.
See decision 101.

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

The dialog shell — backdrop, panel, scroll lock, focus trap, Escape and the ✕ — is `BaseModal`, shared
with the CV dialog (§3.5). Its header is sticky and opaque (the title on the left, an optional action
and the ✕ on the right), so it stays reachable however far the body scrolls.

Opens on card click. Backdrop `color-mix(in srgb, var(--ink) 82%, transparent)` with
`backdrop-filter: blur(4px)` — one soft blur across everything behind, not one per element (decision
96) — `z-index:250`, vertical scroll,
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
- Carousel: `width:100%` **and** `aspect-ratio:16/10` with `max-height:56svh` — the card's own frame;
  it was 16/9 × 40svh and read as a letterbox. The width is explicit because with only an aspect-ratio
  and a max-height the width is derived *from* the height, which left the right of the row empty. The
  slides are a horizontal track moved by `transform` (0.4s, the pagers' curve), each at 100% of the
  box; while there are no screenshots each is the striped frame carrying the project's `shotLabel`.
  Paging is the dots, the rail's indicator on its side: a 24px target with an 8px mark inside, the
  current one a longer pill in `--acc`, under the media on the panel rather than over the shot, and
  only shown when there is more than one slide. The ← → arrows and the `IMAGE n / total · SLUG` label
  are gone (decision 94).
- Body: grid `1.4fr .6fr` (one column on mobile), `padding: clamp(22px,4vw,40px)`. Left: name
  `clamp(26px,3.4vw,40px)` weight 700, lead 18px, two 16px `--fg-2` paragraphs, and two
  buttons (repository outlined, demo in yellow). Right: a mono definition list with Role, Year
  and Stack; each block with a `border-top` and the stack as 11px chips, radius 8, border
  `--line`.

### 3.8 Stack

`grid; repeat(2, minmax(0,1fr)); gap:44px 40px`, collapsing to one column at 900px. **Four** groups —
Languages, Backend & data, Frontend & design, Tools & AI — two per row. The AI tools lead the last
group rather than having one of their own: a group of two icons beside a group of ten would have read
as an accident. Each group: an uppercase mono 13px `--fg-3` label with a `border-bottom` and
`padding-bottom:12px`, and the icons below in `flex-wrap` with `gap:12px`.

Icon tile: 60×60, radius 13, background `--surface-2`, border `--line`, `box-sizing:border-box`;
48×48 below 900px, where the section is read at arm's length and a wall of 60px tiles was taking most
of the screen. Every logo renders at 38×38 (30×30 on mobile), centred, except a **wordmark**, which
gets a wider box — GSAP's is almost 3:1 and would otherwise render as a thin stripe in the middle of
its tile. The dark monochrome logos (Express, Prisma, Three.js, GitHub, Linux, Framer, OpenCode,
GSAP) would vanish against `--surface-2` in the dark theme, so both of their copies carry
`[data-invert-dark]`, inverted **in dark theme only** with `filter: invert(1) hue-rotate(180deg)`;
no filter in light.

**The grid is monochrome at rest.** Each logo is drawn twice, one grey copy at `opacity:.6` (and
`grayscale(1)` when the logo has colour of its own) and one in colour on top at `opacity:0`, and
**the pointer lights what it passes near**: within `150px` of the cursor a tile's colour copy fades
in on a `(1 - distance/reach)^1.6` falloff, the tile lifts `3px` and grows `6%`, all eased at `0.16`
per frame. Two copies rather than an animated `filter: grayscale()` because a filter repaints the
tile every frame and an opacity is composited — this runs at pointer speed.

**Naming the tile is Limonacho's job.** He sits in the corner with his bubble, and the group hands him
the name of the tile the cursor is on once it is within `80px`; the bubble goes when the pointer
leaves the grid. A name inside the tile is not possible — "IntelliJ IDEA" does not fit in 60px at a
legible size — and a caption under every tile would either push the grid apart or overlap the row
below. The bubble is **not** a live region for these: they change as the pointer sweeps the grid, and
every tile already carries its own `alt`.

**If the lemon is not on the page** — `showLemon` off, no hero, no lemon — the name falls back to a
mono 11px uppercase readout in `--acc-text`, `position:fixed`, `16px` from the cursor, that fades with
the same easing and snaps to the cursor on the first frame of each appearance. The tiles mark
themselves `data-interactive` in that case only, so the custom cursor opens its ring over them: with
the lemon the name comes from hovering, and without him the only way to get it is to click, which is
what the cursor has to say.

**On touch there is no cursor, so the scroll is the light, and it comes on one group at a time, in
order, from a grey base.** Not by a threshold drawn on the screen: the grid is `646px` tall against an
`839px` phone viewport, so every group was already past any line by the time you could see them all,
and the whole section lit at once. Instead the grid's crossing of the viewport — from its top at `75%`
of the screen to its bottom at `50%` — is divided into as many slices as there are groups, and each
owns one. They do not lift either, because a block of tiles rising as one reads as the page jumping. A
tap hands the tile's name to Limonacho, up for `1.8s`, or to the readout when there is no lemon.

Either path hangs off machinery the site already owns — `usePointer` and `useScroll` each keep ONE
listener for the whole app — so it costs no second `requestAnimationFrame` and no extra scroll
listener. Under `prefers-reduced-motion` it does nothing and the grid stays grey.

This section has **no footnote**.

### 3.9 Testimonials (optional)

Shown or hidden by config, and it lives **between the Stack and Contact**, not as a section of its
own: it is about the work, and a fifth destination would break the 00–03 numbering for something
that can disappear. It carries the same mono label the contact rows use (`/testimonials`, 13px,
uppercase) instead of a heading. It is not inside a section any more, so it carries the page gutter
and the `1180px` cap itself, plus a `margin-top` of its own on top of the Stack's bottom padding.
See decisions.md 56, 64, 65 and 72.

**One at a time, in a pager.** Measured, one entry is `214px` on a phone, so three made the block
`678px` and the section nearly two screens — the problem the projects grid had, and the same answer.
**One quote is in the DOM at all** — the current one — and changing swaps it, so the block never grows
with the number of quotes. That is the point: the pager is not a scroll container and nothing is
stacked, so there is no scroll to fight and no window to keep a fixed height.

**The box height is animated to the quote on show.** Left to itself the pane's height is its content,
so swapping the card changed it in a single frame — the text slid but the box jumped. `fit()` writes
the new card's measured height onto the pane, and a `ResizeObserver` on the card re-measures after it
lands, because its height also changes once the fonts swap and the clamp resolves.

**The quote is clamped to four lines**, with a mono uppercase "Read more" in `--acc-text`, underlined
and set to the right, under the end of the quote it belongs to. That is what makes the height
predictable: every quote that overflows the clamp is the same height, so the window is the same size
however long they get, and expanding one is the reader's choice — the window grows with it. The button
only exists when there is something to reveal, which is measured, not assumed: the clamp is applied by
default so the box shows four lines while reporting the height of all of them, and the gap between
`scrollHeight` and `clientHeight` is the test. **The measurement runs after the DOM has caught up**,
never inside the click handler — read there it happens before Vue has put the clamp back, so on the way
closed the two heights are equal, the button decides there is nothing to reveal, and it never comes
back.

The box is `--surface` with a `--line` border and radius 18, and it carries **its own header**: the mono
label and the `n / total` position. The label floating above an empty box said nothing about what the box
was; inside, the block reads as one object. **The header is a filled band** — `background: var(--acc)`
with `--on-acc` on top, the same treatment the marquee and the contact band wear — and it is the box's top
edge, so the block opens with the accent instead of with a rule, and it is the only filled thing in the
block. On a fill there is one text colour and the hierarchy comes from opacity rather than from a second
token: the label names the block at full strength, the counter is a number and sits at `.62`. The box's
radius clips the band's two top corners.

The band also carries, in the window's top right, a large `”` in `--acc` at `opacity:.08` — a font glyph
and not an SVG, because it is a watermark and the two faces the site self-hosts already have one. It
belongs to the box and not to an entry, so it is the one thing in the block that does not move. On a phone
it drops, moves right and grows (`74px`, `6px`, `112px`): in a window that narrow it lands behind the quote
instead of behind the name, which is where a watermark belongs — under the text rather than beside the
attribution. **The indicator is a vertical column of dots** on the window's right edge, centred on the window and
not on the whole box (which includes the header, and pushed it high). One per quote, the one you are
on a longer pill in `--acc`; each is a 24px button with an 8px mark drawn inside it, so it clears the
24px WCAG 2.2 asks for without the mark growing. Tapping one goes straight to that quote.

**The swap is vertical.** Forward carries the old quote up and brings the next one in from below;
back does the opposite. `mode="out-in"` so the two never sit on top of each other, and the pane's
`overflow:hidden` clips the movement. Under `prefers-reduced-motion` the swap and the height change
are instant.

**A click on the card goes to the next quote, and wraps** from the last to the first. It is a shortcut,
not the only way in: the dots are the control and this adds nothing to the tab order. Two clicks are not
that click — the "read more" button (or any link), and a drag that selects the quote — so the pointer's
travel is measured between down and up and interactive elements are left alone. The wrap slides as
"next" rather than jumping back the other way.

**The pager announces itself.** The pane is an `aria-live="polite"` region, so a screen reader hears
the new quote when it arrives, and the dots carry `aria-current`.

**No scroll container and no drag.** The pager is not a scroll container and never claims the gesture:
the wheel and a swipe belong to the page, which is what the earlier versions got wrong — they fought the
scroll. The entries that are not showing are not in the DOM at all, so nothing needs `inert`.

**Paging closes whatever was open**, so a quote never arrives half-expanded, and `open` resets on every
change. `fit()` runs again on `nextTick` when the clamp is put back, and `@after-enter` re-observes the
card, so the height follows the card through both the swap and the expand/collapse.

Each entry is `figure` → `figcaption` → `blockquote`: **the attribution first**, and on two lines — a
`48px` avatar circle when there is one, and beside it the name in `--fg-2` over the company in `--fg-3`
(`13px`, tracked/uppercase, a step larger than the 10–11px labels because this one is read rather than
scanned). Stacked because side by side they are two mono strings of different lengths fighting for one
line, and on a phone the second wraps under the first anyway. Then the quote
(`clamp(18px,2vw,23px)`, `line-height:1.5`, `--fg`, 62ch, `text-wrap:pretty`). Header first because that
is how it reads: who is talking, then what they said. The avatar is `object-fit:contain` in a
`--surface-2` circle, not `cover`: the one here is a client's mark rather than a photograph, and
cropping a logo cuts away the part that says who it is.

**The quotes are in quotation marks.** A testimonial is a quote and the marks are what say so before
anyone reads the attribution; the placeholders had them and the first real one did not, which is what
gave it away. One is real and two are placeholders, in square brackets with "Name Surname" so they
cannot be mistaken for genuine ones and shipped by accident: **delete or replace them before this
reaches `main`.**

**No "optional section" note** in the interface.

### 3.10 Contact

The section opens with its **heading**, the same mono title and giant number the other sections use,
carrying their `border-top:1px solid var(--line)` at their 1180px. It is there to separate the band
from Projects: flush against the grid, the band read as part of it rather than as the start of Contact.

Under the heading, a **full-bleed band**, on the accent band the marquee wears (`background:var(--acc)`,
`--on-acc` for everything on it, 1px borders in `--acc`), in display type (700,
`clamp(64px,13vw,190px)`, `line-height:.8`, `letter-spacing:-.03em`, uppercase): the phrase from
`contact.band` — "Let's talk" / "Hablemos" — with its **words alternating** between solid `--on-acc`
and outline (`-webkit-text-stroke:1.5px var(--on-acc)`, no fill), repeated **four** times. Per word,
not per letter: an outline letter between two solid ones reads as a mistake rather than as a pattern.
The parity runs on across the repetitions, so a one-word phrase still alternates.

Behind it sits a **second band** of the same words, outline only in `--on-acc` at `opacity:.45`, a step
higher (`margin-top:-.1em`) and travelling the **other way**. That is where the depth comes from.

It moves with the **scroll**, only with the scroll, and **less than the scroll does** — the text
travels a fifth of its own track, so it reads as drifting with the page instead of racing it. It also
**eases** toward where the scroll says it should be (an inertia of about a frame of lag), and the loop
stops the moment it has caught up. Under `prefers-reduced-motion` nothing runs. Decorative:
`aria-hidden`.

The section is the full-bleed container the band needs, so it carries no gutter of its own: **two**
inner columns carry the gutter and the 1180px cap the other sections use, one above the band (the
heading) and one below (the rows and the form).

**The rows**, separated by `--line`: the label in mono 10px uppercase `--fg-3`, the address below it
(`contact@krub.dev`, `linkedin.com/in/krub`, `github.com/krub-dev` — a network's address is
derived from its href), `clamp(22px,3.2vw,40px)` weight 700, and `↗` on the right spanning both
lines. Hover turns the address and the arrow `--acc-text` and moves the arrow 3px up and right. The
email row is the mailto — there is no separate button; one address, one way in.

**The form** sits after the rows, in a panel: border `--line`, radius 18,
`padding:clamp(20px,3vw,34px)`, the fields in a column with `clamp(18px,2.4vw,26px)` between them.
A mono 10px uppercase label (`SEND A MESSAGE`) titles it, and each field repeats the pattern: a mono
10px uppercase label in `--fg-3`, the input, and its error in `--acc-text` when there is one. The
fields are **a line, not a box**: `border-bottom:1px solid var(--line)`, transparent background,
17px `--fg`, and focus turns that line `--acc-text`. The caret is the browser's own, coloured with
`caret-color:var(--acc-text)` — a drawn one cannot follow the insertion point in a textarea, so it is
not copied. The footer holds the "Send ↗" button (solid, `size="md"`, `type="submit"`) and the mono
note "Or write direct to …" with the address.

Below the fields, the **consent**: a native checkbox tinted with `--acc-text` and, in 13px sans
`--fg-2`, "I have read and accept the privacy policy", the link underlined and turning `--acc-text` on
hover. It links to `/privacy`, which holds the whole policy. The box is **required**: it is validated
like an empty field, and the endpoint refuses a payload without it.

Four states, and one live region (`role="status"`, `aria-live="polite"`) that is empty and hidden
while idle: sending (the button says so and is dimmed), sent (a thank-you, and the fields are
emptied), error (write to me at …). **Validation is live but late**: a field shows its error only once
it has been left, and updates as it is typed from then on, so a mistake clears the moment it is fixed,
and the **Send button stays disabled** (`opacity:.5`) until the four rules pass. They are: name ≥2, a
plausible email, message ≥10, the consent box ticked. Each error is tied to its field with
`aria-invalid` and `aria-describedby`. A hidden honeypot field is filled by bots and dropped by the
endpoint.

The form posts to `config.contactEndpoint` — our own `/api/contact`, never the provider directly: the
key is `RESEND_API_KEY` on the server and `VITE_TURNSTILE_SITE_KEY` in the bundle (`api/contact.js` on
Vercel, the same file mounted by `vite.config.js` in development), so the secret is not in the bundle.
The endpoint validates everything again, checks the Turnstile token and rebuilds the payload field by
field before sending it with Resend.

On mobile the inner column takes `padding-bottom:34px` so the last row and the form do not collide
with the fixed footer.

Links: `mailto:contact@krub.dev`, `linkedin.com/in/krub`, `github.com/krub-dev`.

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
with `padding-bottom: var(--footer-h)`. Below 900px it becomes a centred column with the TOP
button hidden, using `var(--gutter-l)` / `var(--gutter-r)` and the bottom safe-area inset where one
exists. The column stops the longer Spanish credit being squeezed until it breaks mid-phrase, and
the tracking is halved to `.06em` there: at the spec's `.12em` the Spanish credit is a handful of
pixels too wide for a 390px phone and wraps onto a second line. The lemon follows either way,
because `--footer-h` is measured and not assumed.

### 3.12 Background grids

Two layers, always `pointer-events:none`, `z-index:0`, 72px pattern:

- **Hero layer**: `position:absolute`, `height:100svh`, no fade, visible on load.
- **Global layer**: `position:fixed`, from the top down to `var(--footer-h)`, with a
  `linear-gradient(#000 0%, #000 15%, transparent 65%)` mask fading it downwards.

When the top edge of the "about" section reaches 60% of the viewport, a `.35s` crossfade runs:
the hero layer drops to 0 and the global one rises to 1.

**The cell under the pointer lights up**, on pointer devices, and on touch it lights where you tap
and stays until a scroll clears it — there is no cursor to follow, and a tap is told from a scroll by
how far the finger travelled. One 72px square outlined with a 1px `--acc` border, `opacity:.45` with
a pointer and `.22` on touch, snapped with `Math.floor` so it reads as part of the pattern. An
outline and not a fill — the cell is the grid lighting up, not a tile laid on top of it. It is a
fixed element of its own, not a child of either grid, and it snaps to whichever layer is showing:
page coordinates while the absolute hero layer is visible, the viewport once the fixed global layer
takes over, so a scroll does not take it off the lines. It takes that layer's downward mask over the
same box the grid covers, so the light never outlives the grid it belongs to. It rides the app's
single rAF loop. See decision 66.

### 3.13 Custom cursor

Pointer devices only (`@media (hover:hover)`) and above 900px. The native cursor is hidden
**along with the pointer hand on clickable elements**, via
`[root], [root] * { cursor: none !important }` — it has to reach descendants because links and
buttons bring their own `cursor:pointer`.

Three `position:fixed` elements follow the mouse through `transform: translate3d(x, y, 0)`
updated every frame with `requestAnimationFrame`:

1. **Dot** — 10×10px, `margin:-5px 0 0 -5px`, filled `var(--acc-solid)`, radius 50%, `z-index:301`.
   It never changes size.
2. **Ring** — 40×40px, `margin:-20px 0 0 -20px`, `border:1.5px solid var(--acc-solid)`, no fill,
   `z-index:300`. At rest `opacity:0` and `scale(.55)`; over an interactive element, or wherever a
   hint shows, `opacity:1` and `scale(1)`.
3. **Hint** — the same box as the ring, holding a glyph or the 360 mark, a beat behind it.

The trailing is the whole trick: each element carries a slightly longer `transform` transition than
the one before — the dot none, the ring `.28s cubic-bezier(.22,1,.36,1)`, the hint `.32s` — so the
ring trails the dot and the hint trails the ring. All three are `--acc-solid`, not `--mark`: the
cursor is not text, and `--mark` darkens in the light theme for legibility, which left the ring
nearly invisible on the light metal (decision 87).

**Over the hero the cursor becomes the gesture** (decision 87). The dot steps aside and the ring
carries `↑` over the blind, `↓` over the coil once the blind is up, and the `360icon.svg` mark —
18px, masked — over the mark itself, where the drag turns it. The hint is confined to the opening the
shutter occupies, so it does not light on the frame's band. The turn mark follows the blind's edge: it
shows on the strip below the slats' lower edge while the arrow holds over the slats, so it arrives with
the blind's first move and grows as the opening clears, up or down alike. The arrow and the mark
crossfade (0.2s) rather than swapping in a frame.

The cursor no longer fades while the pointer sits still; it is hidden only until the first move
(decision 87).

"Interactive element" resolves through `document.elementFromPoint(x, y)` and
`closest('a,button,[role="button"],input,select,textarea,[data-magnetic],[data-interactive]')`.

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

**He talks.** His bubble shows the once-a-visit greeting on the first poke, and it is also where the
Stack's technology names appear (§3.8): the group hands him a string and he says it. It is
`role="status"` for the greeting, because a screen reader should hear that, and not for the names,
which change as the pointer sweeps the grid. He registers himself on mount, so the Stack knows there
is a voice without knowing why there might not be one.

**The bubble sits beside him, not above him**: it is pushed left by exactly his own width, because the
bubble has no tail and centred over him it reads as sitting on his leaf. **The pupils look at a point** —
the cursor, or on touch the last tap, where a `0.45s` transition on the pupil's transform turns it into
a glance instead of a jump. That transition exists only under `hover: none`: on a pointer device the
frame loop rewrites the position every frame and it would drag the eyes behind the mouse.

The lemon is drawn in CSS: a 58×48px body with
`border-radius: 50% 50% 48% 48% / 58% 58% 42% 42%` and a **flat `var(--acc-solid)` fill, no
gradient** — the accent at full saturation in both themes, so he does not wash out in the dark
one; an 11×12px nub centred on top; a 21×12px leaf in `#3EA34B` outlined `#2C7A36`,
rotated `-24deg`; four texture dots in a darkened yellow at opacities between .35 and .55; and
two 16px white eyes with 7px `#0C0C0D` pupils that **follow the cursor** — or the last tap, on touch —
shifting 4px in its direction.

On click: a `lemonShake .5s ease` shake and a speech bubble beside him — pushed left by his own width
so it does not sit on his leaf — (max 230px, radius 14, background `--surface`, `bubbleIn .28s`)
reading "Welcome! I'm Limonacho" / "¡Bienvenido! Soy Limonacho", which hides itself after 4 seconds.

The **first** click of a visit is the greeting: he says "acho" — a one-second MP3 (`achoSound`,
`src/data/sound.js`, 17 KB), asked for inside the click handler so a phone lets it play, and never
preloaded — and the bubble appears. Every later poke is only the shake.

### 3.17 Mobile menu

A panel below the menu button (`top:74px; right:16px`, `z-index:150`),
`width: min(300px, calc(100vw - 40px))`, radius 20, background `--surface`, `padding:16px`,
`gap:12px`, shadow `0 24px 60px rgba(0,0,0,.45)`. It holds: a header with "Menu", a mono subtitle
and — on the right of that same row — the appearance and language controls, which appear here only
once the bar has compacted (before that they are still in the navbar); a 2×2 grid with Github,
LinkedIn, GitHub and "Let's talk ↗" (this last one in yellow); a list of four navigation links, each
with its `[00]`…`[03]` mono index (the active section's in yellow) and its path; and a centred
"↑ back to top" pill filled with the accent. Every link closes the menu when pressed.

### 3.18 Appearance control (theme + accent)

One control in the navbar, in both the desktop and the mobile group, where the old dark/light
button was. A 36px-tall rounded box (radius 10, 1px `--line`) with two segments and a 1px divider:

- **◐** is the theme toggle it always was: one click alternates dark and light.
- **The accent disc** — 16px, split diagonally between `--acc` and `--acc-2`, so the current
  colour and its variation share one face — advances one palette per click, wrapping at the end.
  The `aria-label` and `title` name the current palette ("Accent colour: Aqua").

On desktop the whole box takes the language button's hover: the frame and the glyphs turn to
`--acc-text`, and the circle grows to 1.18. Under `prefers-reduced-motion` the colour hover stays
and the growth does not.

It is a global setting and stays on every route, the 404 included. The language button beside it
is a separate control and is unchanged.

### 3.19 Settings button (compact navbar)

On desktop, once the capsule compacts, the appearance and language controls are replaced by one
36×36 button with the same four dots as the mobile menu button, beside the CTA — and they spread
apart on open the same way. It opens a small panel: the capsule's own translucent surface and blur
(`color-mix(in srgb, var(--surface) 84%, transparent)` with `backdrop-filter: blur(14px)`), radius
12, a 1px `--line` border, no shadow, `padding: 5px 8px`, 16px below the trigger. The panel is
teleported to `<body>` and given `position: fixed` coordinates from the trigger's rectangle: the
capsule's own `backdrop-filter` makes it a backdrop root, and a blur inside it would see the
capsule's content rather than the page, so it would not match the bar. It holds the appearance
control and the language button, and closes on the trigger, on Escape, on a click outside, on a
scroll and when the bar expands again.

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
| Show CV | boolean | config | on; four PDFs, one per theme and language |

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
  `repoLabel`, `liveLabel`, `summary`, `lead`, `body`, `body2`. Four today:
  `creandomientras`, `sideforge`, `krub-dev`, `showroom`.
- **Timelines** (`experience.js`, `education.js`): two and four entries. Each has `from`, `to`
  (`null` for "still going"), a `current` flag that paints the years in `--acc-text`, and an
  `en` / `es` object with `title` and `body`.
- **Stack** (`stack.js`): four groups with a name and a list of technologies; each technology
  with a name, an icon file and whether it needs inverting in dark theme.
- **Socials** (`socials.js`): name, URL and icon, plus `email`, `cvPath` and `photoPath`. The email is
  the domain's own address, `contact@krub.dev`.
- **Privacy** (`privacy.js`): the form's notice, a `date`, an `intro` and `sections` (each a `heading`
  and a `body`), both languages. `/privacy` renders it and the form links to it.
- **Testimonials** (`testimonials.js`): quote, name, role, avatar. One real quote and two
  placeholders; the section is on.

---

## 6. Assets

- `public/assets/img/krub-mark.png` — the logo. Used **as a CSS mask** (`-webkit-mask` /
  `mask`, `center/contain no-repeat`) over a `var(--mark)` background, so it follows the theme.
  Aspect ratio **1.682**.
- `public/assets/img/krub-pfp.jpeg` — profile photo.
- `public/icons/<technology>/<file>.svg` — technology icons (Devicon).
- `public/uploads/cv-{es,en}.pdf` and `cv-{es,en}-dark.pdf` — the CV linked from About, one per
  theme and language, generated by the standalone cv tool outside this repository.
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
- Text-free buttons (theme, language, menu, close, carousel dots) carry an `aria-label`.
- Touch targets: 44px or more on mobile (carousel arrows 44px, social icons 46px, navbar
  buttons 36px with spacing), and the pagers' dots are 24px — the WCAG 2.2 minimum — with an 8px
  mark drawn inside, so the target can grow without the dot growing.
- External links get `target="_blank"` and `rel="noopener"`.

---

## 8. Responsive

A single breakpoint: **900px**. Below it: one column in every two-column grid, navigation
replaced by the menu, the custom cursor and scroll indicator disabled, the appearance and language
controls in the bar until it compacts and in the menu after, the hero stage dropped (the badge
moves into the text column), the footer centred with the TOP button hidden, a smaller 4/5 photo,
and the lemon at `right:18px` and `bottom: calc(16px + var(--footer-h))`.

---

## 9. Settled decisions

These are deliberate. They are not rough edges to be tidied up later:

- The yellow `#FFC800` is identical in both themes **as a fill**; what changes is whatever is
  painted with `--mark` or `--acc-text`.
- The giant section number **overlaps** the title on purpose.
- The square hero stage holds the 3D logo and carries **no explanatory text** inside it. The scene
  is the mark and the room behind it; the frame around it is CSS.
- There are no filler cards in projects and no user hints ("click to open", "optional
  section", photo captions). They were removed deliberately.
- The lemon enters in a straight line from the right, with no tilt, and its body is flat
  yellow with no gradient.
- The project card arrow is `↗` (diagonal), not `→`.
- The availability dot does not blink: the core is fixed and the outer ring is what pulses.
- The footer reads `DESIGNED & BUILT WITH ♥ BY [logo]`.
