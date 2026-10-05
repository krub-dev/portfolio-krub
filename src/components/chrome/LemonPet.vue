<script setup>
/*
  Limonacho, the lemon in the bottom-right corner.

  He is drawn entirely in CSS — no image, no SVG. The body is one div with a
  four-value elliptical border-radius, which is what gives it the slightly
  lopsided lemon silhouette instead of a plain oval. Flat --acc fill, no
  gradient: that is a settled design decision.

  He rides in from the RIGHT in a straight line, at the same moment as the
  footer, and sits on top of it — hence translating up by --footer-h. No tilt
  on entry.

  The two greens are the second documented exception to "no literal colours":
  the leaf's colours belong to the leaf, not to the theme, and stay the same in
  both.
*/
import { computed, onMounted, onUnmounted, ref } from 'vue'

import { useAcho } from '../../composables/useAcho'
import { useLang } from '../../composables/useLang'
import { useLemonVoice } from '../../composables/useLemonVoice'
import { isPointerDevice, usePointer } from '../../composables/usePointer'
import { usePastHero } from '../../composables/usePastHero'
import { useSeason } from '../../composables/useSeason'
import { copy } from '../../data'
import SpeechBubble from '../base/SpeechBubble.vue'

const PUPIL_TRAVEL = 4 // px the pupils can drift inside the eye
// The pumpkin's eye holes are shallower, so its eyes travel less before they
// would leave the white.
const PUMPKIN_TRAVEL = 4

const pointerDevice = isPointerDevice()

const { lang } = useLang()
const { season } = useSeason()

/*
  With the season on, Limonacho is a pumpkin. The CSS lemon is swapped for the
  pumpkin and its eyes, which come from two SVGs that share one 4267x3755 canvas
  — so the eyes land in the pumpkin's own holes at any size. The eyes are a single
  layer that looks at the cursor, where the lemon's are two pupils; everything
  else (the voice, the poke, the bubble) is unchanged.
*/
const pumpkin = computed(() => season.value === 'halloween')

const body = ref(null)
const leftPupil = ref(null)
const rightPupil = ref(null)
const eyes = ref(null)

const shaking = ref(false)
const greeting = ref(false)

let bubbleTimer = null
let shakeTimer = null
let unlisten = null

// The greeting. With the season on he introduces himself as Calabazacho.
const text = computed(() => {
  const words = copy.lemon[lang.value]
  return pumpkin.value ? words.pumpkin : words.bubble
})
// Same trigger as the footer, so the two arrive together.
const shown = usePastHero()

const { message, listen } = useLemonVoice()
const { playOnce } = useAcho()

/*
  He says one thing at a time: the name of the tile the pointer is on, or the
  once-a-visit greeting. The name wins — it is the one being asked for — and the
  greeting is still there when the pointer leaves the grid.
*/
const said = computed(() => message.value || (greeting.value ? text.value : ''))

/*
  The pupils look at a point. Each eye works out the direction from its own
  centre to it and slides its pupil that way, capped at 4px — the distance is
  normalised, so a cursor across the room and a cursor just outside the eye both
  produce a full look, rather than the pupil creeping further out the further
  away you are.
*/
function lookAt(x, y) {
  // The pumpkin's eyes are one layer over the whole button, so it is the layer
  // that drifts, measured from the button's own centre.
  if (pumpkin.value) {
    const el = eyes.value
    if (!el) return
    const box = el.getBoundingClientRect()
    const dx = x - (box.left + box.width / 2)
    const dy = y - (box.top + box.height / 2)
    const length = Math.hypot(dx, dy) || 1
    const travel = Math.min(PUMPKIN_TRAVEL, length)
    el.style.transform = `translate(${((dx / length) * travel).toFixed(2)}px, ${((dy / length) * travel).toFixed(2)}px)`
    return
  }

  for (const pupil of [leftPupil.value, rightPupil.value]) {
    if (!pupil) continue
    const eye = pupil.parentElement.getBoundingClientRect()
    const dx = x - (eye.left + eye.width / 2)
    const dy = y - (eye.top + eye.height / 2)
    const length = Math.hypot(dx, dy) || 1
    const travel = Math.min(PUPIL_TRAVEL, length)
    pupil.style.transform = `translate(${((dx / length) * travel).toFixed(2)}px, ${((dy / length) * travel).toFixed(2)}px)`
  }
}

usePointer((pointer) => lookAt(pointer.x, pointer.y))

/*
  On touch there is no cursor to follow, so he looks at whatever was tapped last
  instead. The transition on .pupil is what turns it into a glance rather than a
  jump, and it only exists on touch: on a pointer device the loop above rewrites
  the position every frame, and a transition there would drag the eyes behind the
  mouse.
*/
function onPointerDown(event) {
  if (pointerDevice) return
  lookAt(event.clientX, event.clientY)
}

function poke() {
  // The first poke of a visit is the greeting: the voice and the bubble. Every
  // later one is just the shake. Asked for before the rAF below, because the
  // audio has to be requested inside the click itself.
  const first = playOnce()

  // Restart the shake even mid-shake: removing the class and forcing a reflow
  // before adding it back is what makes a CSS animation replay.
  shaking.value = false
  clearTimeout(shakeTimer)
  requestAnimationFrame(() => {
    shaking.value = true
    shakeTimer = setTimeout(() => (shaking.value = false), 500)
  })

  if (!first) return

  // While the lights are out, the poke is what switches them back on, and the
  // seasonal line says so; the welcome would talk over it. SeasonDark marks
  // that on <html>, so this stays a plain "is the game on" read.
  if (document.documentElement.hasAttribute('data-season-dark')) return

  greeting.value = true
  clearTimeout(bubbleTimer)
  bubbleTimer = setTimeout(() => (greeting.value = false), 4000)
}

/*
  Registering is what tells the Stack there is a voice, so it hands the naming
  over instead of running its own readout. The cleanup goes with the unmount,
  and it takes the bubble down with it.
*/
onMounted(() => {
  unlisten = listen()
  window.addEventListener('pointerdown', onPointerDown, { passive: true })
})

onUnmounted(() => {
  unlisten?.()
  window.removeEventListener('pointerdown', onPointerDown)
  clearTimeout(bubbleTimer)
  clearTimeout(shakeTimer)
})
</script>

<template>
  <div class="pet" :class="{ shown, pumpkin }">
    <!--
      Not live for a technology name: those change as the pointer sweeps the
      grid, and every tile already carries its own alt. It goes when he goes:
      the bubble is pinned to him, so on the way out it was hanging half off the
      edge while he slid away.
    -->
    <SpeechBubble v-if="said && shown" :text="said" :live="!message" />

    <button
      ref="body"
      class="lemon"
      :class="{ shaking, pumpkin }"
      type="button"
      :aria-label="text"
      @click="poke"
    >
      <!-- Seasonal: the pumpkin and its own eyes, in place of the whole lemon. -->
      <template v-if="pumpkin">
        <span class="pumpkin-body" aria-hidden="true" />
        <span ref="eyes" class="pumpkin-eyes" aria-hidden="true" />
      </template>

      <template v-else>
        <span class="nub" aria-hidden="true" />
        <span class="leaf" aria-hidden="true" />
        <span class="skin">
          <span class="pore p1" aria-hidden="true" />
          <span class="pore p2" aria-hidden="true" />
          <span class="pore p3" aria-hidden="true" />
          <span class="pore p4" aria-hidden="true" />
          <span class="eye"><span ref="leftPupil" class="pupil" /></span>
          <span class="eye"><span ref="rightPupil" class="pupil" /></span>
        </span>
      </template>
    </button>
  </div>
</template>

<style scoped>
.pet {
  position: fixed;
  /*
    Two things position him, and they must not share a property.

    Vertically he stands on the footer, so his offset tracks --footer-h. That
    number changes the instant iOS collapses its toolbar and the safe-area
    inset appears, growing the footer by ~34px. Horizontally he slides in from
    the right over 0.55s, which is the entrance the spec asks for.

    Both used to be one transform, so the transition applied to both — the
    footer grew immediately and he took half a second to catch up, overlapping
    it the whole way. Now the vertical offset is `bottom`, which is layout and
    updates in the same frame, and the transform only ever moves him sideways.

    No safe-area insets of his own: the bottom one is already inside
    --footer-h, and a right inset would move his resting position without
    moving the parked one, so translateX(160%) would stop being far enough to
    hide him.
  */
  bottom: calc(24px + var(--footer-h, 0px));
  right: 24px;
  z-index: 120;
  /* His width, shared: the bubble is pushed left by exactly this much so it
     sits beside him rather than on his head. */
  --lemon-w: 58px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
  /* Parked off to the right until the footer arrives. */
  transform: translateX(160%);
  transition: transform 0.55s cubic-bezier(0.22, 1, 0.36, 1);
}

/* Straight in from the right. No rotation — settled decision. The height he
   stands at is `bottom`, not part of this. */
.pet.shown {
  transform: translateX(0);
}

/*
  Out of the flex flow and pinned above-left of him. The bubble has no tail, so
  centred over him it would read as sitting on his leaf; pushed left by exactly
  his width it reads as his voice coming from beside him. Absolute so that
  appearing and disappearing never nudges the mascot — with it in the column, the
  pumpkin's taller box made that nudge visible where the lemon's did not.
*/
.pet :deep(.bubble) {
  position: absolute;
  right: var(--lemon-w);
  bottom: calc(100% + 10px);
  margin: 0;
  /*
    Out of the flow the width is shrink-to-fit against the pet, which is only as
    wide as the mascot — so every word landed on its own line. `max-content`
    takes the text's own width, capped by the bubble's max-width.
  */
  width: max-content;
}

.lemon {
  position: relative;
  width: var(--lemon-w);
  height: 48px;
  padding: 0;
  border: 0;
  background: none;
  cursor: pointer;
}

/*
  The pumpkin is a bigger mascot than the lemon, and a background is clipped to
  its box — so making the art bigger means growing the box, not scaling past it.
  The bubble's offset follows --lemon-w, so it keeps clear of the wider pumpkin.
*/
.pet.pumpkin {
  --lemon-w: 92px;
}

.pet.pumpkin .lemon {
  height: 78px;
}

.lemon.shaking {
  animation: lemonShake 0.5s ease;
}

/*
  The pumpkin, in the same box as the lemon. Body and eyes are two masks over one
  shared canvas, so they line up whatever the box size; `contain` keeps the whole
  pumpkin in it.
*/
.pumpkin-body,
.pumpkin-eyes {
  position: absolute;
  inset: 0;
  background-position: center;
  background-repeat: no-repeat;
  /* The art has margins inside the shared canvas, so `contain` left it small in
     the box; scaling the canvas up to 150% of the height makes the pumpkin fill
     the lemon's box. Body and eyes share the size, so they stay aligned. */
  background-size: auto 150%;
}

.pumpkin-body {
  background-image: url('/assets/img/themeHalloween/pumpkin.svg');
}

.pumpkin-eyes {
  background-image: url('/assets/img/themeHalloween/eyes-pumpkin.svg');
  /*
    Its own layer. The eyes are one raster that the loop moves a fraction of a
    pixel every frame; without a stable layer the browser re-rasterises it each
    time and the pupil shimmers — the same flicker the lemon's CSS-drawn pupils
    never had, because those are vectors.
  */
  will-change: transform;
}

.nub {
  position: absolute;
  top: -5px;
  left: 50%;
  transform: translateX(-50%);
  width: 11px;
  height: 12px;
  border-radius: 5px 5px 3px 3px;
  background: var(--acc-solid);
}

.leaf {
  position: absolute;
  top: -5px;
  left: calc(50% + 7px);
  width: 21px;
  height: 12px;
  border-radius: 100% 0 100% 0;
  background: #3ea34b;
  box-shadow: 0 0 0 1.2px #2c7a36;
  transform: rotate(-24deg);
  transform-origin: left center;
}

/* The four-value radius is what makes it a lemon and not an egg: the slashes
   separate horizontal from vertical radii, so each corner is an ellipse. */
.skin {
  position: absolute;
  inset: 0;
  border-radius: 50% 50% 48% 48% / 58% 58% 42% 42%;
  background: var(--acc-solid);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  overflow: hidden;
}

.pore {
  position: absolute;
  border-radius: 50%;
  background: color-mix(in srgb, var(--acc-solid) 62%, #000);
}

.p1 { bottom: 9px; right: 11px; width: 4.4px; height: 4.4px; opacity: 0.55; }
.p2 { bottom: 15px; right: 18px; width: 3.6px; height: 3.6px; opacity: 0.45; }
.p3 { bottom: 6px; right: 21px; width: 3px; height: 3px; opacity: 0.4; }
.p4 { bottom: 12px; left: 12px; width: 3.2px; height: 3.2px; opacity: 0.35; }

.eye {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #ffffff;
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pupil {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #0c0c0d;
}

/* On touch he cannot follow a cursor, so he glances at the last tap. Only on
   touch: on a pointer device the frame loop writes this every frame, and a
   transition there would drag the eyes behind the mouse. */
@media (hover: none) {
  .pupil,
  .pumpkin-eyes {
    transition: transform 0.45s cubic-bezier(0.22, 1, 0.36, 1);
  }
}

@media (max-width: 900px) {
  .pet {
    bottom: calc(16px + var(--footer-h, 0px));
    right: 18px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .pet {
    transition: none;
  }

  .lemon.shaking {
    animation: none;
  }

  .pupil,
  .pumpkin-eyes {
    transition: none;
  }
}
</style>
