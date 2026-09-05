<script setup>
/*
  The hero: name, headline, paragraph, two CTAs on the left; the square stage
  with the logo on the right.

  The stage on the right is LogoStage: it owns the logo, the inner grid and the
  3D parallax. The availability badge is passed into its slot, because it sits
  inside the stage but has nothing to do with the tilt.
*/
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import AvailabilityBadge from '../base/AvailabilityBadge.vue'
import BaseButton from '../base/BaseButton.vue'
import { useLang } from '../../composables/useLang'
import { copy, email } from '../../data'
import BrandName from './BrandName.vue'
import LogoStage from './LogoStage.vue'

const { lang } = useLang()
const { t } = useI18n()

const hero = computed(() => copy.hero[lang.value])
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
          <BaseButton variant="solid" size="lg" magnetic :href="`mailto:${email}`">
            {{ t('actions.talk') }}
          </BaseButton>
          <BaseButton variant="outline" size="md" mono magnetic href="#projects" class="secondary">
            {{ t('actions.projects') }}
          </BaseButton>
        </div>
      </div>

      <LogoStage>
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
  padding: clamp(88px, 11vh, 116px) clamp(20px, 5vw, 64px) clamp(20px, 4vh, 40px);
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

@media (max-width: 900px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>
