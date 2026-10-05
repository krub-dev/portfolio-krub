<script setup>
/*
  The yellow band under the hero.

  The loop is seamless because the content is rendered TWICE and the keyframe
  translates exactly -50%: when the first copy has scrolled fully off, the
  second is sitting where the first started, so the reset is invisible.

  That only works if ONE copy is at least as wide as the viewport. It was not:
  the two phrases came to 919px on a 1440px screen, so at the halfway point
  there were 521px of empty band scrolling past. It read as the marquee
  stopping and starting rather than as a gap.

  So the phrase list is repeated `repeats` times inside each copy, enough to
  cover the screen. The count is measured rather than guessed, because it
  depends on the viewport, on the font once it loads, and on the language —
  the Spanish phrases are longer than the English ones.
*/
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

import { useSeason } from '../../composables/useSeason'

const props = defineProps({
  items: { type: Array, required: true },
  separator: { type: String, default: '//' },
  duration: { type: String, default: '26s' },
})

const { season } = useSeason()
// With the season on, the `//` between the phrases becomes a bat. Only the
// separator changes; the phrases and the loop are untouched.
const bat = computed(() => season.value === 'halloween')

const run = ref(null)
const repeats = ref(1)

/*
  Self-correcting: divide the run's current width by the number of repetitions
  currently rendered to get the width of one, then work out how many are
  needed. Called again after it changes, so it settles in a frame or two
  whatever it started from.
*/
function measure() {
  // A ref inside v-for collects an array of elements, not one element. Either
  // copy would do — they are identical — so take the first.
  const el = Array.isArray(run.value) ? run.value[0] : run.value
  if (!el) return

  const single = el.getBoundingClientRect().width / repeats.value
  if (single <= 0) return
  const needed = Math.max(1, Math.ceil(window.innerWidth / single))
  if (needed !== repeats.value) repeats.value = needed
}

onMounted(() => {
  measure()
  window.addEventListener('resize', measure, { passive: true })
})

onUnmounted(() => window.removeEventListener('resize', measure))

// The phrases change width with the language, so the count has to be redone.
watch(() => props.items, () => requestAnimationFrame(measure), { deep: true })

// Flattened once here rather than nesting two v-for in the template. Objects,
// not strings, because the separator can render as the bat rather than as text.
const cells = computed(() => {
  const out = []
  for (let r = 0; r < repeats.value; r += 1) {
    for (const item of props.items) {
      out.push({ text: item })
      out.push({ text: props.separator, sep: true })
    }
  }
  return out
})
</script>

<template>
  <div class="marquee" aria-hidden="true">
    <div class="track" data-motion="decorative" :style="{ animationDuration: duration }">
      <div v-for="copy in 2" :key="copy" ref="run" class="run">
        <span v-for="(cell, i) in cells" :key="`${copy}-${i}`">
          <span v-if="cell.sep && bat" class="bat" aria-hidden="true" />
          <template v-else>{{ cell.text }}</template>
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.marquee {
  position: relative;
  z-index: 1;
  flex: 0 0 auto;
  background: var(--acc);
  color: var(--on-acc);
  overflow: hidden;
  padding: 13px 0;
  border-top: 1px solid var(--acc);
  border-bottom: 1px solid var(--acc);
}

.track {
  display: flex;
  width: max-content;
  animation: marquee 26s linear infinite;
  font-family: var(--font-mono);
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.22em;
  text-transform: uppercase;
}

.run {
  display: flex;
  gap: 38px;
  padding-right: 38px;
}

/*
  The bat: a mask, not an image, so it takes the band's own text colour and
  follows the theme, and keeps the band's rhythm. Sized to the `//` it stands in
  for, and centred on the line rather than sitting on the baseline.
*/
.bat {
  display: inline-block;
  width: 40px;
  height: 17px;
  vertical-align: middle;
  background: var(--on-acc);
  -webkit-mask: url('/assets/img/themeHalloween/bat.svg') center / contain no-repeat;
  mask: url('/assets/img/themeHalloween/bat.svg') center / contain no-repeat;
}
</style>
