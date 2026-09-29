<script setup>
/*
  The image strip at the top of the project modal.

  It owns its own index — the modal does not care which slide is showing, only
  which project is open.

  The slides are a horizontal track moved by `transform`, the way the projects
  rail moves: every screenshot sits side by side at 100% of the box and the index
  picks which one is framed, so a change slides rather than swapping in a frame.
  With no `images` each slide is the striped frame and a `slides` count stands in
  for the screenshots that are coming.

  The drag is the rail's too: the pointer takes the track over, the pixels it has
  travelled are added to the current slide, and on release a drag past a fifth of
  the box takes the next slide while a shorter one falls back to where it was.
  `DRAG_SLOP` is the line between a drag and a click, and capture is taken in the
  move rather than on the press, so a plain click is never swallowed.

  The dots are the rail's and the testimonials' indicator, laid on its side: a
  24px target each with an 8px mark inside (the WCAG 2.2 minimum), the current one
  a longer pill in the accent. That is why the arrows and the `IMAGE n / total`
  label are gone.
*/
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  images: { type: Array, default: () => [] }, // real screenshots, in order
  slides: { type: Number, default: 1 }, // placeholder count when there are none
  slug: { type: String, required: true },
  name: { type: String, default: '' },
  shotLabel: { type: String, default: '' }, // the striped frame's caption
})

// How far a drag has to travel before it is a drag and not a click, and how much
// of the box it has to cover to count as "the next slide". Same values as the
// rail, so a flick behaves the same in both.
const DRAG_SLOP = 6
const FLICK = 0.2

const { t } = useI18n()
const index = ref(0)

// Back to the first image whenever a different project opens.
watch(() => props.slug, () => (index.value = 0))

const total = computed(() => props.images.length || props.slides)

const carousel = ref(null)
const dragging = ref(false)
const dragX = ref(0)
let startX = 0
let travelled = 0
let pointerId = null

const trackStyle = computed(() => {
  const base = `-${index.value * 100}%`
  return {
    // During a drag the pixels are added to the slide's own position; at rest the
    // index alone decides, and the transition carries it there.
    transform: dragging.value
      ? `translate3d(calc(${base} + ${dragX.value}px), 0, 0)`
      : `translate3d(${base}, 0, 0)`,
  }
})

function onPointerDown(event) {
  if (total.value < 2) return
  dragging.value = true
  dragX.value = 0
  travelled = 0
  startX = event.clientX
  pointerId = event.pointerId
}

function onPointerMove(event) {
  if (pointerId === null || pointerId !== event.pointerId) return
  const delta = event.clientX - startX
  travelled = Math.max(travelled, Math.abs(delta))

  if (!carousel.value?.hasPointerCapture(event.pointerId)) {
    if (travelled <= DRAG_SLOP) return
    carousel.value?.setPointerCapture(event.pointerId)
  }

  dragX.value = delta
}

function onPointerUp(event) {
  if (pointerId === null || pointerId !== event.pointerId) return
  pointerId = null
  dragging.value = false

  if (carousel.value?.hasPointerCapture(event.pointerId)) {
    carousel.value.releasePointerCapture(event.pointerId)
  }

  const width = carousel.value?.clientWidth || 1
  const moved = dragX.value
  // Dragging left brings the next slide in, so the step is the opposite sign.
  const step = Math.abs(moved) > width * FLICK ? -Math.sign(moved) : 0
  index.value = Math.min(Math.max(index.value + step, 0), total.value - 1)
  dragX.value = 0
}
</script>

<template>
  <div class="media">
    <div
      ref="carousel"
      class="carousel"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
    >
      <div class="track" :class="{ dragging }" :style="trackStyle">
        <div v-for="n in total" :key="n" class="slide">
          <img v-if="images.length" class="image" :src="images[n - 1]" :alt="name" />
          <span v-else class="shot-label">{{ shotLabel }}</span>
        </div>
      </div>
    </div>

    <div v-if="total > 1" class="dots" role="group" :aria-label="t('a11y.projectImages')">
      <button
        v-for="n in total"
        :key="n"
        class="dot"
        :class="{ active: n - 1 === index }"
        type="button"
        :aria-label="t('a11y.goToImage', { n })"
        :aria-current="n - 1 === index ? 'true' : undefined"
        @click="index = n - 1"
      />
    </div>
  </div>
</template>

<style scoped>
.media {
  display: flex;
  flex-direction: column;
  /* The panel is a column that scrolls; the media keeps its measured height and
     lets the body be the part that scrolls. */
  flex: 0 0 auto;
}

.carousel {
  /* width, explicitly. As a flex item with only an aspect-ratio and a
     max-height, the width was derived FROM the height — it left the right of the
     row empty. The aspect-ratio now only decides the height on narrow screens. */
  width: 100%;
  /*
    16/10 matches the card's own frame, and a 56svh ceiling keeps it off the roof
    on a laptop. It was 16/9 × 40svh, which read as a letterbox.
  */
  aspect-ratio: 16 / 10;
  max-height: 56svh;
  flex: 0 0 auto;
  display: flex;
  overflow: hidden;
  background: var(--ink);
  /* The rail's declaration: a vertical swipe is left to the page (here, the
     scrolling panel) and a horizontal one comes to the drag. */
  touch-action: pan-y;
  cursor: grab;
  user-select: none;
}

.carousel.dragging {
  cursor: grabbing;
}

/* The travel: the same arrive-and-settle curve the pagers use, so the slide
   lands with the pill rather than after it. Off while a finger is on it, or the
   track would chase the pointer a transition behind. */
.track {
  display: flex;
  flex: 1 1 auto;
  min-width: 0;
  transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}

.track.dragging {
  transition: none;
}

.slide {
  position: relative;
  flex: 0 0 100%;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  /* Wider stripes than the project card's, so the two placeholders read as
     related but not identical. */
  background: repeating-linear-gradient(
    135deg,
    var(--surface-2) 0 14px,
    var(--ink) 14px 28px
  );
}

/* Fills the slide, which is the box the aspect-ratio and the track settle. */
.image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top;
  display: block;
  /* A dragged image must not be grabbed as a file. */
  -webkit-user-drag: none;
}

.shot-label {
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.12em;
  color: var(--fg-3);
}

/*
  The rail's indicator, horizontal: a 24px target with an 8px mark inside it
  (WCAG 2.2 asks for 24px), and the active one a longer pill in the accent. It
  sits under the media on the panel, not over the shot, so the marks are read
  against the panel rather than against whatever the screenshot happens to show.
*/
.dots {
  display: flex;
  justify-content: center;
  gap: 2px;
  padding: 10px 0;
}

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

/* A fill, so the brand yellow is right in both themes. */
.dot.active::before {
  left: 4px;
  right: 4px;
  background: var(--acc);
}

@media (prefers-reduced-motion: reduce) {
  .track,
  .dot::before {
    transition: none;
  }
}
</style>
