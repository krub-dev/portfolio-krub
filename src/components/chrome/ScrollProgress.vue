<script setup>
/*
  The thin vertical progress indicator.

  Purely decorative — aria-hidden, and it says nothing a scrollbar does not. It
  fades out over the last 2% so it does not sit on top of the footer at the end
  of the page.

  It is placed, and hidden below 900px, by RightRail — the positioning is the
  rail's job because the accent picker shares the same column.
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
  font-size: 10px;
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
</style>
