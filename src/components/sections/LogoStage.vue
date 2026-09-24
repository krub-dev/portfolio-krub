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

  **The 2D mark is the fallback.** It paints first and is only hidden once the
  scene says it is ready, so a browser without WebGL, a failed fetch or a
  rejected shader all leave the visitor with the logo rather than with an empty
  box. The scene reports readiness; this decides what to do with it.
*/
import { defineAsyncComponent, ref } from 'vue'

import { usePointer } from '../../composables/usePointer'

/*
  The scene is lazy: TresJS and Three are a chunk of their own, and the stage is
  not mounted below 900px, so a phone never downloads them. See LogoScene.vue.
*/
const LogoScene = defineAsyncComponent(() => import('./LogoScene.vue'))

const MAX_SPIN = 1.1 // radians, about 63 degrees each way

const stage = ref(null)
const tilt = ref({ x: 0, y: 0 })
const spin = ref(0)
const dragging = ref(false)
const ready = ref(false)

let startX = 0
let startSpin = 0

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
  // The material chooser is a control, not part of the object: a press on it
  // must not start a drag, or the capture swallows the button's own click.
  if (event.target.closest('.materials')) return
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
  <div class="frame">
    <div
      ref="stage"
      class="stage"
      @pointerdown="onDown"
      @pointerup="onUp"
      @pointercancel="onUp"
    >
      <div class="grid" aria-hidden="true" />

      <!-- The fallback, under the scene. It goes when the scene is ready. -->
      <div v-show="!ready" class="mark" aria-hidden="true" />

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
  border-radius: 24px;
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

/* 40px inside the stage, not the 72px of the page background: the page grid at
   full size reads as noise inside a 520px box. */
.grid {
  position: absolute;
  inset: 0;
  background-image: linear-gradient(var(--grid) 1px, transparent 1px),
    linear-gradient(90deg, var(--grid) 1px, transparent 1px);
  background-size: 40px 40px;
}

/* The 2D logo, masked and painted with the accent token. The fallback, and the
   thing that paints first. */
.mark {
  width: 58%;
  aspect-ratio: 1.682;
  background: var(--mark);
  -webkit-mask: url('/assets/img/krub-mark.png') center / contain no-repeat;
  mask: url('/assets/img/krub-mark.png') center / contain no-repeat;
}

/* The scene fills the stage and sits over the fallback. */
.scene {
  position: absolute;
  inset: 0;
}
</style>
