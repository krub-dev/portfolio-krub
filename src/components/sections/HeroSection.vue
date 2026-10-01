<script setup>
/*
  The hero: name, headline, paragraph, two CTAs on the left; the square stage
  with the logo on the right.

  The stage on the right is LogoStage: it owns the 3D logo, the frame and the
  pointer gestures.

  On a phone there is no stage at all — see the note above the media query in
  the styles.
*/
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import BaseButton from '../base/BaseButton.vue'
import { useLang } from '../../composables/useLang'
import { copy } from '../../data'
import BrandName from './BrandName.vue'
import LogoStage from './LogoStage.vue'

const { lang } = useLang()
const { t } = useI18n()

const hero = computed(() => copy.hero[lang.value])

/*
  Which layout is on screen, in JavaScript rather than CSS.

  The stage exists on a desktop and not on a phone: below 900px the hero is one
  column and the stage is what does not fit (decision 37). Matching the same
  900px the stylesheet uses; reactive because a phone can be rotated and a
  desktop window resized across the breakpoint.
*/
const narrow = ref(false)
let query = null

function syncLayout(event) {
  narrow.value = event.matches
}

onMounted(() => {
  query = window.matchMedia('(max-width: 900px)')
  narrow.value = query.matches
  query.addEventListener('change', syncLayout)
})

onUnmounted(() => query?.removeEventListener('change', syncLayout))
</script>

<template>
  <section id="top" class="hero">
    <div class="grid">
      <div class="left">
        <BrandName />

        <h1 class="headline">
          {{ hero.line1 }}<br />
          <span class="accent">{{ hero.line2 }}</span>
        </h1>

        <p class="skills">{{ hero.skills }}</p>

        <span class="rule" aria-hidden="true" />

        <p class="body">{{ hero.body }}</p>

        <div class="ctas">
          <BaseButton variant="solid" size="lg" magnetic href="#contact">
            {{ t('actions.talk') }}
          </BaseButton>
          <BaseButton variant="outline" size="md" mono magnetic href="#projects" class="secondary">
            {{ t('actions.projects') }}
          </BaseButton>
        </div>

      </div>

      <LogoStage v-if="!narrow" />
    </div>
  </section>
</template>

<style scoped>
.hero {
  position: relative;
  z-index: 1;
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  align-items: center;
  padding: clamp(88px, 11vh, 116px) var(--gutter-r) clamp(20px, 4vh, 40px) var(--gutter-l);
}

.grid {
  width: 100%;
  max-width: 1180px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: clamp(32px, 5vw, 64px);
  align-items: center;
}

.left {
  display: flex;
  flex-direction: column;
  gap: clamp(14px, 2.2vh, 24px);
}

.headline {
  margin: 0;
  font-size: clamp(38px, 6vw, 76px);
  font-weight: 700;
  letter-spacing: -0.035em;
  line-height: 0.98;
  text-wrap: balance;
}

.accent {
  color: var(--acc-text);
}

/* The disciplines line, the same one the banners carry, in the mono the site
   uses for labels. */
.skills {
  margin: 0;
  font-family: var(--font-mono);
  font-size: clamp(12px, 1.1vw, 15px);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--fg-2);
}

.rule {
  width: 104px;
  height: 3px;
  background: var(--acc);
}

.body {
  margin: 0;
  font-size: clamp(16px, 1.4vw, 19px);
  line-height: 1.6;
  color: var(--fg-2);
  max-width: 46ch;
  text-wrap: pretty;
}

.ctas {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

/* The spec's secondary CTA is 14px 26px, which sits between the md and lg
   sizes of BaseButton. Overriding here beats growing the size scale for one
   instance — see the note in BaseButton.vue. */
.secondary {
  padding: 14px 26px;
}

/*
  The phone layout.

  Below 900px the grid becomes one column, so the text and the stage stack
  instead of sitting side by side and the hero needs both of their heights. At
  375x667 that came to 883px of content in a 667px viewport, which pushed the
  marquee 216px below the fold — on desktop the band sits exactly on it, and
  landing there is the first thing the page does.

  The stage is what does not fit, so on a phone it is not rendered at all.
  Every way of keeping it was worse than losing it: shrunk to fit it became a
  ~130px square holding a logo that is already in the navbar directly above it.
  A box that holds the 3D logo earns its space on a desktop, where it is half the
  composition. On a phone it was taking the marquee's place to show a smaller
  copy of the logo.

  And the WebGL scene never mounts on a phone, because LogoStage does not mount,
  so it costs nothing on a mid-range device: it is not there.
*/
@media (max-width: 900px) {
  .hero {
    /*
      Clear the fixed navbar by measuring it, not by guessing. The 88px floor
      above was two pixels short of the bar's real 90, so the name was already
      touching it in production. --navbar-h comes from TheNavbar.
    */
    padding: calc(var(--navbar-h, 96px) + 20px) var(--gutter-r) 24px var(--gutter-l);
  }

  .grid {
    grid-template-columns: 1fr;
  }
}
</style>
