<script setup>
/*
  The seasonal sticker, stuck on the shutter.

  It is dropped INSIDE the blind, not over the stage, so it rides up with the
  slats when the shutter opens and vanishes with them — a sticker left floating
  over the room behind would read as a bug. The stage itself is untouched.

  Self-guarding: it reads the season from useSeason and renders nothing when it
  is off, so where it is placed never has to know about Halloween. The text is a
  locale string like any other visible label.
*/
import { useI18n } from 'vue-i18n'

import { useSeason } from '../../composables/useSeason'

const { t } = useI18n()
const { season } = useSeason()
</script>

<template>
  <span v-if="season === 'halloween'" class="sticker" aria-hidden="true">
    {{ t('season.sticker') }}
  </span>
</template>

<style scoped>
/*
  A pasted label, not a control: rotated a touch, dashed inset and a cast shadow,
  in the season's own accent. pointer-events off, so the click that lifts the
  blind still belongs to the shutter under it.
*/
.sticker {
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 2;
  transform: translate(-50%, -50%) rotate(-6deg);
  padding: 9px 20px;
  border-radius: 12px;
  background: var(--acc);
  color: var(--on-acc);
  border: 2px dashed color-mix(in srgb, var(--on-acc) 45%, transparent);
  font-family: var(--font-mono);
  font-size: clamp(12px, 1.5vw, 17px);
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  white-space: nowrap;
  pointer-events: none;
  box-shadow: 0 10px 22px -8px color-mix(in srgb, var(--ink) 80%, transparent);
}
</style>
