<script setup>
/*
  The accent switcher: one press moves to the next palette.

  It is a single button, not a row of swatches — five dots on screen read as a
  settings panel (owner decision). The face is a disc split diagonally between
  the accent and its hover tone, so it shows the current colour and its variation
  at a glance.

  Two layouts. 'icon' is the 36×36 square in the navbar, beside the theme and
  language controls, on desktop only. 'row' is a pill in the mobile menu: the
  first attempt spread a label and the disc across the full width and it was not
  clear what was clickable, so the disc and the palette name now sit together
  inside one pill.
*/
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { useAccent } from '../../composables/useAccent'

defineProps({
  layout: { type: String, default: 'icon' }, // 'icon' | 'row'
})

const { t } = useI18n()
const { accent, cycle } = useAccent()

const name = computed(() => t(`accent.${accent.value}`))
</script>

<template>
  <button
    class="accent-btn"
    :class="layout"
    type="button"
    :aria-label="`${t('accent.label')}: ${name}`"
    :title="`${t('accent.label')}: ${name}`"
    @click="cycle"
  >
    <span class="disc" aria-hidden="true" />
    <span v-if="layout === 'row'" class="name">{{ name }}</span>
  </button>
</template>

<style scoped>
.disc {
  width: 16px;
  height: 16px;
  flex: 0 0 auto;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--acc) 0 50%, var(--acc-2) 50% 100%);
}

/* Navbar: the same frame as the theme and language buttons. */
.accent-btn.icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: transparent;
  border: 1px solid var(--line);
  cursor: pointer;
  transition: border-color 0.16s ease;
}

.accent-btn.icon:hover {
  border-color: var(--acc-text);
}

/* Mobile menu: one pill, disc and name together, so the target is obvious. */
.accent-btn.row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  min-height: 44px;
  padding: 10px 16px;
  border-radius: 999px;
  background: transparent;
  border: 1px solid var(--line);
  color: var(--fg-2);
  cursor: pointer;
  font-family: var(--font-mono);
  font-size: 13px;
  transition:
    border-color 0.16s ease,
    color 0.16s ease;
}

.accent-btn.row:hover {
  border-color: var(--acc-text);
  color: var(--acc-text);
}
</style>
