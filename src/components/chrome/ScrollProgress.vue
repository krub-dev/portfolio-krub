<script setup>
/*
  The thin vertical progress indicator on the right edge.

  Purely decorative — aria-hidden, and it says nothing a scrollbar does not.
  Hidden below 900px, where there is no room and the native scrollbar is right
  there anyway. It fades out over the last 2% so it does not sit on top of the
  footer at the end of the page.
*/
import { useScroll } from '../../composables/useScroll'

defineProps({
  label: { type: String, default: 'Scroll' },
})

const { progress, atEnd } = useScroll()
</script>

<template>
  <div class="indicator" :class="{ faded: atEnd }" aria-hidden="true">
    <span class="label">{{ label }}</span>
    <span class="rail">
      <span class="fill" :style="{ height: `${progress * 100}%` }" />
    </span>
  </div>
</template>

<style scoped>
.indicator {
  position: fixed;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 95;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  pointer-events: none;
  opacity: 1;
  transition: opacity 0.35s ease;
}

.indicator.faded {
  opacity: 0;
}

.label {
  writing-mode: vertical-rl;
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: var(--fg-3);
}

.rail {
  position: relative;
  width: 1px;
  height: 96px;
  background: var(--line);
  overflow: hidden;
}

.fill {
  position: absolute;
  left: 0;
  top: 0;
  width: 1px;
  background: var(--acc);
}

@media (max-width: 900px) {
  .indicator {
    display: none;
  }
}
</style>
