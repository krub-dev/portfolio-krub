<script setup>
/*
  The band at the top of Contact: LET'S TALK, huge, running off both edges, with
  the letters alternating between solid and outline.

  It moves with the SCROLL, not with the clock. `animation-timeline: view()`
  ties the slide to how far the band has crossed the viewport, so the type
  travels as the section arrives and settles when it is centred. That is a
  scroll-driven animation: Chrome, Edge and recent Safari have it, and where it
  is missing the @supports block falls back to the same loop the yellow band
  under the hero runs, on a clock. Either way it is a keyframe and a transform —
  no library and no JS, which is all the reference is doing too
  (docs/decisions.md 55).

  The phrase is repeated so that ONE copy is wider than any viewport. The
  keyframe slides exactly -50%, so if a copy were narrower than the screen a gap
  would travel across it — the same trap the yellow band documents at length.

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

// Each letter is a cell with its own parity, worked out per phrase rather than
// across the whole run, so every repetition alternates the same way. The spaces
// are cells too but they do not count towards the parity: they are invisible, so
// counting them would make the visible letters alternate in pairs.
const cells = computed(() => {
  const out = []
  for (let r = 0; r < REPEATS; r += 1) {
    let visible = 0
    for (const char of props.text) {
      const blank = /\s/.test(char)
      out.push({ char, hollow: !blank && visible % 2 === 1 })
      if (!blank) visible += 1
    }
  }
  return out
})
</script>

<template>
  <div class="band" aria-hidden="true">
    <div class="track" data-motion="decorative">
      <div v-for="copy in 2" :key="copy" class="run">
        <span
          v-for="(cell, i) in cells"
          :key="`${copy}-${i}`"
          class="letter"
          :class="{ hollow: cell.hollow }"
        >{{ cell.char }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.band {
  /*
    clip, not hidden. Both cut the track off at the edges, but `overflow: hidden`
    turns this element into a scroll container, and a view() timeline is measured
    against the nearest one — so the band was reading its progress against a box
    that never scrolls and sat at its end state for ever. `clip` cuts it off
    without creating a scroller, so the timeline still belongs to the page.
  */
  overflow: clip;
  padding: clamp(18px, 3vw, 44px) 0;
}

.track {
  display: flex;
  width: max-content;
  animation-name: talkSlide;
  animation-timing-function: linear;
  animation-fill-mode: both;
  animation-timeline: view();
  font-size: clamp(64px, 13vw, 190px);
  font-weight: 700;
  line-height: 0.92;
  letter-spacing: -0.03em;
  text-transform: uppercase;
  color: var(--fg);
}

.run {
  display: flex;
}

/* The space between words is a letter too, and a span would collapse it. */
.letter {
  white-space: pre;
}

/* Half the letters are outline only: no fill, a stroke instead. */
.letter.hollow {
  color: transparent;
  -webkit-text-stroke: 1.5px var(--acc-text);
}

/* No scroll timelines: the band still moves, on a clock, like the one under
   the hero. The @supports test is on the feature, not on a browser. */
@supports not (animation-timeline: view()) {
  .track {
    animation: marquee 26s linear infinite;
  }
}
</style>
