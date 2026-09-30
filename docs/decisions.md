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
download, and the 3D mark now has one: `THREE.LoadingManager` drives the percentage the stage shows
while the GLB lands (decision 75). A skeleton is still held — real project images, once they exist,
would be the first thing to earn one.

### 75. The hero stage is a real 3D logo, and it is metal only
**Status:** active · **Archive:** 75

The mark inside the stage is a WebGL scene. The mesh is a **GLB**
(`public/assets/model/krub-logo.glb`, ~6k triangles) modelled in Blender and loaded as precomputed
buffers — nothing is extruded in the browser. It arrives with two meshes: `krub-logo_front` takes the
accent colour and the rest a dark neutral. TresJS renders it, lazy through `defineAsyncComponent`,
and never below 900px (decision 37).

- **A real download reports its progress.** `THREE.LoadingManager` drives the percentage the stage
  shows while the GLB lands (decision 54).
- **Metal, and only metal.** A crystal finish (`MeshPhysicalMaterial` with `transmission`) was built
  and then removed. Transmission refracts what is *behind* the object, and the mark read as a dark
  mass. The finish that earned its place is in decision 82.
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

- **The frame is a slim brushed-metal band** — 12px, opaque, over the canvas — drawn from the
  `--metal` / `--metal-dark` tokens (a neutral grey pair with its own value per theme), not a colour.
- **The entrance glow is CSS, not WebGL.** It is an `inset` shadow on a wrapper inside the frame now:
  hard on the frame's inner edge, fading inward, for nothing.

### 92. The frame is a masked background, and the stage takes touch
**Status:** active

Two things an iPad (iOS 17.4) showed that no desktop browser did.

- **The frame did not paint.** It was a `border-image` over a transparent border, and on iOS that
  gradient — with `color-mix` and `var()` in it — did not render at all, so the transparent border
  showed through as nothing. The shutter's slats use the very same kind of gradient as a `background`
  and render fine there, so the ring is a background now, cut to the border band with a mask
  (`mask-composite: exclude`, and the legacy `-webkit-mask-composite: xor`), keeping the same brushed
  gradient and dropping `border-image`.
- **The mark did not spin under a finger**, for two reasons at once. `usePointer` — the one loop
  behind the tilt and the drag — listens to `mousemove` and switches itself off unless the device
  reports `(hover: hover)`, which an iPad does not, so the loop never ran there. And the stage had no
  `touch-action`, so the browser claimed a horizontal swipe as a scroll. The drag is now its own
  pointer-event handler on the stage, covering mouse, pen and touch alike and independent of the
  cursor loop, and the stage takes `touch-action: pan-y` so the page keeps the vertical swipe. The
  tilt stays mouse-only, which is right: there is no hover on a finger.

### 93. The stage snaps to `100vh`, not to `window.innerHeight`
**Status:** active

The stage's box is a whole number of 72px cells, and its vertical limit came from `window.innerHeight
- 200`. On iOS `innerHeight` shrinks with the browser toolbar, so the same page snapped to six cells
when the toolbar was out at load and seven when it was not: refreshing made the frame change size while
the rest of the page stayed put. The limit is measured from `100vh` now — the large viewport, the same
unit the stylesheet uses and stable against the toolbar — so the box is the same at first paint and
after a reload. There is no JS property for the large viewport, so it is read from a throwaway
`height:100vh` element.

### 82. The mark's motion and light
**Status:** active · **Archive:** 82

- **The idle breathes on both axes** — a wider, quicker sway than the single slow one it had.
- **The drag is constrained on both axes**, the vertical capped harder (0.45 rad against the
  horizontal's 1.1), and **cleared on release**.
- **The finish is PBR** (`MeshStandardMaterial`): metallic, low roughness, with the environment map
  `SceneRig` generates from a `RoomEnvironment`, so the mark reflects the room and the accent is
  carried on `material.color` as the palette changes.
- **A matcap was the earlier finish and could not shade the front face.** A matcap samples by the
  normal alone, and the mark's front is one normal from edge to edge, so that face came out a single
  flat colour whatever the matcap held. An environment map reads along the view vector and puts a
  gradient on it. The cost is a PMREM render target instead of a small texture.

### 83. The tube strikes once the scene is up
**Status:** active · **Archive:** 83

- **The glow is dark until the scene has reported ready**, then it strikes — a flick, a pause, two
  flicks, then it holds — and only then starts to breathe. With the blind, `ready` is not enough on
  its own: the strike waits for the reveal too (decision 86).
- **The strike is held back by two frames**, not counted straight from `ready`, so the first frame is
  up and painted before the count starts.

### 86. A roller blind covers the stage, and opens and closes on a click
**Status:** active · **Archive:** 86

- **The stage starts closed.** A roller blind of metal slats fills the opening and the room builds
  behind it, which makes the blind a loading cover that is not a fake loader.
- **The blind is CSS, not an image.** Drawn from the metal tokens the way the frame is, the slats
  lift as one piece and come back down the same way: the whole stack translates out of the opening
  and the coil at the top grows as it goes.
- **A slat is flat sheet, and all of its depth is in the joint.** The face is nearly flat with one
  wide reflection lying across its middle, and no lateral bevel or shadow. The joint is three rules:
  the crisp lit edge of the bar above, the hard three-pixel shadow that bar drops on this one, and
  the dark recess where this one's foot meets the next.
- **The stack runs inside guide rails**: dark insets down both sides and across the head, nothing at
  the foot where the frame's own edge is, painted over the bars (`::after`) so they hug them rather
  than sit behind them.
- **The coil is the wound sheet, not a bar.** Round-under, lit across its middle, with the edge of
  every wrap as a fine line.
- **A click opens it; a click on the coil closes it.** The same surface later carries the mark that
  spins, so a press that moved more than 6px is read as a drag and is not the click. With the blind
  up, only the coil takes a pointer — the rest of the button is inert — and the stage steps aside
  over it, because its own drag capture would otherwise retarget the click away.
- **It is a real button.** Focusable, and labelled from the locales (`a11y.raiseShutter`), so the
  keyboard opens it too. Once up it is `aria-hidden` and out of the tab order and takes no pointer,
  except the coil: that stays pressable so the blind can be put back down.
- **The glow waits for the reveal.** With the blind the reveal *is* the entrance: the tube strikes
  after the blind lifts rather than after a fade that played where nobody could see it.

### 87. The cursor becomes the gesture over the hero
**Status:** active · **Archive:** — (new, after the split)

Over the blind, the coil and the mark, the custom cursor stops being a dot with a ring and becomes
the gesture itself, with the dot stepping aside so the hint is the only thing there:

- **Closed blind: an up arrow.** The blind can be raised, so the ring carries `↑`.
- **Coil: the same arrow turned down.** With the blind up the coil is the thing left to press, so the
  glyph points `↓`.
- **The mark: a 360 mark.** The mark takes a drag, so the ring carries the `360icon.svg` mark, masked
  in the cursor's colour at 18px. It is confined to the opening the shutter occupies — the frame's
  12px band is not part of the gesture — so it does not light on the frame.
- **The ring trails the dot, and the hint trails the ring.** Each element carries a slightly longer
  `transform` transition than the one before it (0.28s, then 0.32s): the same chase, one link further.
- **The turn mark follows the blind's own edge.** It is offered on the strip of the opening below the
  slats' lower edge, read from their live rect, not from an "is it open" flag: it becomes available the
  moment the blind starts moving and grows with that strip, going up or coming down alike, and the
  arrow holds over the slats themselves. The two faces crossfade (0.2s), because swapping the glyph for
  the mask in a single frame read as a jump.
- **The two-second idle fade is gone.** The cursor and the grid cell used to disappear after two seconds
  without a `mousemove`, `active` going false until the next one. It never read as deliberate enough to
  keep, so it was dropped and the cursor now stays put; `active` survives as "the pointer has been seen
  at least once", which is what keeps anything from painting at the parked position before the first
  move.
- **The colour is `--acc-solid`, not `--mark`.** The cursor is not text, and `--mark` darkens in the
  light theme for legibility, which left the ring nearly invisible on the light metal.
- **The scene is gated under `navigator.webdriver`** so the e2e suite never holds a WebGL context; the
  2D mark stands in there instead (decision 77).

### 102. Depth on the room is opt-in, and the site does not use it
**Status:** active · **Archive:** — (new, after the split)

Ways to make the open box read as a recess, all gated so the site keeps the box it was built with —
the Open Graph card is where they are weighed.

- **A depth gradient, and it is the one that works.** The geometry carries a vertex colour per corner:
  white at the opening, `depth` (default 0.55) at the far wall. The grid texture multiplies it, so the
  walls *and their lines* sink together as they go back, and the mouth stays exactly `--ink` — the room
  still meets the page at the frame (202863b) while the inside darkens. Measured on the card: the
  ceiling runs 12/255 at the mouth to 3.6 at the far end. No light and no hard facet, and it gets what
  the Blender reference was after without the facets.
- **A contact shadow.** A plane just behind the mark with a radial gradient in `--cast`, transparent,
  `depthWrite: false`, following the room's scale. It gives the floating mark something to cast onto.
  The gradient runs over five stops, most of its alpha gone by two thirds of the radius, so it reads as
  a blur rather than as a disc; the first two-stop version had a hard rim and was too strong.
- **Face lighting was tried and taken out.** A `MeshLambertMaterial` on the walls, so each face caught
  the scene's lights by its normal, differentiated but darkened the near walls (the ceiling to 4.5/255)
  and the hard tone per face read as facets, not as depth. The prop and the geometry's
  `computeVertexNormals` went with it.
- **Exponential fog was tried and taken out.** `FogExp2` fights the gradient — both darken the back,
  and the fog pulls it back to `--ink` — so it was removed rather than left as a second way to do the
  same thing badly.

---

## Enrutado SPA y endpoints

### 7. The design system is a dev-only route
**Status:** active · **Archive:** 7

The design-system sheet — the tokens, the components and the patterns, running live, with a theme and
accent switch — lives at `/design-system`, registered only under `import.meta.env.DEV` and lazily
imported, so it is absent from the production bundle. (It was `/preview` until 2026-09-30, which said
nothing about what it was.)

### 45. The 404 is a route, and a soft one
**Status:** active · **Archive:** 45

The 404 is a real Vue route — `/:pathMatch(.*)*`, lazy-loaded so it stays out of the initial bundle
— and not a static `404.html`. That way it inherits the whole chrome from `App.vue`.

**Production needed a rewrite.** Vercel does not fall back to the SPA on its own, so an unknown path
was answered by Vercel and the router never saw it. A catch-all `rewrites` to `/` sends it to the
bundle, and it is safe because Vercel checks the filesystem **before** applying a rewrite. The cost
is the status code: the page is served **200 with the 404 content**, a soft 404.

### 57. The form posts to our own endpoint, and the endpoint sends by Resend
**Status:** active · **Archive:** 57

The contact form sends a real message, and the browser never talks to the mail provider directly: it
posts to `/api/contact`, a Vercel function holding the secret as an environment variable, which
rebuilds the payload field by field. No key in the bundle, and validation, a rate limit and the
captcha check sit where a caller cannot skip them.

**The provider is Resend, not Web3Forms.** The form was built on Web3Forms first, proxyed exactly
like this — and it broke in production. Web3Forms sits behind Cloudflare and serves a JavaScript
challenge to any server-side caller: a browser passes it, a `fetch` from a server never can. Their
own docs say the API "is expected to run on client side", must not be proxied, and that server-side
use needs the server's IP whitelisted **and a paid plan** — so the proxy is impossible on the free
tier. Resend is a plain server API with a secret key: exactly the provider swap this endpoint was
shaped for, one file.

### 89. The form carries a privacy notice and a required consent box
**Status:** active

The form sends personal data, so the notice and the consent are part of the form, not an extra page
somewhere. The whole point of decision 57's endpoint is that the rules live where a caller cannot skip
them; the consent is one of those rules.

- **The consent is required.** `validateContact` blocks the send while the box is empty, and the
  endpoint refuses any payload whose `consent` is not `true` — a direct post has to tick it too.
- **One line and a page.** The consent label itself carries the link, so the form mentions privacy
  once; `/privacy` behind it renders the whole policy from `src/data/privacy.js` in both languages.
  The page is an ordinary route: the chrome is shared with the rest of the site, the text is content,
  and only the labels (`/privacy`, "Last updated") live in `src/locales/`.
- **The box is the browser's own,** tinted with `--acc-text`. A hand-drawn control would add states to
  get right for no gain, and the native one is announced correctly for free.
- **The endpoint records the consent.** The email carries the time the box was ticked, which is the
  accountability the notice promises. Keeping the message for longer than it takes to answer would
  contradict the retention the page states, so it is not stored anywhere else.

### 90. A route change is scrolled to the top more than once
**Status:** active

`html { scroll-behavior: smooth }` is global, which is right for the section anchors but wrong for a
route change: returning `{ top: 0 }` made the new page first appear at the old offset — on a phone,
opening `/privacy` from the form showed its bottom, then glided up.

- **The router jumps once, with `{ top: 0, behavior: 'instant' }`,** and that is the whole story on a
  desktop.
- **On iOS that is not enough.** The page can be put back at its old offset while the browser settles
  its own viewport, so the new view opens at the bottom of the page it just navigated to. `App.vue`
  watches the route and repeats the jump across a few frames (`0, 60, 140, 240, 360ms`), with the CSS
  smooth behaviour off for the length of the passes. It is the same "wait until it holds" idea as the
  footer's TOP button.
- **It only jumps when the scroll is not already at the top,** so it does not fight a scroll someone
  starts right after navigating, and it does not run on the first load, where the router's one jump is
  what is wanted.
- **A rejected attempt, for the record:** doing the jump inside `scrollBehavior` with the inline
  `scroll-behavior: auto` needed a layout read (`void root.offsetHeight`) or Chromium still glided.
  That worked, but a single jump is the wrong shape for the iOS case, so it was replaced by the repeat
  in `App.vue` and the router went back to returning a position.

### 91. The browser suite runs WebKit too, and the focus trap owns the Tab
**Status:** active

The suite was Chromium only, a desktop and a Pixel 7. It now runs WebKit on an iPhone as well
(`playwright.config.js`), because the bugs that matter here keep being the ones only WebKit shows.

**The first bug it caught.** The project modal's focus trap let Tab escape. `useFocusTrap` only wrapped
at the ends — Tab from the last element back to the first — which assumes the browser can reach the
last element. WebKit leaves links out of the tab order by default, so Tab went from the last button
straight to the page behind without ever touching the last link, and the wrap never fired. The trap now
moves focus itself on every Tab, so the engine's own order never enters into it, with a `focusin` net
for escapes that are not a Tab.

The finger drag is dispatched over CDP, which only Chromium speaks, so that one test is skipped on
WebKit.

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

### 94. The modal's media slides, and pages with the rail's own dots
**Status:** active

The carousel at the top of the project modal carried ← → arrows and an `IMAGE n / total · SLUG` label
over the shot, at `16/9` with a `40svh` ceiling, and it swapped the image in a single frame.

- **The slides are a horizontal track moved by `transform`,** the way the projects rail moves: every
  screenshot sits side by side at 100% of the box and the index picks the framed one, so a change
  slides. `16/10` with a `56svh` ceiling, matching the card's own frame.
- **The dots are the rail's and the testimonials' indicator,** laid on its side rather than a second
  system invented for the modal: a 24px target with an 8px mark inside (WCAG 2.2), the current one a
  longer pill in `--acc`. They sit under the media on the panel, not over the shot, so the marks read
  against the panel and not against whatever the screenshot shows. The arrows, the label and the
  `prevImage` / `nextImage` / `modal.image` strings went with them.
- **The drag is the rail's too.** A pointer takes the track over, the pixels it travels are added to
  the slide's position, and a drag past a fifth of the box takes the next slide while a shorter one
  falls back to where it was. `DRAG_SLOP` and `FLICK` are the rail's own numbers, and capture is taken
  in the move rather than on the press, so a plain click is not swallowed.

### 95. The photo's column travels with the scroll
**Status:** active

The About photo sat still in its column while the timeline ran past it, and the CV button closed the
text column instead — so on a wide screen the two halves drifted apart and the button belonged to the
wrong side.

- **The CV moved under the photo, at the photo's own width**, and became the section's one call to
  action: a solid accent fill, and just "Résumé/CV" / "Currículum/CV" — the "(PDF)" went, because the
  file being a PDF is what the download arrow already says.
- **That column is `position: sticky`** at `top: calc(var(--navbar-h, 88px) + 20px)`. It rides down
  while the timeline scrolls past and stops with its foot just above the section's bottom, which is the
  section's own padding — no second value to keep in step with it.
- **No travel on a phone.** The photo lands at the end of the section there, so there is nothing to
  ride past; the order is photo, badge, CV.

### 96. The modal backdrop is a uniform scrim with a gentle blur
**Status:** active

The project modal's backdrop was `backdrop-filter: blur(10px)` over an 82% ink, and the page behind
turned into soft shapes that read as smudges of their own, competing with the panel. It was flattened to
a plain sheet with no blur — and that read as a blackout instead: the page was not softened, it was just
dark. It is one soft blur (4px) over the same flat scrim now.

**One blur across everything behind, not one per element.** That is the part that matters: a filter per
element gives every element its own edge, which is what "blurring specific spots" was.

### 97. The CV opens in a dialog, rendered from the PDF with pdf.js
**Status:** active

The CV button downloaded a PDF and that was it: to read it you left the site for the browser's viewer.
It opens a dialog now, with the same pages inside it, and the download moved to the foot of that
dialog.

- **The document is the one the site already offers,** picked from the theme and language exactly as
  the old button did (`cvPath`). Nothing new to keep in step, and the dialog and the download cannot
  disagree about which file it is.
- **pdf.js, the legacy build — not an `<iframe>` and not page images.** An iframe hands over to the
  browser's viewer, which on iOS Safari is unreliable and brings its own chrome; page images would need
  a rasteriser in the cv tool, and there is none on this machine — a new binary for a portfolio. pdf.js
  renders the real pages into canvases, in the site's own shell. It is the **legacy** build: the modern
  core leans on APIs a slightly older iOS does not have (`Promise.withResolvers` and friends), and that
  failure is silent — the dialog only says it could not be shown.
- **Lazy, and only on open.** pdf.js and its worker are their own chunks (about 430 KB and 1.2 MB)
  imported when the dialog first opens, so a visitor who never looks at the CV downloads neither. Each
  page is painted at the device pixel ratio, because a PDF scaled to a CSS width and left at 1:1 is
  soft on a retina screen.
- **Warmed on intent, not on load.** The three downloads together are about 610 KB gzipped — more than
  the 3D scene — so they are not fetched with the page: hovering or focusing the CV button, or the
  photo column reaching the viewport (for a phone, where there is no hover before the tap), starts them
  in the background (`useCv`, once per visit). Whoever never looks at the CV never pays, and by the
  time the button is pressed it is usually ready. `vercel.json` also gives `/uploads/` a day of caching,
  so the document is not revalidated on every open.
- **The dialog shell is shared.** The backdrop, panel, scroll lock, focus trap, Escape and close button
  were lifted out of the project modal into `BaseModal`, so there is one set of dialog rules rather
  than two that drift — the same reason the pagers were merged.

### 98. The page is held still under a dialog
**Status:** active

Two things an iPad showed once the CV dialog was there.

- **The scroll lock takes the body out of flow.** `overflow: hidden` on the body is enough on a
  desktop, but iOS ignores it: the document still scrolls, which is how a finger could drag the page
  around behind an open dialog. The lock sets `position: fixed` with the scroll offset in `top`, and
  puts the page back — at once, with the global smooth behaviour turned off for the jump — on unlock.
- **The magnetic hover stands down.** `useBodyScrollLock` keeps a module counter and exports
  `isScrollLocked()`; `useMagnetic` releases every element home and stops while a dialog is over the
  page. Elements leaning behind a backdrop read as the page wobbling under it, which is the opposite of
  what a dialog is for.
- **And the chrome stops believing the zero.** A body taken out of flow reports the scroll as zero, so
  `useScroll` keeps the last real position while a dialog holds the page still. Without it the navbar
  read "zero" as "back at the top" and expanded to its full width the moment any dialog opened, on
  desktop and on a phone.

### 99. The dialog header sticks, and Limonacho explains what will not go
**Status:** active

- **The header sticks.** `position: sticky; top: 0` with an opaque background on the panel's header,
  because a dialog with a document in it scrolls a long way and the title, the close and the action
  have to stay reachable. The shell gained an `actions` slot for that action, beside the close.
- **The CV's download moved into that header**, from the foot of the document: it is the one thing you
  want on whatever page you are reading. It is an icon only — an arrow into a tray — with the words on
  the `aria-label`; no "PDF", which the arrow already says.
- **Limonacho explains the two buttons that will not go.** He says a line over the CV button, and over
  the send button while the form is not ready. The send one is heard on a wrapper around the button,
  because a disabled control takes no mouse events: the button steps out of the way
  (`pointer-events: none`) and the wrapper takes the pointer, so the reason is heard at the moment it
  is needed.

### 101. The projects rail ends on a dashed card to GitHub
**Status:** active

Four projects fit the rail, and whatever else there is lives on GitHub — which nothing on the page
said. The rail's last slot is a card that does: the GitHub mark, a question, a line, and a mono link
in the accent.

- **Dashed, and the dash pattern is set by hand.** The border is what says "a slot in the rail, not a
  fifth project", and the owner wanted the dashes longer and further apart than the browser's own. A CSS
  `border-style: dashed` follows the card's rounded corner but its pattern is fixed against the border's
  width; a `repeating-linear-gradient` can be tuned but is straight, and it left the corners bare. So the
  frame is an SVG `rect` with `stroke-dasharray` (18px dashes, 12px gaps), which does both at once. This
  is not an SVG where CSS would have done: CSS can do one or the other, not both.
- **It sits on the padding box, one pixel in.** A 2px stroke centred on it lands exactly on the card's
  edge, and the rect's radius is 17, one less than the card's 18, which is what puts the two curves on
  the same centre. `overflow: visible` is what lets the outer half of the stroke out. It is a layer above
  the contents (`z-index: 2`, `pointer-events: none`) because the media slot's opaque panel would hide it
  as a background, and the link stretched over the card still gets the click.
- **A `rect` SVG for the dashes was tried, and dropped.** It followed the corners exactly, but it is more
  machinery than the job needs — and the owner asked for CSS where CSS will do. It also brought two traps:
  an `svg` without an explicit size falls back to the replaced-element default of 300×150, and
  `overflow: hidden` clips at the padding box, 1px inside, so the dashes sat inside the card rather than
  on its edge.
- **The component is `GithubCard`.** It began as `ProjectsCta`; "CTA" is the general term for the link
  that asks for the action, and the spec already uses it for the hero's and Contact's buttons, so the card
  is named for what it is instead.
- **A mosaic of rounded accent squares behind the mark.** The media slot is otherwise an empty panel, and
  the card should not look unfinished next to four screenshots. It is an SVG grid (a gradient cannot
  round its own tiles) filled with `--acc-solid`, so it follows the palette, over the theme's
  `--surface-2`, so it follows the theme too. It sits dimmed (0.4) and comes up to full on hover, so the
  mark reads against it by default instead of competing with it.
- **It mirrors the card's structure.** A `16/10` media slot with the mark at 64px, then the body and a
  foot with a hairline, the mono label and the arrow circle — the same radius, surface, hover and parked
  treatment. That shared structure is what makes the two exactly the same size.
- **One source for the link.** The mark and the address come from `socials`/`socialIcons` (the paths
  moved out of `SocialLink` into the data for this), the copy from `src/data/copy.js` and the label
  from `src/locales/`. Nothing here can drift from Contact.
- **It is part of the rail.** The dots count it, it goes `inert` when it is out of view, and on a touch
  screen it takes the parked border, like the cards.

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

### 88. The site's address is `contact@krub.dev`, a mailbox on the domain
**Status:** active

The portfolio carried a personal Gmail: in the contact rows, in the form's fallback and in the
structured data. It now has its own address on the domain, and the whole path to it is the domain's,
so the address a visitor copies is the one the site is about.

- **Receiving is Cloudflare Email Routing.** An MX record and a DKIM record forward anything sent to
  `contact@krub.dev` to the owner's real inbox, well before any of the rest.
- **Sending as it is "Send mail as" over Resend's SMTP,** not Gmail's: a reply goes out signed for
  `krub.dev`, carries no "via gmail.com", and passes `DMARC` because both `SPF` and the `DKIM` domain
  align. A `_dmarc` record already sits at `p=none`.
- **One address, in one place.** `src/data/socials.js` holds it; the contact rows, the form's fallback
  and the JSON-LD head read from it and are kept in step by hand (the static `<head>` cannot import a
  module).
