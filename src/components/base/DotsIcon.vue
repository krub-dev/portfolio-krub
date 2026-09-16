<script setup>
/*
  The four dots the two menu buttons share: the mobile menu and the desktop
  settings button.

  On open they spread apart instead of turning into an X: each moves out along
  both axes, so the group opens and leaves a gap in the middle. The move is a CSS
  transform on the dots, which is what lets it transition — with an overshoot
  curve and a 20ms stagger between them, so they ripple.

  They do NOT melt together and apart again: a gooey filter needs the resting gap
  to be wider than the gap while moving, and here the closed state is the
  tightest the group ever is. See docs/decisions.md 53.
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
  /*
    A curve with a little overshoot, so the dots arrive with a snap instead of
    gliding to a stop. At 2.5px of travel that overshoot is a fraction of a
    pixel — what actually reads is the wave below, not the bounce.
  */
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/*
  The wave: each dot leaves a beat after the one before it, clockwise from the
  top left, so the group ripples open instead of moving as one rigid block.
  Delays on the base rule, so closing ripples back the same way.
*/
.tl { transition-delay: 0ms; }
.tr { transition-delay: 20ms; }
.br { transition-delay: 40ms; }
.bl { transition-delay: 60ms; }

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
