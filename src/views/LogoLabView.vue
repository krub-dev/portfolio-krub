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
  {
    id: 'plain',
    label: 'Plain',
    note: 'no composer, no fade — the behaviour before any of this',
    entrance: 'none',
    effects: 'none',
  },
  {
    id: 'fade',
    label: 'Fade',
    note: 'the scene eases up out of the dark. What the hero ships',
    entrance: 'fade',
    effects: 'none',
  },
  {
    id: 'bloom',
    label: 'Fade + bloom',
    note: 'fade, plus a soft bloom on the glints — one extra pass every frame',
    entrance: 'fade',
    effects: 'bloom',
  },
  {
    id: 'grain',
    label: 'Fade + bloom + grain',
    note: 'the same, with premultiplied film grain — the heaviest of the four',
    entrance: 'fade',
    effects: 'grain',
  },
]

// The hero's own choice: the fade, without a composer.
const pick = ref('fade')
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

    <ul class="options">
      <li v-for="item in VARIANTS" :key="item.id">
        <button
          class="option"
          type="button"
          :class="{ on: pick === item.id }"
          @click="pick = item.id"
        >
          <span class="option-label">{{ item.label }}</span>
          <span class="option-note">{{ item.note }}</span>
        </button>
      </li>
    </ul>

    <p class="lede">
      The composer costs one full-screen pass per effect per frame, so
      <strong>{{ VARIANTS[0].label }}</strong> and <strong>{{ VARIANTS[1].label }}</strong> are
      free. Switching remounts the stage, so the entrance plays again; <em>Replay</em> does it again
      on the same option.
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

.options {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
  max-width: 560px;
}

.option {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 3px;
  text-align: left;
  padding: 12px 16px;
  border: 1px solid var(--line);
  border-radius: 12px;
  background: transparent;
  cursor: pointer;
  transition: border-color 0.16s ease, background 0.16s ease;
}

.option:hover {
  border-color: var(--fg-3);
}

.option.on {
  border-color: var(--acc);
  background: color-mix(in srgb, var(--acc) 10%, transparent);
}

.option-label {
  font: 600 14px var(--font-sans);
  color: var(--fg);
}

.option.on .option-label {
  color: var(--acc-text);
}

.option-note {
  font: 400 12px var(--font-sans);
  color: var(--fg-3);
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
