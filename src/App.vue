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

import BackgroundGrid from './components/chrome/BackgroundGrid.vue'
import CursorFx from './components/chrome/CursorFx.vue'
import LemonPet from './components/chrome/LemonPet.vue'
import ScrollProgress from './components/chrome/ScrollProgress.vue'
import TheFooter from './components/chrome/TheFooter.vue'
import TheMobileMenu from './components/chrome/TheMobileMenu.vue'
import TheNavbar from './components/chrome/TheNavbar.vue'
import { useMagnetic } from './composables/useMagnetic'
import { useScrollSpy, useSectionReached } from './composables/useScrollSpy'
import { config, sections } from './data'

const menuOpen = ref(false)

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

    <TheNavbar :active-id="activeId" :menu-open="menuOpen" @toggle-menu="menuOpen = !menuOpen" />

    <TheMobileMenu
      :open="menuOpen"
      :active-id="activeId"
      @close="menuOpen = false"
      @go-top="goTop"
    />

    <ScrollProgress />
    <CursorFx />

    <RouterView />

    <LemonPet v-if="config.showLemon" />
    <TheFooter @go-top="goTop" />
  </div>
</template>

<style scoped>
.app {
  position: relative;
  min-height: 100vh;
  overflow-x: hidden;
  padding-bottom: var(--footer-h, 52px);
}
</style>
