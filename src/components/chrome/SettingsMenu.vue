<script setup>
/*
  The compact navbar's settings button: one trigger that opens the theme, accent
  and language controls in a small panel.

  On desktop the bar keeps the appearance and language controls while it is
  full, and folds them in here once it compacts — the same idea as the mobile
  menu, but for those controls only. It closes on Escape, on a click outside and
  on the trigger, and the listeners only exist while it is open.

  `visible` is the compact state: when the bar expands again the panel closes, so
  it is not left open behind a hidden trigger.
*/
import { onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import AppearanceControl from './AppearanceControl.vue'
import DotsIcon from '../base/DotsIcon.vue'
import LangButton from '../base/LangButton.vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
})

const { t } = useI18n()
const open = ref(false)

function onKeydown(event) {
  if (event.key === 'Escape') open.value = false
}

function onPointerDown(event) {
  if (!event.target.closest('[data-settings]')) open.value = false
}

watch(open, (isOpen) => {
  if (isOpen) {
    document.addEventListener('keydown', onKeydown)
    document.addEventListener('pointerdown', onPointerDown)
  } else {
    document.removeEventListener('keydown', onKeydown)
    document.removeEventListener('pointerdown', onPointerDown)
  }
})

watch(
  () => props.visible,
  (isVisible) => {
    if (!isVisible) open.value = false
  },
)

onUnmounted(() => {
  document.removeEventListener('keydown', onKeydown)
  document.removeEventListener('pointerdown', onPointerDown)
})
</script>

<template>
  <div class="settings" data-settings :class="{ open }">
    <button
      class="trigger"
      type="button"
      aria-haspopup="true"
      :aria-expanded="open"
      :aria-label="t('a11y.settings')"
      :title="t('a11y.settings')"
      @click="open = !open"
    >
      <DotsIcon :open="open" />
    </button>

    <div v-if="open" class="panel">
      <AppearanceControl />
      <LangButton />
    </div>
  </div>
</template>

<style scoped>
.settings {
  position: relative;
}

.trigger {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border-radius: 10px;
  background: transparent;
  border: 1px solid var(--line);
  color: var(--fg);
  cursor: pointer;
  transition:
    border-color 0.16s ease,
    color 0.16s ease;
}

.trigger svg {
  width: 20px;
  height: 20px;
}

.trigger:hover,
.settings.open .trigger {
  border-color: var(--acc-text);
  color: var(--acc-text);
}

/* Hangs under the trigger, right-aligned, with a gap that clears the compact
   capsule's padding so it does not read as glued to the bar. Same translucent
   surface and blur as the capsule, no shadow. */
.panel {
  position: absolute;
  top: calc(100% + 16px);
  right: 0;
  z-index: 160;
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 5px 8px;
  border: 1px solid var(--line);
  border-radius: 12px;
  background: color-mix(in srgb, var(--surface) 84%, transparent);
  backdrop-filter: blur(14px);
}
</style>
