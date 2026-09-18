<script setup>
/*
  What people say, between the Stack and Contact: one at a time, in a pager.

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

  config.showTestimonials is checked by HomeView, not here: the page decides
  whether the block exists at all.
*/
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
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
const open = ref(-1)
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
let pointerId = null
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
    Two heights, not one, and that is the whole fix for the window that only
    ever grew.

    The floor is what the entries are padded to, so a short quote fills the
    window and the next one cannot show through the gap. It is read from the
    entries that are NOT open: an open quote is taller than its clamped self,
    and feeding that back into the floor raised the floor of every entry, which
    is why collapsing used to leave the block at the expanded size. The window
    itself is still the tallest entry, so it grows while a quote is open and
    comes back down when it closes.
  */
  const rest = heights.filter((_, i) => i !== open.value)
  const floor = rest.length ? Math.max(...rest) : Math.max(...heights)
  view.style.setProperty('--pane-h', `${floor}px`)
  view.style.height = `${Math.max(...heights)}px`

  atStart.value = index.value <= 0
  atEnd.value = index.value >= offsets.length - 1
  hidden.value = offsets.map((_, i) => i !== index.value)

  paint()
}

/*
  One open quote at a time, and it belongs here because the window's height is
  derived from the entries: the pager has to know which one is the tall one.
*/
function toggle(i) {
  open.value = open.value === i ? -1 : i
}

/*
  Going to a quote closes whatever was open first, and that is not tidiness. An
  open entry is taller than its clamped self, so it holds the window at the
  expanded size; a short quote shown in that window would leave the gap that
  lets the next one show through.

  nextTick before the second measurement, because the offsets come from the DOM
  and it is Vue that puts the clamp back — measured in the same tick they are
  still the expanded ones and the pager lands on the wrong entry.
*/
async function goTo(next) {
  const wanted = Math.min(Math.max(next, 0), offsets.length - 1)

  /*
    Only when the index actually moves. A tap on the pane arrives here too (the
    pointerup before the click), and closing on it would collapse the quote the
    click is about to toggle — the "read less" would reopen it.
  */
  if (wanted !== index.value && open.value !== -1) {
    open.value = -1
    await nextTick()
    measure()
  }

  index.value = wanted
  apply(false)
  settle()
}

function step(direction) {
  goTo(index.value + direction)
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
  pointerId = event.pointerId
  if (frame) {
    cancelAnimationFrame(frame)
    frame = null
  }
  /*
    Deliberately NOT capturing here. Capturing on pointerdown makes the pane the
    target of the pointerup, and the click that follows is then dispatched at
    the common ancestor of the two — the pane — so the "read more" under the
    finger never sees it. Capture is taken in the move, once the gesture has
    proved it is a drag and not a click.
  */
}

function onPointerMove(event) {
  if (pointerId === null || pointerId !== event.pointerId) return
  const delta = event.clientY - startY
  travelled = Math.max(travelled, Math.abs(delta))

  if (!pane.value?.hasPointerCapture(event.pointerId)) {
    if (travelled <= DRAG_SLOP) return
    pane.value?.setPointerCapture(event.pointerId)
  }

  offset = Math.min(Math.max(startOffset - delta, 0), maxOffset)
  paint()
}

function onPointerUp(event) {
  if (pointerId === null || pointerId !== event.pointerId) return
  pointerId = null
  if (pane.value?.hasPointerCapture(event.pointerId)) {
    pane.value.releasePointerCapture(event.pointerId)
  }

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

  /*
    Through goTo, so a drag while a quote is open closes it first — and so a
    drag that lands back where it started still settles, which is why this is
    not an early return.
  */
  goTo(next)
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
        <span class="mark" aria-hidden="true">”</span>

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
              :open="open === i"
              :inert="hidden[i] || undefined"
              @toggle="toggle(i)"
            />
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
  </div>
</template>

<style scoped>
/*
  The block sits between the Stack and Contact, so it carries the page gutter and
  the 1180px cap every section uses: it is not inside one any more. The top
  margin is on top of the Stack's own bottom padding — the block is not a section
  and still needs its own air to read as separate from the grid above it.
*/
.testimonials {
  max-width: 1180px;
  margin: clamp(28px, 4vw, 56px) auto 0;
  padding: 0 var(--gutter-r) 0 var(--gutter-l);
}

/*
  The box is the whole block. The controls live inside it, in its bottom right
  corner: beside it they were a pair of buttons hanging off the edge of the box
  with nothing to belong to, and on a desktop the box is wide enough to hold
  them. On a phone they go back to being clipped, see below.
*/
.pager {
  display: flex;
  align-items: center;
}

.box {
  position: relative;
  flex: 1;
  min-width: 0;
  border: 1px solid var(--line);
  border-radius: 18px;
  background: var(--surface);
  overflow: hidden;
}

/*
  A quote mark in the accent, large and faint, in the window's top right. It
  belongs to the box and not to an entry, so it stays put while the quotes slide
  through it — the one thing on the page that does not move.

  --acc and not --acc-text: this is a fill, not text. At this opacity the
  legible variant would read as a grey smudge on the dark theme instead of as
  the palette's colour. aria-hidden in the template, because it is punctuation
  and it says nothing.
*/
.mark {
  position: absolute;
  /* Below the header's rule, not across it: the counter lives up there, and the
     two glyphs on top of each other read as a mistake rather than as a mark. */
  top: 44px;
  right: 16px;
  font-family: var(--font-sans);
  font-size: clamp(76px, 8vw, 104px);
  font-weight: 700;
  line-height: 1;
  color: var(--acc);
  opacity: 0.08;
  pointer-events: none;
  user-select: none;
}

/*
  The block's own header, inside the box: the mono label and the position. It is
  a filled band, the marquee's and the contact band's own treatment —
  `background: var(--acc)` with `--on-acc` on top — rather than a rule and two
  grey strings. It is the box's top edge, so the block opens with the accent
  instead of with a line, and it is the only place in the block that is filled.
  The box's radius clips its two top corners.
*/
.head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  padding: 14px clamp(18px, 2.6vw, 26px);
  background: var(--acc);
  color: var(--on-acc);
}

/* On the fill there is one text colour, --on-acc, and the hierarchy comes from
   opacity instead of from a second token: the label names the block, the
   counter is a number and sits back. */
.label {
  margin: 0;
  font-family: var(--font-mono);
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

/* Mono and 11px, so it reads as a counter and not as a heading. */
.position {
  font-family: var(--font-mono);
  font-size: 11px;
  opacity: 0.62;
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

/*
  In the box's bottom right corner, not against the edge: 12px and 16px of air,
  the same kind of margin the header's own contents keep. A row rather than the
  column they were outside: in the corner of a wide box, two buttons stacked read
  as a strip down the side, and side by side they read as one control.
*/
.pager-controls {
  position: absolute;
  right: 16px;
  bottom: 12px;
  display: flex;
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

/*
  Room for the controls in the box's bottom right, published to the entries as a
  variable instead of kept as the pane's own padding.

  It has to live on the entry. Overflow clips at the padding edge, so with the
  room on the pane the quote stacked under it was still inside the clip and the
  next attribution showed through the empty strip — the fix is not more height
  either, for the same reason. On the entry the room is part of the measured
  height, so the next entry starts below the clip. Desktop only: on a phone the
  arrows are clipped and the room would be an empty strip for nothing.
*/
@media (min-width: 901px) {
  .pane {
    --pane-room: 56px;
  }
}

@media (max-width: 900px) {
  /*
    The arrows go on a phone. The swipe is the gesture there and the two buttons
    beside the box only took width from the quote — which is also why they were
    the only thing on the screen sitting hard against the right edge.

    They are not removed, though: visually hidden, they stay in the
    accessibility tree and keep their focus. The drag is not something a screen
    reader or a keyboard can do, so without them the other quotes would be
    unreachable, and the `inert` on the entries that are not showing means there
    is no other way in. They come back the moment one of them takes focus.
  */
  .pager-controls {
    position: absolute;
    right: 8px;
    bottom: 8px;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
  }

  .pager-controls:focus-within {
    width: auto;
    height: auto;
    overflow: visible;
    clip-path: none;
    padding: 6px;
    border: 1px solid var(--line);
    border-radius: 14px;
    background: var(--surface);
  }

  /*
    The mark drops and moves right on a phone, and grows. In a window this
    narrow it lands behind the quote instead of behind the name, which is where
    a watermark belongs: it reads as something under the text rather than as a
    second attribution.
  */
  .mark {
    top: 74px;
    right: 6px;
    font-size: 112px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .pane {
    transition: none;
  }
}
</style>
