<script setup>
/*
  DEV SCAFFOLDING — not part of the site.

  The design system on one page: the foundations (colour, type, shape, motion),
  the components built on them, the cursor, the hero's stage and the chrome.

  Three rules, because it is a specimen sheet and not a page:

  - **English throughout.** The repository is written in English, and this page is
    part of the repository, not of the site: the prose and the placeholders here
    are English. Only the components' own labels follow the language toggle,
    because those are theirs.
  - **Placeholders, never the real content.** A specimen is about the shape of a
    component, and the copy, the photos and the quotes all change: pointing these
    at `src/data` would rot the sheet the first time a sentence was reworded.
  - **Nothing is a copy.** Every specimen is the real component. The cursor is the
    one exception, and it has to be: its parts follow the pointer, so they cannot
    be shown standing still except as a drawing.

  It never ships: the route is registered under `import.meta.env.DEV`.
*/
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import AvailabilityBadge from '../components/base/AvailabilityBadge.vue'
import BaseButton from '../components/base/BaseButton.vue'
import BaseModal from '../components/base/BaseModal.vue'
import SectionHeading from '../components/base/SectionHeading.vue'
import SocialLink from '../components/base/SocialLink.vue'
import SpeechBubble from '../components/base/SpeechBubble.vue'
import StackGroup from '../components/base/StackGroup.vue'
import TabSwitch from '../components/base/TabSwitch.vue'
import TimelineItem from '../components/base/TimelineItem.vue'
import LemonPet from '../components/chrome/LemonPet.vue'
import LogoStage from '../components/sections/LogoStage.vue'
import MediaCarousel from '../components/content/MediaCarousel.vue'
import ProjectCard from '../components/content/ProjectCard.vue'
import SpecList from '../components/content/SpecList.vue'
import Testimonials from '../components/content/Testimonials.vue'
import { useLang } from '../composables/useLang'
import { useTheme } from '../composables/useTheme'
import { cvPath } from '../data'

const { theme, toggle: toggleTheme } = useTheme()
const { lang, toggle: toggleLang } = useLang()
const { t } = useI18n()

const SECTIONS = [
  ['colour', 'Colour'],
  ['type', 'Type'],
  ['shape', 'Shape'],
  ['motion', 'Motion'],
  ['buttons', 'Buttons'],
  ['blocks', 'Blocks'],
  ['cards', 'Cards'],
  ['bits', 'Small pieces'],
  ['cursor', 'Cursor'],
  ['stage', 'The stage'],
  ['chrome', 'Chrome'],
]

/*
  Colour, grouped by what it is for rather than listed flat: a flat list is how a
  token nobody uses survives for a year. Every value is read back from the
  browser, so a label cannot drift from tokens.css.
*/
const COLOUR = [
  {
    group: 'Surfaces',
    tokens: [
      ['--ink', 'the page'],
      ['--surface', 'cards, panels'],
      ['--surface-2', 'tiles, chips'],
      ['--line', 'every border'],
    ],
  },
  {
    group: 'Text',
    tokens: [
      ['--fg', 'primary'],
      ['--fg-2', 'secondary'],
      ['--fg-3', 'tertiary, mono labels'],
    ],
  },
  {
    group: 'Accent',
    tokens: [
      ['--acc', 'fills only'],
      ['--acc-2', 'fill on hover'],
      ['--acc-text', 'accent as text'],
      ['--acc-text-2', 'text on hover'],
      ['--acc-solid', 'full saturation: cursor, Limonacho'],
      ['--on-acc', 'text on a fill'],
      ['--mark', 'logo, footer heart'],
    ],
  },
  {
    group: 'Element-specific',
    tokens: [
      ['--specular', 'a highlight on metal'],
      ['--cast', 'a shadow'],
      ['--metal', 'frame, shutter'],
      ['--metal-dark', 'its dark side'],
      ['--fog-end', 'where the tunnel fades'],
      ['--stage-bg', 'behind the scene'],
      ['--grid', 'background grid lines'],
    ],
  },
]

// The scale, with the real sizes. One sample line for all of them, so the size is
// the only thing that changes down the column.
const TYPE = [
  ['Display', 'clamp(38px, 6.4vw, 82px)', 'font: 700 clamp(38px,6.4vw,82px) var(--font-sans); letter-spacing:-.04em; line-height:.98'],
  ['Lead', 'clamp(18px, 2vw, 24px)', 'font: 400 clamp(18px,2vw,24px) var(--font-sans); line-height:1.5'],
  ['Body', '17px', 'font: 400 17px var(--font-sans); line-height:1.65'],
  ['Body, quiet', '17px, --fg-2', 'font: 400 17px var(--font-sans); line-height:1.65; color:var(--fg-2)'],
  ['Section title', 'mono clamp(22px, 2.6vw, 30px)', 'font: 500 clamp(22px,2.6vw,30px) var(--font-mono)'],
  ['Label', 'mono 11px, uppercase', 'font: 400 11px var(--font-mono); letter-spacing:.12em; text-transform:uppercase; color:var(--fg-3)'],
]

const RADII = [
  ['8px', 'chips, labels'],
  ['10px', 'buttons, tiles, the menu button'],
  ['14px', 'the speech bubble'],
  ['16px', 'the navbar capsule'],
  ['18px', 'cards, images'],
  ['22px', 'panels, dialogs'],
]

// The only cast in the project. Elevation is a 1px --line border, not a shadow,
// and there are no coloured shadows anywhere. (Limonacho's outline is a
// box-shadow too, but it is an outline: it has its own specimen below.)
const SHADOWS = [['Mobile menu', '0 24px 60px rgba(0, 0, 0, 0.45)']]

const MOTION = [
  ['--ease', 'cubic-bezier(.22, 1, .36, 1)', 'the arrive-and-settle curve: pagers, panels, the capsule'],
  ['0.16s ease', 'colour only', 'hover: buttons, links, borders'],
  ['0.4s', 'transform', 'the media track, the dot pill'],
  ['2.6s', 'dotHalo', 'the availability ring: the core is fixed, the ring pulses'],
  ['26s linear', 'marquee', 'the band under the hero'],
]

/*
  Placeholders, never the real content: the copy, the photos and the quotes all
  change, and a specimen is about the shape.
*/
const SAMPLE = {
  name: 'Project',
  tag: 'CATEGORY',
  summary: 'A line or two about the project, to see how the summary breathes inside the card.',
  shotLabel: 'SHOT · PROJECT',
  role: 'Role',
  year: '2026',
  stack: ['Technology', 'Library', 'Tool'],
}

const SAMPLE_TESTIMONIALS = [
  {
    quote:
      'A sample quote, long enough that it does not fit the four lines the card clamps to, so the read more shows, which is the thing being shown here. It keeps going, because the point is to see how the clamp behaves when the text does not fit.',
    name: 'First Last',
    role: 'Company',
    avatar: null,
  },
  {
    quote: 'A second, shorter quote, so the pager has something to page to and the dots are not a single dot.',
    name: 'Another Name',
    role: 'Another company',
    avatar: null,
  },
]

const SAMPLE_TIMELINE = [
  {
    period: '2024 - 2026',
    current: true,
    title: 'Current position',
    body: 'One line about the position, to see how the text breathes in the row.',
  },
  {
    period: '2020 - 2024',
    current: false,
    title: 'Previous position',
    body: 'Another line, to see two rows together and the border between them.',
  },
]

// Three tiles: two plain marks and one of the dark ones that gets inverted.
const SAMPLE_STACK = [
  { name: 'One', icon: '/icons/java/java-original.svg', invertOnDark: false },
  { name: 'Two', icon: '/icons/c/c-original.svg', invertOnDark: false },
  { name: 'Three', icon: '/icons/javascript/javascript-original.svg', invertOnDark: false },
]

const SAMPLE_SOCIALS = [
  { name: 'Network', href: '#', icon: 'linkedin' },
  { name: 'Network', href: '#', icon: 'github' },
]

// The chrome: the pieces that sit over every route and belong to no section.
const CHROME = [
  [
    'Navbar',
    'Fixed at the top. Full width and transparent over the hero; past 60px of scroll it goes compact: smaller padding and logo, a translucent blurred capsule, and it shrinks to hug its own contents. That width is measured, because `width: auto` cannot be animated.',
  ],
  [
    'Footer',
    'Fixed at the bottom, slid out of sight until the hero is behind you, and it shares that moment with Limonacho. It measures itself and publishes `--footer-h`, so the page reserves exactly its height.',
  ],
  [
    'Mobile menu',
    'The panel behind the menu button, and the one place in the project with a cast shadow.',
  ],
  [
    'Scroll indicator',
    'The word "Scroll" set vertically with a line filled by the accent in proportion to the scroll. Only on a route with a hero, and it fades out at 98%.',
  ],
]

// Live state for the specimens that need it.
const tab = ref('exp')
const tabOptions = computed(() => [
  { value: 'exp', label: t('tab.exp') },
  { value: 'edu', label: t('tab.edu') },
])

const dialogOpen = ref(false)

// Every token value, read back from the browser so the labels are the truth.
const resolved = ref({})
const TOKENS = COLOUR.flatMap((g) => g.tokens.map(([token]) => token))

function readTokens() {
  const styles = getComputedStyle(document.documentElement)
  const next = {}
  for (const token of TOKENS) next[token] = styles.getPropertyValue(token).trim()
  resolved.value = next
}

// The values change with the theme, so they are re-read after the attribute on
// <html> lands.
watch(theme, () => nextTick(readTokens))
onMounted(readTokens)
</script>

<template>
  <main class="sheet">
    <nav class="rail" aria-label="Sections of the sheet">
      <p class="rail-label">Design system</p>
      <a v-for="[id, label] in SECTIONS" :key="id" class="rail-link" :href="`#${id}`">{{ label }}</a>

      <div class="rail-controls">
        <div class="rail-control">
          <button class="toggle" type="button" :aria-label="t('a11y.toggleTheme')" @click="toggleTheme">
            {{ theme === 'dark' ? 'Light' : 'Dark' }}
          </button>
          <span class="rail-caption">Theme</span>
        </div>
        <div class="rail-control">
          <button class="toggle" type="button" :aria-label="t('a11y.toggleLang')" @click="toggleLang">
            {{ lang === 'en' ? 'ES' : 'EN' }}
          </button>
          <span class="rail-caption">Language</span>
        </div>
      </div>
    </nav>

    <div class="content">
      <header class="intro">
        <p class="eyebrow">krub.dev · dev only</p>
        <h1 class="title">Design system</h1>
        <p class="lead">
          One token file drives two themes and six accents, and no component keeps a colour or a
          string of its own. Everything below is the real thing, fed placeholders: the copy, the
          photos and the quotes all change, the shape does not.
        </p>
      </header>

      <section id="colour" class="block">
        <h2 class="h2">Colour</h2>
        <div v-for="group in COLOUR" :key="group.group" class="group">
          <p class="group-label">{{ group.group }}</p>
          <div class="swatches">
            <div v-for="[token, use] in group.tokens" :key="token" class="swatch">
              <div class="chip" :style="{ background: `var(${token})` }" />
              <code class="token">{{ token }}</code>
              <span class="value">{{ resolved[token] }}</span>
              <span class="use">{{ use }}</span>
            </div>
          </div>
        </div>
        <p class="note">
          <code>--acc</code> is the same in both themes; what changes is what is painted with it. The
          element-specific ones are not theme colours: a highlight stays white and a shadow stays
          dark, because the opposite would be a bug, not a feature.
        </p>
      </section>

      <section id="type" class="block">
        <h2 class="h2">Type</h2>
        <p class="note">
          Two variable faces, self-hosted: <strong>Space Grotesk</strong> for prose and
          <strong>JetBrains Mono</strong> for anything that behaves like a label.
        </p>
        <div class="rows">
          <div v-for="[name, spec, css] in TYPE" :key="name" class="row">
            <div class="row-meta">
              <span class="row-name">{{ name }}</span>
              <code class="row-spec">{{ spec }}</code>
            </div>
            <div class="row-demo" :style="css">I build things that hold up</div>
          </div>
        </div>
      </section>

      <section id="shape" class="block">
        <h2 class="h2">Shape</h2>
        <p class="note">Every border in the project is <code>1px solid var(--line)</code>.</p>
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
        <p class="note">
          That is the only cast in the project. Elevation is a <code>1px --line</code> border, not a
          shadow, and there are no coloured shadows anywhere.
        </p>
      </section>

      <section id="motion" class="block">
        <h2 class="h2">Motion</h2>
        <p class="note">
          One curve carries almost everything, and every piece of it switches off under
          <code>prefers-reduced-motion</code>.
        </p>
        <div class="rows">
          <div v-for="[name, value, note] in MOTION" :key="name" class="row">
            <div class="row-meta">
              <span class="row-name">{{ name }}</span>
              <code class="row-spec">{{ value }}</code>
            </div>
            <div class="row-demo dict wrap">{{ note }}</div>
          </div>
        </div>

        <div class="anim-grid">
          <div class="anim">
            <div class="anim-stage marquee-stage">
              <div class="marquee-track">
                <span>FULLSTACK DEVELOPER → BACKEND // MURCIA · BARCELONA · REMOTE //&nbsp;</span>
                <span>FULLSTACK DEVELOPER → BACKEND // MURCIA · BARCELONA · REMOTE //&nbsp;</span>
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
              <span class="dot-label">Available</span>
            </div>
            <code class="anim-name">dotHalo 2.6s · core fixed, ring pulses</code>
          </div>

          <div class="anim">
            <div class="anim-stage center">
              <span class="lemon" />
            </div>
            <code class="anim-name">lemonShake .5s ease</code>
          </div>
        </div>
      </section>

      <section id="buttons" class="block">
        <h2 class="h2">Buttons</h2>
        <p class="note">
          <code>BaseButton</code> renders a <code>&lt;button&gt;</code>, an <code>&lt;a&gt;</code>
          when given <code>href</code>, or a <code>RouterLink</code> when given <code>to</code>.
        </p>
        <div class="specimens">
          <BaseButton variant="solid" size="lg">{{ t('actions.talk') }}</BaseButton>
          <BaseButton variant="solid" size="md">{{ t('actions.talk') }}</BaseButton>
          <BaseButton variant="outline" size="md">{{ t('actions.cv') }}</BaseButton>
          <BaseButton variant="outline" size="sm" mono>{{ t('tab.edu') }}</BaseButton>
          <BaseButton variant="solid" size="md" disabled>{{ t('form.send') }}</BaseButton>
          <BaseButton variant="solid" size="sm" :href="cvPath[theme][lang]" download>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="icon">
              <path d="M12 3v12M7 10l5 5 5-5M5 21h14" />
            </svg>
          </BaseButton>
        </div>
        <p class="note">
          The dimmed one is the send button with the form not ready; the last is the CV's download, an
          icon with the words on the <code>aria-label</code>. There are no capsule pills: the radius
          is 10px, and the only 999px in the project is the pager's dot.
        </p>
      </section>

      <section id="blocks" class="block">
        <h2 class="h2">Blocks</h2>

        <p class="group-label">Section heading</p>
        <div class="specimens headings">
          <SectionHeading index="00" :title="t('section.me')" />
          <SectionHeading index="01" :title="t('section.projects')" :count="3" />
          <SectionHeading :title="t('section.contact')" />
        </div>
        <p class="note">
          The giant number sits behind the title on purpose. <code>count</code> is the yellow
          superscript the projects section carries.
        </p>

        <p class="group-label">Tabs and timeline</p>
        <TabSwitch v-model="tab" :options="tabOptions" panel-id="preview-tabs" />
        <div class="timeline">
          <TimelineItem
            v-for="(entry, i) in SAMPLE_TIMELINE"
            :key="entry.period"
            :period="entry.period"
            :current="entry.current"
            :title="entry.title"
            :body="entry.body"
            :is-last="i === SAMPLE_TIMELINE.length - 1"
          />
        </div>

        <p class="group-label">Stack</p>
        <p class="note">
          Each tile draws the logo twice (a grey copy under a colour one) and the pointer fades the
          colour in, so the light is a radius rather than a winner.
        </p>
        <div class="stack-grid">
          <StackGroup :label="t('stack.g1')" :items="SAMPLE_STACK" :index="0" :total="1" />
        </div>
      </section>

      <section id="cards" class="block">
        <h2 class="h2">Cards</h2>

        <p class="group-label">Project card</p>
        <p class="note">
          The whole card is the click target while the button stays around the title alone, so the
          accessible name is the project's name and the summary stays ordinary text.
        </p>
        <div class="card-demo">
          <ProjectCard
            :name="SAMPLE.name"
            :tag="SAMPLE.tag"
            :summary="SAMPLE.summary"
            :shot-label="SAMPLE.shotLabel"
            :image="null"
            :stack="SAMPLE.stack"
            @open="dialogOpen = true"
          />
        </div>

        <p class="group-label">The modal's media</p>
        <p class="note">
          A horizontal track of slides, paged by the dots (the rail's indicator on its side) and by a
          drag. With no screenshots each slide is the striped frame.
        </p>
        <div class="media-demo">
          <MediaCarousel
            :images="[]"
            :slides="4"
            slug="project"
            :name="SAMPLE.name"
            :shot-label="SAMPLE.shotLabel"
          />
        </div>

        <p class="group-label">Testimonials</p>
        <p class="note">
          One quote in the DOM at a time, in its own card: a filled accent header with the label and
          the position, the quote mark behind, the attribution, the clamp and the read more, and the
          dots down the side. Fed placeholders here.
        </p>
        <Testimonials :entries="SAMPLE_TESTIMONIALS" />

        <p class="group-label">Dialog</p>
        <p class="note">
          The shell every dialog uses: backdrop, panel, scroll lock, focus trap, Escape, a sticky
          header and the close. Open it and tab through; the header stays while the body scrolls.
        </p>
        <div class="specimens">
          <BaseButton variant="solid" size="md" @click="dialogOpen = true">Open a dialog</BaseButton>
        </div>
      </section>

      <section id="bits" class="block">
        <h2 class="h2">Small pieces</h2>
        <p class="group-label">Availability</p>
        <div class="specimens">
          <AvailabilityBadge label="Available" />
        </div>
        <p class="group-label">A speech bubble</p>
        <div class="specimens">
          <SpeechBubble text="A sample message" />
        </div>
        <p class="group-label">Social links</p>
        <div class="specimens">
          <SocialLink v-for="s in SAMPLE_SOCIALS" :key="s.icon" v-bind="s" />
        </div>
        <p class="group-label">The project's spec list</p>
        <div class="spec-demo">
          <SpecList :role="SAMPLE.role" :year="SAMPLE.year" :stack="SAMPLE.stack" />
        </div>
      </section>

      <section id="cursor" class="block">
        <h2 class="h2">Cursor</h2>
        <p class="note">
          The native cursor is hidden and replaced by three elements that follow the pointer: a dot
          that arrives at once, a ring that trails it, and a hint a beat further back. The ring opens
          over anything interactive. There is no cursor at all on touch.
        </p>
        <div class="specimens cursor-specimens">
          <span class="c-dot" />
          <span class="c-ring" />
          <span class="c-hint">↑</span>
          <span class="c-hint">↓</span>
          <span class="c-hint c-360" />
        </div>
        <p class="note">
          Dot 10px, ring 40px, hint 18px, all in <code>--acc-solid</code> (the same in both themes).
          Over the hero the hint becomes the gesture: ↑ over the closed blind, ↓ over the coil, and
          the 360 mark over the mark itself, once the blind has finished moving. These are drawn,
          because the real ones follow the pointer and cannot stand still.
        </p>
      </section>

      <section id="stage" class="block">
        <h2 class="h2">The stage</h2>
        <p class="note">
          The hero's square slot for the 3D scene: a box of whole 72px cells (five here), a slim
          brushed-metal frame, a roller blind that lifts on a click, and the mark turning inside.
          The scene is not mounted below 900px, so this is the only place to see it small. Click the
          blind.
        </p>
        <div class="stage-demo">
          <LogoStage :snap="false" />
        </div>
      </section>

      <section id="chrome" class="block">
        <h2 class="h2">Chrome</h2>
        <p class="note">
          The pieces that sit over every route and belong to no section. They are live on this page:
          the bar above, the footer below, the cursor, and Limonacho.
        </p>
        <div class="rows">
          <div v-for="[name, what] in CHROME" :key="name" class="row">
            <div class="row-meta">
              <span class="row-name">{{ name }}</span>
            </div>
            <div class="row-demo dict wrap">{{ what }}</div>
          </div>
        </div>

        <p class="group-label">Limonacho</p>
        <p class="note">
          He is chrome too: bottom-right, pure CSS, flat accent fill and no gradient. He rides in
          from the right with the footer. Poke him.
        </p>
        <LemonPet />
      </section>

      <footer class="outro">
        <p class="note">
          English throughout, because the repository is written in English and this page belongs to
          it, not to the site: only the components' own labels follow the language toggle. The prose a
          visitor reads lives in <code>src/data/</code> and the interface strings in
          <code>src/locales/</code>.
        </p>
      </footer>
    </div>

    <BaseModal
      :open="dialogOpen"
      labelledby="preview-dialog-title"
      close-label="Close the dialog"
      @close="dialogOpen = false"
    >
      <template #head>
        <span id="preview-dialog-title" class="dialog-title">A dialog</span>
      </template>

      <div class="dialog-body">
        <p class="note">
          The panel and its behaviour are the shell's; what is inside is the caller's. The backdrop
          is one soft blur over a flat scrim (one blur across everything behind, not one per
          element).
        </p>
        <p v-for="n in 12" :key="n" class="note">Scroll line {{ n }}.</p>
      </div>
    </BaseModal>
  </main>
</template>

<style scoped>
/*
  Two columns: the rail, and the sheet. The rail sticks under the bar, which is
  the real one — this is a route like any other.
*/
.sheet {
  max-width: 1180px;
  margin: 0 auto;
  padding: calc(var(--navbar-h, 88px) + clamp(20px, 4vw, 44px)) var(--gutter-r)
    calc(var(--footer-h, 52px) + clamp(48px, 8vw, 96px)) var(--gutter-l);
  display: grid;
  grid-template-columns: 180px minmax(0, 1fr);
  gap: clamp(28px, 5vw, 72px);
  align-items: start;
}

.rail {
  position: sticky;
  top: calc(var(--navbar-h, 88px) + 24px);
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.rail-label {
  margin: 0 0 10px;
  font: 500 11px var(--font-mono);
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--fg-3);
}

.rail-link {
  padding: 5px 0;
  font-size: 15px;
  color: var(--fg-2);
  transition: color 0.16s ease;
}

.rail-link:hover {
  color: var(--acc-text);
}

.rail-controls {
  display: flex;
  gap: 14px;
  margin-top: 18px;
}

.rail-control {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 5px;
}

.rail-caption {
  font: 400 10px var(--font-mono);
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--fg-3);
}

.toggle {
  font: 500 12px var(--font-mono);
  color: var(--fg-2);
  background: transparent;
  border: 1px solid var(--line);
  /* 10px, the project's button radius: there are no capsule pills here. */
  border-radius: 10px;
  padding: 7px 14px;
  cursor: pointer;
  transition:
    color 0.16s ease,
    border-color 0.16s ease;
}

.toggle:hover {
  color: var(--acc-text);
  border-color: var(--acc-text);
}

.content {
  display: flex;
  flex-direction: column;
  gap: clamp(48px, 7vw, 88px);
  min-width: 0;
}

.intro {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.eyebrow {
  margin: 0;
  font: 500 11px var(--font-mono);
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--fg-3);
}

.title {
  margin: 0;
  font: 700 clamp(32px, 5vw, 56px) var(--font-sans);
  letter-spacing: -0.03em;
  line-height: 1;
}

.lead {
  margin: 0;
  max-width: 58ch;
  font-size: clamp(17px, 1.8vw, 20px);
  line-height: 1.55;
  color: var(--fg-2);
}

.block {
  display: flex;
  flex-direction: column;
  gap: 20px;
  /* Anchors land below the fixed bar. */
  scroll-margin-top: calc(var(--navbar-h, 88px) + 24px);
}

.h2 {
  margin: 0;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--line);
  font: 500 clamp(20px, 2.4vw, 26px) var(--font-mono);
  letter-spacing: -0.02em;
}

.group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.group-label {
  margin: 0;
  font: 500 11px var(--font-mono);
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--fg-3);
}

.note {
  margin: 0;
  max-width: 68ch;
  font-size: 15px;
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
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
}

.swatch {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.chip {
  height: 60px;
  margin-bottom: 8px;
  border: 1px solid var(--line);
  border-radius: 10px;
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
  font-size: 13px;
  color: var(--fg-2);
}

/* Rows: a meta column and a demo ------------------------------------------ */
.rows {
  display: flex;
  flex-direction: column;
}

.row {
  display: grid;
  grid-template-columns: minmax(140px, 200px) 1fr;
  gap: clamp(14px, 3vw, 32px);
  align-items: baseline;
  padding: 18px 0;
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

.row-demo.wrap,
.dict {
  white-space: normal;
  font-size: 15px;
  color: var(--fg-2);
}

/* Shape ------------------------------------------------------------------- */
.tiles {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.tile {
  width: 128px;
  height: 88px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 0 8px;
  text-align: center;
  background: var(--surface-2);
  border: 1px solid var(--line);
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
}

.shadow {
  flex: 1 1 240px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 20px;
  border: 1px solid var(--line);
  border-radius: 18px;
  background: var(--surface);
}

/* Motion ------------------------------------------------------------------ */
.anim-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 20px;
}

.anim {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.anim-stage {
  height: 120px;
  overflow: hidden;
  border: 1px solid var(--line);
  border-radius: 18px;
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

.lemon {
  width: 58px;
  height: 48px;
  border-radius: 50% 50% 48% 48% / 58% 58% 42% 42%;
  background: var(--acc);
  animation: lemonShake 0.5s ease infinite;
}

/* Components -------------------------------------------------------------- */
.specimens {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 14px;
}

/* The giant section number overflows its box on purpose, so these are stacked
   with room between them rather than left to wrap into each other. */
.headings {
  flex-direction: column;
  align-items: flex-start;
  gap: 48px;
  padding: 28px 0 8px;
}

.timeline {
  display: flex;
  flex-direction: column;
}

.stack-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 32px;
}

.card-demo {
  max-width: 380px;
}

.media-demo {
  max-width: 640px;
}

.spec-demo {
  max-width: 340px;
}

.icon {
  width: 15px;
  height: 15px;
  display: block;
}

/* Cursor ------------------------------------------------------------------ */
/* Drawn, because the real elements follow the pointer. Same sizes and colours. */
.cursor-specimens {
  gap: 26px;
  padding: 24px 0;
}

.c-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--acc-solid);
}

.c-ring {
  width: 40px;
  height: 40px;
  border: 1.5px solid var(--acc-solid);
  border-radius: 50%;
}

.c-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  font: 700 18px var(--font-mono);
  line-height: 1;
  color: var(--acc-solid);
}

.c-360 {
  background: var(--acc-solid);
  -webkit-mask: url('/assets/img/360icon.svg') center / contain no-repeat;
  mask: url('/assets/img/360icon.svg') center / contain no-repeat;
}

/* The stage --------------------------------------------------------------- */
.stage-demo {
  width: 360px;
  max-width: 100%;
}

/* The dialog specimen ----------------------------------------------------- */
.dialog-title {
  font-family: var(--font-mono);
  font-size: 13px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--fg-2);
}

.dialog-body {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 24px;
}

.outro {
  padding-top: 24px;
  border-top: 1px solid var(--line);
}

@media (max-width: 900px) {
  .sheet {
    grid-template-columns: 1fr;
    gap: 32px;
  }

  .rail {
    position: static;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    gap: 4px 14px;
  }

  .rail-label {
    flex-basis: 100%;
    margin-bottom: 4px;
  }

  .rail-controls {
    margin-top: 0;
  }

  .row {
    grid-template-columns: 1fr;
    gap: 8px;
  }
}
</style>
