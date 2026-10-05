<script setup>
/*
  Halloween's lights-out, and finding the way back.

  When the shutter opens — the moment the room behind lights up — the rest of the
  page goes dark instead. Everything but the chrome (navbar, footer, Calabazacho):
  a round hole rides the cursor like a torch, its edge only slightly feathered,
  and the stage lights itself, so it needs nothing here. Poke Calabazacho, or
  wait, or reach the end of the page, and the lights come back with a flicker; a
  poke also earns a line from him.

  Seasonal and self-contained. HalloweenFx mounts it; it finds the shutter and the
  pumpkin by class, so LogoStage and LemonPet know nothing about it, and it goes
  with the season. Desktop only (no cursor on a phone) and off under reduced
  motion.
*/
import { onBeforeUnmount, onMounted, ref } from 'vue'

import { useLang } from '../../composables/useLang'
import { useLemonVoice } from '../../composables/useLemonVoice'
import { usePointer } from '../../composables/usePointer'
import { copy } from '../../data'

// How long the dark holds if nobody finds the pumpkin.
const ESCAPE_MS = 20000
// How long Calabazacho's line stays up after a poke.
const SAY_MS = 4000
// After the click, wait out the blind, the beat and the tube's whole strike, so
// the page only follows them out once the 3D has finished lighting up.
const IGNITION_MS = 3600

const root = ref(null)
const dark = ref(false)
const flicker = ref(false)

const { lang } = useLang()
const { say, hush } = useLemonVoice()

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
const desktop = window.matchMedia('(hover: hover) and (min-width: 901px)')

let observer = null
let timer = 0
let sayTimer = 0
let ignitionTimer = 0
// The dark happens once, on the shutter's first open. Without this the lights
// came back and then went out again: the observer looks for a `.shutter.open`
// on every class change, and the flicker toggling a class IS such a change.
let spent = false

// The torch, driven by the app's single rAF loop — no listener of its own.
usePointer((pointer) => {
  const el = root.value
  if (!el || !dark.value) return
  el.style.setProperty('--x', `${pointer.x}px`)
  el.style.setProperty('--y', `${pointer.y}px`)
})

// The metal rim's band, so the hole is the frame's inside and not its edge.
const RIM = 12

/*
  The stage keeps its hole in the dark, a SQUARE cut to the frame's inside so the
  scene shows through — the frame, the shutter, the ring and the mark all paint
  over it, the way they already do. Read off the live rect: it scrolls with the
  hero.
*/
function trackStage() {
  const el = root.value
  const stage = document.querySelector('.stage')
  if (!el || !stage) return
  const box = stage.getBoundingClientRect()
  el.style.setProperty('--sl', `${box.left + RIM}px`)
  el.style.setProperty('--st', `${box.top + RIM}px`)
  el.style.setProperty('--sr', `${box.right - RIM}px`)
  el.style.setProperty('--sb', `${box.bottom - RIM}px`)
}

function lightsOn(touched = false) {
  if (!dark.value) return
  clearTimeout(timer)
  dark.value = false
  document.documentElement.removeAttribute('data-season-dark')
  // The flicker of the lights coming back, the way the tube struck.
  if (!reduced.matches) {
    flicker.value = false
    requestAnimationFrame(() => (flicker.value = true))
    window.setTimeout(() => (flicker.value = false), 1200)
  }
  if (touched) {
    /*
      Back to the top, without reloading. He is fixed to the corner, so the poke
      lands wherever the visitor happened to be — often well past the hero, in
      the dark. The page reads from the start, so that is where they come back to
      (the glide is the global `scroll-behavior: smooth`).
    */
    window.scrollTo({ top: 0 })
    clearTimeout(sayTimer)
    say(copy.lemon[lang.value].touched)
    sayTimer = window.setTimeout(hush, SAY_MS)
  }
}

function lightsOut() {
  if (spent || reduced.matches || !desktop.matches) return
  spent = true
  clearTimeout(ignitionTimer)
  ignitionTimer = window.setTimeout(() => {
    trackStage()
    dark.value = true
    // A marker on <html> so the pet can shiver while the game is on, without
    // this component knowing anything about it (see halloween.css).
    document.documentElement.setAttribute('data-season-dark', '')
    clearTimeout(timer)
    timer = window.setTimeout(() => lightsOn(false), ESCAPE_MS)
  }, IGNITION_MS)
}

/*
  The stroke of light that gives it away, watched on the shutter's own class so
  the stage stays untouched. Watched on the whole document, not on the shutter
  itself: this layer mounts before the hero does, so at mount there is no shutter
  to find yet.
*/
function watchShutter() {
  observer = new MutationObserver(() => {
    if (document.querySelector('.shutter.open')) lightsOut()
  })
  observer.observe(document.body, {
    subtree: true,
    attributes: true,
    attributeFilter: ['class'],
  })
}

// A poke on the pumpkin brings the light back; reaching the foot of the page
// brings it back too, so nobody is left in the dark.
function onDown(event) {
  if (!dark.value) return
  if (event.target.closest?.('.lemon')) lightsOn(true)
}

function onScroll() {
  if (!dark.value) return
  trackStage()
  const atFoot = window.scrollY + window.innerHeight >= document.body.scrollHeight - 4
  if (atFoot) lightsOn(false)
}

onMounted(() => {
  watchShutter()
  window.addEventListener('pointerdown', onDown, { passive: true })
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', trackStage, { passive: true })
})

onBeforeUnmount(() => {
  observer?.disconnect()
  window.removeEventListener('pointerdown', onDown)
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', trackStage)
  document.documentElement.removeAttribute('data-season-dark')
  clearTimeout(timer)
  clearTimeout(sayTimer)
  clearTimeout(ignitionTimer)
})
</script>

<template>
  <!--
    One dark layer with a single round hole cut out of it, riding the cursor.
    Over the sections and the chrome but under the mascot, so the way out stays
    lit and reachable.
  -->
  <div ref="root" class="dark" :class="{ on: dark, flicker }" aria-hidden="true" />
</template>

<style scoped>
/* Registered so the torch's position can be transitioned. */
@property --x {
  syntax: '<length>';
  inherits: false;
  initial-value: -999px;
}

@property --y {
  syntax: '<length>';
  inherits: false;
  initial-value: -999px;
}

.dark {
  position: fixed;
  inset: 0;
  /*
    Over everything but the mascot: the navbar (100) and the footer (95) go dark
    too, and Calabazacho (120) is the one light left on — the way out. The
    cursor (300) still rides on top.
  */
  z-index: 110;
  pointer-events: none;
  opacity: 0;
  /*
    The torch TRAILS the cursor: `--x`/`--y` are registered above, so a transition
    on them eases the hole toward the pointer instead of pinning it under it —
    the same chase the cursor ring runs on the dot.
  */
  transition:
    opacity 0.5s ease,
    --x 0.32s cubic-bezier(0.22, 1, 0.36, 1),
    --y 0.32s cubic-bezier(0.22, 1, 0.36, 1);
  background: color-mix(in srgb, var(--ink) 97%, transparent);
  /*
    Two holes, cut two ways so they add up instead of fighting:

    - the stage is a SQUARE taken with `clip-path` (evenodd: the viewport, then
      the frame's inside reversed, which punches it out), which is the hole a
      gradient cannot draw;
    - the torch is the `mask`, a hard circle with a little feather at the rim.

    Clip and mask intersect, so the dark comes through where either holds light.
  */
  --sl: -999px;
  --st: -999px;
  --sr: -999px;
  --sb: -999px;
  clip-path: polygon(
    evenodd,
    0 0,
    100% 0,
    100% 100%,
    0 100%,
    0 0,
    var(--sl) var(--st),
    var(--sr) var(--st),
    var(--sr) var(--sb),
    var(--sl) var(--sb),
    var(--sl) var(--st)
  );
  -webkit-mask: radial-gradient(
    circle 165px at var(--x, -999px) var(--y, -999px),
    transparent 0 84%,
    #000 100%
  );
  mask: radial-gradient(
    circle 165px at var(--x, -999px) var(--y, -999px),
    transparent 0 84%,
    #000 100%
  );
}

.dark.on {
  opacity: 1;
}

/* The lights coming back: a flick, a pause, then held — the tube's own strike. */
.dark.flicker {
  animation: darkStrike 1.1s steps(1, end) 1;
}

@keyframes darkStrike {
  0% {
    opacity: 1;
  }
  18% {
    opacity: 0.15;
  }
  30% {
    opacity: 1;
  }
  44% {
    opacity: 0.2;
  }
  58% {
    opacity: 1;
  }
  70% {
    opacity: 0.25;
  }
  100% {
    opacity: 0;
  }
}
</style>
