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
import { ref } from 'vue'
import { useRoute } from 'vue-router'

import BackgroundGrid from './components/chrome/BackgroundGrid.vue'
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
}
</script>

<template>
  <div class="app" data-hide-cursor>
    <BackgroundGrid variant="hero" :visible="!pastHero" />
    <BackgroundGrid variant="global" :visible="pastHero" />
    <GridCell :masked="pastHero" />

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
