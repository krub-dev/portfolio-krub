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
import { defineAsyncComponent, onMounted, onUnmounted, ref } from 'vue'

import { usePointer } from '../../composables/usePointer'

/*
  The scene is lazy: TresJS and Three are a chunk of their own, and the stage is
  not mounted below 900px, so a phone never downloads them. See LogoScene.vue.
*/
const LogoScene = defineAsyncComponent(() => import('./LogoScene.vue'))

const MAX_SPIN = 1.1 // radians, about 63 degrees each way, horizontally
const MAX_SPIN_Y = 0.45 // and much less vertically: tipping it up and down reads heavier
// The page's background grid. The box is sized and placed on whole cells of it.
const GRID = 72
const MAX_CELLS = 7

const frame = ref(null)
const stage = ref(null)
const tilt = ref({ x: 0, y: 0 })
const spin = ref(0)
const spinY = ref(0)
const dragging = ref(false)
const ready = ref(false)

let startX = 0
let startY = 0
let startSpin = 0
let startSpinY = 0
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
  if (!el) return

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
})

onUnmounted(() => {
  cancelAnimationFrame(snapFrame)
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
      <!-- The fallback, under the scene. It fades out once the scene is ready. -->
      <div class="mark" :class="{ gone: ready }" aria-hidden="true" />

      <div class="scene" aria-hidden="true">
        <Suspense>
          <LogoScene
            :tilt="tilt"
            :spin="spin"
            :spin-y="spinY"
            :dragging="dragging"
            @ready="ready = true"
          />
        </Suspense>
      </div>

      <!-- The frame, over the canvas and under the slot. -->
      <div class="rim" aria-hidden="true" />

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
  background: radial-gradient(80% 80% at 50% 40%, var(--surface) 0%, var(--ink) 100%);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: grab;
}

.stage:active {
  cursor: grabbing;
}

/* The 2D logo, masked and painted with the accent token. The fallback, and the
   thing that paints first. */
.mark {
  width: 58%;
  aspect-ratio: 1.682;
  background: var(--mark);
  -webkit-mask: url('/assets/img/krub-mark.png') center / contain no-repeat;
  mask: url('/assets/img/krub-mark.png') center / contain no-repeat;
  /* It is decoration, never a hit target, and it must not sit over the scene
     once faded. */
  pointer-events: none;
  transition: opacity 0.4s ease;
}

/* The crossfade: the flat mark gives way to the scene. */
.mark.gone {
  opacity: 0;
}

/*
  The frame. Square, on the page's grid like the box, and drawn over the canvas so
  the box's own edges are covered: whatever the camera's lean does to them, the
  eye reads the frame and not the seam.

  It is metal, out of the theme's own greys — `--fg` mixed into `--ink` in bands —
  so it is a brushed sheen in both themes rather than a colour of its own.
  `border-image` is what lets a border carry the gradient. The 24px width has to
  cover the box's lean (about eleven pixels) with room to spare.
*/
.rim {
  position: absolute;
  inset: 0;
  pointer-events: none;
  border: 24px solid var(--ink);
  border-image: linear-gradient(
      135deg,
      color-mix(in srgb, var(--fg) 22%, var(--ink)) 0%,
      color-mix(in srgb, var(--fg) 6%, var(--ink)) 15%,
      color-mix(in srgb, var(--fg) 18%, var(--ink)) 32%,
      color-mix(in srgb, var(--fg) 5%, var(--ink)) 50%,
      color-mix(in srgb, var(--fg) 16%, var(--ink)) 68%,
      color-mix(in srgb, var(--fg) 7%, var(--ink)) 100%
    )
    1;
  box-shadow: inset 0 0 0 1px var(--line);
}

/*
  A ridge over the metal. The browser's own `border-style: ridge` draws a raised
  bevel from a single colour, so a translucent one laid over the band reads as a
  lip without burying the brushed gradient underneath.
*/
.rim::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  border: 24px ridge color-mix(in srgb, var(--fg) 22%, transparent);
}

/* The scene fills the stage and sits over the fallback. `overflow: hidden` clips
   the canvas to the stage's box, so a square WebGL canvas cannot paint over the
   border. */
.scene {
  position: absolute;
  inset: 0;
  overflow: hidden;
}
</style>
