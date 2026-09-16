import { computed, onUnmounted, ref } from 'vue'
import { useRoute } from 'vue-router'

import { useScroll } from './useScroll'

/*
  "Has the visitor left the hero behind?" — the moment the fixed footer and
  Limonacho slide in.

  Both used to test `y > innerHeight * 0.55` on their own. That number was
  chosen for the desktop layout, where the hero wrapper is exactly one viewport
  tall and the marquee sits on the fold: 55% of a viewport lands the arrival
  somewhere sensible inside the hero.

  On a phone the wrapper is taller than the viewport, so the same fraction
  fires while the visitor is still reading the headline — the chrome arrives
  before the page has visibly started. The marquee is the honest line: it is
  the band that says the hero is over. So the trigger is the bottom of the hero
  wrapper, whatever height it happens to have.

  The height is measured rather than assumed because it is not knowable in CSS
  terms: it depends on the viewport, on how the headline wraps, and on the
  language.
*/

// Module scope: one observer, however many components ask. The page has a
// single hero, so a second observer would be watching the same element to
// compute the same boolean.
const heroBottom = ref(0)
let observer = null
let consumers = 0

function measure(el) {
  // Distance from the top of the DOCUMENT, not the viewport: the value has to
  // survive scrolling, and getBoundingClientRect() is relative to the viewport.
  heroBottom.value = el.getBoundingClientRect().bottom + window.scrollY
}

export function usePastHero() {
  const { y } = useScroll()
  const route = useRoute()

  if (consumers === 0) {
    const el = document.querySelector('[data-hero-wrap]')
    if (el) {
      // Fires on a resize, an orientation change, a font load or a language
      // switch — anything that changes how tall the hero ended up.
      observer = new ResizeObserver(() => measure(el))
      observer.observe(el)
      measure(el)
    }
  }
  consumers += 1

  onUnmounted(() => {
    consumers -= 1
    if (consumers === 0) {
      observer?.disconnect()
      observer = null
    }
  })

  /*
    The route says whether there is a hero at all, rather than the measured
    value: `heroBottom` is 0 both when the route has no wrapper (the 404) and
    for the moment before the wrapper has been measured, and those two want
    opposite answers. On the 404 the footer and the lemon are wanted on screen
    from the first frame — the page is one viewport tall and does not scroll, so
    waiting for a movement that never comes would leave both hidden and the
    strip App.vue reserves for the footer empty. On a route with a hero, the
    line is the wrapper's bottom, with a fraction of the viewport as the value
    until the measurement lands.
  */
  return computed(() => {
    if (!route.meta.hero) return true
    const line = heroBottom.value > 0 ? heroBottom.value : window.innerHeight * 0.55
    return y.value > line
  })
}
