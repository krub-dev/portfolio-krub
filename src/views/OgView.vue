<script setup>
/*
  DEV SCAFFOLDING — not part of the site.

  The Open Graph banner, at its real size: 1200x630. It lives here so the design
  can be worked on in a browser instead of guessed at inside a generator, and so
  the two pieces that cannot be drawn — the 3D mark and the mascot — are the
  site's own components rather than screenshots of them.

  build-og.mjs (in the cv tool beside this repository) screenshots the `.banner`
  box here and writes public/assets/img/og-banner.png from it, so what ships is
  this page and nothing else.

  Everything the card is made of is a grid multiple. The page grid is 72px, so
  the mark's slot is 504 (7 cells) with its edges on lines at 648/1152 and 72/576,
  and the padding is 72 rather than 80 for the same reason. A box that does not
  land on the grid reads as a mistake next to the lines.

  The headline is written here rather than read from the hero while it is being
  decided; when it settles it moves to src/data/copy.js and the hero follows.

  The banner is dark by design — a social card does not follow a theme — so if the
  site is in the light theme, the colours below are not the shipped ones.

  Like DesignSystemView and LogoLabView this is exempt from the "no literal
  strings in a template" rule: the banner's own composition is the subject. It
  never ships — the route is dev-only.
*/
import { computed, onBeforeUnmount, ref, watch } from 'vue'

import BrandLogo from '../components/base/BrandLogo.vue'
import AppearanceControl from '../components/chrome/AppearanceControl.vue'
import LemonPet from '../components/chrome/LemonPet.vue'
import LogoScene from '../components/sections/LogoScene.vue'
import { useLang } from '../composables/useLang'
import { copy, email } from '../data'

const { lang } = useLang()

const marquee = computed(() => copy.marquee[lang.value])

/*
  The mark lights up when the stage is armed, and on the site that happens a beat
  after the scene is ready — the prop goes from false to true rather than starting
  true, because it is the change that the halo follows. Same here, so the page
  shows what the card will.
*/
const armed = ref(false)
let armTimer = 0

function onReady() {
  clearTimeout(armTimer)
  armTimer = window.setTimeout(() => (armed.value = true), 600)
}

onBeforeUnmount(() => clearTimeout(armTimer))

// Live switches, so a piece can be taken out of the picture while the rest is
// judged on its own.
const showMark = ref(true)
const showLemon = ref(true)
const showGrid = ref(true)

/*
  Two ways to show the mark. The scene is the site's own — the polished 3D mark
  standing in its room — and the room comes with it: it is built inside SceneRig,
  which exposes no switch for it, so "the logo on its own" is the site's other
  mark, the flat accent mask the hero falls back to when the scene cannot start.

  Switching back has to re-arm: the halo follows the prop going from false to
  true, so a mark that comes back with `armed` already true comes back dark.
*/
const flat = ref(false)

watch(showMark, (on) => {
  if (on) armed.value = false
})

/*
  Where the mark's slot sits, in grid cells rather than pixels: the grid is 72px,
  and a slot that does not land on it reads as a mistake next to the lines. 5x5 at
  x8/y1 leaves the bottom-right corner clear for the mascot.

  Numbers rather than dragging: the scene takes the pointer for its own spin, so a
  drag over the slot turns the mark instead of moving the box.
*/
const CELL = 72
const slot = ref({ x: 8, y: 1, size: 5 })

const markStyle = computed(() => ({
  left: `${slot.value.x * CELL}px`,
  top: `${slot.value.y * CELL}px`,
  width: `${slot.value.size * CELL}px`,
  height: `${slot.value.size * CELL}px`,
}))
</script>

<template>
  <main class="page">
    <header class="bar">
      <p class="eyebrow">dev only · open graph</p>
      <p class="size">1200 × 630</p>

      <AppearanceControl />

      <div class="controls">
        <label class="toggle"><input v-model="showMark" type="checkbox" />Mark</label>
        <label class="toggle"><input v-model="flat" type="checkbox" />Flat</label>
        <label class="toggle"><input v-model="showLemon" type="checkbox" />Lemon</label>
        <label class="toggle"><input v-model="showGrid" type="checkbox" />Grid</label>
      </div>

      <div class="slot-controls">
        <span class="size">slot · cells</span>
        <label class="field">x<input v-model.number="slot.x" type="number" min="0" max="16" /></label>
        <label class="field">y<input v-model.number="slot.y" type="number" min="0" max="8" /></label>
        <label class="field"
          >size<input v-model.number="slot.size" type="number" min="2" max="8"
        /></label>
      </div>
    </header>

    <div class="banner">
      <div v-if="showGrid" class="grid" aria-hidden="true" />

      <div class="left">
        <p class="brand">
          <BrandLogo :height="20" />
          <span class="brand-dev">.dev</span>
        </p>

        <p class="name"><span class="acc">K</span>IKO<br /><span class="acc">RUB</span>IO</p>

        <h1 class="headline">FULL STACK<br /><span class="accent">DEVELOPER</span></h1>

        <p class="line skills">Frontend · Backend · Applied AI</p>

        <span class="rule" aria-hidden="true" />

        <div class="details">
          <p class="line">{{ marquee[1] }}</p>
          <p class="line mail">{{ email }}</p>
        </div>
      </div>

      <!--
        The slot the mark stands in, placed in grid cells from the header and
        bound to `.mark` below, so its edges can sit on the lines.
      -->
      <div v-if="showMark" class="mark" :style="markStyle" aria-hidden="true">
        <div v-if="flat" class="flat-mark" />
        <Suspense v-else>
          <LogoScene :halo-on="armed" @ready="onReady" />
        </Suspense>
      </div>

      <div v-if="showLemon" class="pet">
        <LemonPet />
      </div>
    </div>
  </main>
</template>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: 18px;
  align-items: center;
  padding: 24px 0 80px;
}

.bar {
  display: flex;
  align-items: center;
  gap: 18px;
  flex-wrap: wrap;
}

.eyebrow,
.size {
  margin: 0;
  font: 400 11px var(--font-mono);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--fg-3);
}

.controls {
  display: flex;
  gap: 14px;
}

.slot-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.field {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font: 500 12px var(--font-mono);
  color: var(--fg-2);
}

.field input {
  width: 46px;
  padding: 4px 6px;
  font: 500 12px var(--font-mono);
  color: var(--fg);
  background: transparent;
  border: 1px solid var(--line);
  border-radius: 6px;
}

.toggle {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font: 500 12px var(--font-mono);
  color: var(--fg-2);
  cursor: pointer;
}

.toggle input {
  width: 15px;
  height: 15px;
  margin: 0;
  accent-color: var(--acc);
  cursor: pointer;
}

/*
  The banner itself. Everything inside is measured against it, so nothing here
  reads the viewport: the page only decides how it is placed.
*/
.banner {
  position: relative;
  box-sizing: border-box;
  width: 1200px;
  height: 630px;
  flex: 0 0 auto;
  overflow: hidden;
  background: var(--ink);
  color: var(--fg);
  font-family: var(--font-sans);
  display: flex;
  align-items: center;
  /* 72, not 80: the grid's own cell, so the text starts on a line. */
  padding: 72px;
}

.grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(var(--grid) 1px, transparent 1px),
    linear-gradient(90deg, var(--grid) 1px, transparent 1px);
  background-size: 72px 72px;
}

.left {
  position: relative;
  max-width: 540px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.brand {
  display: flex;
  align-items: baseline;
  gap: 2px;
  margin: 0 0 6px;
}

.brand-dev {
  font-family: var(--font-mono);
  font-size: 17px;
  font-weight: 500;
  letter-spacing: 0.02em;
  color: var(--fg-2);
}

.name {
  margin: 0;
  font-family: var(--font-mono);
  font-weight: 700;
  font-size: 28px;
  letter-spacing: 0.18em;
  line-height: 1.1;
}

.name .acc {
  color: var(--acc-text);
}

.headline {
  margin: 0;
  font-size: 62px;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1;
}

.accent {
  color: var(--acc-text);
}

.rule {
  width: 104px;
  height: 3px;
  background: var(--acc);
}

.details {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.line {
  margin: 0;
  font-family: var(--font-mono);
  font-size: 14px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--fg-2);
}

.mail {
  color: var(--acc-text);
}

/*
  The mark, drawn by the site's own scene: no frame, no rim, no blind — what the
  banner wants is the mark, and the room it stands in comes with it. The slot is
  placed against the banner, not against the text, so its edges can sit on the
  grid; its position and size come from the header controls.
*/
.mark {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* The site's own fallback mark: the same mask the hero paints when the scene
   cannot start, at the same 58% of the slot. */
.flat-mark {
  width: 58%;
  aspect-ratio: 1.682;
  background: var(--mark);
  -webkit-mask: url('/assets/img/krub-mark.png') center / contain no-repeat;
  mask: url('/assets/img/krub-mark.png') center / contain no-repeat;
}

/*
  The mascot, out of his fixed position and parked on the last grid cell. He is
  scaled rather than resized: his leaf, his pores and his eyes are all absolute
  pixels inside him, so a wider box would pull him apart.
*/
.pet {
  position: absolute;
  right: 48px;
  bottom: 54px;
}

.pet :deep(.pet) {
  position: relative;
  right: auto;
  bottom: auto;
  transform: scale(1.28);
  transform-origin: bottom right;
}

.pet :deep(.bubble) {
  display: none;
}
</style>
