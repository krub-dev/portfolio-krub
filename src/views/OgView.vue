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

  The headline and the name come from the hero, so the two cannot drift; the
  details block is composed here until the design settles.

  The banner is dark by design — a social card does not follow a theme — so if the
  site is in the light theme, the colours below are not the shipped ones.

  Like DesignSystemView and LogoLabView this is exempt from the "no literal
  strings in a template" rule: the banner's own composition is the subject. It
  never ships — the route is dev-only.
*/
import { computed, onBeforeUnmount, ref } from 'vue'

import LemonPet from '../components/chrome/LemonPet.vue'
import LogoScene from '../components/sections/LogoScene.vue'
import { useLang } from '../composables/useLang'
import { copy, email } from '../data'

const { lang } = useLang()

const hero = computed(() => copy.hero[lang.value])
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
</script>

<template>
  <main class="page">
    <header class="bar">
      <p class="eyebrow">dev only · open graph</p>
      <p class="size">1200 × 630</p>
      <div class="controls">
        <label class="toggle"><input v-model="showMark" type="checkbox" />Mark</label>
        <label class="toggle"><input v-model="showLemon" type="checkbox" />Lemon</label>
        <label class="toggle"><input v-model="showGrid" type="checkbox" />Grid</label>
      </div>
    </header>

    <div class="banner">
      <div v-if="showGrid" class="grid" aria-hidden="true" />

      <div class="left">
        <p class="name"><span class="acc">K</span>IKO<br /><span class="acc">RUB</span>IO</p>

        <h1 class="headline">
          {{ hero.line1 }}<br />
          {{ hero.line2 }}<br />
          {{ hero.line3pre }}<span class="accent">{{ hero.accent }}</span>{{ hero.line3post }}
        </h1>

        <span class="rule" aria-hidden="true" />

        <div class="details">
          <p class="role">Full Stack Developer</p>
          <p class="line skills">Frontend · Backend · Applied AI</p>
          <p class="line">{{ marquee[1] }}</p>
          <p class="line mail">{{ email }}</p>
        </div>
      </div>

      <div v-if="showMark" class="mark" aria-hidden="true">
        <Suspense>
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
  display: grid;
  grid-template-columns: 1.15fr 0.85fr;
  gap: 40px;
  align-items: center;
  padding: 56px 80px;
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
  display: flex;
  flex-direction: column;
  gap: 18px;
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
  font-size: 60px;
  font-weight: 700;
  letter-spacing: -0.035em;
  line-height: 0.98;
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
  gap: 6px;
}

.role {
  margin: 0;
  font-size: 22px;
  font-weight: 600;
}

.line {
  margin: 0;
  font-family: var(--font-mono);
  font-size: 14px;
  letter-spacing: 0.02em;
  color: var(--fg-2);
}

.mail {
  color: var(--acc-text);
}

/*
  The mark, drawn by the site's own scene: no frame, no rim, no blind — what the
  banner wants is the mark, and the room it stands in comes with it. The box is
  what the scene measures itself against.
*/
.mark {
  position: relative;
  justify-self: end;
  width: 470px;
  height: 470px;
}

/*
  The mascot, out of his fixed position and parked in the corner. He is scaled
  rather than resized: his leaf, his pores and his eyes are all absolute pixels
  inside him, so a wider box would pull him apart.
*/
.pet {
  position: absolute;
  right: 44px;
  bottom: 40px;
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
