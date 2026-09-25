<script setup>
/*
  DEV SCAFFOLDING — not part of the site.

  One hero stage, with a selector, to compare how it arrives and how the render is
  finished: plain, the fade, the fade with bloom, and the fade with bloom and
  grain.

  One stage rather than three side by side on purpose. Every stage is its own
  WebGL context, with its own generated environment and its own composer, so three
  at once is three times the cost — that is what made the screen feel heavy, not
  the composer itself. Switching the selector remounts the stage, and `Replay`
  does it again, which is what re-runs the entrance and the tube's ignition.

  Like PreviewView, this is exempt from the "no literal strings in a template"
  rule: the labels are the subject. It never ships — the route is dev-only and
  this file is deleted before launch.
*/
import { computed, ref } from 'vue'

import LogoStage from '../components/sections/LogoStage.vue'

const VARIANTS = [
  { id: 'plain', label: 'Plain', entrance: 'none', effects: 'none' },
  { id: 'fade', label: 'Fade', entrance: 'fade', effects: 'none' },
  { id: 'bloom', label: 'Fade + bloom', entrance: 'fade', effects: 'bloom' },
  { id: 'grain', label: 'Fade + bloom + grain', entrance: 'fade', effects: 'grain' },
]

// The hero's default. See the lede below.
const pick = ref('bloom')
const variant = computed(() => VARIANTS.find((item) => item.id === pick.value))

// Bumping the key remounts the stage, so the entrance plays again.
const round = ref(0)
</script>

<template>
  <main class="lab">
    <header class="head">
      <div>
        <p class="eyebrow">dev only</p>
        <h1 class="title">logo-lab</h1>
      </div>
      <button class="replay" type="button" @click="round++">Replay entrance</button>
    </header>

    <div class="bar">
      <button
        v-for="item in VARIANTS"
        :key="item.id"
        class="tab"
        type="button"
        :class="{ on: pick === item.id }"
        @click="pick = item.id"
      >
        {{ item.label }}
      </button>
    </div>

    <p class="lede">
      The hero ships <strong>{{ VARIANTS[2].label }}</strong
      >. The composer costs one full-screen pass per effect per frame;
      <strong>{{ VARIANTS[0].label }}</strong> and <strong>{{ VARIANTS[1].label }}</strong> have
      none, and the grain is the one on trial.
    </p>

    <div class="stage-wrap">
      <LogoStage
        :key="`${variant.id}-${round}`"
        :entrance="variant.entrance"
        :effects="variant.effects"
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

.bar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tab {
  font: 500 12px var(--font-mono);
  color: var(--fg-2);
  background: transparent;
  border: 1px solid var(--line);
  border-radius: 999px;
  padding: 8px 16px;
  cursor: pointer;
  transition: color 0.16s ease, border-color 0.16s ease, background 0.16s ease;
}

.tab:hover {
  color: var(--fg);
}

.tab.on {
  color: var(--on-acc);
  background: var(--acc);
  border-color: var(--acc);
}

.lede {
  margin: 0;
  font: 400 14px var(--font-sans);
  line-height: 1.6;
  color: var(--fg-2);
}

.stage-wrap {
  width: 100%;
  max-width: 520px;
}
</style>
