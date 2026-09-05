<script setup>
/*
  The square stage in the hero, with the logo tilting in 3D as the mouse moves.

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
  data-magnetic, so the two effects do not fight over the same transform.
*/
import { ref } from 'vue'

import { usePointer } from '../../composables/usePointer'

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
  <div ref="stage" class="stage" data-magnetic>
    <div class="grid" aria-hidden="true" />
    <div ref="mark" class="mark" aria-hidden="true" />
    <slot />
  </div>
</template>

<style scoped>
.stage {
  position: relative;
  aspect-ratio: 1 / 1;
  max-height: min(58vh, 520px);
  justify-self: center;
  width: 100%;
  max-width: 520px;
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

.mark {
  width: 58%;
  aspect-ratio: 1.682;
  background: var(--mark);
  -webkit-mask: url('/assets/img/krub-mark.png') center / contain no-repeat;
  mask: url('/assets/img/krub-mark.png') center / contain no-repeat;
  /* Short and linear: the position is already updated every frame, so an
     easing curve here would only add lag. */
  transition: transform 0.12s linear;
}

@media (prefers-reduced-motion: reduce) {
  .mark {
    transition: none;
  }
}
</style>
