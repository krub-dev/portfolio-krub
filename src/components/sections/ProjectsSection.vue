<script setup>
/*
  Section 01. The projects live in a horizontal rail: three cards and a sliver of
  the fourth on a desktop, one and a sliver on a phone, so a fifth project does
  not push the section another screen down the page. Measured with four stacked
  cards: 2319px on a phone against an 839px viewport.

  The rail is a track moved by transform. The native scroll version came first
  and it was not smooth: `scroll-snap` fights a drag — it has to be switched off
  while dragging and switching it back on snaps without animating — and the
  easing of a programmatic scroll belongs to the browser, not to us. A transform
  is composited, the curve is one line of CSS and it is the same arrive-and-settle
  the lemon and the footer use, and a drag can follow the pointer exactly.

  What that costs is the two things the scroll container gave away for free:

  - The phone's swipe. The drag below covers every pointer type, and
    `touch-action: pan-y` is what keeps a vertical swipe scrolling the page
    instead of being swallowed by the rail.
  - The off-screen cards being out of reach. They stay in the DOM — that is the
    point, the keyboard must be able to reach them — so they are marked `inert`
    while they are fully out of the rail, which takes them out of the tab order
    without taking them out of the document.

  The sliver of the next card is still the whole affordance: it says there is
  more without a dot or a counter.
*/
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import SectionHeading from '../base/SectionHeading.vue'
import ProjectCard from '../content/ProjectCard.vue'
import ProjectsCta from '../content/ProjectsCta.vue'
import { useLang } from '../../composables/useLang'
import { projects } from '../../data'

// How far a drag has to travel before it counts as one. Under this it is a click
// and the card opens; over it the click is swallowed, because nobody means to
// open a card they just dragged.
const DRAG_SLOP = 6

// How much of a card a drag has to move before it counts as "the next one"
// rather than falling back to the nearest. Without it the rail settled on
// whichever card was closer, so a phone swipe had to travel more than half a
// card — 160px — before anything happened, which reads as the rail refusing to
// budge.
const FLICK = 0.2

const { lang } = useLang()
const { t } = useI18n()

defineEmits(['open'])

const items = computed(() =>
  projects.map((project) => ({ ...project, ...project[lang.value] })),
)

const viewport = ref(null)
const track = ref(null)
const dragging = ref(false)
const parked = ref([]) // per card: fully out of the rail, so out of the tab order
const current = ref(0) // the card the rail is parked on, which touch marks
const positions = ref(1) // parking spots at this width: 2 on desktop, 4 on a phone
const fade = ref('fade-right') // which edges the clip softens

/*
  Which edges to fade: a side only while a card is actually hanging off it.

  Not "has the rail moved": at a settled index the rail has moved and the card
  behind is exactly off the edge — a whole card plus a gap of travel — so that
  test faded the left side of the card the rail is parked on, which is the one
  thing this is meant to avoid. What matters is whether a card straddles the
  edge, and that is what the offset within the current step says.
*/
function syncFade() {
  const view = viewport.value
  if (!view) return

  const at = step > 0 ? offset % step : 0
  const left = at > 0 && at < cardWidth
  const right = offset < maxOffset - 1
  const next = left && right ? 'fade-both' : left ? 'fade-left' : right ? 'fade-right' : 'none'
  if (next !== fade.value) fade.value = next

  /*
    The mask width is driven by the live offset, so the fade ramps in and out
    with the rail. Four fixed gradients that flipped the instant a card crossed
    the edge made it snap — the last card went from faded to clear in one frame.
  */
  view.style.setProperty('--fade-l', `${left ? Math.min(at, fadeMax) : 0}px`)
  view.style.setProperty('--fade-r', `${right ? Math.min(maxOffset - offset, fadeMax) : 0}px`)
}

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')

/*
  The animation state is deliberately plain and not reactive: it is written onto
  the track, not rendered. A reactive offset would re-render the section on every
  frame of a drag.
*/
let step = 0 // one card plus one gap, in px
let cardWidth = 0 // one card, in px
let visibleWidth = 0 // how much of the rail the viewport shows
let fadeMax = 0 // how wide the edge fade can get — the peek, in px
let maxOffset = 0 // how far the rail can travel before the last card is in
let offset = 0 // where it is, which is what gets painted
let target = 0 // where it is going
let index = 0
let startX = 0
let startOffset = 0
let travelled = 0
let pointerId = null
let frame = null

/*
  The travel is animated here rather than by a CSS transition, and the fade is
  why. A transition runs in the compositor, where nothing can read the position
  it is passing through, so the fade could only be decided from the destination —
  which left a card cut on the side the rail was travelling towards, for the
  whole 0.55s. A loop knows the live offset, so the fade is right at every frame,
  and it stops the moment the rail settles.
*/
const EASING = 0.16

function paint() {
  if (track.value) track.value.style.transform = `translate3d(${-offset}px, 0, 0)`
  syncFade()

  /*
    The marker and the tab order are computed from the live offset, not from the
    settled index. Written only on settle, a card dragged into view kept its
    "parked" state — dimmed by the edge fade and out of the tab order — for the
    half second the rail took to arrive.
  */
  if (step > 0) current.value = Math.round(offset / step)
  // One entry per child of the track: the projects, then the CTA card.
  parked.value = Array.from({ length: items.value.length + 1 }, (_, i) => {
    const left = i * step - offset
    return left + cardWidth <= 0 || left >= visibleWidth
  })
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
  Re-measures the rail and puts the state back on it. Runs on mount, on resize
  and whenever the index moves. `snap` puts it straight where it belongs instead
  of leaving it to travel there: the geometry changed under it, so there is
  nothing to animate from.
*/
function sync(snap) {
  const rail = track.value
  const view = viewport.value
  if (!rail || !view) return

  const gap = parseFloat(getComputedStyle(rail).columnGap) || 0
  const card = rail.firstElementChild?.getBoundingClientRect().width ?? 0

  /*
    The room the viewport keeps so the magnetic pull has somewhere to move a card
    is padding, so clientWidth is two rooms wider than the strip the cards
    actually travel in. Without taking it back here the rail would stop short of
    its last card by exactly that much.
  */
  const room = parseFloat(getComputedStyle(view).paddingLeft) || 0
  const visible = view.clientWidth - room * 2

  cardWidth = card
  step = card + gap
  visibleWidth = visible
  maxOffset = Math.max(0, rail.scrollWidth - visible)

  // The peek: what is left of `visible` after the whole cards and the gaps.
  const whole = Math.max(1, Math.round((visible - gap) / step))
  fadeMax = Math.max(0, visible - whole * step + gap)

  const last = step > 0 ? Math.ceil(maxOffset / step) : 0
  index = Math.min(Math.max(index, 0), last)
  positions.value = last + 1
  target = Math.min(index * step, maxOffset)
  if (snap) offset = target

  paint()
}

function goTo(wanted) {
  const last = step > 0 ? Math.ceil(maxOffset / step) : 0
  const next = Math.min(Math.max(wanted, 0), last)
  if (next === index) return
  index = next
  sync(false)
  settle()
}

/*
  Dragging. One set of handlers for every pointer type: a mouse has no horizontal
  gesture of its own, and a phone's swipe is no longer free now that the rail is
  not a scroll container. `touch-action: pan-y` is what leaves the vertical swipe
  to the page.
*/
function onPointerDown(event) {
  if (!track.value || !viewport.value) return
  dragging.value = true
  travelled = 0
  startX = event.clientX
  startOffset = offset
  target = offset
  pointerId = event.pointerId
  // The pointer is in charge, so any travel still running is abandoned.
  if (frame) {
    cancelAnimationFrame(frame)
    frame = null
  }
  viewport.value.style.userSelect = 'none'
  /*
    Deliberately NOT capturing here. Capturing on pointerdown makes the viewport
    the target of the pointerup, and the click that follows is dispatched at the
    common ancestor of the two — the viewport — so the card's own button never
    sees it and no card opens with a mouse. Capture is taken in the move, once
    the gesture has proved it is a drag and not a click.
  */
}

function onPointerMove(event) {
  if (pointerId === null || pointerId !== event.pointerId) return
  const delta = event.clientX - startX
  travelled = Math.max(travelled, Math.abs(delta))

  if (!viewport.value?.hasPointerCapture(event.pointerId)) {
    if (travelled <= DRAG_SLOP) return
    viewport.value?.setPointerCapture(event.pointerId)
  }

  offset = Math.min(Math.max(startOffset - delta, 0), maxOffset)
  paint()
}

function onPointerUp(event) {
  if (pointerId === null || pointerId !== event.pointerId) return
  pointerId = null
  dragging.value = false

  if (viewport.value) {
    viewport.value.style.userSelect = ''
    if (viewport.value.hasPointerCapture(event.pointerId)) {
      viewport.value.releasePointerCapture(event.pointerId)
    }
  }

  /*
    Settle on a card. A drag that moved far enough takes the next one in the
    direction it was going; anything shorter falls back to the nearest. The
    offset is left where the finger dropped it, so the loop travels from there.
  */
  const moved = offset - startOffset
  index =
    Math.abs(moved) > step * FLICK ? index + Math.sign(moved) : Math.round(offset / step)
  sync(false)
  settle()
}

function onClickCapture(event) {
  if (travelled <= DRAG_SLOP) return
  travelled = 0
  event.stopPropagation()
  event.preventDefault()
}

function onResize() {
  sync(true)
}

onMounted(() => {
  // A frame, so the cards are laid out and there is something to measure.
  requestAnimationFrame(() => sync(true))
  window.addEventListener('resize', onResize, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('resize', onResize)
  if (frame) cancelAnimationFrame(frame)
})
</script>

<template>
  <section id="projects" class="projects">
    <SectionHeading index="01" :title="t('section.projects')" :count="items.length" />

    <div class="rail">
      <div
        ref="viewport"
        class="viewport"
        :class="[fade, { dragging }]"
        role="group"
        :aria-label="t('a11y.projectsRail')"
        @pointerdown="onPointerDown"
        @pointermove="onPointerMove"
        @pointerup="onPointerUp"
        @pointercancel="onPointerUp"
        @click.capture="onClickCapture"
      >
        <div ref="track" class="track">
          <ProjectCard
            v-for="(project, i) in items"
            :key="project.slug"
            :name="project.name"
            :tag="project.tag"
            :summary="project.summary"
            :shot-label="project.shotLabel"
            :image="project.image"
            :stack="project.stack"
            :inert="parked[i] || undefined"
            :current="i === current"
            @open="$emit('open', i)"
          />

          <!-- The rail's last slot: not a project, the way out to GitHub. -->
          <ProjectsCta
            :inert="parked[items.length] || undefined"
            :current="items.length === current"
          />
        </div>
      </div>

      <div class="dots" role="group" :aria-label="t('a11y.projectsRail')">
        <button
          v-for="i in positions"
          :key="i"
          class="dot"
          :class="{ active: i - 1 === current }"
          type="button"
          :aria-label="t('a11y.goToProject', { n: i })"
          :aria-current="i - 1 === current ? 'true' : undefined"
          @click="goTo(i - 1)"
        />
      </div>
    </div>
  </section>
</template>

<style scoped>
.projects {
  position: relative;
  z-index: 1;
  padding: clamp(56px, 8vw, 110px) var(--gutter-r) clamp(56px, 8vw, 110px) var(--gutter-l);
  max-width: 1180px;
  margin: 0 auto;
  border-top: 1px solid var(--line);
  display: flex;
  flex-direction: column;
  gap: 34px;
}

.rail {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/*
  One dot per parking spot, centred under the rail. The one you are on is a
  longer pill in the accent — the same indicator the testimonials use, laid on
  its side because this rail travels sideways.
*/
.dots {
  display: flex;
  justify-content: center;
  gap: 2px;
}

/*
  A 24px target with an 8px mark inside it: WCAG 2.2 asks for 24px, and the old
  20px button failed it. The mark keeps its size by taking an 8px inset, and the
  active pill keeps its 16px width by ending 4px in from each side.
*/
.dot {
  position: relative;
  width: 24px;
  height: 24px;
  padding: 0;
  border: 0;
  background: none;
  cursor: pointer;
}

.dot::before {
  content: '';
  position: absolute;
  top: 8px;
  bottom: 8px;
  left: 8px;
  right: 8px;
  border-radius: 999px;
  background: var(--fg-3);
  transition:
    left 0.4s cubic-bezier(0.22, 1, 0.36, 1),
    right 0.4s cubic-bezier(0.22, 1, 0.36, 1),
    background-color 0.3s ease;
}

.dot:hover::before {
  background: var(--fg-2);
}

.dot.active::before {
  left: 4px;
  right: 4px;
  background: var(--acc);
}

@media (prefers-reduced-motion: reduce) {
  .dot::before {
    transition: none;
  }
}

/*
  Clipped, with vertical room for the magnetic pull, which moves a card up to
  10px. `pan-y` is the whole declaration: the browser intersects touch-action
  from the element the finger lands on down to the nearest scroll container, so
  one rule here covers every card inside — a vertical swipe is left to the page
  and a horizontal one comes to us.

  The geometry lives here as variables because the fade has to know it: the fade
  is exactly the part of the next card that shows, so it can never reach back
  into the card you are reading. A flat 56px did: on a phone the peek is 45px,
  so the fade ate 11px of the visible card's right edge and the card looked
  smudged rather than the next one looking cut.
*/
.viewport {
  /*
    The magnetic pull moves a card up to 10px toward the cursor, and a card at
    either end of the rail would be pushed past the viewport's own edge — its
    border and its rounded corner clipped off, which is the one thing the eye
    catches. So the clip keeps a room of padding, taken straight back with a
    negative margin: the content box is unchanged, so the cards still line up
    with the section's gutter and keep the width they were measured at, and only
    the clip is wider.
  */
  --rail-room: 10px;
  --rail-gap: 20px;
  --rail-peek: 68px;
  /*
    The visible peek is the peek minus the gap, so the fade covers it exactly.
    Plus the room, or the extra strip would show unfaded and the cut would come
    back as a hard edge further in.
  */
  /*
    The fade widths are written per frame from the rail's offset, so a card the
    clip cuts gets a soft edge that grows and shrinks with it instead of a fixed
    gradient that flips.
  */
  --fade-l: 0px;
  --fade-r: 0px;
  overflow: hidden;
  /* More air top and bottom: the magnetic pull moves a card, and a card at the
     bottom edge was having its border clipped. */
  padding: 20px var(--rail-room);
  margin: 0 calc(-1 * var(--rail-room));
  -webkit-mask-image: linear-gradient(to right, transparent 0, #000 var(--fade-l), #000 calc(100% - var(--fade-r)), transparent 100%);
  mask-image: linear-gradient(to right, transparent 0, #000 var(--fade-l), #000 calc(100% - var(--fade-r)), transparent 100%);
  touch-action: pan-y;
  cursor: grab;
}

.viewport.dragging {
  cursor: grabbing;
}

.track {
  display: flex;
  gap: var(--rail-gap);
  /* The travel is written here from the script, one frame at a time, so it
     stays on the compositor and the fade can follow it. */
  will-change: transform;
}

/* Three cards and the peek at a fourth. A phone shows one and the same peek. */
.track > * {
  flex: 0 0 calc((100% - 2 * var(--rail-gap) - var(--rail-peek)) / 3);
}

@media (max-width: 900px) {
  .viewport {
    --rail-peek: 18%;
  }

  .track > * {
    flex: 0 0 calc(100% - var(--rail-peek));
  }
}
</style>
