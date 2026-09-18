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
*/
import { ref } from 'vue'

import { usePointer } from '../../composables/usePointer'

// The grid's own step. Design spec 3.12; keep in sync with BackgroundGrid's size.
const SIZE = 72

defineProps({
  masked: { type: Boolean, default: false },
})

const cell = ref(null)
let idle = false

usePointer((pointer) => {
  if (!cell.value) return

  const x = Math.floor(pointer.x / SIZE) * SIZE
  const y = Math.floor(pointer.y / SIZE) * SIZE
  cell.value.style.transform = `translate(${x}px, ${y}px)`

  // Gone with the cursor while the pointer is outside the page.
  const away = !pointer.active
  if (away !== idle) {
    idle = away
    cell.value.classList.toggle('idle', away)
  }
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
</style>
