<script setup>
/*
  The 72px cell of the background grid under the pointer, outlined in the accent.

  A fixed element of its own rather than a child of BackgroundGrid. The hero grid
  is absolute and scrolls away, so a cell inside it would drift off the cursor the
  moment the page moved; fixed to the viewport it is always the cell the pointer
  is really over, whichever of the two grids is showing.

  It rides usePointer, the app's single rAF loop — no listener of its own. The
  position is snapped with Math.floor rather than eased between cells, so it
  reads as part of the grid and not as a second cursor. An outline and not a fill:
  the cell should be the grid lighting up, not a tile laid on top of it.

  `masked` mirrors the global grid's own mask once the hero is behind you: the
  grid fades out toward the bottom of the viewport, and a cell still glowing down
  there would be a light with nothing under it.

  On touch there is no cursor, so the cell follows the finger instead: it lights
  where you tap and stays, and a scroll clears it. Staying is deliberate — a cell
  that fades on a timer reads as a glitch, and on a phone the tap is the only way
  to light it at all. Clearing on scroll is what stops it being left behind,
  marked, while the page moves under it.
*/
import { onMounted, onUnmounted, ref } from 'vue'

import { isPointerDevice, usePointer } from '../../composables/usePointer'

// The grid's own step. Design spec 3.12; keep in sync with BackgroundGrid's size.
const SIZE = 72

defineProps({
  masked: { type: Boolean, default: false },
})

const enabled = isPointerDevice()
const cell = ref(null)
let idle = false

function place(x, y) {
  if (cell.value) cell.value.style.transform = `translate(${x}px, ${y}px)`
}

if (enabled) {
  usePointer((pointer) => {
    if (!cell.value) return

    place(
      Math.floor(pointer.x / SIZE) * SIZE,
      Math.floor(pointer.y / SIZE) * SIZE,
    )

    /*
      Only the state machine touches `idle` here. Removing the class on every
      frame and re-adding it on the change would strip it one frame after the
      pointer goes: the flag is already true, so the guard would not put it back.
    */
    const away = !pointer.active
    if (away !== idle) {
      idle = away
      cell.value.classList.toggle('idle', away)
    }
  })
}

function onTap(event) {
  if (!cell.value) return
  place(
    Math.floor(event.clientX / SIZE) * SIZE,
    Math.floor(event.clientY / SIZE) * SIZE,
  )
  cell.value.classList.remove('idle')
}

function onScroll() {
  cell.value?.classList.add('idle')
}

onMounted(() => {
  if (enabled) return
  window.addEventListener('pointerdown', onTap, { passive: true })
  window.addEventListener('scroll', onScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('pointerdown', onTap)
  window.removeEventListener('scroll', onScroll)
})
</script>

<template>
  <div class="grid-cell-field" :class="{ masked }" aria-hidden="true">
    <div ref="cell" class="grid-cell" />
  </div>
</template>

<style scoped>
.grid-cell-field {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}

/* The same mask the global grid carries, and the #000 stops are alpha, not a
   colour — see BackgroundGrid.vue. */
.masked {
  -webkit-mask: linear-gradient(#000 0%, #000 15%, transparent 65%);
  mask: linear-gradient(#000 0%, #000 15%, transparent 65%);
}

.grid-cell {
  position: absolute;
  top: 0;
  left: 0;
  box-sizing: border-box;
  width: 72px;
  height: 72px;
  border: 1px solid var(--acc);
  opacity: 0.45;
  transition: opacity 0.15s ease;
  /* Off-screen until the first mousemove: the shared pointer starts at -200,-200,
     and on a touch device usePointer never subscribes at all. */
  transform: translate(-200px, -200px);
}

.grid-cell.idle {
  opacity: 0;
}

/*
  On touch it sits back. With no cursor the cell is not a pointer, it is a mark
  left on the paper, and it stays until the next scroll — at the pointer's own
  weight it shouted over a grid whose lines are about 4% white.
*/
@media (hover: none) {
  .grid-cell {
    opacity: 0.22;
  }
}
</style>
