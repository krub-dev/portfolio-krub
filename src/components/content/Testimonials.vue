<script setup>
/*
  What people say, at the end of the Projects rail: one at a time, in a pager.

  It used to be a column, and a column grows. Measured: one entry is 214px on a
  phone, so three of them made the block 678px and the section nearly two
  screens — the same problem the projects grid had, and the same answer.

  The box carries its own header — the mono label and the position — because the
  label floating above an empty box said nothing about what the box was. Inside,
  with a rule under it, it is the same header the stack groups and the contact
  rows use, and the block reads as one object instead of a label and a mystery.

  The movement is vertical, so the arrows are: up above, down below, at the side.
  It drags with any pointer type, the same as the projects rail — the mouse has
  no vertical gesture of its own and the pager is not a scroll container — and a
  drag that travels far enough takes the next quote in the direction it was
  going. The rail's drag could leave the vertical axis to the page; this one
  cannot, so the pane claims both axes and the page is scrolled by starting the
  touch anywhere else on the screen.

  The window is masked at its two edges, so a quote arrives and departs through a
  fade rather than a hard cut. At rest the mask does nothing, because the entries
  carry their own vertical padding and the text never sits on the edge.

  config.showTestimonials is checked by ProjectsSection, not here: the parent
  decides whether the block exists at all.
*/
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import TestimonialCard from './TestimonialCard.vue'
import { useLang } from '../../composables/useLang'
import { testimonials } from '../../data'

// How far a drag has to travel before it counts as one. Under this it is a click
// and whatever is under it opens; over it the click is swallowed.
const DRAG_SLOP = 6

// How much of the window a drag has to cover to count as "the next one" rather
// than falling back to the nearest.
const FLICK = 0.2

// Fraction of the remaining distance covered per frame. Lower is heavier.
const EASING = 0.16

const { lang } = useLang()
const { t } = useI18n()

const items = computed(() => testimonials.map((entry) => ({ ...entry, ...entry[lang.value] })))

const pane = ref(null)
const reel = ref(null)
const index = ref(0)
const atStart = ref(true)
const atEnd = ref(false)
const hidden = ref([])

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')

/*
  The animation state is deliberately plain and not reactive: it is written onto
  the reel, not rendered. A reactive offset would re-render the block on every
  frame of a drag.
*/
let offsets = []
let heights = []
let maxOffset = 0
let offset = 0
let target = 0
let frame = null
let startY = 0
let startOffset = 0
let travelled = 0
let observer = null

function paint() {
  if (reel.value) reel.value.style.transform = `translateY(${-offset}px)`
}

function settle() {
  if (reduced.matches) {
    offset = target
    paint()
    return
  }

  if (frame) return
  frame = requestAnimationFrame(function tick() {
    offset += (target - offset) * EASING
    if (Math.abs(target - offset) < 0.5) {
      offset = target
      frame = null
    } else {
      frame = requestAnimationFrame(tick)
    }
    paint()
  })
}

/*
  Measured, not assumed. The entries are different lengths, so where each one
  sits is its own offset and the window's height is its own height; a uniform
  step would be wrong the moment one quote is longer than another.
*/
function measure() {
  const rail = reel.value
  if (!rail) return

  const entries = Array.from(rail.children)
  const top = rail.getBoundingClientRect().top
  offsets = entries.map((el) => el.getBoundingClientRect().top - top)
  heights = entries.map((el) => el.getBoundingClientRect().height)
  maxOffset = offsets.length ? offsets[offsets.length - 1] : 0

  index.value = Math.min(Math.max(index.value, 0), entries.length - 1)
  apply(true)
}

function apply(snap) {
  const view = pane.value
  const rail = reel.value
  if (!view || !rail || !offsets.length) return

  target = offsets[index.value]
  if (snap) offset = target

  /*
    The window is as tall as the tallest entry, not as tall as the one showing.
    Sized to the current quote it changed height every time you paged, which
    moved everything under it; this way it only changes if an entry grows past
    the tallest, which is what expanding one can do.
  */
  view.style.height = `${Math.max(...heights)}px`

  atStart.value = index.value <= 0
  atEnd.value = index.value >= offsets.length - 1
  hidden.value = offsets.map((_, i) => i !== index.value)

  paint()
}

function step(direction) {
  const next = Math.min(Math.max(index.value + direction, 0), offsets.length - 1)
  if (next === index.value) return
  index.value = next
  apply(false)
  settle()
}

/*
  Dragging. One set of handlers for every pointer type: a mouse has no vertical
  gesture of its own, and the pager is not a scroll container, so a phone has no
  swipe either. The pane claims both axes, which is the cost of a vertical pager:
  the page is scrolled by starting the touch anywhere else.
*/
function onPointerDown(event) {
  if (!reel.value || !pane.value) return
  travelled = 0
  startY = event.clientY
  startOffset = offset
  target = offset
  if (frame) {
    cancelAnimationFrame(frame)
    frame = null
  }
  pane.value.setPointerCapture(event.pointerId)
}

function onPointerMove(event) {
  if (!pane.value?.hasPointerCapture(event.pointerId)) return
  const delta = event.clientY - startY
  travelled = Math.max(travelled, Math.abs(delta))
  offset = Math.min(Math.max(startOffset - delta, 0), maxOffset)
  paint()
}

function onPointerUp(event) {
  if (!pane.value?.hasPointerCapture(event.pointerId)) return
  pane.value.releasePointerCapture(event.pointerId)

  /*
    Settle on a quote. A drag that covered enough of the window takes the next
    one in the direction it was going; anything shorter falls back to the nearest
    one, which is found by comparing offsets — NOT by dividing the offset by a
    height, which is what this did and what sent a short drag to the wrong quote
    as soon as the first entry was longer than the others.
  */
  const moved = offset - startOffset
  const height = Math.max(...heights) || 1
  let next = 0
  for (let i = 1; i < offsets.length; i += 1) {
    if (Math.abs(offsets[i] - offset) < Math.abs(offsets[next] - offset)) next = i
  }
  if (Math.abs(moved) > height * FLICK) next = index.value + Math.sign(moved)
  index.value = Math.min(Math.max(next, 0), offsets.length - 1)
  apply(false)
  settle()
}

// A drag that ends over the "read more" must not press it.
function onClickCapture(event) {
  if (travelled <= DRAG_SLOP) return
  travelled = 0
  event.stopPropagation()
  event.preventDefault()
}

onMounted(() => {
  measure()
  /*
    The reel changes size when a quote is expanded and when the fonts land, and
    the window's height is derived from the tallest entry — so it is the reel
    that is watched, not the window, which would be a loop.
  */
  observer = new ResizeObserver(measure)
  if (reel.value) observer.observe(reel.value)
  window.addEventListener('resize', measure, { passive: true })
})

onUnmounted(() => {
  observer?.disconnect()
  window.removeEventListener('resize', measure)
  if (frame) cancelAnimationFrame(frame)
})
</script>

<template>
  <div class="testimonials">
    <div class="pager">
      <div class="box">
        <div class="head">
          <p class="label">{{ t('section.test') }}</p>
          <span class="position">{{ index + 1 }} / {{ items.length }}</span>
        </div>

        <div
          ref="pane"
          class="pane"
          @pointerdown="onPointerDown"
          @pointermove="onPointerMove"
          @pointerup="onPointerUp"
          @pointercancel="onPointerUp"
          @click.capture="onClickCapture"
        >
          <div ref="reel" class="reel">
            <TestimonialCard
              v-for="(item, i) in items"
              :key="i"
              :quote="item.quote"
              :name="item.name"
              :role="item.role"
              :avatar="item.avatar"
              :inert="hidden[i] || undefined"
            />
          </div>
        </div>
      </div>

      <div class="pager-controls">
        <button
          class="pager-arrow"
          type="button"
          :aria-label="t('a11y.prevTestimonial')"
          :disabled="atStart"
          @click="step(-1)"
        >
          ↑
        </button>
        <button
          class="pager-arrow"
          type="button"
          :aria-label="t('a11y.nextTestimonial')"
          :disabled="atEnd"
          @click="step(1)"
        >
          ↓
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.testimonials {
  /* Air before the block, on top of the section's own gap: the rail and the
     quotes are two different things and were sitting too close to tell. */
  margin-top: clamp(28px, 4vw, 56px);
}

/*
  The controls beside the box and not above it: the rail already has a pair of
  horizontal arrows over its head, and two pairs in the same column of the page
  read as one control that lost its way.
*/
.pager {
  display: flex;
  align-items: center;
  gap: 14px;
}

.box {
  flex: 1;
  min-width: 0;
  border: 1px solid var(--line);
  border-radius: 18px;
  background: var(--surface);
  overflow: hidden;
}

/* The block's own header, inside the box: the mono label and the position, with
   the rule the stack groups and the contact rows use. */
.head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  padding: 14px clamp(18px, 2.6vw, 26px);
  border-bottom: 1px solid var(--line);
}

.label {
  margin: 0;
  font-family: var(--font-mono);
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--fg-3);
}

.position {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--fg-3);
  white-space: nowrap;
}

/*
  The window. Clipped and masked top and bottom: the mask is what turns the
  arrival and departure of a quote into a fade, and it is invisible at rest
  because the entries carry their own vertical padding and the text never sits on
  the edge. touch-action:none is what lets a vertical drag work on a phone — the
  cost is that the page is scrolled by starting the touch anywhere else.
*/
.pane {
  overflow: hidden;
  touch-action: none;
  cursor: grab;
  padding: 0 clamp(18px, 2.6vw, 26px);
  -webkit-mask-image: linear-gradient(
    to bottom,
    transparent 0,
    #000 18px,
    #000 calc(100% - 18px),
    transparent 100%
  );
  mask-image: linear-gradient(
    to bottom,
    transparent 0,
    #000 18px,
    #000 calc(100% - 18px),
    transparent 100%
  );
  transition: height 0.5s cubic-bezier(0.22, 1, 0.36, 1);
}

.reel {
  will-change: transform;
}

.pager-controls {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.pager-arrow {
  width: 40px;
  height: 40px;
  flex: 0 0 auto;
  border-radius: 12px;
  background: transparent;
  border: 1px solid var(--line);
  color: var(--fg);
  cursor: pointer;
  font-size: 15px;
  transition:
    border-color 0.16s ease,
    color 0.16s ease;
}

.pager-arrow:hover:not(:disabled) {
  border-color: var(--acc-text);
  color: var(--acc-text);
}

.pager-arrow:disabled {
  opacity: 0.35;
  cursor: default;
}

@media (max-width: 900px) {
  .pager {
    gap: 10px;
  }

  .pager-arrow {
    width: 36px;
    height: 36px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .pane {
    transition: none;
  }
}
</style>
