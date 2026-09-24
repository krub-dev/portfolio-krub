<script setup>
/*
  The square stage in the hero: the reserved slot for the 3D scene, and it
  carries no explanatory text on purpose.

  The stage is a still box. The pointer only turns the logo inside it, and that
  happens in the scene, on the mesh — not here with a CSS transform. It reads as
  a solid object being looked at rather than as a card being pulled around, and
  it keeps the frame's border and grid from drifting off the section's gutter.

  `tilt` is the cursor's position over the stage, normalised to -1..1 and
  clamped, so the turn stops growing once the pointer leaves the box.
*/
import { defineAsyncComponent, ref } from 'vue'

import { usePointer } from '../../composables/usePointer'

/*
  The scene is lazy: TresJS and Three are a chunk of their own, and the stage is
  not mounted below 900px, so a phone never downloads them. See LogoScene.vue.
*/
const LogoScene = defineAsyncComponent(() => import('./LogoScene.vue'))

const stage = ref(null)
const tilt = ref({ x: 0, y: 0 })

usePointer((pointer) => {
  const el = stage.value
  if (!el) return

  const rect = el.getBoundingClientRect()
  if (rect.bottom < 0 || rect.top > window.innerHeight) return // offscreen, skip the work

  tilt.value = {
    x: clamp((pointer.x - (rect.left + rect.width / 2)) / (rect.width / 2)),
    y: clamp((pointer.y - (rect.top + rect.height / 2)) / (rect.height / 2)),
  }
})

function clamp(value) {
  return Math.max(-1, Math.min(1, value))
}
</script>

<template>
  <div class="frame">
    <div ref="stage" class="stage">
      <div class="grid" aria-hidden="true" />
      <div class="scene" aria-hidden="true">
        <Suspense>
          <LogoScene :tilt="tilt" />
        </Suspense>
      </div>
      <slot />
    </div>
  </div>
</template>

<style scoped>
/*
  The frame is the stage's box. It used to carry the magnetic pull; it does not
  any more — only the logo moves. The turning glow that lived here (a conic
  gradient on two pseudo-elements) is gone too.
*/
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
  /* Above the glow, which is behind it by design. */
  z-index: 1;
  /*
    border-box, which the project does not set globally on purpose (the spec's
    measurements were taken content-box). Here it is not a preference: with
    content-box the 1px border is added to 100% of the frame, so the stage came
    out 2px wider and taller than the box it was supposed to fill, pushed out of
    centre, and its overflow covered the glow on the right and bottom edges —
    which is exactly what it looked like.
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
