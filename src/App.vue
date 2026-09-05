<script setup>
/*
  Application root: the fixed chrome, then the page.

  The wrapper reserves `padding-bottom: var(--footer-h)` so the fixed footer
  never sits on top of the last section. TheFooter measures itself and
  publishes that variable — the fallback keeps the layout sane for the one
  frame before the first measurement lands.

  data-hide-cursor is the hook for the custom cursor in step 8; the rule that
  uses it already exists in tokens.css and only applies on pointer devices.

  The scroll spy that fills `activeId` arrives in step 9, so no link is
  highlighted yet.
*/
import { ref } from 'vue'

import TheFooter from './components/chrome/TheFooter.vue'
import TheMobileMenu from './components/chrome/TheMobileMenu.vue'
import TheNavbar from './components/chrome/TheNavbar.vue'
import ScrollProgress from './components/chrome/ScrollProgress.vue'

const menuOpen = ref(false)
const activeId = ref('')

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

    <RouterView />

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
