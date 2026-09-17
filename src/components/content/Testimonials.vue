<script setup>
/*
  What people say, at the end of the Projects rail: one at a time, in a pager.

  It used to be a column, and a column grows. Measured: one entry is 214px on a
  phone, so three of them made the block 678px and the section nearly two
  screens — the same problem the projects grid had, and the same answer. One at a
  time keeps the block the height of a single quote, however many arrive, and
  that is what lets the quote be shown whole instead of clamped.

  The arrows are vertical and on the side because the movement is: pressing down
  brings the next quote up from below while the one showing leaves upwards. The
  window is clipped and masked at its two edges, so a quote arrives and departs
  through a fade rather than through a hard cut — the mask does nothing at rest,
  because the entries' own padding keeps the text clear of the edges.

  Every entry stays in the DOM — the keyboard has to be able to reach them — so
  the ones that are not showing carry `inert`, which is what keeps Tab from
  walking into a quote nobody can see. Same rule as the projects rail.

  config.showTestimonials is checked by ProjectsSection, not here: the parent
  decides whether the block exists at all.
*/
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import TestimonialCard from './TestimonialCard.vue'
import { useLang } from '../../composables/useLang'
import { testimonials } from '../../data'

const { lang } = useLang()
const { t } = useI18n()

const items = computed(() => testimonials.map((entry) => ({ ...entry, ...entry[lang.value] })))

const pane = ref(null)
const reel = ref(null)
const index = ref(0)
const atStart = ref(true)
const atEnd = ref(false)
const hidden = ref([])

// Plain, not reactive: they are measured from the DOM and written back to it.
let offsets = []
let heights = []

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

  index.value = Math.min(Math.max(index.value, 0), entries.length - 1)
  apply()
}

function apply() {
  const view = pane.value
  const rail = reel.value
  if (!view || !rail || !offsets.length) return

  rail.style.transform = `translateY(${-offsets[index.value]}px)`
  view.style.height = `${heights[index.value]}px`

  atStart.value = index.value <= 0
  atEnd.value = index.value >= offsets.length - 1
  hidden.value = offsets.map((_, i) => i !== index.value)
}

function step(direction) {
  const next = Math.min(Math.max(index.value + direction, 0), offsets.length - 1)
  if (next === index.value) return
  index.value = next
  apply()
}

onMounted(() => {
  measure()
  // And again once the fonts have landed: a reflow changes every height here.
  document.fonts?.ready.then(measure)
  window.addEventListener('resize', measure, { passive: true })
})

onUnmounted(() => window.removeEventListener('resize', measure))
</script>

<template>
  <div class="testimonials">
    <p class="label">{{ t('section.test') }}</p>

    <div class="pager">
      <div ref="pane" class="pane">
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

      <div class="controls">
        <button
          class="arrow"
          type="button"
          :aria-label="t('a11y.prevTestimonial')"
          :disabled="atStart"
          @click="step(-1)"
        >
          ↑
        </button>
        <span class="position">{{ index + 1 }} / {{ items.length }}</span>
        <button
          class="arrow"
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
  display: flex;
  flex-direction: column;
  gap: 18px;
  /* Air before the block, on top of the section's own gap: the rail and the
     quotes are two different things and were sitting too close to tell. */
  margin-top: clamp(28px, 4vw, 56px);
}

/* The same mono label the contact rows use, not a section heading: this is a
   block inside a section, not a destination. A step larger than those rows,
   because this one is a block title and not a field label. */
.label {
  margin: 0;
  font-family: var(--font-mono);
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--fg-3);
}

/*
  The box, with the controls beside it and not above it: the rail already has a
  pair of horizontal arrows over its head, and two pairs in the same column of
  the page read as one control that lost its way.
*/
.pager {
  display: flex;
  align-items: stretch;
  gap: 16px;
  padding: clamp(18px, 2.6vw, 28px) clamp(18px, 2.6vw, 28px);
  border: 1px solid var(--line);
  border-radius: 18px;
  background: var(--surface);
}

/*
  The window. Clipped and masked top and bottom: the mask is what turns the
  arrival and departure of a quote into a fade, and it is invisible at rest
  because the entries carry their own vertical padding and the text never sits on
  the edge.
*/
.pane {
  flex: 1;
  min-width: 0;
  overflow: hidden;
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
  transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
  will-change: transform;
}

.controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.arrow {
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

.arrow:hover:not(:disabled) {
  border-color: var(--acc-text);
  color: var(--acc-text);
}

.arrow:disabled {
  opacity: 0.35;
  cursor: default;
}

.position {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--fg-3);
  white-space: nowrap;
}

@media (max-width: 900px) {
  .pager {
    gap: 12px;
  }

  .arrow {
    width: 36px;
    height: 36px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .pane,
  .reel {
    transition: none;
  }
}
</style>
