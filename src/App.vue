<script setup>
/*
  Application root: the background, the fixed chrome, then the page.

  The wrapper reserves `padding-bottom: var(--footer-h)` so the fixed footer
  never sits on top of the last section. TheFooter measures itself and
  publishes that variable — the fallback keeps the layout sane for the one
  frame before the first measurement lands.

  data-hide-cursor turns off the native cursor for the whole subtree; the rule
  lives in tokens.css and only applies on pointer devices.

  useMagnetic() is called here, once, rather than in each component that wants
  the effect: it watches the document for [data-magnetic] and drives whichever
  element is nearest the cursor. One owner, one loop.
*/
import { onBeforeUnmount, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import BackgroundGrid from './components/chrome/BackgroundGrid.vue'
import BlurBands from './components/chrome/BlurBands.vue'
import CursorFx from './components/chrome/CursorFx.vue'
import GridCell from './components/chrome/GridCell.vue'
import LemonPet from './components/chrome/LemonPet.vue'
import ScrollProgress from './components/chrome/ScrollProgress.vue'
import TheFooter from './components/chrome/TheFooter.vue'
import TheMobileMenu from './components/chrome/TheMobileMenu.vue'
import TheNavbar from './components/chrome/TheNavbar.vue'
import { useMagnetic } from './composables/useMagnetic'
import { useScrollSpy, useSectionReached } from './composables/useScrollSpy'
import { config, sections } from './data'

const menuOpen = ref(false)
const route = useRoute()

useMagnetic()

/*
  'top' leads the list even though the hero has no nav link. That is the point:
  while it is the active id, none of the four links match, so nothing is
  highlighted until you have actually scrolled into a section.
*/
const { activeId } = useScrollSpy(['top', ...sections.map((s) => s.id)])

// The grids swap while "about" is still arriving, at 60% — earlier than the
// scroll spy's 35%, so the background has settled before the link lights up.
const pastHero = useSectionReached('#me', 0.6)

function goTop() {
  // scroll-behavior:smooth in tokens.css animates this; under
  // prefers-reduced-motion it jumps instead, which is the point.
  window.scrollTo({ top: 0 })

  /*
    A smooth scroll can stop a few pixels short when the layout settles under it
    — the fixed footer sliding out, the iOS toolbar coming back — and on a phone
    that sliver of the next section is visible. Wait for the position to stop
    changing and then snap the last of it, which does not cut the animation
    short because it lets it finish first.
  */
  let last = -1
  const settle = () => {
    const y = window.scrollY
    if (y === 0) return
    if (y === last) {
      window.scrollTo({ top: 0, behavior: 'auto' })
      return
    }
    last = y
    requestAnimationFrame(settle)
  }
  requestAnimationFrame(settle)
}

/*
  A route change lands at the top. The router makes the jump for the load and for
  the change, but one jump is not enough everywhere: on iOS the page can be put
  back at its old offset while the browser settles its own viewport, so the jump
  is repeated over a few frames, the same "wait until it holds" idea as goTop()
  above. Anchor navigations are left to the router and the global smooth
  behaviour, and it only ever jumps when it is off the top, so it does not fight
  a scroll someone starts right after a navigation.
*/
let landTimers = []

function landAtTop() {
  if (route.hash) return

  const root = document.documentElement
  const smooth = root.style.scrollBehavior
  // Jump, do not glide, while the passes run.
  root.style.scrollBehavior = 'auto'

  const jump = () => {
    if (window.scrollY !== 0) window.scrollTo(0, 0)
  }

  landTimers.forEach(clearTimeout)
  landTimers = [0, 60, 140, 240, 360].map((delay) => setTimeout(jump, delay))
  // Back to the CSS smooth once the last pass has had its frame.
  landTimers.push(setTimeout(() => (root.style.scrollBehavior = smooth), 420))
}

// Not on the first load: the router's own scrollBehavior covers that, and firing
// here would fight the first scroll for the length of the passes.
watch(() => route.fullPath, landAtTop)
onBeforeUnmount(() => landTimers.forEach(clearTimeout))
</script>

<template>
  <div class="app" data-hide-cursor>
    <BackgroundGrid variant="hero" :visible="!pastHero" />
    <BackgroundGrid variant="global" :visible="pastHero" />
    <GridCell v-if="config.showGridCell" :masked="pastHero" />

    <TheNavbar :active-id="activeId" :menu-open="menuOpen" @toggle-menu="menuOpen = !menuOpen" />

    <TheMobileMenu
      :open="menuOpen"
      :active-id="activeId"
      @close="menuOpen = false"
      @go-top="goTop"
    />

    <!--
      The scroll indicator belongs to a page you scroll. On the 404 there is
      nothing to scroll and no scrollbar, so a rail and a "Scroll" label would be
      pointing at something that is not there.
    -->
    <ScrollProgress v-if="route.meta.hero" />
    <!--
      The blur bands belong to the fixed chrome a page scrolls under, so they
      only render where there is a hero to scroll past.
    -->
    <BlurBands v-if="route.meta.hero" />
    <CursorFx />

    <RouterView />

    <!--
      Limonacho belongs to the hero, which only the home route has. On the 404
      there is nothing for him to sit next to, so he is left out; the footer
      stays, and usePastHero brings it in from the first frame there.
    -->
    <LemonPet v-if="config.showLemon && route.meta.hero" />
    <TheFooter @go-top="goTop" />
  </div>
</template>

<style scoped>
.app {
  position: relative;
  /* svh, not vh: on iOS vh is the height with the browser toolbar hidden, so
     mixing the two makes half the page measure against one number and half
     against the other, and they stop moving together when the toolbar
     collapses. The rest of the site is already on svh. */
  min-height: 100svh;
  /*
    border-box so the reserved footer strip counts inside that 100svh. Without
    it the content box gets a full 100svh AND the padding is added on top, so a
    page that is meant to fit the viewport — the 404 — is one footer taller and
    scrolls. That scroll was enough to trip the navbar into its compact state.
  */
  box-sizing: border-box;
  /*
    clip, not hidden. The guard is the same — nothing may stick out sideways and
    bring a horizontal scrollbar with it — but `hidden` has a cost that is not
    obvious: a box with one axis hidden makes the other compute to `auto`, so
    this wrapper became a scroll container, and it never scrolls (its content is
    as tall as it is). A view() timeline is measured against the nearest scroll
    container, so the scroll-driven band in Contact was reading its progress
    against a box that never moves and sat frozen. `clip` does not create a
    scroller, so the timeline belongs to the page again.
  */
  overflow-x: clip;
  padding-bottom: var(--footer-h, 52px);
}
</style>
