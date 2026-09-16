<script setup>
/*
  The appearance control: the theme toggle and the accent picker, side by side.

  One rounded box, two segments and a divider. The first is the ◐ button — one
  click alternates dark and light, as it always did. The second is a disc split
  between the accent and its hover tone, which opens a small dropdown with the
  palette swatches: that is where the accent lives now, because picking the
  colour you want beats pressing a button until it comes round.

  The dropdown closes on Escape, on a click outside and on a choice, and its two
  listeners only exist while it is open.
*/
import { onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import { accents } from '../../data'
import { useAccent } from '../../composables/useAccent'
import { useTheme } from '../../composables/useTheme'

const { t } = useI18n()
const { toggle: toggleTheme } = useTheme()
const { accent, set: setAccent } = useAccent()

const open = ref(false)

function onKeydown(event) {
  if (event.key === 'Escape') open.value = false
}

function onPointerDown(event) {
  if (!event.target.closest('[data-appearance]')) open.value = false
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

onUnmounted(() => {
  document.removeEventListener('keydown', onKeydown)
  document.removeEventListener('pointerdown', onPointerDown)
})

function pick(id) {
  setAccent(id)
  open.value = false
}
</script>

<template>
  <div class="appearance" data-appearance>
    <div class="segments">
      <button
        class="seg seg-theme"
        type="button"
        :aria-label="t('a11y.toggleTheme')"
        :title="t('a11y.toggleTheme')"
        @click="toggleTheme"
      >
        ◐
      </button>

      <span class="divider" aria-hidden="true" />

      <button
        class="seg seg-accent"
        type="button"
        aria-haspopup="true"
        :aria-expanded="open"
        :aria-label="t('accent.label')"
        :title="t('accent.label')"
        @click="open = !open"
      >
        <span class="disc" aria-hidden="true" />
      </button>
    </div>

    <div v-if="open" class="dropdown" role="group" :aria-label="t('accent.label')">
      <button
        v-for="option in accents"
        :key="option.id"
        class="swatch"
        :class="{ on: accent === option.id }"
        type="button"
        :style="{ '--c': `var(--pal-${option.id})` }"
        :aria-label="t(`accent.${option.id}`)"
        :aria-pressed="accent === option.id"
        @click="pick(option.id)"
      >
        <span class="dot" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.appearance {
  position: relative;
}

.segments {
  display: flex;
  align-items: center;
  height: 36px;
  border: 1px solid var(--line);
  border-radius: 10px;
}

.seg {
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  background: none;
  border: 0;
  cursor: pointer;
  color: var(--fg-2);
  transition: color 0.16s ease;
}

.seg:hover {
  color: var(--fg);
}

.seg-theme {
  font-size: 15px;
}

/* The accent and its hover tone, in one face. */
.disc {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--acc) 0 50%, var(--acc-2) 50% 100%);
}

.divider {
  width: 1px;
  height: 18px;
  flex: 0 0 auto;
  background: var(--line);
}

/* Positioned against the control, so it hangs under whichever group it is in. */
.dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  z-index: 160;
  display: flex;
  gap: 6px;
  padding: 8px;
  border: 1px solid var(--line);
  border-radius: 12px;
  background: var(--surface);
  box-shadow: 0 14px 34px rgba(0, 0, 0, 0.32);
}

.swatch {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  background: none;
  border: 0;
  cursor: pointer;
}

.dot {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--c);
  /* A border, so a pastel swatch still has an edge on the light theme. */
  border: 1px solid var(--line);
  transition: box-shadow 0.16s ease;
}

.swatch:hover .dot {
  border-color: var(--fg-2);
}

/* The ring sits on the dot, so it hugs the visible circle. */
.swatch.on .dot {
  box-shadow: 0 0 0 2px var(--surface), 0 0 0 3.5px var(--fg-3);
}

/* 44px touch targets on a phone; the panel is still narrower than the viewport. */
@media (max-width: 900px) {
  .swatch {
    width: 44px;
    height: 44px;
  }

  .dot {
    width: 24px;
    height: 24px;
  }
}
</style>
