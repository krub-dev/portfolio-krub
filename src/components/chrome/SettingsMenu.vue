<script setup>
/*
  The compact navbar's settings button: one trigger that opens the theme, accent
  and language controls in a small panel.

  On desktop the bar keeps the appearance and language controls while it is
  full, and folds them in here once it compacts — the same idea as the mobile
  menu, but for those controls only.

  The panel is teleported to <body> instead of rendering inside the capsule. The
  capsule has a `backdrop-filter`, and an element with one becomes a backdrop
  root: a descendant's own blur would then only see the capsule's content, not
  the page, and the panel would not match the bar's translucent blur. At the top
  level it blurs the page exactly as the bar does, and it is positioned from the
  trigger's own rectangle.

  It closes on the trigger, on Escape, on a click outside, on a scroll and when
  the bar expands again, and its listeners only exist while it is open.
*/
import { onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import AppearanceControl from './AppearanceControl.vue'
import DotsIcon from '../base/DotsIcon.vue'
import LangButton from '../base/LangButton.vue'
import { useScroll } from '../../composables/useScroll'

const props = defineProps({
  visible: { type: Boolean, default: false },
})

const { t } = useI18n()
const { y } = useScroll()

const trigger = ref(null)
const open = ref(false)
const top = ref(0)
const right = ref(0)

function place() {
  const el = trigger.value
  if (!el) return
  const rect = el.getBoundingClientRect()
  top.value = Math.round(rect.bottom + 16)
  right.value = Math.round(window.innerWidth - rect.right)
}

function onKeydown(event) {
  if (event.key === 'Escape') open.value = false
}

function onPointerDown(event) {
  if (!event.target.closest('[data-settings]')) open.value = false
}

watch(open, (isOpen) => {
  if (isOpen) {
    place()
    document.addEventListener('keydown', onKeydown)
    document.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('resize', place)
  } else {
    document.removeEventListener('keydown', onKeydown)
    document.removeEventListener('pointerdown', onPointerDown)
    window.removeEventListener('resize', place)
  }
})

// A scroll closes it, as it does the mobile menu.
watch(y, () => {
  open.value = false
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
  window.removeEventListener('resize', place)
})
</script>

<template>
  <div class="settings" :class="{ open }" data-settings>
    <button
      ref="trigger"
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

    <Teleport to="body">
      <div
        v-if="open"
        class="settings-panel"
        data-motion="decorative"
        data-settings
        :style="{ top: `${top}px`, right: `${right}px` }"
      >
        <AppearanceControl />
        <LangButton />
      </div>
    </Teleport>
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

/* Teleported to <body>, so it is positioned from the trigger's rectangle with
   `position: fixed`. The background and blur are the capsule's own, so the two
   read as the same surface. No shadow. */
.settings-panel {
  animation: panelIn 0.18s ease;
  position: fixed;
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
