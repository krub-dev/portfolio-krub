<script setup>
/*
  Application root: the fixed chrome, then the page.

  The wrapper reserves `padding-bottom: var(--footer-h)` so the fixed footer
  never sits on top of the last section. TheFooter measures itself and
  publishes that variable — the fallback keeps the layout sane for the one
  frame before the first measurement lands.

  data-hide-cursor turns off the native cursor for the whole subtree; the rule
  lives in tokens.css and only applies on pointer devices.

  useMagnetic() is called here, once, rather than in each component that wants
  the effect: it watches the document for [data-magnetic] and drives whichever
  element is nearest the cursor. One owner, one loop.

  The scroll spy that fills `activeId` arrives in step 9, so no link is
  highlighted yet.
*/
import { ref } from 'vue'

import CursorFx from './components/chrome/CursorFx.vue'
import LemonPet from './components/chrome/LemonPet.vue'
import ScrollProgress from './components/chrome/ScrollProgress.vue'
import TheFooter from './components/chrome/TheFooter.vue'
import TheMobileMenu from './components/chrome/TheMobileMenu.vue'
import TheNavbar from './components/chrome/TheNavbar.vue'
import { useMagnetic } from './composables/useMagnetic'
import { config } from './data'

const menuOpen = ref(false)
const activeId = ref('')

useMagnetic()

function goTop() {
  // scroll-behavior:smooth in tokens.css animates this; under
  // prefers-reduced-motion it jumps instead, which is the point.
  window.scrollTo({ top: 0 })
}
</script>

<template>
  <div class="app" data-hide-cursor>
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
