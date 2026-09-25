<script setup>
/*
  DEV SCAFFOLDING — not part of the site.

  The hero stage three times over, to compare how the 3D render is finished:
  plain, bloom, and bloom with film grain. `Replay` remounts every stage, which is
  what re-runs the entrance and the tube's ignition.

  Like PreviewView, this is exempt from the "no literal strings in a template"
  rule: the labels are the subject. It never ships — the route is dev-only and
  this file is deleted before launch.
*/
import { ref } from 'vue'

import LogoStage from '../components/sections/LogoStage.vue'

const VARIANTS = [
  { id: 'none', label: 'Plain', note: 'no composer' },
  { id: 'bloom', label: 'Bloom', note: 'threshold .72 · intensity .6' },
  { id: 'grain', label: 'Bloom + grain', note: 'the same, premultiplied noise' },
]

// Bumping the key remounts every stage, so the entrance plays again.
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

    <p class="lede">
      Three stages, same scene. The composer costs one full-screen pass per effect per frame; the
      plain one has none.
    </p>

    <div class="grid">
      <section v-for="variant in VARIANTS" :key="variant.id" class="cell">
        <LogoStage :key="`${variant.id}-${round}`" :effects="variant.id" :snap="false" />
        <p class="label">{{ variant.label }}</p>
        <p class="note">{{ variant.note }}</p>
      </section>
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
  gap: 28px;
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

.lede {
  margin: 0;
  font: 400 14px var(--font-sans);
  line-height: 1.6;
  color: var(--fg-2);
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 28px;
}

.cell {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.label {
  margin: 0;
  font: 600 14px var(--font-sans);
}

.note {
  margin: 0;
  font: 400 11px var(--font-mono);
  color: var(--fg-3);
}
</style>
