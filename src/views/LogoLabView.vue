<script setup>
/*
  DEV SCAFFOLDING — not part of the site.

  The hero stage with live switches, so each part of the scene can be seen on its
  own: the mark, the ring round the opening and the blind. `Replay` remounts the
  stage, which re-runs the tube's ignition.

  One stage rather than two side by side on purpose. Every stage is its own WebGL
  context with its own generated environment, so two at once is twice the cost of
  the very thing being compared.

  Like DesignSystemView, this is exempt from the "no literal strings in a template"
  rule: the labels are the subject. It never ships — the route is dev-only and
  this file is deleted before launch.
*/
import { ref } from 'vue'

import LogoStage from '../components/sections/LogoStage.vue'

// Bumping the key remounts the stage, which re-runs the tube's ignition.
const round = ref(0)

// Live switches, so the stage is not remounted while they are flipped.
const showLogo = ref(true)
const showRing = ref(true)
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
          <input v-model="showRing" type="checkbox" />
          Ring
        </label>
        <label class="toggle">
          <input v-model="showShutter" type="checkbox" />
          Shutter
        </label>
        <button class="replay" type="button" @click="round++">Replay</button>
        <button class="replay" type="button" @click="onExport">Export GLB</button>
      </div>
    </header>

    <div class="stage-wrap">
      <LogoStage
        ref="stageRef"
        :key="round"
        :logo="showLogo"
        :ring="showRing"
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

.stage-wrap {
  width: 100%;
  max-width: 520px;
}
</style>
