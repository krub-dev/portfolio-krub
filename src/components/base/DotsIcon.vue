<script setup>
/*
  The four dots the two menu buttons share: the mobile menu and the desktop
  settings button.

  On open they spread apart instead of turning into an X: each moves out along
  both axes, so the group opens and leaves a gap in the middle. The move is a CSS
  transform on the dots, which is what lets it transition.
*/
defineProps({
  open: { type: Boolean, default: false },
})
</script>

<template>
  <svg class="dots" :class="{ open }" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <circle class="dot tl" cx="8" cy="8" r="2.8" />
    <circle class="dot tr" cx="16" cy="8" r="2.8" />
    <circle class="dot bl" cx="8" cy="16" r="2.8" />
    <circle class="dot br" cx="16" cy="16" r="2.8" />
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
