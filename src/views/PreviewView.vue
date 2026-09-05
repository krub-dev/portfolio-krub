<script setup>
/*
  DEV SCAFFOLDING — not part of the site.

  A visual check for the token layer: every colour, the type scale, the radii,
  the shadows and the four keyframes, side by side and switchable between
  themes. Step 5 will grow this route to cover the base components too.

  This is the one file exempt from the "no literal strings in a template" rule,
  because the strings *are* the subject: it is a spec sheet, not a page. It
  never ships — the route is dev-only and this file is deleted before launch.
*/
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import { useLang } from '../composables/useLang'
import { useTheme } from '../composables/useTheme'
import {
  config,
  copy,
  education,
  email,
  experience,
  projects,
  socials,
  stack,
  testimonials,
} from '../data'

const { theme, toggle: toggleTheme } = useTheme()
const { lang, toggle: toggleLang } = useLang()
const { t } = useI18n()

/*
  This is the pattern every section component will use: pick the half of a data
  entry that matches the current language. `lang` is a ref, so the computed
  re-runs on its own when the language toggle is pressed.
*/
const hero = computed(() => copy.hero[lang.value])
const marquee = computed(() => copy.marquee[lang.value])

// Timeline rows: "2024 — now", "2018 — 2024", or just "2025" for one year.
function period(entry) {
  if (entry.to === null) return `${entry.from} — ${t('time.now')}`
  if (entry.to === entry.from) return entry.from
  return `${entry.from} — ${entry.to}`
}

const collections = computed(() => [
  { name: 'projects', count: projects.length, sample: projects[0][lang.value].name },
  { name: 'experience', count: experience.length, sample: experience[0][lang.value].title },
  { name: 'education', count: education.length, sample: education[0][lang.value].title },
  { name: 'stack', count: stack.reduce((n, g) => n + g.items.length, 0), sample: `${stack.length} groups` },
  { name: 'socials', count: socials.length, sample: socials.map((s) => s.name).join(', ') },
  {
    name: 'testimonials',
    count: testimonials.length,
    sample: `${config.showTestimonials ? 'section on' : 'section off'} · ${testimonials[0][lang.value].quote}`,
  },
])

// Read back what the browser actually computed for each custom property, so
// the swatch labels cannot drift from tokens.css.
const resolved = ref({})

const COLOR_TOKENS = [
  ['--ink', 'page background'],
  ['--surface', 'cards and panels'],
  ['--surface-2', 'icon tiles, chips'],
  ['--line', 'every border'],
  ['--fg', 'primary text'],
  ['--fg-2', 'secondary text'],
  ['--fg-3', 'tertiary text, mono labels'],
  ['--acc', 'brand yellow — fills only'],
  ['--acc-text', 'accent text on --ink'],
  ['--acc-2', 'yellow on hover'],
  ['--on-acc', 'text on yellow'],
  ['--mark', 'logo and footer heart'],
  ['--grid', 'background grid lines'],
]

const TYPE_SCALE = [
  ['Hero headline', 'clamp(38px, 6.4vw, 82px)', 'font: 700 clamp(38px,6.4vw,82px) var(--font-sans); letter-spacing:-.04em; line-height:.98'],
  ['Contact headline', 'clamp(26px, 4vw, 52px)', 'font: 700 clamp(26px,4vw,52px) var(--font-sans); letter-spacing:-.03em; line-height:1.06'],
  ['Section title', 'mono clamp(22px, 2.6vw, 30px)', 'font: 500 clamp(22px,2.6vw,30px) var(--font-mono)'],
  ['Section number', 'mono clamp(48px, 6vw, 74px)', 'font: 700 clamp(48px,6vw,74px) var(--font-mono); letter-spacing:-.05em; color:var(--acc); opacity:var(--sec-idx)'],
  ['Lead paragraph', 'clamp(18px, 2vw, 24px)', 'font: 400 clamp(18px,2vw,24px) var(--font-sans); line-height:1.5'],
  ['Body paragraph', '17px / --fg-2', 'font: 400 17px var(--font-sans); line-height:1.65; color:var(--fg-2)'],
  ['Card title', '19px / 600', 'font: 600 19px var(--font-sans)'],
  ['Card body', '15px', 'font: 400 15px var(--font-sans); line-height:1.55'],
  ['Small mono label', '10-11px uppercase', 'font: 400 11px var(--font-mono); letter-spacing:.12em; text-transform:uppercase; color:var(--fg-3)'],
]

const RADII = [
  ['8px', 'chips, labels'],
  ['10px', 'icon tiles, square buttons'],
  ['14px', 'lemon bubble'],
  ['18px', 'cards, images'],
  ['22px', 'panels, modal'],
  ['999px', 'pill buttons'],
]

// Interface strings only — the prose now lives in src/data/copy.js.
const SAMPLE_KEYS = [
  'nav.projects',
  'tab.exp',
  'actions.cv',
  'time.now',
  'footer.place',
  'modal.role',
  'a11y.toggleTheme',
]

const SHADOWS = [
  ['Compact navbar', '0 14px 40px rgba(0,0,0,.28)'],
  ['Lemon bubble', '0 14px 34px rgba(0,0,0,.32)'],
  ['Mobile menu', '0 24px 60px rgba(0,0,0,.45)'],
]

function readTokens() {
  const styles = getComputedStyle(document.documentElement)
  const next = {}
  for (const [token] of COLOR_TOKENS) next[token] = styles.getPropertyValue(token).trim()
  next['--sec-idx'] = styles.getPropertyValue('--sec-idx').trim()
  resolved.value = next
}

// The swatch labels show the computed values, so they have to be re-read after
// the attribute on <html> changes. nextTick waits for the DOM write to land.
watch(theme, () => nextTick(readTokens))

onMounted(readTokens)
</script>

<template>
  <main class="preview">
    <header class="head">
      <div>
        <p class="eyebrow">Step 04 · content &amp; data</p>
        <h1 class="title">src/data</h1>
      </div>
      <div class="controls">
        <button class="toggle" type="button" :aria-label="t('a11y.toggleTheme')" @click="toggleTheme">
          {{ theme === 'dark' ? 'Switch to light' : 'Switch to dark' }}
        </button>
        <button class="toggle" type="button" :aria-label="t('a11y.toggleLang')" @click="toggleLang">
          {{ lang.toUpperCase() }} / {{ lang === 'en' ? 'ES' : 'EN' }}
        </button>
      </div>
    </header>

    <section class="block">
      <h2 class="h2">Content · src/data/</h2>
      <p class="note">
        Every sentence on the site comes from here, both languages in one file. Toggle the
        language and watch it follow — nothing below is written in a component.
      </p>

      <div class="rows">
        <div v-for="c in collections" :key="c.name" class="row">
          <div class="row-meta">
            <span class="row-name">{{ c.name }}.js</span>
            <code class="row-spec">{{ c.count }} entries</code>
          </div>
          <div class="row-demo dict">{{ c.sample }}</div>
        </div>
        <div class="row">
          <div class="row-meta">
            <span class="row-name">socials.js</span>
            <code class="row-spec">email + cvPath</code>
          </div>
          <div class="row-demo dict">{{ email }}</div>
        </div>
      </div>

      <p class="note">Hero headline, straight from <code>copy.hero.{{ lang }}</code>:</p>
      <p class="headline-demo">
        {{ hero.line1 }}<br />
        {{ hero.line2 }}<br />
        {{ hero.line3pre }}<span class="accent">{{ hero.accent }}</span>{{ hero.line3post }}
      </p>

      <p class="note">Timeline periods, computed from <code>from</code> / <code>to</code>:</p>
      <div class="rows">
        <div v-for="(e, i) in [...experience, ...education]" :key="i" class="row">
          <div class="row-meta">
            <code class="row-spec" :class="{ current: e.current }">{{ period(e) }}</code>
          </div>
          <div class="row-demo dict">{{ e[lang].title }}</div>
        </div>
      </div>

      <p class="note">Marquee phrases: {{ marquee.join('  //  ') }}</p>
    </section>

    <section class="block">
      <h2 class="h2">Interface · src/locales/</h2>
      <p class="note">
        Labels the UI needs, from <code>src/locales/{{ lang }}.json</code>. Both toggles persist
        in <code>localStorage</code> and survive a reload;
        <code>&lt;html lang&gt;</code> is now <strong>{{ lang }}</strong>.
      </p>
      <div class="rows">
        <div v-for="key in SAMPLE_KEYS" :key="key" class="row">
          <div class="row-meta">
            <code class="row-spec">{{ key }}</code>
          </div>
          <div class="row-demo dict">{{ t(key) }}</div>
        </div>
      </div>
    </section>

    <section class="block">
      <h2 class="h2">Colour</h2>
      <div class="swatches">
        <div v-for="[token, use] in COLOR_TOKENS" :key="token" class="swatch">
          <div class="chip" :style="{ background: `var(${token})` }" />
          <code class="token">{{ token }}</code>
          <span class="value">{{ resolved[token] }}</span>
          <span class="use">{{ use }}</span>
        </div>
      </div>
      <p class="note">
        <code>--acc</code> is identical in both themes. <code>--mark</code> is what flips,
        because the yellow has no contrast on light. <code>--sec-idx</code> is
        <strong>{{ resolved['--sec-idx'] }}</strong> here.
      </p>
    </section>

    <section class="block">
      <h2 class="h2">Type scale</h2>
      <div class="rows">
        <div v-for="[name, spec, css] in TYPE_SCALE" :key="name" class="row">
          <div class="row-meta">
            <span class="row-name">{{ name }}</span>
            <code class="row-spec">{{ spec }}</code>
          </div>
          <div class="row-demo" :style="css">Desarrollo cosas que aguantan</div>
        </div>
      </div>
    </section>

    <section class="block">
      <h2 class="h2">Radii, borders, shadows</h2>
      <div class="tiles">
        <div v-for="[r, use] in RADII" :key="r" class="tile" :style="{ borderRadius: r }">
          <span class="tile-r">{{ r }}</span>
          <span class="tile-use">{{ use }}</span>
        </div>
      </div>
      <div class="shadow-row">
        <div v-for="[name, value] in SHADOWS" :key="name" class="shadow" :style="{ boxShadow: value }">
          <span class="tile-r">{{ name }}</span>
          <code class="tile-use">{{ value }}</code>
        </div>
      </div>
    </section>

    <section class="block">
      <h2 class="h2">Keyframes</h2>
      <div class="anim-grid">
        <div class="anim">
          <div class="anim-stage marquee-stage">
            <div class="marquee-track">
              <span>FULLSTACK DEVELOPER → BACKEND // FROM MURCIA, BASED IN BARCELONA · SPAIN //&nbsp;</span>
              <span>FULLSTACK DEVELOPER → BACKEND // FROM MURCIA, BASED IN BARCELONA · SPAIN //&nbsp;</span>
            </div>
          </div>
          <code class="anim-name">marquee 26s linear infinite</code>
        </div>

        <div class="anim">
          <div class="anim-stage center">
            <span class="dot-wrap">
              <span class="dot-ring" />
              <span class="dot-core" />
            </span>
            <span class="dot-label">Available for work</span>
          </div>
          <code class="anim-name">dotHalo 2.6s · core is static, ring pulses</code>
        </div>

        <div class="anim">
          <div class="anim-stage center">
            <span class="bubble">Welcome! I'm Limonacho</span>
          </div>
          <code class="anim-name">bubbleIn .28s</code>
        </div>

        <div class="anim">
          <div class="anim-stage center">
            <span class="lemon" />
          </div>
          <code class="anim-name">lemonShake .5s ease</code>
        </div>
      </div>
    </section>

    <section class="block">
      <h2 class="h2">Background grid</h2>
      <div class="grid-demo" />
      <p class="note">72&times;72px pattern, 1px lines in <code>--grid</code>.</p>
    </section>
  </main>
</template>

<style scoped>
.preview {
  max-width: 1180px;
  margin: 0 auto;
  padding: clamp(24px, 5vw, 56px) clamp(20px, 5vw, 64px) 120px;
  display: flex;
  flex-direction: column;
  gap: 56px;
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
  gap: 10px;
  flex-wrap: wrap;
}

.dict {
  font: 400 15px var(--font-sans);
  color: var(--fg-2);
}

.headline-demo {
  margin: 0;
  font: 700 clamp(28px, 4vw, 48px) var(--font-sans);
  letter-spacing: -0.04em;
  line-height: 0.98;
}

/* .row-spec is declared later in this file and would win on source order,
   since both are single-class selectors. Two classes beats one. */
.row-spec.current {
  color: var(--acc-text);
}

.accent {
  color: var(--acc-text);
}

.toggle {
  font: 500 13px var(--font-mono);
  color: var(--fg-2);
  background: transparent;
  border: 1px solid var(--line);
  border-radius: 999px;
  padding: 10px 20px;
  cursor: pointer;
  transition: color 0.16s ease, border-color 0.16s ease;
}

.toggle:hover {
  color: var(--acc);
  border-color: var(--acc);
}

.block {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.h2 {
  margin: 0;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--line);
  font: 500 clamp(18px, 2.4vw, 24px) var(--font-mono);
}

.note {
  margin: 0;
  font: 400 14px var(--font-sans);
  line-height: 1.6;
  color: var(--fg-2);
}

.note code,
.token,
.row-spec,
.anim-name,
.tile-use {
  font-family: var(--font-mono);
}

/* Colour ------------------------------------------------------------------ */
.swatches {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 14px;
}

.swatch {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.chip {
  height: 56px;
  border: 1px solid var(--line);
  border-radius: 10px;
  margin-bottom: 6px;
}

.token {
  font-size: 12px;
  color: var(--fg);
}

.value {
  font: 400 11px var(--font-mono);
  color: var(--fg-3);
}

.use {
  font: 400 12px var(--font-sans);
  color: var(--fg-2);
}

/* Type -------------------------------------------------------------------- */
.rows {
  display: flex;
  flex-direction: column;
}

.row {
  display: grid;
  grid-template-columns: minmax(150px, 220px) 1fr;
  gap: clamp(14px, 3vw, 32px);
  align-items: baseline;
  padding: 20px 0;
  border-top: 1px solid var(--line);
}

.row:last-child {
  border-bottom: 1px solid var(--line);
}

.row-meta {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.row-name {
  font: 600 14px var(--font-sans);
}

.row-spec {
  font-size: 11px;
  color: var(--fg-3);
}

.row-demo {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Radii, shadows ---------------------------------------------------------- */
.tiles {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.tile {
  width: 128px;
  height: 88px;
  background: var(--surface-2);
  border: 1px solid var(--line);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  text-align: center;
  padding: 0 8px;
}

.tile-r {
  font: 500 13px var(--font-mono);
}

.tile-use {
  font-size: 10px;
  color: var(--fg-3);
}

.shadow-row {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  padding: 8px 0 16px;
}

.shadow {
  flex: 1 1 240px;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 18px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

/* Keyframes --------------------------------------------------------------- */
.anim-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.anim {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.anim-stage {
  height: 120px;
  border: 1px solid var(--line);
  border-radius: 18px;
  overflow: hidden;
  background: var(--surface);
}

.anim-stage.center {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.anim-name {
  font-size: 11px;
  color: var(--fg-3);
}

.marquee-stage {
  display: flex;
  align-items: center;
  background: var(--acc);
  border-color: var(--acc);
}

.marquee-track {
  display: flex;
  white-space: nowrap;
  animation: marquee 26s linear infinite;
  font: 700 13px var(--font-mono);
  letter-spacing: 0.22em;
  color: var(--on-acc);
}

.dot-wrap {
  position: relative;
  width: 5px;
  height: 5px;
  flex: 0 0 auto;
  display: inline-block;
}

.dot-ring {
  position: absolute;
  inset: -5px;
  border-radius: 50%;
  border: 1px solid #39d98a;
  opacity: 0;
  animation: dotHalo 2.6s cubic-bezier(0.15, 0.6, 0.3, 1) infinite;
}

.dot-core {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: #39d98a;
}

.dot-label {
  font: 400 10px var(--font-mono);
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--fg-3);
}

.bubble {
  max-width: 230px;
  border-radius: 14px;
  background: var(--surface);
  border: 1px solid var(--line);
  box-shadow: 0 14px 34px rgba(0, 0, 0, 0.32);
  padding: 10px 14px;
  font: 400 13px var(--font-sans);
  animation: bubbleIn 0.28s ease both;
  animation-iteration-count: infinite;
  animation-duration: 2s;
}

.lemon {
  width: 58px;
  height: 48px;
  background: var(--acc);
  border-radius: 50% 50% 48% 48% / 58% 58% 42% 42%;
  animation: lemonShake 0.5s ease infinite;
}

/* Grid -------------------------------------------------------------------- */
.grid-demo {
  height: 200px;
  border: 1px solid var(--line);
  border-radius: 18px;
  background-image: linear-gradient(var(--grid) 1px, transparent 1px),
    linear-gradient(90deg, var(--grid) 1px, transparent 1px);
  background-size: 72px 72px;
}

@media (max-width: 900px) {
  .row {
    grid-template-columns: 1fr;
    gap: 8px;
  }
}
</style>
