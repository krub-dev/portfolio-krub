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

const MAX_SPIN = 1.1 // radians, about 63 degrees each way
// The page's background grid. The box is sized and placed on whole cells of it.
const GRID = 72

const frame = ref(null)
const stage = ref(null)
const tilt = ref({ x: 0, y: 0 })
const spin = ref(0)
const dragging = ref(false)
const ready = ref(false)

let startX = 0
let startSpin = 0
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
  el.style.transform = ''

  const natural = el.getBoundingClientRect().width
  const limit = Math.min(natural, 520, window.innerHeight * 0.58)
  const cells = Math.max(1, Math.floor(limit / GRID))
  const size = cells * GRID
  el.style.width = `${size}px`
  el.style.height = `${size}px`

  const rect = el.getBoundingClientRect()
  const left = rect.left + window.scrollX
  const top = rect.top + window.scrollY
  const targetLeft = Math.ceil(left / GRID) * GRID
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
    // A full width of travel is a bit more than the clamp, so the limit is felt
    // before the pointer reaches the edge of the box.
    spin.value = clamp(startSpin + ((pointer.x - startX) / rect.width) * 3, -MAX_SPIN, MAX_SPIN)
    return
  }

  if (rect.bottom < 0 || rect.top > window.innerHeight) return // offscreen, skip the work

  tilt.value = {
    x: clamp((pointer.x - (rect.left + rect.width / 2)) / (rect.width / 2)),
    y: clamp((pointer.y - (rect.top + rect.height / 2)) / (rect.height / 2)),
  }
})

function onDown(event) {
  if (!stage.value) return
  dragging.value = true
  startX = event.clientX
  startSpin = spin.value
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
            :dragging="dragging"
            @ready="ready = true"
          />
        </Suspense>
      </div>

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
  The scene fills the stage and sits over the fallback. `overflow: hidden` clips
  the canvas to the stage's box, so a square WebGL canvas cannot paint over the
  border.
*/
.scene {
  position: absolute;
  inset: 0;
  overflow: hidden;
}
</style>
