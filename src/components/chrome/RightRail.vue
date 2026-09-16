<script setup>
/*
  The fixed rail on the right edge: the accent picker, and — where the route has
  a hero — the scroll indicator below it.

  They are siblings rather than one element because the indicator fades out at
  the end of the page and a control must not disappear just as you reach the
  bottom.

  Hidden below 900px, like the rest of the mouse-era chrome; the accent picker's
  mobile home is the menu.
*/
import AccentSwitcher from './AccentSwitcher.vue'
import ScrollProgress from './ScrollProgress.vue'

defineProps({
  // default false, not true: the caller passes route.meta.hero, which is
  // undefined on a route without a hero, and an undefined prop takes the
  // default — which would have rendered the indicator on the 404.
  showScroll: { type: Boolean, default: false },
})
</script>

<template>
  <div class="rail">
    <AccentSwitcher layout="rail" />
    <ScrollProgress v-if="showScroll" />
  </div>
</template>

<style scoped>
.rail {
  position: fixed;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 95;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 26px;
}

@media (max-width: 900px) {
  .rail {
    display: none;
  }
}
</style>
