<script setup>
/*
  The band at the top of Contact: the phrase huge, running off both edges, on the
  accent band the marquee wears, with a second copy of the words in outline
  behind it and a step higher, drifting the other way.

  It moves with the SCROLL and only with the scroll. The first version drove the
  slide from a `view()` timeline in CSS — the elegant way to do it — but its
  fallback was the marquee's clock, so on a browser without scroll-driven
  animations the band moved on its own, which is not what this band is for. The
  progress is worked out here and written to a CSS variable; the transform stays
  in CSS.

  The listener is not a new one: useScroll() already owns the app's single scroll
  handler and this reads its position. The rectangle is measured on every tick on
  purpose — caching it is the trap the marquee documents at length, because the
  page's height is not final until the fonts and the sections are in.

  The alternation is by WORD, not by letter: per letter it read as noise, and an
  outline "l" between two solid ones looks like a mistake rather than a pattern.
  The parity carries on across the repetitions and into the second copy, because
  the Spanish phrase is a single word ("Hablemos") and an odd count would
  otherwise put two solid words together at the seam where the track wraps.

  Decorative: it says what the section heading already says, so it is
  aria-hidden and its letters are not read out one at a time.
*/
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

import { useScroll } from '../../composables/useScroll'

const props = defineProps({
  text: { type: String, required: true },
})

// Three phrases at a display size that is a fraction of the viewport width is
// comfortably wider than any screen this site is read on.
const REPEATS = 3

const band = ref(null)
const { y } = useScroll()

// One copy of the track, with the word parity running 0, 1, 0, 1… down it. The
// space that separates two words is a cell as well, so it can be laid out.
const cells = computed(() => {
  const words = props.text.split(/\s+/).filter(Boolean)
  const out = []
  let index = 0

  for (let r = 0; r < REPEATS; r += 1) {
    for (const word of words) {
      const hollow = index % 2 === 1
      for (const char of word) out.push({ char, hollow })
      out.push({ char: ' ', hollow: false })
      index += 1
    }
  }

  return out
})

/*
  The two copies the -50% slide is built from. The second carries the alternation
  ON rather than starting it again, or the seam where the track wraps shows two
  solid words in a row. With an even number of words per copy the pattern already
  repeats exactly and nothing is flipped.
*/
const copies = computed(() => {
  const first = cells.value
  const odd = (REPEATS * props.text.split(/\s+/).filter(Boolean).length) % 2 === 1
  if (!odd) return [first, first]
  return [first, first.map((cell) => ({ char: cell.char, hollow: !cell.hollow }))]
})

/*
  How far the band has crossed the viewport: 0 when its top edge sits at the
  bottom of the screen, 1 when its bottom edge has left the top. Written as a
  variable rather than applied here, so both layers can read the same number and
  move opposite ways.
*/
function slide() {
  const el = band.value
  if (!el) return

  const rect = el.getBoundingClientRect()
  const range = window.innerHeight + rect.height
  const progress = range > 0 ? Math.min(1, Math.max(0, (window.innerHeight - rect.top) / range)) : 0

  el.style.setProperty('--band-progress', progress.toFixed(4))
}

/*
  Decorative motion, so under reduced motion it does not happen at all and the
  band sits at the start. The global [data-motion="decorative"] rule cannot do
  this one: there is no animation to switch off, the number comes from here.
*/
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')

onMounted(() => {
  if (reduced.matches) return
  slide()
  window.addEventListener('resize', slide, { passive: true })
})

onUnmounted(() => window.removeEventListener('resize', slide))

watch(y, () => {
  if (!reduced.matches) slide()
})
</script>

<template>
  <div ref="band" class="band" aria-hidden="true">
    <div
      v-for="layer in ['back', 'front']"
      :key="layer"
      class="layer"
      :class="layer"
    >
      <div class="track">
        <div v-for="(copy, c) in copies" :key="c" class="run">
          <span
            v-for="(cell, i) in copy"
            :key="i"
            class="letter"
            :class="{ hollow: layer === 'front' && cell.hollow }"
          >{{ cell.char }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/*
  clip, not hidden. Both cut the track off at the edges, but `overflow: hidden`
  turns this element into a scroll container — and a box with one axis hidden
  makes the other compute to `auto` — which is a trap this section has already
  paid for once. `clip` cuts it off without creating a scroller.
*/
.band {
  position: relative;
  overflow: clip;
  padding: clamp(20px, 3vw, 48px) 0;
  /* The marquee's band, at this size. */
  background: var(--acc);
  color: var(--on-acc);
  border-top: 1px solid var(--acc);
  border-bottom: 1px solid var(--acc);
  /* On the band, so the layers can offset themselves in ems of the display
     size rather than in pixels that only work at one width. */
  font-size: clamp(64px, 13vw, 190px);
  font-weight: 700;
  line-height: 0.92;
  letter-spacing: -0.03em;
  text-transform: uppercase;
}

.layer {
  position: relative;
}

/* The band behind: the same words, outline only, a step higher and drifting the
   other way. Out of the flow, or the two would stack and double the height. */
.layer.back {
  position: absolute;
  top: 0;
  left: 0;
  margin-top: -0.12em;
  opacity: 0.45;
}

.track {
  display: flex;
  width: max-content;
  /* The slide. --band-progress is 0 to 1, written by the script above. */
  transform: translateX(calc(var(--band-progress, 0) * -50%));
}

/* The same number, read backwards: this one travels the other way. */
.layer.back .track {
  transform: translateX(calc((1 - var(--band-progress, 0)) * -50%));
}

.run {
  display: flex;
}

/* The space between words is a cell too, and a span would collapse it. */
.letter {
  white-space: pre;
}

/* Half the words are outline only: no fill, a stroke in the band's own text
   colour, which is what makes them read against the accent. */
.letter.hollow {
  color: transparent;
  -webkit-text-stroke: 1.5px var(--on-acc);
}

/* The layer behind is outline whatever its cells say. */
.layer.back .letter {
  color: transparent;
  -webkit-text-stroke: 1.5px var(--on-acc);
}
</style>
