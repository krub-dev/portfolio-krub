<script setup>
/*
  The square stage in the hero: the slot for the 3D scene.

  The stage is a still box. The pointer only turns the logo inside it, and that
  happens on the mesh, in the scene — not here with a CSS transform. It reads as
  a solid object being looked at rather than as a card being pulled around, and
  it keeps the frame's border and grid on the section's gutter.

  Two gestures, and they never run at once — that was the mistake the first time:

  - **Hover** tilts it a little, toward the cursor.
  - **Drag** takes over completely: while the button is down the hover is
    suspended and the logo spins with the pointer. On release it snaps back to
    the front, eased in the scene's own loop.

  **The 2D mark is the fallback.** It paints first and is only faded out once the
  scene says it is ready, so a browser without WebGL, a failed fetch or a
  rejected shader all leave the visitor with the logo rather than with an empty
  box. The fade is what turns the hand-off from the flat mark to the scene into a
  crossfade instead of a pop. The scene reports readiness; this decides what to do
  with it.
*/
import { defineAsyncComponent, onMounted, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import { usePointer } from '../../composables/usePointer'

// The shutter is a real button, so its label has to come from the locales.
const { t } = useI18n()

/*
  The scene is lazy: TresJS and Three are a chunk of their own, and the stage is
  not mounted below 900px, so a phone never downloads them. See LogoScene.vue.
*/
const LogoScene = defineAsyncComponent(() => import('./LogoScene.vue'))

const props = defineProps({
  /*
    How the scene arrives: `fade` comes up out of the dark, `none` switches on.
    The scene builds asynchronously, so without this it pops the moment it is
    ready.
  */
  entrance: { type: String, default: 'fade' },
  // The lab switches these off to show what is behind what. On in the site.
  logo: { type: Boolean, default: true },
  ring: { type: Boolean, default: true },
  halo: { type: Boolean, default: true },
  // How the tunnel fades out with depth. See SceneRig for the modes and why.
  fog: { type: String, default: 'far' },
  // The lab puts stages side by side and does not want them walking themselves
  // onto the page's grid.
  snap: { type: Boolean, default: true },
  /*
    The shutter: a closed metal blind over the stage that lifts once, on a click,
    and stays up. The lab turns it off to compare the stage with and without it.
  */
  shutter: { type: Boolean, default: true },
})

const MAX_SPIN = 1.1 // radians, about 63 degrees each way, horizontally
const MAX_SPIN_Y = 0.45 // and much less vertically: tipping it up and down reads heavier
// The page's background grid. The box is sized and placed on whole cells of it.
const GRID = 72
const MAX_CELLS = 7
// The blind's slats. Fixed, and flexed to fill the opening: the count only has to
// be plausible at the sizes the stage takes, and a fixed number keeps the
// stylesheet out of the measuring. Few and thick on purpose — the slats read as
// bars of metal, and a dozen thin ones read as a texture instead.
const SLATS = 8

const frame = ref(null)
const stage = ref(null)
const tilt = ref({ x: 0, y: 0 })
const spin = ref(0)
const spinY = ref(0)
const dragging = ref(false)
const ready = ref(false)
// Bumped on a double press: LogoScene watches it to bring the zoom home.
const resetToken = ref(0)
/*
  The 2D mark is the failure state now, not the loading state. It used to paint
  first and fade out, which meant a flash of the flat logo on every load; now it
  is shown only if WebGL never comes up, so a load with a working scene never
  renders it at all.
*/
const failed = ref(!webglSupported())
/*
  The glow stays dark until this is set, and it is set only once the scene has
  reported ready — the 3D and the room's grid on screen — and the flat fallback
  has had its beat. Striking the tube before that ignites an empty box.

  Two frames before the timer, because the geometry build blocks the main thread
  for a moment right after `ready`: the frame has to be up and painted before the
  count starts. `failed` arms it too, so a browser without WebGL still ends up
  with a lit frame around the 2D mark.
*/
const BEAT_MS = 500
// Must agree with the .scene transition in the stylesheet — the glow is held
// back until the fade is done, so a mismatch strikes over a half-arrived mark.
const FADE_MS = 1800
const armed = ref(false)
let armFrameA = 0
let armFrameB = 0
let armTimer = 0
let failTimer = 0

/*
  The shutter, and whether it has been raised. It opens once and stays open: the
  stage spends the rest of the visit as it always was, the mark turning under the
  pointer.
*/
const revealed = ref(false)
/*
  A press that became a drag must not also lift the blind. The same surface holds
  the mark that spins, so a click counts as a click only if the pointer barely
  moved between press and release.
*/
const DRAG_SLOP = 6
let shutterDownAt = null

function onShutterDown(event) {
  shutterDownAt = { x: event.clientX, y: event.clientY }
}

function onShutterClick(event) {
  if (shutterDownAt) {
    const moved = Math.hypot(event.clientX - shutterDownAt.x, event.clientY - shutterDownAt.y)
    shutterDownAt = null
    if (moved > DRAG_SLOP) return
  }
  revealed.value = true
}

/*
  The glow waits for the reveal. With the shutter the reveal *is* the entrance —
  the blind lifts and the tube strikes behind it — so it does not wait out the
  fade, which played where nobody could see it. Without the shutter the fade is
  still the thing the tube follows.
*/
watch([ready, failed, revealed], ([isReady, isFailed, isRevealed]) => {
  if (!isReady && !isFailed) return
  if (props.shutter && !isRevealed) return
  // Re-enterable now that the reveal is a third source: drop whatever the last
  // pass scheduled before scheduling again.
  cancelAnimationFrame(armFrameA)
  cancelAnimationFrame(armFrameB)
  clearTimeout(armTimer)
  const beat = props.shutter || props.entrance !== 'fade' ? BEAT_MS : FADE_MS + BEAT_MS
  armFrameA = requestAnimationFrame(() => {
    armFrameB = requestAnimationFrame(() => {
      armTimer = window.setTimeout(() => (armed.value = true), beat)
    })
  })
})

function webglSupported() {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'))
  } catch {
    return false
  }
}

let startX = 0
let startY = 0
let startSpin = 0
let startSpinY = 0
let lastDownAt = 0
let snapFrame = 0

/*
  Snap the box to the page's grid: a square of whole 72px cells, its left edge on
  the next line to the right and its top on the nearest one, so a box that is
  otherwise centred in its column lands on the background it sits on. Done in JS
  because it depends on the viewport and the column width; `width`, `height` and
  `transform` are the only things it sets.
*/
function snapToGrid() {
  const el = frame.value
  if (!el || !props.snap) return

  // Clear our own overrides first, so the natural layout can be measured.
  el.style.width = ''
  el.style.height = ''
  el.style.maxWidth = ''
  el.style.maxHeight = ''
  el.style.transform = ''

  const natural = el.getBoundingClientRect().width
  const byWidth = Math.round(natural / GRID)
  const byHeight = Math.floor((window.innerHeight - 200) / GRID)
  const cells = Math.max(1, Math.min(MAX_CELLS, byWidth, byHeight))
  const size = cells * GRID
  el.style.width = `${size}px`
  el.style.height = `${size}px`
  // The stylesheet caps the box; the snap owns its size now.
  el.style.maxWidth = 'none'
  el.style.maxHeight = 'none'

  const rect = el.getBoundingClientRect()
  const left = rect.left + window.scrollX
  const top = rect.top + window.scrollY
  // The next line to the right, unless that would run the box off the screen —
  // then the line before, so a bigger box still fits.
  let targetLeft = Math.ceil(left / GRID) * GRID
  if (targetLeft + size > window.innerWidth - 8) targetLeft -= GRID
  const targetTop = Math.round(top / GRID) * GRID
  el.style.transform = `translate(${targetLeft - left}px, ${targetTop - top}px)`
}

function scheduleSnap() {
  cancelAnimationFrame(snapFrame)
  snapFrame = requestAnimationFrame(snapToGrid)
}

onMounted(() => {
  scheduleSnap()
  window.addEventListener('resize', scheduleSnap)
  document.fonts?.ready.then(scheduleSnap)
  /*
    Slow is not broken. The scene loads a chunk and then builds; if it has not
    reported by now something is wrong with it rather than slow, and the flat mark
    is better than an empty frame.
  */
  failTimer = window.setTimeout(() => {
    if (!ready.value) failed.value = true
  }, 8000)
})

onUnmounted(() => {
  cancelAnimationFrame(snapFrame)
  cancelAnimationFrame(armFrameA)
  cancelAnimationFrame(armFrameB)
  clearTimeout(armTimer)
  clearTimeout(failTimer)
  window.removeEventListener('resize', scheduleSnap)
})

usePointer((pointer) => {
  const el = stage.value
  if (!el) return

  const rect = el.getBoundingClientRect()

  if (dragging.value) {
    // Both axes, both clamped the same way, so the mark can be thrown up and
    // down as well as left and right.
    spin.value = clamp(startSpin + ((pointer.x - startX) / rect.width) * 3, -MAX_SPIN, MAX_SPIN)
    spinY.value = clamp(startSpinY + ((pointer.y - startY) / rect.height) * 3, -MAX_SPIN_Y, MAX_SPIN_Y)
    return
  }

  if (rect.bottom < 0 || rect.top > window.innerHeight) return // offscreen, skip the work

  // The scene only follows the pointer over the stage. Outside it the tilt goes
  // home and the mark eases back — the box belongs to its frame, not to the page.
  const inside =
    pointer.x >= rect.left &&
    pointer.x <= rect.right &&
    pointer.y >= rect.top &&
    pointer.y <= rect.bottom

  if (!inside) {
    tilt.value = { x: 0, y: 0 }
    return
  }

  tilt.value = {
    x: clamp((pointer.x - (rect.left + rect.width / 2)) / (rect.width / 2)),
    y: clamp((pointer.y - (rect.top + rect.height / 2)) / (rect.height / 2)),
  }
})

function onDown(event) {
  if (!stage.value) return
  // The blind is over the mark: there is nothing to turn yet, and this press
  // belongs to the shutter.
  if (props.shutter && !revealed.value) return
  // A double press puts the view back: the mark straight and the zoom home. It
  // is read here rather than with `dblclick` because the drag captures the
  // pointer, which can keep the native event from landing.
  const now = performance.now()
  if (now - lastDownAt < 320) {
    spin.value = 0
    spinY.value = 0
    resetToken.value += 1
  }
  lastDownAt = now

  dragging.value = true
  startX = event.clientX
  startY = event.clientY
  startSpin = spin.value
  startSpinY = spinY.value
  // Capture so the drag survives leaving the box; the logo keeps up with the
  // pointer instead of stopping at the edge.
  stage.value.setPointerCapture(event.pointerId)
}

function onUp(event) {
  dragging.value = false
  // Clear the drag angles. They are what the next press measures its start from,
  // so leaving the last one in place made the mark jump back to it on a click.
  spin.value = 0
  spinY.value = 0
  if (stage.value?.hasPointerCapture(event.pointerId)) {
    stage.value.releasePointerCapture(event.pointerId)
  }
}

function clamp(value) {
  return Math.max(-1, Math.min(1, value))
}
</script>

<template>
  <div ref="frame" class="frame">
    <div
      ref="stage"
      class="stage"
      @pointerdown="onDown"
      @pointerup="onUp"
      @pointercancel="onUp"
    >
      <!-- The fallback. It paints only if the scene never came up. -->
      <div v-if="failed" class="mark" aria-hidden="true" />

      <div
        v-if="!failed"
        class="scene"
        :class="{ fade: props.entrance === 'fade', shown: ready }"
        aria-hidden="true"
      >
        <Suspense>
          <LogoScene
            :tilt="tilt"
            :spin="spin"
            :spin-y="spinY"
            :dragging="dragging"
            :reset="resetToken"
            :logo="props.logo"
            :halo="props.halo"
            :fog="props.fog"
            @ready="ready = true"
          />
        </Suspense>
      </div>

      <!-- The frame: a slim brushed-metal band over the canvas. -->
      <div class="rim" aria-hidden="true" />
      <div
        v-if="props.ring"
        class="glow"
        :class="{ on: armed }"
        data-motion="decorative"
        aria-hidden="true"
      />

      <!--
        The shutter: a closed metal blind over the stage. It lifts once, on a
        click, and stays up, revealing the room behind it. A real button, so the
        keyboard can open it too. Once it is up it stops taking the pointer and
        the stage's own gestures take the surface back.

        Last in here on purpose: the blind paints over the glow, so the coil it
        leaves at the top stays in front of the lit edge rather than behind it.
      -->
      <button
        v-if="props.shutter"
        class="shutter"
        :class="{ open: revealed }"
        type="button"
        :aria-label="t('a11y.raiseShutter')"
        :aria-hidden="revealed"
        :tabindex="revealed ? -1 : 0"
        @pointerdown="onShutterDown"
        @click="onShutterClick"
      >
        <span class="roll" aria-hidden="true" />
        <span class="slats" aria-hidden="true">
          <span v-for="n in SLATS" :key="n" class="slat">
            <span v-if="n === SLATS" class="handle" />
          </span>
        </span>
      </button>

      <slot />
    </div>
  </div>
</template>

<style scoped>
/* The frame is the stage's box. It used to carry the magnetic pull; it does not
   any more — only the logo moves. */
.frame {
  position: relative;
  aspect-ratio: 1 / 1;
  max-height: min(58vh, 520px);
  justify-self: center;
  width: 100%;
  max-width: 520px;
}

.stage {
  position: relative;
  z-index: 1;
  /*
    border-box, which the project does not set globally on purpose. Here it is
    not a preference: with content-box the 1px border is added to 100% of the
    frame, so the stage came out 2px wider and taller than the box it was
    supposed to fill.
  */
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  border: 1px solid var(--line);
  /*
    Flat, and the page's own background. It is only ever seen while the scene
    builds or if it fails, and the `--surface`-to-`--ink` radial that used to be
    here read as a shadow hanging in the empty slot — and it hid the entrance
    fade, because the room's walls are that same `--surface`.
  */
  background: var(--ink);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: grab;
}

.stage:active {
  cursor: grabbing;
}

/* The 2D logo, masked and painted with the accent token. Only ever seen when the
   scene could not start at all. */
.mark {
  width: 58%;
  aspect-ratio: 1.682;
  background: var(--mark);
  -webkit-mask: url('/assets/img/krub-mark.png') center / contain no-repeat;
  mask: url('/assets/img/krub-mark.png') center / contain no-repeat;
  pointer-events: none;
}

/*
  The shutter: a roller blind of metal slats across the opening, closed until a
  click lifts it. Built in CSS rather than from an image so it can actually roll —
  a picture bakes the slats and the pull into place and cannot lift — and so it is
  drawn in the theme's own greys (`--fg` mixed into `--ink`), the way the frame is.

  It lifts as one piece: the whole stack translates up out of the opening and the
  coil at the top — `.roll` — grows as it goes. Only the stack moves, and the slats
  keep their spacing, so they stay contiguous the way a sheet of metal does.
*/
.shutter {
  position: absolute;
  inset: 12px;
  display: block;
  padding: 0;
  border: 0;
  overflow: hidden;
  background: var(--ink);
  cursor: pointer;
  -webkit-appearance: none;
  appearance: none;
}

/* Up, so the opening belongs to the stage and its gestures again. Transparent at
   once, because the reveal is the stack clearing, not a panel fading. */
.shutter.open {
  pointer-events: none;
  background: transparent;
}

/*
  The guide rails the blind runs inside: dark insets down both sides and across the
  head, nothing at the foot, because that is where the frame's own edge is. They
  hug the stack rather than sitting behind it, so they paint over it — `::after`,
  not `::before` — and they fade out with the reveal, since the rails of a window
  are not what should be seen through once the window is open.
*/
.shutter::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  box-shadow:
    inset 13px 0 11px -9px var(--ink),
    inset -13px 0 11px -9px var(--ink),
    inset 0 11px 11px -9px var(--ink);
  transition: opacity 0.6s ease;
}

.shutter.open::after {
  opacity: 0;
}

.slats {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  transition: transform 1.05s cubic-bezier(0.55, 0, 0.35, 1);
  will-change: transform;
}

.shutter.open .slats {
  transform: translateY(-100%);
}

/*
  A slat: flat sheet metal, side to side, cut flush — no lateral bevel and no
  lateral shadow, because the depth of a roller blind is not in the leaf. The face
  drifts a couple of steps from head to foot and catches one wide reflection lying
  across its middle, which is the brushed aluminium.

  The depth is all in the joint, drawn as three rules: the crisp lit edge of the
  leaf above, the hard shadow that leaf drops three pixels onto this one, and the
  dark recess where this leaf's foot meets the next. A dark groove with a bright
  edge over it is the whole difference from the frame, whose sheen is soft and has
  no joints at all.
*/
.slat {
  position: relative;
  flex: 1 1 0;
  min-height: 0;
  background:
    linear-gradient(
      90deg,
      transparent 0%,
      color-mix(in srgb, var(--fg) 15%, transparent) 18%,
      color-mix(in srgb, var(--fg) 22%, transparent) 50%,
      color-mix(in srgb, var(--fg) 13%, transparent) 82%,
      transparent 100%
    ),
    linear-gradient(
      180deg,
      color-mix(in srgb, var(--fg) 5%, var(--ink)) 0%,
      color-mix(in srgb, var(--fg) 13%, var(--ink)) 48%,
      color-mix(in srgb, var(--fg) 7%, var(--ink)) 100%
    );
  box-shadow:
    inset 0 1px 0 color-mix(in srgb, var(--fg) 55%, var(--ink)),
    inset 0 5px 3px -3px var(--ink),
    inset 0 -1px 0 var(--ink);
}

/*
  The pull, on the bottom slat: a bar in the same greys with a dark line under it,
  so it reads as standing proud of the metal.
*/
.handle {
  position: absolute;
  left: 50%;
  bottom: 7px;
  width: 52px;
  height: 10px;
  transform: translateX(-50%);
  border-radius: 2px;
  background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--fg) 42%, var(--ink)),
    color-mix(in srgb, var(--fg) 12%, var(--ink))
  );
  box-shadow:
    0 1px 0 var(--ink),
    inset 0 -1px 0 color-mix(in srgb, var(--fg) 20%, var(--ink));
}

/*
  The coil: nothing while the blind is closed, a bundle that grows at the head as
  the stack winds onto it. A cylinder of the same metal — light across its middle,
  dark at its top and under its belly — with the edge of every wrap showing as a
  fine line, so it reads as the sheet wound up rather than as a bar left hanging.
  Rounded underside, and a shadow dropped on the metal still down the opening.
*/
.roll {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  height: 0;
  border-radius: 0 0 11px 11px;
  background:
    linear-gradient(
      180deg,
      color-mix(in srgb, var(--ink) 75%, transparent) 0%,
      transparent 32%,
      transparent 60%,
      color-mix(in srgb, var(--ink) 80%, transparent) 100%
    ),
    repeating-linear-gradient(
      180deg,
      color-mix(in srgb, var(--fg) 24%, var(--ink)) 0 1px,
      var(--ink) 1px 3px,
      color-mix(in srgb, var(--fg) 9%, var(--ink)) 3px 7px
    );
  box-shadow: 0 5px 9px -3px color-mix(in srgb, var(--ink) 90%, transparent);
  transition: height 1.05s cubic-bezier(0.55, 0, 0.35, 1);
}

.shutter.open .roll {
  height: 34px;
}

/* Reduced motion keeps the reveal but drops the roll: the blind is simply up. */
@media (prefers-reduced-motion: reduce) {
  .slats,
  .roll {
    transition: none;
  }
}

/*
  The frame: a slim brushed-metal band over the canvas. Opaque, so it masks the
  box's edges — whatever the camera's small lean does to them — and drawn in the
  theme's own greys (`--fg` mixed into `--ink`), a sheen in both themes rather
  than a colour. `border-image` is what lets a border carry the gradient, and the
  slice is the band's own width so the corners take a real piece of it: sliced at
  one pixel the corners were each a single colour stretched over 12px, and the
  brushed streaks stopped dead at the edges.

  No hairline on its inner edge, and no vignette either: the glow's own hard edge
  is the line there, and a dark rule or a soft inset shadow on top of it read as a
  second edge running round the frame. The vignette lasted a while and measured at
  only about 4/255, but it was the shape — a rounded rectangle, brighter at the
  sides than at its corners — that kept reading as a shadow cast into the slot.
*/
.rim {
  position: absolute;
  inset: 0;
  pointer-events: none;
  border: 12px solid transparent;
  border-image: linear-gradient(
      135deg,
      color-mix(in srgb, var(--fg) 30%, var(--ink)) 0%,
      color-mix(in srgb, var(--fg) 3%, var(--ink)) 15%,
      color-mix(in srgb, var(--fg) 26%, var(--ink)) 33%,
      color-mix(in srgb, var(--fg) 2%, var(--ink)) 50%,
      color-mix(in srgb, var(--fg) 24%, var(--ink)) 68%,
      color-mix(in srgb, var(--fg) 4%, var(--ink)) 100%
    )
    12;
}

/*
  The entrance glow, in CSS: an inset shadow inside the frame, hard just past the
  inner edge and falling off inward, so it reads as light coming through the
  opening. No WebGL for this, so it costs nothing. It breathes slowly — opacity
  only, which the compositor handles — and the reduced-motion rule switches it
  off with the rest of the decorative motion.

  The shape is the point: the blur stays tight at the edge, so it reads as a line
  just past the frame rather than a haze. What is tuned is strength, the two
  alphas, like dimming the bulb behind it — and the reach inward, the second
  shadow, is the one that was reading as glare, so it sits far below the edge's.
*/
.glow {
  position: absolute;
  inset: 12px;
  pointer-events: none;
  /*
    Dark until `on`. The strike is paused, which holds its first frame — and its
    first frame is dark — and the base opacity is the belt for when the
    reduced-motion rule has taken the animation away altogether.
  */
  opacity: 0;
  box-shadow:
    inset 0 0 12px 1px color-mix(in srgb, var(--acc-solid) 84%, transparent),
    inset 0 0 90px 20px color-mix(in srgb, var(--acc-solid) 24%, transparent);
  /*
    Two runs, in order: the tube striking, once, then the slow breath. Both are on
    opacity, so the breath waits the strike out with a delay of the strike's own
    length — otherwise it would take over from the first frame and the strike
    would never be seen. The delay is the one thing to keep in step with
    `glowStrike`'s duration below.
  */
  animation:
    glowStrike 2.1s steps(1, end) 1,
    glowBreathe 5.5s ease-in-out 2.1s infinite;
  animation-play-state: paused;
}

.glow.on {
  opacity: 1;
  animation-play-state: running;
}

/*
  The tube coming on: a flick, a pause, two more flicks, then it holds. Stepped,
  so every change snaps instead of fading — that is what reads as neon rather
  than as a dimmer. It opens dark, which is what covers the stretch before the
  scene is up; the reduced-motion rule turns the whole thing off.
*/
@keyframes glowStrike {
  0% {
    opacity: 0;
  }
  8% {
    opacity: 1;
  }
  14% {
    opacity: 0;
  }
  36% {
    opacity: 0;
  }
  44% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
  58% {
    opacity: 1;
  }
  64% {
    opacity: 0;
  }
  80% {
    opacity: 1;
  }
  100% {
    opacity: 1;
  }
}

@keyframes glowBreathe {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.72;
  }
}

/* The scene fills the stage and sits over the fallback. `overflow: hidden` clips
   the canvas to the stage's box, so a square WebGL canvas cannot paint over the
   border. */
.scene {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

/*
  The entrance. The scene builds asynchronously, so without this it pops the
  instant it reports ready. Opacity alone was not enough: the room's walls are the
  same `--surface` as the stage behind them, so the fade had almost nothing to
  fade from. The small scale is what makes it read — the opening eases back into
  the frame — and it goes the right way, from larger to rest, so the box's edges
  stay out of sight behind the frame the whole time.

  Not marked `data-motion="decorative"` on purpose: a crossfade is not the
  continuous movement that setting asks to be rid of, and marking it meant the
  whole entrance disappeared for anyone with it on, leaving the pop it exists to
  avoid. Only the scale is dropped for reduced motion.

  The duration has to agree with FADE_MS in the script, which is what holds the
  glow back until it is done.
*/
.scene.fade {
  opacity: 0;
  transform: scale(1.03);
  transition: opacity 1.8s ease, transform 1.8s ease;
}

.scene.fade.shown {
  opacity: 1;
  transform: scale(1);
}

@media (prefers-reduced-motion: reduce) {
  .scene.fade {
    transform: none;
  }
}
</style>
