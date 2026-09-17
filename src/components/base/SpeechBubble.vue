<script setup>
/*
  Limonacho's speech bubble. Presentation only — the lemon owns the timer that
  shows and hides it.

  `role="status"` makes a screen reader announce the text when it appears,
  without stealing focus. The bubble is a friendly aside, not an alert.

  That is right for the greeting and wrong for a technology name: those change
  as the pointer sweeps the grid, and a live region would read out twenty of
  them. They also say nothing a screen reader does not already have — every tile
  carries its own alt. So the greeting is live and the names are not.
*/
defineProps({
  text: { type: String, required: true },
  live: { type: Boolean, default: true },
})
</script>

<template>
  <p class="bubble" :role="live ? 'status' : undefined">{{ text }}</p>
</template>

<style scoped>
.bubble {
  margin: 0;
  max-width: 230px;
  border-radius: 14px;
  background: var(--surface);
  border: 1px solid var(--line);
  padding: 10px 14px;
  font-size: 13px;
  line-height: 1.45;
  color: var(--fg);
  animation: bubbleIn 0.28s ease both;
}

/* The entrance is decorative; reduced motion drops it and the bubble simply
   appears. tokens.css does the switching off. */
@media (prefers-reduced-motion: reduce) {
  .bubble {
    animation: none;
  }
}
</style>
