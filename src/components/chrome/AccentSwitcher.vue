<script setup>
/*
  The accent picker: one swatch per palette, the current one ringed. Selecting is
  direct rather than cycling — with five options a click beats four.

  It renders in two places, and only the layout changes: the fixed rail on the
  right of the page (desktop) and the mobile menu. The button is the touch
  target and the .dot inside is what you see, so the row can keep 44px targets
  without five 44px circles across the panel.

  Each swatch is painted with var(--pal-<id>), the identity colour declared in
  tokens.css, so no hex and no palette list lives here.
*/
import { useI18n } from 'vue-i18n'

import { accents } from '../../data'
import { useAccent } from '../../composables/useAccent'

defineProps({
  layout: { type: String, default: 'rail' }, // 'rail' | 'row'
})

const { t } = useI18n()
const { accent, set } = useAccent()
</script>

<template>
  <div class="picker" :class="layout">
    <span class="label">{{ t('accent.label') }}</span>

    <div class="swatches" role="group" :aria-label="t('accent.label')">
      <button
        v-for="option in accents"
        :key="option.id"
        class="swatch"
        :class="{ on: accent === option.id }"
        type="button"
        :aria-label="t(`accent.${option.id}`)"
        :aria-pressed="accent === option.id"
        @click="set(option.id)"
      >
        <span class="dot" :style="{ '--c': `var(--pal-${option.id})` }" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.picker {
  display: flex;
  align-items: center;
  gap: 10px;
}

.rail {
  flex-direction: column;
}

.row {
  flex-direction: row;
  justify-content: center;
}

.label {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: var(--fg-3);
}

/* Vertical in the rail, matching the scroll indicator's label. */
.rail .label {
  writing-mode: vertical-rl;
}

.row .label {
  letter-spacing: 0.16em;
}

.swatches {
  display: flex;
  gap: 6px;
}

.rail .swatches {
  flex-direction: column;
}

.swatch {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 0;
  background: none;
  cursor: pointer;
}

.rail .swatch {
  width: 16px;
  height: 16px;
}

.row .swatch {
  width: 44px;
  height: 44px;
}

.dot {
  display: block;
  border-radius: 50%;
  background: var(--c);
  /* A border, so a pastel swatch still has an edge on the light theme. */
  border: 1px solid var(--line);
  transition: box-shadow 0.16s ease;
}

.rail .dot {
  width: 14px;
  height: 14px;
}

.row .dot {
  width: 22px;
  height: 22px;
}

.swatch:hover .dot {
  border-color: var(--fg-2);
}

/* The ring sits on the dot, not the button, so it hugs the visible circle. */
.swatch.on .dot {
  box-shadow: 0 0 0 2px var(--ink), 0 0 0 3px var(--fg-3);
}
</style>
