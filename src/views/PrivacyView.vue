<script setup>
/*
  The privacy page.

  Its own route, so the whole chrome arrives with it from App.vue: the grid, the
  navbar, the cursor, the mobile menu and the footer. Nothing here draws any of
  that.

  A document, so unlike the 404 it scrolls: the words are longer than a screen.
  The sections carry the same mono-uppercase label the rest of the site uses for
  a small heading, and the column is capped for reading rather than for looks.

  The text comes from src/data/privacy.js and the labels from src/locales/, like
  every other string in the project.
*/
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import BaseButton from '../components/base/BaseButton.vue'
import { useLang } from '../composables/useLang'
import { privacy } from '../data'

const { t } = useI18n()
const { lang } = useLang()

const doc = computed(() => privacy[lang.value])
</script>

<template>
  <main class="privacy">
    <div class="inner">
      <p class="label">{{ t('privacy.label') }}</p>
      <h1 class="title">{{ t('privacy.title') }}</h1>
      <p class="updated">{{ t('privacy.updated') }} · {{ doc.date }}</p>

      <p class="intro">{{ doc.intro }}</p>

      <section v-for="section in doc.sections" :key="section.heading" class="block">
        <h2 class="heading">{{ section.heading }}</h2>
        <p class="body">{{ section.body }}</p>
      </section>

      <BaseButton class="back" variant="solid" to="/" magnetic>{{ t('actions.home') }}</BaseButton>
    </div>
  </main>
</template>

<style scoped>
/*
  Clears the fixed navbar at the top and reserves the fixed footer at the bottom,
  both published by the elements that own them. The footer is on screen from the
  first frame on this route: there is no hero to scroll past, so usePastHero
  reports it shown straight away.
*/
.privacy {
  box-sizing: border-box;
  padding-top: calc(var(--navbar-h, 88px) + clamp(24px, 5vw, 60px));
  padding-bottom: calc(var(--footer-h, 52px) + clamp(40px, 6vw, 90px));
}

/* The same gutter and 1180px cap the sections use. */
.inner {
  max-width: 1180px;
  margin: 0 auto;
  padding-left: var(--gutter-l);
  padding-right: var(--gutter-r);
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.label,
.updated,
.heading {
  margin: 0;
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--fg-3);
}

/* The section-scale title, the size the contact rows use. */
.title {
  margin: 0;
  font-size: clamp(22px, 3.2vw, 40px);
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--fg);
}

.updated {
  letter-spacing: 0.14em;
}

/* Both prose blocks read at the same measure, so the column is the body column
   and not the 1180px cap. */
.intro,
.body {
  margin: 0;
  max-width: 68ch;
  font-size: clamp(17px, 1.6vw, 20px);
  line-height: 1.6;
  color: var(--fg-2);
}

.intro {
  margin-top: 4px;
}

.block {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: clamp(14px, 2vw, 24px);
}

.heading {
  color: var(--fg-3);
}

.back {
  align-self: flex-start;
  margin-top: clamp(20px, 3vw, 36px);
}
</style>
