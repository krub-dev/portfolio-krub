<script setup>
/*
  Section 01. The projects live in a horizontal rail: three cards and a sliver of
  the fourth on a desktop, one and a sliver on a phone, so a fifth project does
  not push the section another screen down the page. Measured before this: four
  stacked cards were 2319px on a phone against an 839px viewport.

  The rail is a native scroll container with snap, not a transformed track. That
  keeps every card in the DOM — so the keyboard reaches them all, there is no
  hidden focus to trap and no carousel ARIA to get wrong — and it gives the phone
  its swipe for free. The arrows only call scrollBy, and the drag below is the
  same thing for a mouse, which has no horizontal gesture of its own.

  The sliver of the next card is the whole affordance: it says there is more
  without a dot or a counter.

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

// How far a drag has to travel before it counts as one. Under this it is a
// click and the card opens; over it the click is swallowed, because nobody
// means to open a card they just dragged.
const DRAG_SLOP = 6

const { lang } = useLang()
const { t } = useI18n()

defineEmits(['open'])

const items = computed(() =>
  projects.map((project) => ({ ...project, ...project[lang.value] })),
)

const track = ref(null)
const atStart = ref(true)
const atEnd = ref(false)
const dragging = ref(false)

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')

/*
  The arrows disable at the ends, which is also how the reader learns how much
  is left. One pixel of slack, because sub-pixel scroll positions are normal.
*/
function update() {
  const el = track.value
  if (!el) return
  atStart.value = el.scrollLeft <= 1
  atEnd.value = el.scrollLeft >= el.scrollWidth - el.clientWidth - 1
}

function step(direction) {
  const el = track.value
  if (!el) return
  const gap = parseFloat(getComputedStyle(el).columnGap) || 0
  const distance = (el.firstElementChild?.getBoundingClientRect().width ?? 0) + gap
  el.scrollBy({
    left: direction * distance,
    behavior: reduced.matches ? 'auto' : 'smooth',
  })
}

/*
  Dragging with the mouse. Touch already scrolls the rail on its own, so this is
  only for a pointer with no horizontal gesture — and it is why the click is
  watched in the capture phase: a drag that happens to end over a card must not
  open it.
*/
let startX = 0
let startScroll = 0
let travelled = 0

function onPointerDown(event) {
  if (event.pointerType !== 'mouse') return
  dragging.value = true
  travelled = 0
  startX = event.clientX
  startScroll = track.value.scrollLeft
  track.value.setPointerCapture(event.pointerId)
}

function onPointerMove(event) {
  if (!dragging.value) return
  const delta = event.clientX - startX
  travelled = Math.max(travelled, Math.abs(delta))
  track.value.scrollLeft = startScroll - delta
}

function onPointerUp(event) {
  if (!dragging.value) return
  dragging.value = false
  if (track.value.hasPointerCapture(event.pointerId)) {
    track.value.releasePointerCapture(event.pointerId)
  }
}

function onClickCapture(event) {
  if (travelled <= DRAG_SLOP) return
  travelled = 0
  event.stopPropagation()
  event.preventDefault()
}

onMounted(() => {
  update()
  // How much rail there is to scroll changes with the viewport, and the arrows
  // read that.
  window.addEventListener('resize', update, { passive: true })
})

onUnmounted(() => window.removeEventListener('resize', update))
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
          @click="step(-1)"
        >
          ←
        </button>
        <button
          class="arrow"
          type="button"
          :aria-label="t('a11y.nextProject')"
          :disabled="atEnd"
          @click="step(1)"
        >
          →
        </button>
      </div>

      <div
        ref="track"
        class="track"
        :class="{ dragging }"
        role="group"
        :aria-label="t('a11y.projectsRail')"
        tabindex="0"
        @scroll.passive="update"
        @pointerdown="onPointerDown"
        @pointermove="onPointerMove"
        @pointerup="onPointerUp"
        @pointercancel="onPointerUp"
        @click.capture="onClickCapture"
      >
        <ProjectCard
          v-for="(project, i) in items"
          :key="project.slug"
          :name="project.name"
          :tag="project.tag"
          :summary="project.summary"
          :shot-label="project.shotLabel"
          :image="project.image"
          :stack="project.stack"
          @open="$emit('open', i)"
        />
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
  overflow-x: auto makes the other axis compute to auto as well, so it is clipped
  on purpose — with vertical padding, because the magnetic pull moves a card up
  to 10px and would otherwise be cut off. The scrollbar is hidden: the arrows and
  the sliver are the affordance, and a grey bar across the row is not.
*/
.track {
  display: flex;
  gap: 20px;
  overflow-x: auto;
  overflow-y: hidden;
  padding: 12px 0;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
  cursor: grab;
}

.track::-webkit-scrollbar {
  display: none;
}

/* No snapping while a mouse drags it: the browser would fight every frame.
   Taking the class off at the end is what lets it settle onto the nearest card. */
.track.dragging {
  cursor: grabbing;
  user-select: none;
  scroll-snap-type: none;
}

/* Three cards and the sliver of a fourth. The 40px is the two gaps, the 68px the
   sliver. A phone shows one and a sliver of the next. */
.track > * {
  flex: 0 0 calc((100% - 40px - 68px) / 3);
  scroll-snap-align: start;
}

@media (max-width: 900px) {
  .track > * {
    flex: 0 0 82%;
  }
}
</style>
