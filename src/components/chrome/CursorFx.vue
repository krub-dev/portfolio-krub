<script setup>
/*
  The custom cursor: a solid dot that tracks the mouse exactly, a ring that
  trails behind it and opens up over anything clickable, and — over the blind or
  the mark — a hint glyph that trails the ring in turn.

  The trailing is not done in JavaScript. Every element gets the same position
  every frame; each simply carries a slightly longer transition on `transform`
  than the one before it, so the browser interpolates its way there while the dot
  arrives instantly. One line of CSS per link of the chain, no spring simulation:
  the dot leads, the ring follows at 0.28s, the arrow at 0.32s — a hair behind, a
  hint of inertia rather than a lag you watch.

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
const hintBox = ref(null)

// These change rarely, so they are class toggles rather than per-frame style writes.
let over = false
let idle = false
let lastHint = null

usePointer((pointer) => {
  const move = `translate3d(${pointer.x}px, ${pointer.y}px, 0)`
  if (dot.value) dot.value.style.transform = move
  if (hintBox.value) hintBox.value.style.transform = move

  /*
    Gone, not frozen, while the pointer is outside the page. Every element hides
    together through one class, and only when the state actually changes.
  */
  const away = !pointer.active
  if (away !== idle) {
    idle = away
    dot.value?.classList.toggle('idle', away)
    ring.value?.classList.toggle('idle', away)
    hintBox.value?.classList.toggle('idle', away)
  }

  /*
    What is under the cursor? elementFromPoint is a hit test, which is cheap,
    and it answers the question correctly even when the topmost element is a
    child span inside the button — closest() walks back up to the thing that
    actually behaves like a control.
  */
  const el = document.elementFromPoint(pointer.x, pointer.y)
  const hot = Boolean(el?.closest(props.interactiveSelector))
  /*
    Over the blind or the stage the cursor becomes the hint and nothing else:
    the dot steps aside and a glyph stands in — up while the blind is closed,
    down once the coil is the thing left to press, and the turn gesture once the
    blind is up and the mark is what the drag grabs. The coil is checked before
    the stage because it lives inside it.
  */
  const hint = el?.closest('.shutter:not(.open)')
    ? 'up'
    : el?.closest('.shutter.open .roll')
      ? 'down'
      : el?.closest('.stage')
        ? 'rotate'
        : null

  if (ring.value) {
    ring.value.style.transform = `${move} scale(${hot ? 1 : 0.55})`
    if (hot !== over) {
      ring.value.classList.toggle('hot', hot)
      over = hot
    }
  }

  if (hint !== lastHint) {
    lastHint = hint
    hintBox.value?.classList.toggle('hint', hint !== null)
    hintBox.value?.classList.toggle('down', hint === 'down')
    hintBox.value?.classList.toggle('rotate', hint === 'rotate')
    dot.value?.classList.toggle('hint', hint !== null)
  }
})
</script>

<template>
  <template v-if="enabled">
    <div ref="ring" class="cursor-ring" aria-hidden="true" />
    <div ref="hintBox" class="cursor-hint-wrap" aria-hidden="true">
      <span class="cursor-hint" />
    </div>
    <div ref="dot" class="cursor-dot" aria-hidden="true" />
  </template>
</template>

<style scoped>
.cursor-dot,
.cursor-ring,
.cursor-hint-wrap {
  position: fixed;
  top: 0;
  left: 0;
  pointer-events: none;
  /* Parked offscreen until the first mousemove, so nothing flashes at 0,0. */
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

/*
  The arrow's own box: same size and centring as the ring, so it sits inside it
  at rest, but a hair slower — the same chase the ring runs on the dot, one link
  further along and barely there.
*/
.cursor-hint-wrap {
  width: 40px;
  height: 40px;
  margin: -20px 0 0 -20px;
  z-index: 300;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.32s cubic-bezier(0.22, 1, 0.36, 1);
}

.cursor-hint {
  font: 700 18px var(--font-mono);
  color: var(--mark);
  opacity: 0;
  /* Tucked back and small; it swings out whenever the hint arrives. Same
     entrance whichever it is, so only the glyph says what it wants. */
  transform: translateY(4px) scale(0.4);
  transition:
    opacity 0.18s ease,
    transform 0.25s cubic-bezier(0.22, 1, 0.36, 1);
  line-height: 1;
}

.cursor-hint::before {
  content: '↑';
}

.cursor-hint-wrap.hint .cursor-hint {
  opacity: 1;
  transform: translateY(0) scale(1);
}

/* The coil only goes down. */
.cursor-hint-wrap.down .cursor-hint::before {
  content: '↓';
}

/* The mark takes a drag: side to side, the axis with the room to give. */
.cursor-hint-wrap.rotate .cursor-hint::before {
  content: '↔';
}

/* Over the blind or the stage the dot steps aside so the glyph is the only
   thing there. */
.cursor-dot.hint {
  opacity: 0;
}

/* After .hot on purpose: with equal specificity, this is the rule that wins
   while the pointer is outside the page, whatever the ring was over before. */
.cursor-dot.idle,
.cursor-ring.idle,
.cursor-hint-wrap.idle {
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
  .cursor-ring,
  .cursor-hint-wrap {
    display: none;
  }
}

/* Someone who asked for less motion does not want a second cursor chasing
   theirs around the page. */
@media (prefers-reduced-motion: reduce) {
  .cursor-dot,
  .cursor-ring,
  .cursor-hint-wrap {
    display: none;
  }
}
</style>
