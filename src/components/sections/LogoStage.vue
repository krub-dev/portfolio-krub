<script setup>
/*
  The square stage in the hero: the slot for the 3D scene.

  The stage is a still box. The pointer only turns the logo inside it, and that
  happens on the mesh, in the scene — not here with a CSS transform. It reads as
  a solid object being looked at rather than as a card being pulled around, and
  it keeps the frame's border and grid on the section's gutter.

  Two gestures, and they share one value:

  - **Hover** tilts it a little, toward the cursor. `tilt` is the pointer's
    position over the stage, normalised to -1..1 and clamped.
  - **Drag** spins it, and on release it snaps back to the front. `spin` is the
    dragged angle; the magnetic return lives in the scene, where the render loop
    already runs, so it costs no second loop here.

  Both are clamped: past ~70 degrees the word stops being a word.
*/
import { defineAsyncComponent, onUnmounted, ref } from 'vue'

import { usePointer } from '../../composables/usePointer'

/*
  The scene is lazy: TresJS and Three are a chunk of their own, and the stage is
  not mounted below 900px, so a phone never downloads them. See LogoScene.vue.
*/
const LogoScene = defineAsyncComponent(() => import('./LogoScene.vue'))

const MAX_SPIN = 1.2 // radians, about 70 degrees each way

const stage = ref(null)
const tilt = ref({ x: 0, y: 0 })
const spin = ref(0)
const dragging = ref(false)

let startX = 0
let startSpin = 0

usePointer((pointer) => {
  const el = stage.value
  if (!el) return

  const rect = el.getBoundingClientRect()

  if (dragging.value) {
    // A full width of travel is a bit more than the clamp, so the limit is felt
    // rather than hit at the edges of the box.
    spin.value = clamp(startSpin + ((pointer.x - startX) / rect.width) * 3.2, -MAX_SPIN, MAX_SPIN)
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

onUnmounted(() => (dragging.value = false))
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
      <div class="scene" aria-hidden="true">
        <Suspense>
          <LogoScene :tilt="tilt" :spin="spin" :dragging="dragging" />
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

/* The scene fills the stage. The logo inside it is the extruded 3D mesh. */
.scene {
  position: absolute;
  inset: 0;
}
</style>
