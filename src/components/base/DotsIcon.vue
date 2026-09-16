<script setup>
/*
  The four dots the two menu buttons share: the mobile menu and the desktop
  settings button.

  They are rounded squares rather than circles — halfway between the two, which
  reads a little firmer at small sizes. On open they spread apart instead of
  turning into an X: each moves out along both axes, so the group opens and
  leaves a gap in the middle. The move is a CSS transform on the squares, which
  is what lets it transition.
*/
defineProps({
  open: { type: Boolean, default: false },
})
</script>

<template>
  <svg class="dots" :class="{ open }" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <rect class="dot tl" x="3.5" y="3.5" width="7" height="7" rx="2" />
    <rect class="dot tr" x="13.5" y="3.5" width="7" height="7" rx="2" />
    <rect class="dot bl" x="3.5" y="13.5" width="7" height="7" rx="2" />
    <rect class="dot br" x="13.5" y="13.5" width="7" height="7" rx="2" />
  </svg>
</template>

<style scoped>
.dot {
  transition: transform 0.28s cubic-bezier(0.22, 1, 0.36, 1);
}

.dots.open .tl {
  transform: translate(-2.5px, -2.5px);
}

.dots.open .tr {
  transform: translate(2.5px, -2.5px);
}

.dots.open .bl {
  transform: translate(-2.5px, 2.5px);
}

.dots.open .br {
  transform: translate(2.5px, 2.5px);
}

/* The spread is decorative motion; the button still reads as open from the
   panel it shows, so it simply does not move. */
@media (prefers-reduced-motion: reduce) {
  .dot {
    transition: none;
  }
}
</style>
