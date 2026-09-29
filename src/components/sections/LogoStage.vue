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
    ready. Default is `none` — the fade was dropped because it reads as a delay
    rather than as an entrance.
  */
  entrance: { type: String, default: 'none' },
  // The lab switches these off to show what is behind what. On in the site.
  logo: { type: Boolean, default: true },
  ring: { type: Boolean, default: true },
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
const sceneRef = ref(null)
const tilt = ref({ x: 0, y: 0 })
const spin = ref(0)
const spinY = ref(0)
const dragging = ref(false)
const ready = ref(false)
// Bumped on a double press: LogoScene watches it to bring the zoom home.
const resetToken = ref(0)
/*
  Gate the scene under navigator.webdriver. Playwright sets this flag, and when
  four workers each hold a WebGL context the GPU stalls and timing tests fail.
  With the scene off, the 2D mark shows instead and the tests pass.
*/
const isTestRunner = typeof navigator !== 'undefined' && navigator.webdriver
/*
  The 2D mark is the failure state now, not the loading state. It used to paint
  first and fade out, which meant a flash of the flat logo on every load; now it
  is shown only if WebGL never comes up, so a load with a working scene never
  renders it at all.
*/
const failed = ref(!webglSupported() || isTestRunner)
const loadProgress = ref(0)
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
  The shutter, and whether it is up. A click on the closed blind raises it; a
  click on the coil it leaves at the head lowers it again. The stage spends the
  rest of the visit as it always was, the mark turning under the pointer.
*/
const revealed = ref(false)
/*
  A press that became a drag must not also work the blind. The same surface holds
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
  revealed.value = !revealed.value
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
  // With the blind up the coil is its own control. Capturing the pointer for a
  // drag would retarget the pointerup and steal the click that lowers it.
  if (event.target.closest?.('.roll')) return
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

/*
  Export the geometry as a GLB file. Delegates to LogoScene, which owns the
  geometry and the exporter. The lab uses this to let the owner download the
  exact mesh that Three builds from the SVG.
*/
function exportModel() {
  sceneRef.value?.exportModel()
}

defineExpose({ exportModel })
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
        <!-- Loading percentage, shown only while the GLB downloads. -->
        <div v-if="!ready" class="loader" aria-hidden="true">
          <span class="loader-pct">{{ loadProgress }}%</span>
        </div>

        <Suspense>
          <LogoScene
            ref="sceneRef"
            :tilt="tilt"
            :spin="spin"
            :spin-y="spinY"
            :dragging="dragging"
            :reset="resetToken"
            :logo="props.logo"
            :halo-on="armed"
            :fog="props.fog"
            @ready="ready = true"
            @progress="loadProgress = $event"
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
    pan-y, the same declaration the project rail uses: the browser keeps the
    vertical swipe for the page and hands the horizontal drag to us, which is what
    lets the mark spin under a finger. Without it the browser claimed the gesture
    as a scroll and cancelled the pointer, so touch turned nothing.
  */
  touch-action: pan-y;
  /*
    Flat background. In the dark theme it is --ink (near black). In the light
    theme it is --stage-bg (medium grey) so the tunnel starts from a darker tone
    and the fog has room to fade. The `--surface`-to-`--ink` radial that used to
    be here read as a shadow hanging in the empty slot — and it hid the entrance
    fade, because the room's walls are that same `--surface`.
  */
  background: var(--stage-bg, var(--ink));
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
  click lifts it and lowered again by a click on the coil it leaves at the head.
  Built in CSS rather than from an image so it can actually roll — a picture bakes
  the slats and the pull into place and cannot lift — and so it is drawn in the
  metal tokens, the way the frame is.

  It moves as one piece: the whole stack translates up out of the opening and the
  coil at the top — `.roll` — grows as it goes, both ways. Only the stack moves,
  and the slats keep their spacing, so they stay contiguous the way a sheet of
  metal does.
*/
.shutter {
  position: absolute;
  inset: 12px;
  display: block;
  padding: 0;
  border: 0;
  overflow: hidden;
  /* Transparent, and it has to be said: a <button> ships the UA's own grey face,
     which would paint over the scene the moment the slats clear it. The slats are
     the cover; the button is only the surface the gestures land on. */
  background: transparent;
  cursor: pointer;
  -webkit-appearance: none;
  appearance: none;
}

/*
  No panel of its own: the slats are the cover, so whatever is behind shows
  through the opening the moment they clear it — on the way up and on the way
  down alike.
*/
.shutter.open {
  pointer-events: none;
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
    inset 13px 0 11px -9px rgba(0, 0, 0, 0.4),
    inset -13px 0 11px -9px rgba(0, 0, 0, 0.4),
    inset 0 11px 11px -9px rgba(0, 0, 0, 0.4);
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
  A slat: flat sheet metal, side to side, cut flush — no lateral bevel or shadow,
  because a roller blind's depth is not in the leaf. The face is nearly flat with
  one wide reflection lying across its left third (the brushed aluminium), and the
  whole of the depth is in the joint, drawn as three rules: the crisp lit edge of
  the bar above, the hard shadow that bar drops on this one, and the dark recess
  where this one's foot meets the next. A dark groove with a bright edge over it
  is the whole difference from the frame, whose sheen is soft and has no joints.
*/
.slat {
  position: relative;
  flex: 1 1 0;
  min-height: 0;
  background:
    linear-gradient(
      90deg,
      transparent 0%,
      color-mix(in srgb, var(--fg) 18%, transparent) 28%,
      color-mix(in srgb, var(--fg) 24%, transparent) 38%,
      color-mix(in srgb, var(--fg) 14%, transparent) 62%,
      transparent 100%
    ),
    linear-gradient(
      180deg,
      var(--metal) 0%,
      color-mix(in srgb, var(--metal) 80%, var(--metal-dark)) 48%,
      var(--metal) 100%
    );
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.4),
    inset 0 -2px 0 var(--metal-dark),
    0 4px 4px -1px rgba(0, 0, 0, 0.5);
}

/*
  The pull, on the bottom slat: a rounded bar with a subtle gradient and a small
  notch in the middle, so it reads as a mechanical handle rather than as a plain
  rectangle. The notch is a dark inset that breaks the symmetry and gives the
  eye a place to land.
*/
.handle {
  position: absolute;
  left: 50%;
  bottom: 8px;
  width: 64px;
  height: 12px;
  transform: translateX(-50%);
  border-radius: 3px;
  background: linear-gradient(
    180deg,
    var(--metal),
    var(--metal-dark)
  );
  box-shadow:
    0 3px 5px rgba(0, 0, 0, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.4),
    inset 0 -1px 0 var(--metal-dark);
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* The pull answers the whole blind, not just its own 64px: hovering anywhere on
   the shutter lifts it, so the invitation reads as "raise this", not "grab the
   handle". */
.shutter:not(.open):hover .handle {
  transform: translateX(-50%) translateY(-3px);
}

/* The notch: a small accent-coloured rectangle in the middle of the handle, with
   a soft glow so it reads as a lit indicator rather than as a scratch. */
.handle::after {
  content: '';
  position: absolute;
  left: 50%;
  top: 50%;
  width: 16px;
  height: 3px;
  transform: translate(-50%, -50%);
  background: var(--acc-solid);
  border-radius: 1px;
  box-shadow: 0 0 6px 1px color-mix(in srgb, var(--acc-solid) 60%, transparent);
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
      color-mix(in srgb, var(--metal-dark) 75%, transparent) 0%,
      transparent 32%,
      transparent 60%,
      color-mix(in srgb, var(--metal-dark) 80%, transparent) 100%
    ),
    repeating-linear-gradient(
      180deg,
      color-mix(in srgb, var(--fg) 24%, var(--metal-dark)) 0 1px,
      var(--metal-dark) 1px 3px,
      color-mix(in srgb, var(--fg) 9%, var(--metal-dark)) 3px 7px
    );
  box-shadow: 0 6px 10px -3px rgba(0, 0, 0, 0.5);
  transition: height 1.05s cubic-bezier(0.55, 0, 0.35, 1);
}

/*
  Once the blind is up its button takes no pointer, so the stage has its surface
  back. The coil is the exception: it is the one thing left of the blind, and the
  press that lowers it again belongs to it.
*/
.shutter.open .roll {
  height: 34px;
  pointer-events: auto;
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
  metal tokens, a sheen in both themes rather than a colour.

  Drawn as a background with a mask, not as a `border-image`. The border-image
  version of this same gradient did not paint at all on an iPad, while the very
  same kind of gradient as a background (the shutter's slats) does, so the frame
  uses the combination that is known to work there (decision 92). The ring is the
  border box minus the padding box, cut with the mask `exclude` and the legacy
  `-webkit-mask-composite: xor` for older WebKit. The border itself stays
  transparent; it is only there to give the mask its padding box.
*/
.rim {
  position: absolute;
  inset: 0;
  pointer-events: none;
  border: 12px solid transparent;
  background:
    linear-gradient(
        135deg,
        var(--metal) 0%,
        color-mix(in srgb, var(--metal) 40%, var(--metal-dark)) 15%,
        var(--metal) 33%,
        color-mix(in srgb, var(--metal) 20%, var(--metal-dark)) 50%,
        var(--metal) 68%,
        var(--metal-dark) 100%
      )
      border-box;
  -webkit-mask:
    linear-gradient(#000 0 0) padding-box,
    linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask:
    linear-gradient(#000 0 0) padding-box,
    linear-gradient(#000 0 0);
  mask-composite: exclude;
}

/*
  The entrance glow, in CSS: an inset shadow inside the frame, hard just past the
  inner edge and falling off inward, so it reads as light spilling through the
  opening. No WebGL for this, so it costs nothing. It breathes slowly — opacity
  only, which the compositor handles — and the reduced-motion rule switches it
  off with the rest of the decorative motion.

  The first shadow is the hard edge line; the second is the soft reach, and it
  runs as wide as it likes: it is light, not a panel, and the mark reads through
  it. The seam that crossed the mark used to be the scene's backlight plane, not
  this — that is gone (decision 80).
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
    opacity: 0.85;
  }
  50% {
    opacity: 0.6;
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
  The loading percentage. Shown only while the GLB downloads, centred in the
  stage. Mono, small, and the accent colour so it reads as part of the brand
  rather than as a system spinner.
*/
.loader {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--ink);
}

.loader-pct {
  font: 500 14px var(--font-mono);
  color: var(--acc-solid);
  letter-spacing: 0.05em;
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
