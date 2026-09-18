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

  The grid it belongs to is not always the viewport. While the hero layer is the
  visible one it is absolute and scrolls, so the cell has to snap in page
  coordinates — otherwise it sits on the fixed grid's lines and comes apart from
  the ones you can see. `masked` is exactly the switch: true once the global
  (fixed) layer has taken over.

  `masked` also mirrors that layer's own downward fade, so the cell never glows
  where the grid has faded out — and the field is cut to the same box the grid
  uses (`bottom: var(--footer-h)`), or the fade lands lower on the cell than on
  the lines behind it and the cell outlives the grid.

  Scrolling does not take it away: it stays, and the page-coordinate snapping is
  what keeps it on the hero layer's lines while that layer slides up. The touch
  mark is the exception, because it is not following anything.

  On touch there is no cursor, so the cell follows the finger instead: it lights
  on a tap and stays, and a scroll clears it. A tap and not a press: the finger
  has to lift without travelling, or the start of every scroll would flash a cell
  before the page moved.
*/
import { onMounted, onUnmounted, ref } from 'vue'

import { isPointerDevice, usePointer } from '../../composables/usePointer'

// The grid's own step. Design spec 3.12; keep in sync with BackgroundGrid's size.
const SIZE = 72

// How far a finger can travel and still be a tap rather than a scroll.
const TAP_SLOP = 10

const props = defineProps({
  masked: { type: Boolean, default: false },
})

const enabled = isPointerDevice()
const cell = ref(null)
let hidden = false
let downX = 0
let downY = 0
let downId = null

// Where the visible grid starts, in viewport coordinates: 0 for the fixed layer,
// minus the scroll for the hero layer, which scrolls with the page.
function gridTop() {
  return props.masked ? 0 : -window.scrollY
}

function place(clientX, clientY) {
  if (!cell.value) return
  const top = gridTop()
  const x = Math.floor(clientX / SIZE) * SIZE
  const y = top + Math.floor((clientY - top) / SIZE) * SIZE
  cell.value.style.transform = `translate(${x}px, ${y}px)`
}

function setHidden(value) {
  if (value === hidden || !cell.value) return
  hidden = value
  cell.value.classList.toggle('idle', value)
}

if (enabled) {
  usePointer((pointer) => {
    if (!cell.value) return
    place(pointer.x, pointer.y)
    setHidden(!pointer.active)
  })
}

function onDown(event) {
  downX = event.clientX
  downY = event.clientY
  downId = event.pointerId
}

function onUp(event) {
  if (downId === null || event.pointerId !== downId) return
  downId = null

  // A scroll travels before the finger lifts; only a tap lights the cell.
  if (Math.hypot(event.clientX - downX, event.clientY - downY) > TAP_SLOP) return

  place(event.clientX, event.clientY)
  setHidden(false)
}

// The browser takes the gesture over for a scroll and cancels it, so a cancel is
// never a tap and must not light anything.
function onCancel() {
  downId = null
}

// A mark left on the paper has to go when the paper moves; the cursor's cell does
// not, because the cursor is still where it was.
function onScroll() {
  setHidden(true)
}

onMounted(() => {
  if (enabled) return
  window.addEventListener('pointerdown', onDown, { passive: true })
  window.addEventListener('pointerup', onUp, { passive: true })
  window.addEventListener('pointercancel', onCancel, { passive: true })
  window.addEventListener('scroll', onScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('pointerdown', onDown)
  window.removeEventListener('pointerup', onUp)
  window.removeEventListener('pointercancel', onCancel)
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
  top: 0;
  left: 0;
  right: 0;
  /* The same box the global grid covers, footer strip and all, so the mask below
     fades the cell exactly where the grid fades. */
  bottom: var(--footer-h, 52px);
  z-index: 0;
  pointer-events: none;
}

/* The same mask the global grid carries, and the #000 stops are alpha, not a
   colour — see BackgroundGrid.vue. no-repeat so a cell placed under the field's
   own bottom edge is masked away instead of showing through a tiled mask. */
.masked {
  -webkit-mask: linear-gradient(#000 0%, #000 15%, transparent 65%) no-repeat;
  mask: linear-gradient(#000 0%, #000 15%, transparent 65%) no-repeat;
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
