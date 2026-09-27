<script setup>
/*
  DEV SCAFFOLDING — not part of the site.

  One hero stage, with a selector, to compare how the scene arrives: switching on
  the instant it is ready, or easing up out of the dark.

  One stage rather than two side by side on purpose. Every stage is its own WebGL
  context with its own generated environment, so two at once is twice the cost of
  the very thing being compared. Switching the selector remounts the stage, and
  `Replay` does it again, which is what re-runs the entrance and the tube's
  ignition.

  Like PreviewView, this is exempt from the "no literal strings in a template"
  rule: the labels are the subject. It never ships — the route is dev-only and
  this file is deleted before launch.
*/
import { computed, ref } from 'vue'

import LogoStage from '../components/sections/LogoStage.vue'

const VARIANTS = [
  {
    id: 'plain',
    label: 'Plain',
    note: 'no fade — the scene switches on the moment it reports ready',
    entrance: 'none',
  },
  {
    id: 'fade',
    label: 'Fade',
    note: 'the scene eases up out of the dark as the opening settles into the frame',
    entrance: 'fade',
  },
]

// What the hero ships.
const pick = ref('plain')
const variant = computed(() => VARIANTS.find((item) => item.id === pick.value))

// Bumping the key remounts the stage, so the entrance plays again.
const round = ref(0)

// How the tunnel fades out with depth. See SceneRig for what each one means.
const FOG_MODES = [
  { id: 'off', label: 'Off' },
  { id: 'near', label: 'Near' },
  { id: 'far', label: 'Far' },
]

const fogMode = ref('far')

// Live switches, so the stage is not remounted while they are flipped.
const showLogo = ref(true)
const showHalo = ref(true)
// Off shows the stage as it was before the blind: the room already open.
const showShutter = ref(true)

const stageRef = ref(null)

function onExport() {
  stageRef.value?.exportModel()
}
</script>

<template>
  <main class="lab">
    <header class="head">
      <div>
        <p class="eyebrow">dev only</p>
        <h1 class="title">logo-lab</h1>
      </div>
      <div class="controls">
        <label class="toggle">
          <input v-model="showLogo" type="checkbox" />
          Mark
        </label>
        <label class="toggle">
          <input v-model="showHalo" type="checkbox" />
          Halo
        </label>
        <label class="toggle">
          <input v-model="showShutter" type="checkbox" />
          Shutter
        </label>
        <button class="replay" type="button" @click="round++">Replay</button>
        <button class="replay" type="button" @click="onExport">Export GLB</button>
      </div>
    </header>

    <div class="row">
      <span class="row-label">Entrance</span>
      <div class="options">
        <button
          v-for="item in VARIANTS"
          :key="item.id"
          class="option"
          type="button"
          :class="{ on: pick === item.id }"
          @click="pick = item.id"
        >
          {{ item.label }}
        </button>
      </div>
    </div>

    <p class="option-note">{{ variant.note }}</p>

    <div class="row">
      <span class="row-label">Fog</span>
      <div class="options">
        <button
          v-for="mode in FOG_MODES"
          :key="mode.id"
          class="option"
          type="button"
          :class="{ on: fogMode === mode.id }"
          @click="fogMode = mode.id"
        >
          {{ mode.label }}
        </button>
      </div>
    </div>

    <div class="stage-wrap">
      <LogoStage
        ref="stageRef"
        :key="`${variant.id}-${round}`"
        :entrance="variant.entrance"
        :logo="showLogo"
        :halo="showHalo"
        :fog="fogMode"
        :shutter="showShutter"
        :snap="false"
      />
    </div>
  </main>
</template>

<style scoped>
.lab {
  max-width: 1180px;
  margin: 0 auto;
  padding: clamp(24px, 5vw, 56px) clamp(20px, 5vw, 64px) 120px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
}

.eyebrow {
  margin: 0 0 6px;
  font: 400 11px var(--font-mono);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--fg-3);
}

.title {
  margin: 0;
  font: 700 clamp(28px, 4vw, 44px) var(--font-mono);
  letter-spacing: -0.04em;
}

.controls {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
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

.replay {
  font: 500 13px var(--font-mono);
  color: var(--fg-2);
  background: transparent;
  border: 1px solid var(--line);
  border-radius: 999px;
  padding: 10px 20px;
  cursor: pointer;
  transition: color 0.16s ease, border-color 0.16s ease;
}

.replay:hover {
  color: var(--acc);
  border-color: var(--acc);
}

.row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.row-label {
  min-width: 74px;
  font: 500 11px var(--font-mono);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--fg-3);
}

.options {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.option {
  padding: 10px 14px;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: transparent;
  color: var(--fg-2);
  font: 500 13px var(--font-mono);
  cursor: pointer;
  transition: color 0.16s ease, border-color 0.16s ease, background 0.16s ease;
}

.option:hover {
  color: var(--fg);
}

.option.on {
  color: var(--on-acc);
  background: var(--acc);
  border-color: var(--acc);
}

/* It holds a line whether the note wraps or not, so the stage below never jumps
   when the option changes. */
.option-note {
  margin: 0;
  min-height: 22px;
  font: 400 13px var(--font-sans);
  line-height: 1.6;
  color: var(--fg-3);
}

.stage-wrap {
  width: 100%;
  max-width: 520px;
}
</style>
