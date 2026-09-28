# Decisions

Registro activo de decisiones arquitectónicas que condicionan cómo se programa y diseña el proyecto
hoy. Agrupadas temáticamente. Los identificadores numéricos mantienen trazabilidad con el archivo
histórico [`decisions-archive.md`](decisions-archive.md).

Si una decisión aquí contradice [`design-spec.md`](design-spec.md), este archivo wins — el spec es
el contrato visual, este es el registro de dónde nos hemos movido de él.

---

## Fundamentos y tokens

### 1. Static assets live in `public/`, not `src/assets/`
**Status:** active · **Archive:** 1

Stack icons and project images are referenced by name from `src/data/`. Under `public/` the paths are
stable literals (`/icons/vuejs/vuejs-original.svg`) that a data file can hold as a string. Going
through the bundler would mean importing each of the 24 icons individually, for a caching benefit
that does not matter at this size.

**Trade-off:** these files are not fingerprinted, so a changed icon needs a cache bust.

### 2. Default language is English
**Status:** active · **Archive:** 2

`index.html` ships `lang="en"`, and vue-i18n uses `en` as both the initial locale and the
`fallbackLocale`. Spanish is available through the toggle and is persisted in
`localStorage["krub-lang"]`. No browser-language detection on purpose — a portfolio's audience is
mostly non-Spanish readers.

### 4. Text is LF everywhere, enforced by `.gitattributes`
**Status:** active · **Archive:** 4

`* text=auto eol=lf` overrides Git for Windows' `core.autocrlf=true`, so the working copy is LF on
Windows too, matching the Linux build machine. Binary assets are marked `binary`.

### 6. No global `box-sizing: border-box`
**Status:** active · **Archive:** 6

Every measurement in the design spec was taken against the browser default, `content-box`. Switching
the whole project to `border-box` would silently change what `max-width` plus `padding` resolves to.
The few elements that genuinely want `border-box` declare it themselves.

### 10. Theme and language are restored by an inline script in `index.html`
**Status:** active · **Archive:** 10

`main.js` loads as a module, which is deferred, so the browser paints once before Vue runs. A small
blocking script in `<head>` reads the same two `localStorage` keys and sets `data-theme` and `lang`
before the first paint.

**Trade-off:** the two storage key names are written in two places.

### 11. Accent fills and accent text are separate tokens
**Status:** active · **Archive:** 11 · **Overrides the design spec**

The spec said the brand yellow is identical in both themes. That holds for fills, but as *text* on
the light background `#FFC800` measures **1.40:1** against `#F5F3EE` — fails even the 3:1 large-text
allowance.

`--acc-text` (and `--acc-text-2` for hover) were added: `#FFC800` in dark, `#8A6A00` in light
(4.57:1, AA at any size). `--acc` keeps its job — yellow **fills** with `--on-acc` on top — and does
not change between themes.

### 12. Content lives in `src/data/`, interface strings in `src/locales/`
**Status:** active · **Archive:** 12

    sentences I wrote     ->  src/data/    (both languages side by side in one file)
    labels the UI needs   ->  src/locales/ (nav paths, button labels, aria-labels)

The reason is editing, not purity. This content evolves for years: projects get added, the About
text gets reworked. With both languages in one file, a rewording is one edit in one place, and
deleting an entry deletes its translations with it.

### 13. `src/data/config.js` for the optional sections
**Status:** active · **Archive:** 13

Design spec §4 lists "show testimonials" and "show lemon" as configuration. They live in `config.js`
as plain booleans, alongside the footer clock's timezone.

### 27. `--fg-3` was raised: the spec's value failed contrast
**Status:** active · **Archive:** 27 · **Overrides the design spec**

The spec's values scored **3.55:1** (dark) and **3.16:1** (light) — under the 4.5:1 that text below
18pt requires. Raised to `#868580` (dark) and `#706F6B` (light) — the smallest change that clears AA
against both `--ink` and `--surface`.

### 48. The accent is a separate axis from the theme
**Status:** active · **Archive:** 48

Five accent palettes, chosen with `data-accent` on `<html>`: the brand yellow (default) plus four
pastels — aqua `#C3FFFC`, rose `#FB7185`, mint `#9AFFC9`, violet `#D8C7FF`. The dark/light theme is
untouched and orthogonal: two themes times five accents.

**The two-tier structure:** The reference colours are pastels made for a black background. On the
light theme they are nearly invisible *as fills*, so each palette gets a more saturated light-theme
fill. The logo follows the accent in both themes via `--mark`.

---

## Rendimiento y rAF unificado

### 16. One rAF loop and a subscription list for everything that follows the mouse
**Status:** active · **Archive:** 16

Four effects track the cursor: the custom cursor, the magnetic hover, the logo parallax and the
lemon's pupils. `usePointer(callback)` owns the single loop and a `Set` of subscribers. It starts
when the first subscriber arrives and stops when the last one leaves.

The pointer position is a **plain object, not a ref**. A reactive ref would re-render every
component that reads it sixty times a second, for values that never reach a template.

### 30. Lighthouse results, and what is left on performance
**Status:** informational · **Archive:** 30

After the fixes, measured against the production build on `localhost:4173`:

| | Desktop | Mobile |
|---|---|---|
| Performance | 98 | 82 |
| Accessibility | **100** | **100** |
| Best Practices | **100** | **100** |
| SEO | **100** | **100** |

The remaining gap is almost entirely **render-blocking requests, ~1,360 ms of the mobile LCP**,
which is the Google Fonts stylesheet in `<head>`. Closed by decision 43.

### 43. The fonts are self-hosted
**Status:** active · **Archive:** 43 · **Closes the font half of decision 30**

`Space Grotesk` and `JetBrains Mono` load from `public/fonts/`, one **variable** `.woff2` per family
(300–700 and 100–800), declared with `@font-face` in `tokens.css`. Only the **latin** subset is
downloaded. The Google Fonts `<link>` and both `preconnect` hints are out of `index.html`.

The point is not only speed. It also stops a visit from making a request to a third party, which has
been the subject of GDPR rulings in the EU.

### 54. No fake loader, and no skeleton until something actually arrives late
**Status:** active · **Archive:** 54

Both were considered and both are held, for the same reason: on this site nothing arrives late
enough to deserve either. The honest version of a loader is a real percentage tied to a real
download, which is what the 3D model will have through `THREE.LoadingManager`.

### 75. The hero stage is a real 3D logo, and it is metal only
**Status:** active · **Archive:** 75

The mark inside the stage is a WebGL scene: the same vector path as the favicon, parsed by Three's
`SVGLoader` and extruded. TresJS renders it, lazy through `defineAsyncComponent`, and never below
900px (decision 37).

- **Metal, and only metal.** A crystal finish (`MeshPhysicalMaterial` with `transmission`) was built
  and then removed. Transmission refracts what is *behind* the object, and the mark is a flat
  extrusion: at normal incidence its Fresnel is about 5%, so it read as a dark mass. The polished
  `MeshStandardMaterial` is the finish that earned its place.
- **The walls are welded and re-normalled.** `ExtrudeGeometry` does not share vertices between the
  segments of a curve, so every facet carries its own normal. Dropping the normals, `mergeVertices`
  by position and `computeVertexNormals` averages them across the curve without rounding the edges.
- **The loop is paused off-screen** (IntersectionObserver at 60%), framed at 24fps and capped at
  1.5x DPR.

---

## Accesibilidad WCAG

### 24. A visible focus ring, using `:focus-visible`
**Status:** active · **Archive:** 24 · **Not in the design spec**

The project had no focus indicator at all. That is worse here than in most sites: the custom cursor
sets `cursor: none` across everything, so a keyboard user would have had no pointer AND no ring.

`:focus-visible`, not `:focus`. The browser decides: a keyboard user gets the ring, someone who
clicked a button with a mouse does not.

### 25. Reduced motion covers transitions, not just keyframes
**Status:** active · **Archive:** 25

The spec asks for the marquee, the dot halo and the sliding entrances to stop under
`prefers-reduced-motion`. Half of that motion is not keyframe animation at all — the footer sliding
in, the navbar capsule resizing over 0.55s and the grid crossfade are CSS transitions.

The `[data-motion="decorative"]` rule now clears both. Killing a transition still leaves the element
at its final value: the footer arrives, it just does not travel.

### 26. The project card gets an explicit `aria-label`
**Status:** active · **Archive:** 26

The whole card is one `<button>`, so without a label a screen reader falls back to its contents and
announces the title, the type, the summary and three technologies as the *name of a single control*.
"Open project: Showroom" is what someone needs to hear before deciding to press it.

### 28. The project card uses the overlay pattern, not a button around everything
**Status:** active · **Archive:** 28

The button now wraps only the title and is stretched over the card with an `::after` overlay. The
accessible name is "Open project: Showroom", which contains the visible "Showroom"; the summary is
ordinary readable text again; the whole card surface is still clickable.

### 29. Other findings from the Lighthouse pass
**Status:** active · **Archive:** 29

- **`aria-label` on a `<p>` is prohibited ARIA.** `role="img"` makes it legal.
- **The language button's label did not contain its visible text.** Now "EN — Switch language".
- **`robots.txt` returned the SPA's `index.html`.** Added a real `robots.txt` and a one-URL
  `sitemap.xml` in `public/`.

### 34. Tests: Vitest for logic, Playwright for what only a browser can answer
**Status:** active · **Archive:** 34

Twenty unit tests and five end-to-end flows. Deliberately small — the point is a safety net and a
working setup, not coverage.

**Vitest** covers pure logic and the two composables that touch storage. **Playwright** covers the
five things that could not be verified any other way, because they depend on scroll events, animation
frames and CSS transitions actually advancing. It runs against the production build, not the dev
server.

### 73. The `/me` tabs are a row again, and a real tablist
**Status:** active · **Archive:** 73

The tabs are a row at every width — as plain folder labels on a hairline track the three fit a phone
at 12px with no tracking.

**And the tablist is real now, not just the roles.** It has roving `tabindex` (only the selected tab
is in the tab order), ArrowLeft/ArrowRight with wrap, Home/End, `aria-controls` on each tab, and the
panel is a `role="tabpanel"` with `aria-labelledby`.

### 74. The dots are 24px, and the pagers announce themselves
**Status:** active · **Archive:** 74

- **The dots were 20px, under WCAG 2.2's 24px minimum.** They are 24px now.
- **The testimonial pager had no live region.** The pane is now `aria-live="polite"`.
- **Everything else passed.** axe reported no violations, and every text pair clears AA against the
  new light background. Lighthouse is 100 on accessibility and best practices in both themes.

---

## Persiana y escena WebGL

### 77. The 2D mark is the fallback, and it fades
**Status:** active · **Archive:** 77

The PNG mask over `var(--mark)` paints first and is what a browser without WebGL, a failed fetch or
a rejected shader falls back to. The scene reports readiness with a `ready` emit, and the mark fades
(`opacity`, 0.4s) so the hand-off from the flat mark to the scene is a crossfade instead of a pop.

### 78. The room comes back, as one box and a rig
**Status:** active · **Archive:** 78

- **The room is a box open at the front.** The camera sits outside it, looking in: the near face is
  left out of the geometry, so the four walls run away from the frame and close on a far wall.
- **The grid is world-uniform.** The walls are built by hand, with their UVs taken from the world
  position — a `BoxGeometry` maps each face to 0..1, which would stretch the grid on the deeper
  walls.
- **The camera peeks.** `SceneRig` leans the camera with the pointer and always looks back at the
  mark, so the mark stays centred and the room parallaxes around it.

### 79. The stage snaps to the page's grid
**Status:** active · **Archive:** 79

The box is now a **square of whole cells** — seven by seven, 504×504 — with all four edges on grid
lines, moved to the next cell to the right of where it landed naturally, or one back when that would
run it off the screen.

### 80. The opening is cut to the stage, and the grid meets the page's
**Status:** active · **Archive:** 80

- **The opening is cut to the stage** — its half-size is `d * tan(fov/2)` at its distance — and
  divided into the stage's own **seven cells**, so its grid lines land on the page's at the frame.
- **The wheel zooms, and the box scales with it** so its opening stays on the stage at any zoom.
- **The fog falls off to `--ink`** so the tunnel has no bottom to see.
- **A backlight behind the mark was removed.** It was a neutral plane on the camera's axis that
  cleared the grid behind the mark. As a plane it cannot do that job: to project wider than the mark
  it has to sit just behind it, and there the mark's own corners cross it once it is turned (the
  model is ~13 deep at rest but its corners sweep to ~60 in z across the drag), so it cut a seam
  across the mark. Pushed deeper to clear that, the tunnel's own aperture clips it smaller than the
  mark. See `docs/backlog.md` for a revisitable version that is not a plane.

### 81. The frame is a slim brushed-metal band, and the badge hangs outside it
**Status:** active · **Archive:** 81

- **The frame is a slim brushed-metal band** — 12px, opaque, over the canvas — drawn in the theme's
  own greys (`--fg` mixed into `--ink`) rather than a colour.
- **The entrance glow is CSS, not WebGL.** It is an `inset` shadow on a wrapper inside the frame now:
  hard on the frame's inner edge, fading inward, for nothing.

### 82. The mark's motion and light
**Status:** active · **Archive:** 82

- **The idle breathes on both axes** — a wider, quicker sway than the single slow one it had.
- **The drag is constrained on both axes**, the vertical capped harder (0.45 rad against the
  horizontal's 1.1), and **cleared on release**.
- **The finish is a matcap** (`MeshMatcapMaterial` and one 256px texture), not a lit material. The
  lighting and the reflections are baked into the image, so there is no environment, no PMREM, no
  BRDF and no light in the scene at all.
- **The matcap's range is the whole tuning, and its ceiling is the flat face.** The accent is
  multiplied over it by `material.color`. The extrusion's front face is one normal from edge to edge,
  and a matcap samples by the normal alone, so that face is a single flat colour whatever the matcap
  holds.

### 83. The tube strikes once the scene is up
**Status:** active · **Archive:** 83

- **The glow is dark until the scene has reported ready and the flat fallback has faded**, then it
  strikes — a flick, a pause, two flicks, then it holds — and only then starts to breathe.
- **The strike is held back by two frames**, not counted straight from `ready`: the geometry build
  blocks the main thread for a moment just after.

### 86. A shutter opens the stage, once, on a click
**Status:** active · **Archive:** 86

- **The stage starts closed.** A roller blind of metal slats fills the opening and the room builds
  behind it, which makes the blind a loading cover that is not a fake loader.
- **The blind is CSS, not an image.** Drawn from `--fg` into `--ink` the way the frame is, the slats
  lift as one piece: the whole stack translates up out of the opening and the coil at the top grows
  as it goes.
- **A slat is flat sheet, and all of its depth is in the joint.** The face is nearly flat with one
  wide reflection lying across its middle, and no lateral bevel or shadow. The joint is three rules:
  the crisp lit edge of the bar above, the hard three-pixel shadow that bar drops on this one, and
  the dark recess where this one's foot meets the next.
- **The stack runs inside guide rails**: dark insets down both sides and across the head, nothing at
  the foot where the frame's own edge is, painted over the bars (`::after`) so they hug them rather
  than sit behind them.
- **The coil is the wound sheet, not a bar.** Round-under, lit across its middle, with the edge of
  every wrap as a fine line.
- **A click opens it; a drag does not.** The same surface later carries the mark that spins, so a
  press that moved more than 6px is read as a drag and is not counted as the click.
- **It is a real button.** Focusable, and labelled from the locales (`a11y.raiseShutter`), so the
  keyboard opens it too. Once up it is `aria-hidden`, out of the tab order and takes no pointer.
- **The glow waits for the reveal.** With the blind the reveal *is* the entrance: the tube strikes
  after the blind lifts rather than after a fade that played where nobody could see it.

---

## Enrutado SPA y endpoints

### 7. `/preview` is a dev-only route
**Status:** active · **Archive:** 7

A visual sheet for the token layer lives at `/preview`, registered only under `import.meta.env.DEV`
and lazily imported, so it is absent from the production bundle.

### 45. The 404 is a route, and a soft one
**Status:** active · **Archive:** 45

The 404 is a real Vue route — `/:pathMatch(.*)*`, lazy-loaded so it stays out of the initial bundle
— and not a static `404.html`. That way it inherits the whole chrome from `App.vue`.

**Production needed a rewrite.** Vercel does not fall back to the SPA on its own, so an unknown path
was answered by Vercel and the router never saw it. A catch-all `rewrites` to `/` sends it to the
bundle, and it is safe because Vercel checks the filesystem **before** applying a rewrite. The cost
is the status code: the page is served **200 with the 404 content**, a soft 404.

### 57. The form posts to our own endpoint, never to Web3Forms
**Status:** active · **Archive:** 57

The contact form sends a real message, and the service behind it is Web3Forms. What it does **not**
do is post to Web3Forms from the browser.

Web3Forms' access key is designed to be public. Hiding it is still strictly better: no key in the
bundle, validation and rate-limiting possible on the server, and the provider becomes something that
can be swapped in one file. So the browser posts to `/api/contact`, which is a Vercel function
holding the key as an environment variable.

---

## Responsive y mobile

### 14. The hero's viewport-height escape is keyed to width, not just height
**Status:** active · **Archive:** 14 · **Fixes a prototype bug**

Below 900px the hero grid collapses to a single column, so the stage stacks under the text and the
section needs roughly twice the height. The rule is now `@media (max-width: 900px), (max-height:
700px)`. Width is the honest trigger: the single-column layout is what needs the room.

### 37. No stage on a phone, and the navbar publishes its own height
**Status:** active · **Archive:** 37

Below 900px the hero grid becomes one column, so the text and the square stage stack. The stage is
what does not fit, and it is not rendered below 900px. `LogoStage` never mounts on a phone, so the
parallax never subscribes.

The hero cleared the fixed navbar with a hardcoded 88px, and the bar is 90px tall. The fix is the
one this codebase already uses for the footer: the element measures itself and publishes the number.
`useElementHeight` publishes `--navbar-h`, and the hero and `scroll-margin-top` both read it.

### 40. The gutter is a token, and the safe area does not belong on `body`
**Status:** active · **Archive:** 40

The inset belongs where the page's own gutter is, so the gutter became a token:

    --gutter-l: max(clamp(20px, 5vw, 64px), env(safe-area-inset-left, 0px))
    --gutter-r: max(clamp(20px, 5vw, 64px), env(safe-area-inset-right, 0px))

`max()` rather than a sum, so a device with no notch gets exactly the gutter it always had.

---

## Secciones y contenido

### 55. The contact section: a band that moves with the scroll
**Status:** active · **Archive:** 55

The band is CSS and one scroll read, not GSAP, and it is two bands. The words alternating between
solid and outline is `-webkit-text-stroke` with a transparent fill, and "passing by" is the marquee
the site already has under the hero.

**Building it found a real bug in the layout.** `.app` had `overflow-x: hidden`, and a box with one
axis hidden makes the other compute to `auto`: the app wrapper was a **scroll container**, one that
never scrolls. `overflow-x: clip` keeps the guard and does not create a scroller.

### 58. The Stack goes monochrome, and the pointer lights it
**Status:** active · **Archive:** 58

- **Monochrome by drawing the logo twice.** Each icon renders a grey copy under a colour copy, and
  the spotlight fades the colour one in with `opacity`.
- **The light is a radius, not a winner.** A radius of light that falls off with distance reads as a
  torch, so every tile in range lights, each by how close it is.
- **It rides the existing loop.** `usePointer` is one mouse listener and one `requestAnimationFrame`
  for the cursor, the magnetic hover, the parallax and the lemon.

### 60. The projects move into a rail
**Status:** active · **Archive:** 60

Four projects in a grid meant a second row holding one card beside an empty column. On a phone four
stacked cards made the section **2319px against an 839px viewport**.

- **A rail, not a grid.** Three cards and the sliver of a fourth on a desktop, one and a sliver on a
  phone.
- **So it is a track moved by `transform`.** Composited, with the same arrive-and-settle curve the
  lemon and the footer use.
- **The drag needed a click guard.** The whole card is a click target behind an overlay, so a drag
  that ends over one would open it.

### 62. No em dashes in the copy
**Status:** active · **Archive:** 62

The owner reads the em dash as a tell — the thing that makes prose look machine-written — and asked
for it out of the copy a visitor can see. Appositives and asides became a colon, a comma or
parentheses. The year ranges got an en dash instead.

### 69. The CV tool moved out of the repository, and the CV now comes in two themes
**Status:** active · **Archive:** 69

The generator is a small, self-contained text-to-PDF tool. It is not part of the website, and
keeping it here mixed a personal document tool into a public front-end repository. Nothing about the
site depends on it at build or run time — the site only ever ships the compiled PDFs.

**What stayed.** The four compiled PDFs, in `public/uploads/`: the light pair for print and email,
and the dark pair to match the site on screen.

### 71. The light theme is a cooler grey, and the stage glow is gone
**Status:** active · **Archive:** 71

- **The light page is `#F2F3F2`, not the cream `#F5F3EE`.** The cream was warm and read as a paper
  tint next to the accent; the cool grey is neutral.
- **The rotating glow around the hero stage is gone.** With the marquee, the cursor and the lemon
  all moving, the stage was the fourth thing turning and it read as noise around an empty box.

### 72. The testimonials are one quote at a time, sliding vertically
**Status:** active · **Archive:** 72

- **One quote in the DOM.** The current one, swapped on change. Nothing is stacked, so there is no
  scroll to fight, no window to keep a fixed height and no entry sliding past the one on show.
- **The pager never claims the page's scroll.** The wheel and a swipe belong to the page.
