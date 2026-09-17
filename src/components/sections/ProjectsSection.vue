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

  The testimonials sit at the end of the rail: they are about this work, and they
  are a block rather than a section, so they add no destination and no number.
  See docs/decisions.md 56.
*/
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import SectionHeading from '../base/SectionHeading.vue'
import ProjectCard from '../content/ProjectCard.vue'
import Testimonials from '../content/Testimonials.vue'
import { useLang } from '../../composables/useLang'
import { config, projects } from '../../data'

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
const atStart = ref(true)
const atEnd = ref(false)
const parked = ref([]) // per card: fully out of the rail, so out of the tab order
const current = ref(0) // the card the rail is parked on, which touch marks
const moving = ref(false)

/*
  Which edges to fade. The clip cuts a card off mid-way, and a hard vertical edge
  reads as a mistake rather than as "there is more this way" — but only the side
  the rail actually continues on: at the start the first card's rounded corner
  sits on the edge and fading it would eat it.
*/
const fade = computed(() => {
  // Both, while it travels. Mid-flight there is a card hanging off each side,
  // and the rule below only knows where the rail is going: it left one of them
  // with a hard cut for the whole animation, which is what "it still cuts while
  // it moves" was.
  if (moving.value) return 'fade-both'
  if (atStart.value && atEnd.value) return 'none'
  if (atStart.value) return 'fade-right'
  if (atEnd.value) return 'fade-left'
  return 'fade-both'
})

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')

/*
  The animation state is deliberately plain and not reactive: it is written onto
  the track, not rendered. A reactive offset would re-render the section on every
  frame of a drag.
*/
let step = 0 // one card plus one gap, in px
let maxOffset = 0 // how far the rail can travel before the last card is in
let offset = 0
let index = 0
let startX = 0
let startOffset = 0
let travelled = 0
let movingTimer = null

/*
  A little longer than the transition, so the fade covers the whole travel and
  the settle, and no longer than that.
*/
function markMoving() {
  moving.value = true
  clearTimeout(movingTimer)
  movingTimer = setTimeout(() => (moving.value = false), 700)
}

function paint() {
  if (track.value) track.value.style.transform = `translate3d(${-offset}px, 0, 0)`
}

/*
  Re-measures the rail and puts the state back on it. Runs on mount, on resize,
  and whenever the index moves.
*/
function sync() {
  const rail = track.value
  const view = viewport.value
  if (!rail || !view) return

  const gap = parseFloat(getComputedStyle(rail).columnGap) || 0
  const card = rail.firstElementChild?.getBoundingClientRect().width ?? 0
  step = card + gap
  maxOffset = Math.max(0, rail.scrollWidth - view.clientWidth)

  const last = step > 0 ? Math.ceil(maxOffset / step) : 0
  index = Math.min(Math.max(index, 0), last)
  offset = Math.min(index * step, maxOffset)

  atStart.value = index <= 0
  atEnd.value = offset >= maxOffset - 1
  current.value = index

  parked.value = items.value.map((_, i) => {
    const left = i * step - offset
    return left + card <= 0 || left >= view.clientWidth
  })

  paint()
}

function page(direction) {
  const last = step > 0 ? Math.ceil(maxOffset / step) : 0
  const next = Math.min(Math.max(index + direction, 0), last)
  if (next === index) return
  index = next
  markMoving()
  sync()
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
  markMoving()
  // No curve while the pointer is in charge, or the rail lags behind it.
  track.value.style.transition = 'none'
  viewport.value.style.userSelect = 'none'
  viewport.value.setPointerCapture(event.pointerId)
}

function onPointerMove(event) {
  if (!dragging.value) return
  const delta = event.clientX - startX
  travelled = Math.max(travelled, Math.abs(delta))
  offset = Math.min(Math.max(startOffset - delta, 0), maxOffset)
  markMoving()
  paint()
}

function onPointerUp(event) {
  if (!dragging.value) return
  dragging.value = false
  markMoving()

  const rail = track.value
  if (rail) rail.style.transition = ''
  if (viewport.value) {
    viewport.value.style.userSelect = ''
    if (viewport.value.hasPointerCapture(event.pointerId)) {
      viewport.value.releasePointerCapture(event.pointerId)
    }
  }

  /*
    Settle on a card, in the next frame: the transform has to change once the
    curve is back in place, or it lands with a jump instead of gliding. A drag
    that moved far enough takes the next card in the direction it was going;
    anything shorter falls back to the nearest.
  */
  requestAnimationFrame(() => {
    const moved = offset - startOffset
    index =
      Math.abs(moved) > step * FLICK ? index + Math.sign(moved) : Math.round(offset / step)
    sync()
  })
}

function onClickCapture(event) {
  if (travelled <= DRAG_SLOP) return
  travelled = 0
  event.stopPropagation()
  event.preventDefault()
}

onMounted(() => {
  // A frame, so the cards are laid out and there is something to measure.
  requestAnimationFrame(sync)
  window.addEventListener('resize', sync, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('resize', sync)
  clearTimeout(movingTimer)
})
</script>

<template>
  <section id="projects" class="projects">
    <SectionHeading index="01" :title="t('section.projects')" :count="items.length" />

    <div class="rail">
      <div class="controls">
        <button
          class="arrow"
          type="button"
          :aria-label="t('a11y.prevProject')"
          :disabled="atStart"
          @click="page(-1)"
        >
          ←
        </button>
        <button
          class="arrow"
          type="button"
          :aria-label="t('a11y.nextProject')"
          :disabled="atEnd"
          @click="page(1)"
        >
          →
        </button>
      </div>

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
        </div>
      </div>
    </div>

    <Testimonials v-if="config.showTestimonials" />
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

.controls {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.arrow {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: transparent;
  border: 1px solid var(--line);
  color: var(--fg);
  cursor: pointer;
  font-size: 16px;
  transition:
    border-color 0.16s ease,
    color 0.16s ease;
}

.arrow:hover:not(:disabled) {
  border-color: var(--acc-text);
  color: var(--acc-text);
}

.arrow:disabled {
  opacity: 0.35;
  cursor: default;
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
  --rail-gap: 20px;
  --rail-peek: 68px;
  --rail-fade: calc(var(--rail-peek) - var(--rail-gap));
  overflow: hidden;
  padding: 12px 0;
  touch-action: pan-y;
  cursor: grab;
}

/*
  A card the clip cuts in half gets a soft edge instead of a hard one, and only
  on the side the rail continues on.
*/
.fade-right {
  -webkit-mask-image: linear-gradient(to right, #000 0, #000 calc(100% - var(--rail-fade)), transparent 100%);
  mask-image: linear-gradient(to right, #000 0, #000 calc(100% - var(--rail-fade)), transparent 100%);
}

.fade-left {
  -webkit-mask-image: linear-gradient(to right, transparent 0, #000 var(--rail-fade), #000 100%);
  mask-image: linear-gradient(to right, transparent 0, #000 var(--rail-fade), #000 100%);
}

.fade-both {
  -webkit-mask-image: linear-gradient(to right, transparent 0, #000 var(--rail-fade), #000 calc(100% - var(--rail-fade)), transparent 100%);
  mask-image: linear-gradient(to right, transparent 0, #000 var(--rail-fade), #000 calc(100% - var(--rail-fade)), transparent 100%);
}

.viewport.dragging {
  cursor: grabbing;
}

.track {
  display: flex;
  gap: var(--rail-gap);
  /* Composited, and the curve is ours: the same arrive-and-settle the lemon and
     the footer use. */
  transition: transform 0.55s cubic-bezier(0.22, 1, 0.36, 1);
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

@media (prefers-reduced-motion: reduce) {
  .track {
    transition: none;
  }
}
</style>
