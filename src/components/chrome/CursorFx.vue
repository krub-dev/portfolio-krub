<script setup>
/*
  The custom cursor: a solid dot that tracks the mouse exactly, and a ring that
  trails behind it and opens up over anything clickable.

  The trailing is not done in JavaScript. Both elements get the same position
  every frame; the ring simply has a 0.28s transition on `transform`, so the
  browser interpolates its way there while the dot arrives instantly. One line
  of CSS instead of a spring simulation.

  The native cursor is hidden by the [data-hide-cursor] rule in tokens.css,
  which also reaches descendants — links and buttons ship their own
  `cursor: pointer` and would otherwise show the hand.

  Nothing renders on touch or below 900px: usePointer refuses to subscribe
  there, and without the dot moving there would just be an invisible element
  parked at -200,-200.
*/
import { ref } from 'vue'

import { isPointerDevice, usePointer } from '../../composables/usePointer'

const props = defineProps({
  interactiveSelector: {
    type: String,
    default: 'a,button,[role="button"],input,select,textarea,[data-magnetic],[data-interactive]',
  },
})

const enabled = isPointerDevice()
const dot = ref(null)
const ring = ref(null)

// The ring's open/closed state changes rarely, so it is a class toggle rather
// than a style write every frame.
let over = false
let idle = false

usePointer((pointer) => {
  const move = `translate3d(${pointer.x}px, ${pointer.y}px, 0)`
  if (dot.value) dot.value.style.transform = move

  /*
    Gone, not frozen, while the pointer is outside the page. Both elements hide
    together through one class, and only when the state actually changes.
  */
  const away = !pointer.active
  if (away !== idle) {
    idle = away
    dot.value?.classList.toggle('idle', away)
    ring.value?.classList.toggle('idle', away)
  }

  /*
    What is under the cursor? elementFromPoint is a hit test, which is cheap,
    and it answers the question correctly even when the topmost element is a
    child span inside the button — closest() walks back up to the thing that
    actually behaves like a control.
  */
  const el = document.elementFromPoint(pointer.x, pointer.y)
  const hot = Boolean(el?.closest(props.interactiveSelector))

  if (ring.value) {
    ring.value.style.transform = `${move} scale(${hot ? 1 : 0.55})`
    if (hot !== over) {
      ring.value.classList.toggle('hot', hot)
      over = hot
    }
  }
})
</script>

<template>
  <template v-if="enabled">
    <div ref="ring" class="cursor-ring" aria-hidden="true" />
    <div ref="dot" class="cursor-dot" aria-hidden="true" />
  </template>
</template>

<style scoped>
.cursor-dot,
.cursor-ring {
  position: fixed;
  top: 0;
  left: 0;
  pointer-events: none;
  /* Parked offscreen until the first mousemove, so neither flashes at 0,0. */
  transform: translate3d(-200px, -200px, 0);
}

.cursor-dot {
  width: 10px;
  height: 10px;
  margin: -5px 0 0 -5px;
  background: var(--acc);
  border-radius: 50%;
  z-index: 301;
  transition: opacity 0.15s ease;
}

.cursor-ring {
  width: 40px;
  height: 40px;
  margin: -20px 0 0 -20px;
  border: 1.5px solid var(--mark);
  border-radius: 50%;
  z-index: 300;
  opacity: 0;
  transition:
    opacity 0.22s ease,
    transform 0.28s cubic-bezier(0.22, 1, 0.36, 1);
}

.cursor-ring.hot {
  opacity: 1;
}

/* After .hot on purpose: with equal specificity, this is the rule that wins
   while the pointer is outside the page, whatever the ring was over before. */
.cursor-dot.idle,
.cursor-ring.idle {
  opacity: 0;
}

/*
  The v-if decides once, at setup. This is the belt to that braces: resize the
  window across 900px, or switch to a touch device, and the CSS hides the
  cursor even though the component is still mounted. Without it you get a dot
  frozen wherever the mouse last was.
*/
@media (max-width: 900px), (hover: none) {
  .cursor-dot,
  .cursor-ring {
    display: none;
  }
}

/* Someone who asked for less motion does not want a second cursor chasing
   theirs around the page. */
@media (prefers-reduced-motion: reduce) {
  .cursor-dot,
  .cursor-ring {
    display: none;
  }
}
</style>
