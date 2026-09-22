<script setup>
/*
  "Available for work" with the pulsing dot, top-left of the hero stage.

  The dot does NOT blink — that was a deliberate design decision. It is two
  layers in a 5×5px box: a solid core that never moves, and a ring around it
  that is born small, fades in, grows and fades out completely before
  restarting. A blink would read as an alert; this reads as a heartbeat.

  The green is one of the two documented exceptions to "no literal colours":
  it belongs to this element, not to the theme, and stays the same in both.

  data-motion="decorative" is the opt-in that lets the reduced-motion rule in
  tokens.css switch the ring off without touching anything else.
*/
defineProps({
  label: { type: String, required: true },
  color: { type: String, default: '#39D98A' },
})
</script>

<template>
  <p class="badge">
    <span class="dot" aria-hidden="true">
      <span class="ring" data-motion="decorative" :style="{ borderColor: color }" />
      <span class="core" :style="{ background: color }" />
    </span>
    <span>{{ label }}</span>
  </p>
</template>

<style scoped>
.badge {
  margin: 0;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--fg-3);
}

.dot {
  position: relative;
  width: 5px;
  height: 5px;
  flex: 0 0 auto;
  display: inline-block;
}

.ring {
  position: absolute;
  inset: -5px;
  border-radius: 50%;
  border: 1px solid;
  opacity: 0;
  will-change: transform, opacity;
  animation: dotHalo 2.6s cubic-bezier(0.15, 0.6, 0.3, 1) infinite;
}

.core {
  position: absolute;
  inset: 0;
  border-radius: 50%;
}
</style>
