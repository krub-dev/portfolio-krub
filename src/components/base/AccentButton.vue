<script setup>
/*
  The accent switcher: one press moves to the next palette.

  It is a single button, not a row of swatches — five dots on screen read as a
  settings panel (owner decision). The face is a disc split diagonally between
  the accent and its hover tone, so it shows the current colour and its variation
  at a glance.

  Two layouts. 'icon' is the 36×36 square in the navbar, beside the theme and
  language controls, on desktop only. 'row' is the full-width row in the mobile
  menu, where another square in the bar read badly and a row matches the
  navigation rows around it.
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
    <template v-if="layout === 'row'">
      <span class="label">{{ t('accent.label') }}</span>
      <span class="name">{{ name }}</span>
    </template>
    <span class="disc" aria-hidden="true" />
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

/* Mobile menu: a full-width row, like the navigation rows around it. */
.accent-btn.row {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  min-height: 44px;
  padding: 10px 0;
  background: transparent;
  border: 0;
  border-top: 1px solid var(--line);
  color: var(--fg-2);
  cursor: pointer;
  font-family: var(--font-mono);
  font-size: 13px;
  text-align: left;
  transition: color 0.16s ease;
}

.accent-btn.row:hover {
  color: var(--acc-text);
}

.accent-btn.row .label {
  font-size: 10px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--fg-3);
}

/* Pushes the disc to the far right of the row. */
.accent-btn.row .name {
  margin-right: auto;
}

.accent-btn.row:hover .label {
  color: var(--acc-text);
}
</style>
