<script setup>
/*
  Two bands of blur: one under the bar, one above the footer, so the content
  softens as it passes under the fixed chrome instead of being cut off by it.
  They arrive once the hero is behind you, with the footer and the lemon.

  One strip with `backdrop-filter`, and only there. Blurring each element that
  passes under the chrome would mean a filter per element and a different look
  for each; a single strip softens everything behind it the same way.

  `backdrop-filter` makes its element a backdrop root — the thing decision 48 ran
  into with the navbar's settings panel. These bands are below the chrome in the
  stack and take no pointer, and nothing that blurs is inside them, so the trap
  does not apply here.
*/
import { usePastHero } from '../../composables/usePastHero'

const shown = usePastHero()
</script>

<template>
  <div class="bands" :class="{ shown }" aria-hidden="true">
    <div class="band top" />
    <div class="band bottom" />
  </div>
</template>

<style scoped>
/*
  z-index 90: under the footer (95) and the bar (100), over the page. The bands
  soften the page, and the chrome paints on top of them.
*/
.bands {
  position: fixed;
  inset: 0;
  z-index: 90;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.4s ease;
}

.bands.shown {
  opacity: 1;
}

.band {
  position: absolute;
  left: 0;
  right: 0;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

/*
  Under the bar: as tall as the bar plus a little, fading out at its foot, so the
  blur has no edge of its own. On a phone the bar is a centred pill, so what is
  left of this band is the strip either side of it.
*/
.band.top {
  top: 0;
  height: calc(var(--navbar-h, 88px) + 10px);
  -webkit-mask-image: linear-gradient(to bottom, #000 55%, transparent);
  mask-image: linear-gradient(to bottom, #000 55%, transparent);
}

/* Above the footer: sits on the footer's own top edge and fades upwards. */
.band.bottom {
  bottom: var(--footer-h, 52px);
  height: 56px;
  -webkit-mask-image: linear-gradient(to top, #000 40%, transparent);
  mask-image: linear-gradient(to top, #000 40%, transparent);
}

@media (prefers-reduced-motion: reduce) {
  .bands {
    transition: none;
  }
}
</style>
