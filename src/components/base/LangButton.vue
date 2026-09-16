<script setup>
/*
  The ES / EN button. One click toggles the language.

  A component rather than inline markup because it now sits in two places: the
  navbar capsule on desktop and the mobile menu header. The look is the navbar
  control it always was — nothing about it changed.
*/
import { useI18n } from 'vue-i18n'

import { useLang } from '../../composables/useLang'

const { t } = useI18n()
const { lang, toggle } = useLang()
</script>

<template>
  <button
    class="lang-btn"
    type="button"
    :aria-label="`${lang.toUpperCase()} — ${t('a11y.toggleLang')}`"
    @click="toggle"
  >
    {{ lang.toUpperCase() }}
  </button>
</template>

<style scoped>
.lang-btn {
  height: 36px;
  padding: 0 12px;
  border-radius: 10px;
  background: transparent;
  border: 1px solid var(--line);
  color: var(--fg);
  cursor: pointer;
  font-family: var(--font-mono);
  font-size: 12px;
  letter-spacing: 0.1em;
  transition:
    background-color 0.16s ease,
    border-color 0.16s ease,
    color 0.16s ease;
}

.lang-btn:hover {
  border-color: var(--acc-text);
  color: var(--acc-text);
}
</style>
