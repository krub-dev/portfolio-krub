<script setup>
/*
  The seasonal sticker, stuck on the shutter.

  It is dropped INSIDE the blind, not over the stage, so it rides up with the
  slats when the shutter opens and vanishes with them — a sticker left floating
  over the room behind would read as a bug. The stage itself is untouched.

  Self-guarding: it reads the season from useSeason and renders nothing when it
  is off, so where it is placed never has to know about Halloween. The artwork is
  the owner's own sticker; a faint gloss (below) is what makes it read as a
  sticker rather than as a printed label.
*/
import { useSeason } from '../../composables/useSeason'

const { season } = useSeason()
</script>

<template>
  <span v-if="season === 'halloween'" class="sticker" aria-hidden="true" />
</template>

<style scoped>
/*
  A pasted sticker, not a control: tilted a touch, lifting off the metal with a
  soft shadow. pointer-events off, so the click that raises the blind still
  belongs to the shutter under it.
*/
.sticker {
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 2;
  width: min(58%, 180px);
  aspect-ratio: 586 / 515;
  /*
    No tilt: the artwork hangs a spider from a thread, and rotating the sticker
    swung the thread off the vertical. It falls straight.
  */
  transform: translate(-50%, -50%);
  background: url('/assets/img/themeHalloween/codeortreat-sticker.svg') center / contain no-repeat;
  /* A short, soft lift off the metal — enough to read as a sticker, not a drop. */
  filter: drop-shadow(0 2px 3px color-mix(in srgb, var(--ink) 45%, transparent));
  pointer-events: none;
}

/*
  The gloss: one soft diagonal shine, masked to the sticker's own shape so it
  catches the sticker and not the blind behind it. `--specular` is the same
  white highlight the metal uses, so it belongs to the material rather than to
  the theme, and it is deliberately faint.
*/
.sticker::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(112deg, transparent 34%, var(--specular) 47%, transparent 60%);
  -webkit-mask: url('/assets/img/themeHalloween/codeortreat-sticker.svg') center / contain no-repeat;
  mask: url('/assets/img/themeHalloween/codeortreat-sticker.svg') center / contain no-repeat;
  pointer-events: none;
}
</style>
