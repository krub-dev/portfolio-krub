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
  the mark's slot is a whole number of cells — six by default, 432px — and the
  padding is 72 rather than 80 for the same reason. A box that does not land on
  the grid reads as a mistake next to the lines.

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
import SpeechBubble from '../components/base/SpeechBubble.vue'
import AppearanceControl from '../components/chrome/AppearanceControl.vue'
import LemonPet from '../components/chrome/LemonPet.vue'
import LogoScene from '../components/sections/LogoScene.vue'
import { useLang } from '../composables/useLang'
import { copy, email } from '../data'

const { lang } = useLang()

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
const showRoom = ref(true)
const showLemon = ref(true)
const showGrid = ref(true)

/*
  The room's darkening: painted into its vertex colours, so the walls and their
  grid sink together toward the back. `opacity` is how dark the far wall goes; 0
  is the site's flat box. `diffuse` is how much of that darkening the opening
  shares — 0 is one flat tone edge to back, 1 leaves the opening at the page tone
  and keeps it all for the back.
*/
const opacity = ref(0.6)
const diffuse = ref(0.65)

// Switching the mark back on has to re-arm: the halo follows the prop going from
// false to true, so a mark that comes back with `armed` already true comes back
// dark.
watch(showMark, (on) => {
  if (on) armed.value = false
})

/*
  Where the mark's slot sits, in grid cells rather than pixels: the grid is 72px,
  and a slot that does not land on it reads as a mistake next to the lines. 6x6 at
  x8/y1 leaves the bottom-right corner clear for the mascot.

  Numbers rather than dragging: the scene takes the pointer for its own spin, so a
  drag over the slot turns the mark instead of moving the box.
*/
const CELL = 72
const slot = ref({ x: 8, y: 1, size: 6 })

const markStyle = computed(() => ({
  left: `${slot.value.x * CELL}px`,
  top: `${slot.value.y * CELL}px`,
  width: `${slot.value.size * CELL}px`,
  height: `${slot.value.size * CELL}px`,
}))

/*
  The mark does not fill its slot, so its size is a dial: a multiplier on the
  fit-to-stage scale inside the scene. It is not a CSS transform on the slot, which
  would shrink the room with the mark and pull the room off the slot's edge.
*/
const markScale = ref(0.9)

/*
  The background grid follows the room. The room's opening is cut into the same
  seven cells the stage is, so its lines only land on the page's when the slot is
  7 cells across; at any other size the background has to be scaled to the room's
  own cell and moved to start at the slot's corner, or the two grids cross. With
  the room off there is nothing to line up with, and the page's own 72px grid is
  the one to draw.
*/
const gridStyle = computed(() => {
  if (!showRoom.value) return { backgroundSize: '72px 72px', backgroundPosition: '0 0' }
  const cell = (slot.value.size * CELL) / 7
  return {
    backgroundSize: `${cell}px ${cell}px`,
    backgroundPosition: `${slot.value.x * CELL}px ${slot.value.y * CELL}px`,
  }
})

/*
  The LinkedIn banner's own switches and slot, kept apart from the card's. The
  slot is the 3D box in whole cells of the page grid: it is placed and sized from
  x/y/size, the room is divided into the same number of cells, and the background
  grid starts at its corner — so the room's lines always land on the page's.
*/
const liGridOn = ref(true)
const liLemon = ref(true)
const liBubble = ref(true)
// The cell size of the banner's own grid, so the grid can be made coarser or
// finer and the slot still lands on its lines.
const liCell = ref(72)
const liSlot = ref({ x: 15, y: 1, size: 4 })
// Nudges, in px: the middle column, and Limonacho's bubble off its column.
const liCenterX = ref(0)
const liBubbleX = ref(-30)
// The lockup: its size, and where it sits from the top-left.
const liBrandSize = ref(48)
const liBrandX = ref(0)
const liBrandY = ref(0)

// The README banner (1280x640, 2:1 — GitHub's social-preview size). Same pieces
// as the card, no photo band to dodge, so the column and the mark are balanced.
//
// Its grid is defined by a column count rather than a pixel cell, so it always
// starts at the banner's edge and ends on the other one — 1280/cols is the cell,
// and the height (half the width) comes out at cols/2 rows for an even count.
const ghLemon = ref(true)
const ghGrid = ref(true)
const ghCols = ref(16)
const ghSlot = ref({ x: 8, y: 1, size: 6 })
const ghCell = computed(() => 1280 / ghCols.value)

const ghStageStyle = computed(() => ({
  left: `${ghSlot.value.x * ghCell.value}px`,
  top: `${ghSlot.value.y * ghCell.value}px`,
  width: `${ghSlot.value.size * ghCell.value}px`,
  height: `${ghSlot.value.size * ghCell.value}px`,
}))

const ghGridStyle = computed(() => ({
  backgroundSize: `${ghCell.value}px ${ghCell.value}px`,
}))

const liStageStyle = computed(() => ({
  left: `${liSlot.value.x * liCell.value}px`,
  top: `${liSlot.value.y * liCell.value}px`,
  width: `${liSlot.value.size * liCell.value}px`,
  height: `${liSlot.value.size * liCell.value}px`,
}))

const liGridStyle = computed(() => ({
  backgroundSize: `${liCell.value}px ${liCell.value}px`,
  backgroundPosition: `${liSlot.value.x * liCell.value}px ${liSlot.value.y * liCell.value}px`,
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
        <label class="toggle"><input v-model="showRoom" type="checkbox" />Room</label>
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

      <div class="slot-controls">
        <span class="size">opacity</span>
        <label class="field"
          ><input
            v-model.number="opacity"
            type="number"
            min="0"
            max="1"
            step="0.05"
        /></label>
      </div>

      <div class="slot-controls">
        <span class="size">diffuse</span>
        <label class="field"
          ><input
            v-model.number="diffuse"
            type="number"
            min="0"
            max="1"
            step="0.05"
        /></label>
      </div>

      <div class="slot-controls">
        <span class="size">mark</span>
        <label class="field"
          >scale<input
            v-model.number="markScale"
            type="number"
            min="0.3"
            max="2"
            step="0.05"
        /></label>
      </div>
    </header>

    <div class="banner">
      <div v-if="showGrid" class="grid" :style="gridStyle" aria-hidden="true" />

      <div class="left">
        <p class="brand">
          <BrandLogo :height="20" />
          <span class="brand-dev">.dev</span>
        </p>

        <p class="name"><span class="acc">K</span>IKO<br /><span class="acc">RUB</span>IO</p>

        <h1 class="headline">FULL STACK<br /><span class="accent">DEVELOPER</span></h1>

        <p class="line skills">Frontend · Backend · 3D · Applied AI</p>

        <span class="rule" aria-hidden="true" />

        <div class="details">
          <p class="line place">{{ copy.locations[lang] }}</p>
          <p class="line mail">{{ email }}</p>
        </div>
      </div>

      <!--
        The slot the mark stands in, placed in grid cells from the header and
        bound to `.mark` below, so its edges can sit on the lines.
      -->
      <div v-if="showMark" class="mark" :style="markStyle" aria-hidden="true">
        <div class="mark-inner">
          <Suspense>
            <LogoScene
              :halo-on="armed"
              :room="showRoom"
              :opacity="opacity"
              :diffuse="diffuse"
              :mark-scale="markScale"
              @ready="onReady"
            />
          </Suspense>
        </div>
      </div>

      <div v-if="showLemon" class="pet">
        <LemonPet />
      </div>
    </div>

    <header class="bar">
      <p class="eyebrow">dev only · linkedin</p>
      <p class="size">1584 × 396</p>

      <div class="controls">
        <label class="toggle"><input v-model="liLemon" type="checkbox" />Lemon</label>
        <label class="toggle"><input v-model="liBubble" type="checkbox" />Bubble</label>
        <label class="toggle"><input v-model="liGridOn" type="checkbox" />Grid</label>
      </div>

      <div class="slot-controls">
        <span class="size">slot · cells</span>
        <label class="field">x<input v-model.number="liSlot.x" type="number" min="0" max="60" /></label>
        <label class="field">y<input v-model.number="liSlot.y" type="number" min="0" max="20" /></label>
        <label class="field"
          >size<input v-model.number="liSlot.size" type="number" min="1" max="20"
        /></label>
      </div>

      <div class="slot-controls">
        <span class="size">cell</span>
        <label class="field"
          ><input v-model.number="liCell" type="number" min="12" max="200" step="2"
        /></label>
      </div>

      <div class="slot-controls">
        <span class="size">center x</span>
        <label class="field"
          ><input v-model.number="liCenterX" type="number" step="4"
        /></label>
      </div>

      <div class="slot-controls">
        <span class="size">bubble x</span>
        <label class="field"
          ><input v-model.number="liBubbleX" type="number" step="4"
        /></label>
      </div>

      <div class="slot-controls">
        <span class="size">logo</span>
        <label class="field"
          >size<input v-model.number="liBrandSize" type="number" min="16" max="120" step="2"
        /></label>
        <label class="field">x<input v-model.number="liBrandX" type="number" step="4" /></label>
        <label class="field">y<input v-model.number="liBrandY" type="number" step="4" /></label>
      </div>
    </header>

    <!--
      The LinkedIn banner: 1584x396, the personal-profile cover size. The lockup
      sits alone at the top-left, clear of the profile photo's corner; the card's
      own column — name, headline, disciplines, place, mail — holds the middle, and
      the 3D mark the right. Its grid is measured to the mark's box, so the two
      read as one.
    -->
    <div class="banner banner-li">
      <div v-if="liGridOn" class="grid li-grid" :style="liGridStyle" aria-hidden="true" />

      <div class="li-left" :style="{ transform: `translate(${liBrandX}px, ${liBrandY}px)` }">
        <div class="li-brand">
          <BrandLogo :height="liBrandSize" />
          <span class="brand-dev" :style="{ fontSize: `${liBrandSize * 0.83}px` }">.dev</span>
        </div>
      </div>

      <div class="li-center" :style="{ transform: `translateX(${liCenterX}px)` }">
        <p class="name"><span class="acc">K</span>IKO<br /><span class="acc">RUB</span>IO</p>

        <h2 class="headline">FULL STACK<br /><span class="accent">DEVELOPER</span></h2>

        <p class="line skills">Frontend · Backend · 3D · Applied AI</p>

        <span class="rule" aria-hidden="true" />

        <!-- English, like the rest of the card: LinkedIn is not toggled. -->
        <p class="line place">{{ copy.locations.en }}</p>
        <p class="line mail">{{ email }}</p>
      </div>

      <div class="li-stage" :style="liStageStyle" aria-hidden="true">
        <Suspense>
          <LogoScene
            :halo-on="armed"
            :room="showRoom"
            :opacity="opacity"
            :diffuse="diffuse"
            :cells="liSlot.size"
            :mark-scale="markScale"
            @ready="onReady"
          />
        </Suspense>
      </div>

      <div v-if="liLemon" class="li-pet">
        <SpeechBubble
          v-if="liBubble"
          :style="{ left: `${liBubbleX}px` }"
          text="Let's connect!"
          :live="false"
        />
        <LemonPet />
      </div>
    </div>

    <header class="bar">
      <p class="eyebrow">dev only · github</p>
      <p class="size">1280 × 640</p>

      <div class="controls">
        <label class="toggle"><input v-model="ghLemon" type="checkbox" />Lemon</label>
        <label class="toggle"><input v-model="ghGrid" type="checkbox" />Grid</label>
      </div>

      <div class="slot-controls">
        <span class="size">slot · cells</span>
        <label class="field">x<input v-model.number="ghSlot.x" type="number" min="0" max="30" /></label>
        <label class="field">y<input v-model.number="ghSlot.y" type="number" min="0" max="12" /></label>
        <label class="field"
          >size<input v-model.number="ghSlot.size" type="number" min="1" max="12"
        /></label>
      </div>

      <div class="slot-controls">
        <span class="size">cols</span>
        <label class="field"
          ><input v-model.number="ghCols" type="number" min="4" max="40" step="2"
        /></label>
      </div>
    </header>

    <!--
      The GitHub banner: 1280x640, 2:1 — the size GitHub asks for a repository's
      social preview, and what a README header is read at once scaled down. The
      card's column on the left, the 3D mark on the right, Limonacho in the corner.
    -->
    <div class="banner banner-gh">
      <div v-if="ghGrid" class="grid gh-grid" :style="ghGridStyle" aria-hidden="true" />

      <div class="left">
        <p class="brand">
          <BrandLogo :height="20" />
          <span class="brand-dev">.dev</span>
        </p>

        <p class="name"><span class="acc">K</span>IKO<br /><span class="acc">RUB</span>IO</p>

        <h1 class="headline">FULL STACK<br /><span class="accent">DEVELOPER</span></h1>

        <p class="line skills">Frontend · Backend · 3D · Applied AI</p>

        <span class="rule" aria-hidden="true" />

        <div class="details">
          <p class="line place">{{ copy.locations.en }}</p>
          <p class="line mail">{{ email }}</p>
        </div>
      </div>

      <div class="gh-mark" :style="ghStageStyle" aria-hidden="true">
        <Suspense>
          <LogoScene
            :halo-on="armed"
            :room="showRoom"
            :opacity="opacity"
            :diffuse="diffuse"
            :cells="ghSlot.size"
            :mark-scale="markScale"
            @ready="onReady"
          />
        </Suspense>
      </div>

      <div v-if="ghLemon" class="pet">
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

.field input,
.field select {
  padding: 4px 6px;
  font: 500 12px var(--font-mono);
  color: var(--fg);
  background: transparent;
  border: 1px solid var(--line);
  border-radius: 6px;
}

.field input {
  width: 46px;
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

/* The size and the offset come from the header: they follow the room, so the two
   grids land on each other whatever the slot measures. */
.grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(var(--grid) 1px, transparent 1px),
    linear-gradient(90deg, var(--grid) 1px, transparent 1px);
}

.left {
  position: relative;
  max-width: 480px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.brand {
  display: flex;
  align-items: baseline;
  gap: 2px;
  margin: 0 0 6px;
}

.brand-dev {
  font-family: var(--font-mono);
  font-size: 20px;
  font-weight: 500;
  letter-spacing: 0.02em;
  color: var(--fg-2);
}

.name {
  margin: 0;
  font-family: var(--font-mono);
  font-weight: 700;
  font-size: 34px;
  letter-spacing: 0.18em;
  line-height: 1.1;
}

.name .acc {
  color: var(--acc-text);
}

.headline {
  margin: 0;
  font-size: 70px;
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
  font-size: 17px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--fg-2);
}

/* Where he is reads as a fact rather than a caption, so it is the foreground
   colour and not the muted one the lines around it use. */
.place {
  color: var(--fg);
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

/* The canvas fills the slot, so the room's opening reaches its edge and its grid
   lands on the page's. The mark's size is a dial inside the scene, not a CSS
   transform here — scaling the canvas would shrink the room with the mark. */
.mark-inner {
  width: 100%;
  height: 100%;
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

/* ---------------------------------------------------------------------------
   The LinkedIn banner: 1584x396, 4:1. The profile photo is drawn over the
   bottom-left (a ~360px circle), so the name sits above it and nothing important
   goes in that corner; the sides are cropped on mobile, so the content stays off
   the far edges. The grid follows the 3D box (see liGridStyle).
   --------------------------------------------------------------------------- */
.banner-li {
  width: 1584px;
  height: 396px;
  padding: 0 56px;
  /* Three columns of equal side width, so the lockup is centred in the banner
     whatever the name and the mark measure. */
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
}

.li-grid {
  /* Size and offset come from the mark's box, measured on mount. */
  background-size: 72px 72px;
}

/* The name, above the profile photo: the photo's circle tops out around 216px
   down, so the column starts high and stops before it. */
/* The lockup on its own, top-left and clear of the photo's corner. */
.li-left {
  justify-self: start;
  align-self: start;
  margin-top: 40px;
}

.li-brand {
  display: flex;
  align-items: baseline;
  gap: 0;
}

/* The .dev size rides with the mark's, set inline from the lockup dial. */

/* The card's column, centred and a size up: name, headline, disciplines, rule,
   place and mail, the same order as the card above. */
.li-center {
  justify-self: center;
  align-self: center;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
  text-align: left;
}

.banner-li .name {
  font-size: 32px;
}

.banner-li .headline {
  font-size: 54px;
  text-align: left;
}

.banner-li .rule {
  width: 104px;
}

.banner-li .skills,
.banner-li .place,
.banner-li .mail {
  font-size: 15px;
}

/* The 3D mark. Its place and size come from the slot (x/y/size, in cells); the
   scene fills it. */
.li-stage {
  position: absolute;
}

/* Limonacho, out of his fixed corner, parked at the banner's lower-right with his
   line above him and nudged to his right. */
.li-pet {
  position: absolute;
  right: 30px;
  bottom: 28px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
}

/* Offset from its column by the bubble-x dial (see the template). */
.li-pet :deep(.bubble) {
  position: relative;
}

.li-pet :deep(.pet) {
  position: relative;
  left: auto;
  right: auto;
  bottom: auto;
  transform: scale(1.1);
  transform-origin: bottom left;
}

/* The banner says its own line, so the lemon's own bubble stays down. */
.li-pet :deep(.pet .bubble) {
  display: none;
}

/* ---------------------------------------------------------------------------
   The GitHub banner: 1280x640, 2:1. The card's own layout — column left, mark
   right — at the size a repository's social preview wants.
   --------------------------------------------------------------------------- */
.banner-gh {
  width: 1280px;
  height: 640px;
}

.gh-grid {
  /* Size comes from ghGridStyle: a column count, so the grid meets both edges. */
}

/* The 3D mark. Its place and size come from the slot (x/y/size, in cells). */
.gh-mark {
  position: absolute;
}
</style>
