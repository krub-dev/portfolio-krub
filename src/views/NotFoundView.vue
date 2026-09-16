<script setup>
/*
  The 404 page.

  It is its own route, so the whole chrome arrives with it from App.vue — the
  grid, the navbar, the cursor, the mobile menu and the footer. Nothing here
  draws any of that.

  The heading is the h1, not the h2 the sections use: a section sits under the
  hero's h1, and this page has no hero above it. The sentence comes from
  src/data/copy.js and the title and button label from src/locales/, like every
  other string in the project.
*/
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import BaseButton from '../components/base/BaseButton.vue'
import SectionHeading from '../components/base/SectionHeading.vue'
import { useLang } from '../composables/useLang'
import { copy } from '../data'

const { t } = useI18n()
const { lang } = useLang()

const body = computed(() => copy.notFound[lang.value].body)
</script>

<template>
  <main class="not-found">
    <SectionHeading index="404" :title="t('notFound.title')" level="h1" />
    <p class="body">{{ body }}</p>
    <BaseButton variant="solid" to="/" magnetic>{{ t('actions.home') }}</BaseButton>
  </main>
</template>

<style scoped>
/*
  Fills the viewport above the fixed footer, so the footer and Limonacho are on
  screen from the first frame (see usePastHero) and the page does not scroll.
  `--navbar-h` keeps the block clear of the bar and the gutters keep it clear of
  the notch, both published by the elements that own them.
*/
.not-found {
  box-sizing: border-box;
  min-height: calc(100svh - var(--footer-h, 52px));
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 26px;
  padding: calc(var(--navbar-h, 88px) + 20px) var(--gutter-r) 40px var(--gutter-l);
}

.body {
  margin: 0;
  max-width: 46ch;
  font-size: clamp(17px, 1.6vw, 20px);
  line-height: 1.6;
  color: var(--fg-2);
}
</style>
