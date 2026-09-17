<script setup>
/*
  The band in Contact, between the heading and the rows: the phrase huge, running
  off both edges, on the accent band the marquee wears, with a second copy of the
  words in outline behind it and a step higher, travelling the other way.

  It moves with the scroll and only with the scroll, and it moves LESS than the
  scroll does — a fifth of its own track, not half — which is what makes it read
  as drifting with the page instead of racing it. It also eases toward where the
  scroll says it should be, so it has a little inertia: it lags a beat behind and
  settles, and the loop stops the moment it has caught up.

  Two earlier versions are worth remembering. One drove the slide from a view()
  timeline in CSS, whose fallback for browsers without scroll-driven animations
  was the marquee's clock: the band moved on its own, which is not what it is
  for. The other worked the progress out by hand but moved half the track across
  the band's own crossing — about two and a half times the scroll, and no amount
  of frame-perfect rendering makes that feel calm. See docs/decisions.md 55.

  The alternation is by WORD, not by letter: per letter it read as noise, and an
  outline "l" between two solid ones looks like a mistake rather than a pattern.
  The parity runs on across the repetitions, because the Spanish phrase is a
  single word ("Hablemos") and restarting it per phrase would paint the band one
  colour.

  Decorative: it says what the section heading already says, so it is
  aria-hidden and its letters are not read out one at a time.
*/
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

import { useScroll } from '../../composables/useScroll'

const props = defineProps({
  text: { type: String, required: true },
})

// Four phrases at a display size that is a fraction of the viewport width is
// wider than any screen this site is read on, with room for the slide below.
const REPEATS = 4

// How far the text travels, as a percentage of the track. Deliberately small:
// this is the difference between drifting and racing.
const TRAVEL = -20

// How much of the remaining distance is covered per frame. Lower is heavier.
const EASING = 0.14

const band = ref(null)
const { y } = useScroll()

let current = 0
let target = 0
let frame = null

// Every letter, each knowing whether its word is the solid one. The space
// between two words is a cell as well, so it can be laid out.
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

// How far the band has crossed the viewport: 0 when its top edge sits at the
// bottom of the screen, 1 when its bottom edge has left the top.
function progress() {
  const el = band.value
  if (!el) return 0

  const rect = el.getBoundingClientRect()
  const range = window.innerHeight + rect.height
  return range > 0 ? Math.min(1, Math.max(0, (window.innerHeight - rect.top) / range)) : 0
}

// Written straight onto the two tracks rather than through a custom property on
// the band: a custom property inherits, so setting it there invalidated the
// computed style of every letter on every tick.
function write(value) {
  const el = band.value
  if (!el) return

  const front = el.querySelector('.layer.front .track')
  const back = el.querySelector('.layer.back .track')
  if (!front || !back) return

  front.style.transform = `translateX(${(value * TRAVEL).toFixed(3)}%)`
  back.style.transform = `translateX(${((1 - value) * TRAVEL).toFixed(3)}%)`
}

/*
  The inertia. A second requestAnimationFrame, which the project's one-loop rule
  would rather not have — but that rule is about the pointer, which runs whenever
  the mouse is over the page. This one only runs while the band is still catching
  up, and it stops itself.
*/
function tick() {
  current += (target - current) * EASING

  if (Math.abs(target - current) < 0.001) {
    current = target
    frame = null
    write(current)
    return
  }

  write(current)
  frame = requestAnimationFrame(tick)
}

function follow() {
  target = progress()
  if (!frame) frame = requestAnimationFrame(tick)
}

/*
  Decorative motion, so under reduced motion it does not happen at all and the
  band sits where it starts.
*/
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')

onMounted(() => {
  if (reduced.matches) return
  current = target = progress()
  write(current)
  window.addEventListener('resize', follow, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('resize', follow)
  if (frame) cancelAnimationFrame(frame)
})

watch(y, () => {
  if (!reduced.matches) follow()
})
</script>

<template>
  <div ref="band" class="band" aria-hidden="true">
    <div v-for="layer in ['back', 'front']" :key="layer" class="layer" :class="layer">
      <div class="track">
        <span
          v-for="(cell, i) in cells"
          :key="i"
          class="letter"
          :class="{ hollow: layer === 'front' && cell.hollow }"
        >{{ cell.char }}</span>
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
  /* Tight on purpose: with a display size this large, a line-height of 1 plus a
     generous padding leaves a band of empty accent under the caps, which reads
     as a mistake rather than as breathing room. */
  padding: clamp(14px, 2vw, 30px) 0;
  /* The marquee's band, at this size. */
  background: var(--acc);
  color: var(--on-acc);
  border-top: 1px solid var(--acc);
  border-bottom: 1px solid var(--acc);
  /* On the band, so the layers can offset themselves in ems of the display
     size rather than in pixels that only work at one width. */
  font-size: clamp(64px, 13vw, 190px);
  font-weight: 700;
  line-height: 0.8;
  letter-spacing: -0.03em;
  text-transform: uppercase;
}

.layer {
  position: relative;
}

/* The band behind: the same words, outline only, a step higher and travelling
   the other way. Out of the flow, or the two would stack and double the height. */
.layer.back {
  position: absolute;
  top: 0;
  left: 0;
  margin-top: -0.1em;
  opacity: 0.45;
}

.track {
  display: flex;
  width: max-content;
  /* The transform is written here from the script; this keeps it on the
     compositor, so the band does not re-rasterise as it moves. */
  will-change: transform;
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
