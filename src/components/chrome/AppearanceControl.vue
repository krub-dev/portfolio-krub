<script setup>
/*
  The appearance control: dark, light and the accent palette, in one segmented
  pill.

  The first two segments set the theme directly — they are the state, not a
  toggle button, so the active one is painted with the accent and carries a soft
  glow. The third opens a small dropdown with the accent swatches, which is where
  the accent lives now: showing the colours beats pressing a button until the
  right one comes round.

  It replaces both the old single dark/light button and the cycling accent
  button, on desktop and in the mobile control bar.

  The dropdown closes on Escape, on a click outside and on a choice, and its two
  listeners only exist while it is open.
*/
import { onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import { accents } from '../../data'
import { useAccent } from '../../composables/useAccent'
import { useTheme } from '../../composables/useTheme'

const { t } = useI18n()
const { theme, set: setTheme } = useTheme()
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
        class="seg seg-dark"
        type="button"
        :class="{ on: theme === 'dark' }"
        :aria-pressed="theme === 'dark'"
        :aria-label="t('a11y.themeDark')"
        :title="t('a11y.themeDark')"
        @click="setTheme('dark')"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M20.4 14.6A8.6 8.6 0 0 1 9.4 3.6a7.2 7.2 0 1 0 11 11Z" />
        </svg>
      </button>

      <span class="divider" aria-hidden="true" />

      <button
        class="seg seg-light"
        type="button"
        :class="{ on: theme === 'light' }"
        :aria-pressed="theme === 'light'"
        :aria-label="t('a11y.themeLight')"
        :title="t('a11y.themeLight')"
        @click="setTheme('light')"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="4.1" fill="currentColor" />
          <path
            d="M12 2.4v2.3M12 19.3v2.3M2.4 12h2.3M19.3 12h2.3M5.6 5.6l1.6 1.6M16.8 16.8l1.6 1.6M18.4 5.6l-1.6 1.6M7.2 16.8l-1.6 1.6"
            fill="none"
            stroke="currentColor"
            stroke-width="1.9"
            stroke-linecap="round"
          />
        </svg>
      </button>

      <span class="divider" aria-hidden="true" />

      <button
        class="seg seg-palette"
        type="button"
        :class="{ on: open }"
        aria-haspopup="true"
        :aria-expanded="open"
        :aria-label="t('accent.label')"
        :title="t('accent.label')"
        @click="open = !open"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true">
          <path d="M12 3.2a8.8 8.8 0 0 0 0 17.6c1.1 0 1.9-.85 1.9-1.85 0-.5-.2-.95-.5-1.27-.29-.33-.46-.75-.46-1.19 0-.95.78-1.72 1.72-1.72h1.4A4.94 4.94 0 0 0 21 9.8c0-3.9-4.03-6.6-9-6.6Z" />
          <circle cx="7.6" cy="11.7" r="1.05" fill="currentColor" stroke="none" />
          <circle cx="10.1" cy="7.7" r="1.05" fill="currentColor" stroke="none" />
          <circle cx="14.4" cy="7.7" r="1.05" fill="currentColor" stroke="none" />
          <circle cx="17" cy="11.3" r="1.05" fill="currentColor" stroke="none" />
        </svg>
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
  transition:
    color 0.16s ease,
    filter 0.16s ease;
}

.seg svg {
  width: 17px;
  height: 17px;
}

.seg:hover {
  color: var(--fg);
}

/* The active theme segment is the state, so it is painted with the accent and
   carries a soft glow. --acc is a fill, but here it is a light source, which is
   what the glow needs. */
.seg.on {
  color: var(--acc-text);
  filter: drop-shadow(0 0 6px color-mix(in srgb, var(--acc) 75%, transparent));
}

.seg.on:hover {
  color: var(--acc-text);
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
