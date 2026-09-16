<script setup>
/*
  The accent switcher: one press moves to the next palette.

  It is a single button, not a row of swatches — five dots on screen read as a
  settings panel, and this is a one-line control (owner decision). The face is a
  disc split diagonally between the accent and its hover tone, so it shows the
  current colour and its variation at a glance without listing every palette.

  It sits in the navbar next to the theme and language buttons, and shares their
  frame. The aria-label names the current palette, because there is no visible
  text to do it.
*/
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { useAccent } from '../../composables/useAccent'

const { t } = useI18n()
const { accent, cycle } = useAccent()

const name = computed(() => t(`accent.${accent.value}`))
</script>

<template>
  <button
    class="accent-btn"
    type="button"
    :aria-label="`${t('accent.label')}: ${name}`"
    :title="`${t('accent.label')}: ${name}`"
    @click="cycle"
  >
    <span class="disc" aria-hidden="true" />
  </button>
</template>

<style scoped>
/* The same frame as the theme and language buttons in the navbar. */
.accent-btn {
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

.accent-btn:hover {
  border-color: var(--acc-text);
}

/*
  The diagonal split: solid --acc above the line, --acc-2 below. Both tokens are
  palette and theme aware, so the disc is always two related tones.
*/
.disc {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--acc) 0 50%, var(--acc-2) 50% 100%);
}
</style>
