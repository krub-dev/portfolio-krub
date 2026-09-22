<script setup>
/*
  The hero: name, headline, paragraph, two CTAs on the left; the square stage
  with the logo on the right.

  The stage on the right is LogoStage: it owns the logo, the inner grid and the
  3D parallax. The availability badge is passed into its slot, because it sits
  inside the stage but has nothing to do with the tilt.

  On a phone there is no stage at all — see the note above the media query in
  the styles — so the badge moves into the text column instead.
*/
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import AvailabilityBadge from '../base/AvailabilityBadge.vue'
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

  The badge exists once either way. Rendering it twice and hiding one with a
  media query would be simpler to write, but a screen reader walks the DOM, not
  the stylesheet — `display: none` does hide a node from it, yet the pattern
  invites the version where it does not, and the badge is the one line on the
  page that says I am open to work.

  Matching the same 900px the stylesheet uses. Reactive because a phone can be
  rotated, and because resizing a desktop window across the breakpoint has to
  put the badge back where it belongs.
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
          {{ hero.line2 }}<br />
          {{ hero.line3pre }}<span class="accent">{{ hero.accent }}</span>{{ hero.line3post }}
        </h1>

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

        <AvailabilityBadge v-if="narrow" class="availability-inline" :label="hero.badge" />
      </div>

      <LogoStage v-if="!narrow">
        <AvailabilityBadge class="availability" :label="hero.badge" />
      </LogoStage>
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

/* The stage, its grid and the logo all moved to LogoStage.vue in step 8, so
   the parallax lives next to the markup it drives. */
.availability {
  position: absolute;
  top: 14px;
  left: 22px;
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
  ~130px square holding a logo that is already in the navbar directly above it,
  with the availability badge wrapping onto two lines inside it. An empty box
  reserved for a 3D scene earns its space on a desktop, where it is half the
  composition. On a phone it was taking the marquee's place to show a smaller
  copy of the logo.

  Two things follow. The badge moves into the text column, since it was living
  inside the stage — that is the v-if in the script. And the parallax never
  subscribes on a phone, because LogoStage does not mount, which also answers
  the question of what a WebGL scene would cost on a mid-range device: nothing,
  it will not be there.
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

  /*
    The badge in its phone position: below the buttons, which is where the
    reading order puts it on desktop too — left column first, then the stage.
    Static rather than absolutely positioned, since there is no stage corner to
    pin it to any more.
  */
  .availability-inline {
    position: static;
    margin-top: 4px;
  }
}
</style>
