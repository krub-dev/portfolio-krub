<script setup>
/*
  The ghost leaves its tile in the Stack, once per visit.

  It waits until the Stack has climbed into view, then places itself over the
  seasonal tile, grows and drifts off the top of the screen — the tile empties as
  it goes. Once per page load: the flag is component state, so a reload brings it
  back, and there is nothing written down.

  Seasonal and self-contained: HalloweenFx mounts it, it finds its own tile by
  name, and under reduced motion it does nothing at all. Removing the season
  removes it.
*/
import { onBeforeUnmount, ref, watch } from 'vue'

import { useSectionReached } from '../../composables/useScrollSpy'

// Trigger when the Stack's top has crossed halfway up the viewport: at that
// point the tile is on screen and the flight is watched rather than missed.
const reached = useSectionReached('#stack', 0.5)

const root = ref(null)
const flying = ref(false)
let done = false
let timer = 0

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')

function launch() {
  if (done) return
  const ghost = root.value
  const tile = document.querySelector('[data-tile][data-name="Spectre"]')
  if (!ghost || !tile) return
  done = true
  // The tile's box is read now, when it is really on screen.
  const box = tile.getBoundingClientRect()
  ghost.style.setProperty('--x', `${box.left + box.width / 2}px`)
  ghost.style.setProperty('--y', `${box.top + box.height / 2}px`)
  timer = window.setTimeout(() => (flying.value = true), 60)
}

watch(
  reached,
  (value) => {
    // Under reduced motion the flight never happens, but the trigger is still
    // consumed so it does not fire later if the setting changes mid-page.
    if (!value) return
    if (reduced.matches) done = true
    else launch()
  },
  { immediate: true },
)

onBeforeUnmount(() => clearTimeout(timer))
</script>

<template>
  <span ref="root" class="ghost" :class="{ fly: flying }" aria-hidden="true" />
</template>

<style scoped>
.ghost {
  position: fixed;
  top: 0;
  left: 0;
  width: 56px;
  height: 56px;
  z-index: 3;
  pointer-events: none;
  opacity: 0;
  background: url('/assets/img/themeHalloween/ghost.svg') center / contain no-repeat;
  /*
    Parked over its own tile at the trigger coordinates, small and invisible, on
    its own layer. The flight is one keyframe run, so the whole thing is a single
    composited animation from the tile to off-screen.
  */
  transform: translate3d(var(--x, -999px), var(--y, -999px), 0) translate(-50%, -50%) scale(0.2);
  will-change: transform, opacity;
}

.ghost.fly {
  animation: ghostFly 2.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

@keyframes ghostFly {
  0% {
    opacity: 0;
    transform: translate3d(var(--x), var(--y), 0) translate(-50%, -50%) scale(0.2);
  }
  14% {
    opacity: 1;
    transform: translate3d(var(--x), var(--y), 0) translate(-50%, -50%) scale(1.15);
  }
  100% {
    opacity: 0;
    transform: translate3d(calc(var(--x) + 34vw), calc(var(--y) - 72vh), 0) translate(-50%, -50%)
      scale(3.4) rotate(16deg);
  }
}
</style>
