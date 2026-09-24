<script setup>
/*
  The square stage in the hero, with the logo tilting in 3D as the mouse moves
  and a glow turning around its edge.

  The stage is empty apart from the logo on purpose: it is the reserved slot
  for a future 3D scene, and it carries no explanatory text.

  The tilt maps the cursor's distance from the stage centre onto rotation:
  -1 to 1 across each axis, times 14deg horizontally and 10deg vertically. The
  vertical one is inverted because rotateX tips the top toward you as the value
  grows, and the logo should lean toward the cursor, not away from it.

  perspective() has to come first in the transform list — it establishes the
  projection that the rotations are then read through. Written after them it
  applies to nothing.

  Only the logo tilts. The stage itself gets the magnetic pull instead, via
  data-magnetic, so the two effects do not fight over the same transform — and
  the pull is on the frame rather than on the stage, so the glow travels with
  it instead of being left behind.
*/
import { defineAsyncComponent, ref } from 'vue'

import { usePointer } from '../../composables/usePointer'

/*
  The scene is lazy: TresJS and Three are a chunk of their own, and the stage is
  not mounted below 900px, so a phone never downloads them. See LogoScene.vue.
*/
const LogoScene = defineAsyncComponent(() => import('./LogoScene.vue'))

const MAX_Y = 14 // degrees, left/right
const MAX_X = 10 // degrees, up/down

const stage = ref(null)
const mark = ref(null)

usePointer((pointer) => {
  if (!stage.value || !mark.value) return

  const rect = stage.value.getBoundingClientRect()
  if (rect.bottom < 0 || rect.top > window.innerHeight) return // offscreen, skip the work

  // -1 at the left/top edge, 0 at the centre, 1 at the right/bottom edge.
  // Clamped so the tilt stops growing once the cursor leaves the stage.
  const nx = clamp((pointer.x - (rect.left + rect.width / 2)) / (rect.width / 2))
  const ny = clamp((pointer.y - (rect.top + rect.height / 2)) / (rect.height / 2))

  mark.value.style.transform = `perspective(700px) rotateY(${(nx * MAX_Y).toFixed(2)}deg) rotateX(${(-ny * MAX_X).toFixed(2)}deg)`
})

function clamp(value) {
  return Math.max(-1, Math.min(1, value))
}
</script>

<template>
  <div class="frame" data-magnetic>
    <div ref="stage" class="stage">
      <div class="grid" aria-hidden="true" />
      <div ref="mark" class="scene" aria-hidden="true">
        <Suspense>
          <LogoScene />
        </Suspense>
      </div>
      <slot />
    </div>
  </div>
</template>

<style scoped>
/*
  The frame holds the magnetic pull, so the pull moves the whole stage rather
  than the logo inside it. The turning glow that used to live here (a conic
  gradient on two pseudo-elements) is gone: it read as decoration rather than as
  light, and it competed with the logo it was meant to frame.
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

/*
  The scene fills the stage. It replaces the old masked `.mark` image: the logo
  is the extruded 3D mesh now. The tilt that follows the pointer still lands
  here, on the wrapper, so the whole logo leans as one piece.
*/
.scene {
  position: absolute;
  inset: 0;
  transition: transform 0.12s linear;
}

@media (prefers-reduced-motion: reduce) {
  .scene {
    transition: none;
  }
}
</style>
