<script setup>
/*
  The band at the top of Contact: the phrase huge, running off both edges, with
  a second band of the same words in outline behind it and a step above, drifting
  the other way.

  The alternation is by WORD, not by letter. Per letter it read as noise — an
  outline "l" between two solid ones looks like a mistake, not a pattern — and
  per word it reads as two colours, which is what the reference does. The parity
  carries on across the repetitions rather than restarting, so a phrase of one
  word (the Spanish "Hablemos") still alternates down the band instead of
  repeating a single colour for ever.

  It moves with the SCROLL, not with the clock. `animation-timeline: view()` ties
  the slide to how far the band has crossed the viewport, so the type travels as
  the section arrives and settles when it is centred. Chrome, Edge and recent
  Safari have that; where it is missing the @supports block falls back to the
  loop the yellow band under the hero runs, on a clock. Either way it is a
  keyframe and a transform — no library and no JS, which is all the reference is
  doing either (docs/decisions.md 55).

  The phrase is repeated so that ONE copy is wider than any viewport: the
  keyframe slides exactly -50%, so a copy narrower than the screen would let a
  gap travel across it — the trap the yellow band documents at length.

  Decorative: it says what the section heading already says, so it is
  aria-hidden and its letters are not read out one at a time.
*/
import { computed } from 'vue'

const props = defineProps({
  text: { type: String, required: true },
})

// Three phrases at a display size that is a fraction of the viewport width is
// comfortably wider than any screen this site is read on.
const REPEATS = 3

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
  The two copies the -50% loop is built from.

  The second one carries the alternation ON rather than starting it again, or the
  seam where the track wraps shows two solid words in a row. That happens with an
  odd number of words per copy, which is the Spanish case: one word, repeated
  three times, ends on solid and would start again on solid. With an even count
  the pattern already repeats exactly and nothing is flipped.
*/
const copies = computed(() => {
  const first = cells.value
  const odd = (REPEATS * props.text.split(/\s+/).filter(Boolean).length) % 2 === 1
  if (!odd) return [first, first]
  return [first, first.map((cell) => ({ char: cell.char, hollow: !cell.hollow }))]
})
</script>

<template>
  <div class="band" aria-hidden="true">
    <div
      v-for="layer in ['back', 'front']"
      :key="layer"
      class="layer"
      :class="layer"
      data-motion="decorative"
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
  turns this element into a scroll container, and a view() timeline is measured
  against the nearest one — so the band was reading its progress against a box
  that never scrolls and sat at its end state for ever. `clip` cuts it off
  without creating a scroller, so the timeline still belongs to the page.
*/
.band {
  position: relative;
  overflow: clip;
  padding: clamp(22px, 3.4vw, 52px) 0;
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
  opacity: 0.5;
}

.track {
  display: flex;
  width: max-content;
  animation-name: talkSlide;
  animation-timing-function: linear;
  animation-fill-mode: both;
  animation-timeline: view();
  color: var(--fg);
}

.layer.back .track {
  animation-direction: reverse;
}

.run {
  display: flex;
}

/* The space between words is a cell too, and a span would collapse it. */
.letter {
  white-space: pre;
}

/* Half the words are outline only: no fill, a stroke instead. */
.letter.hollow {
  color: transparent;
  -webkit-text-stroke: 1.5px var(--acc-text);
}

/* The layer behind is outline whatever its cells say. */
.layer.back .letter {
  color: transparent;
  -webkit-text-stroke: 1.5px var(--fg-3);
}

/* No scroll timelines: the band still moves, on a clock, like the one under
   the hero. The @supports test is on the feature, not on a browser. */
@supports not (animation-timeline: view()) {
  .track {
    animation: marquee 26s linear infinite;
  }
}
</style>
