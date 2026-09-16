<script setup>
/*
  The 404 page.

  It is its own route, so the whole chrome arrives with it from App.vue — the
  grid, the navbar, the cursor, the mobile menu and the footer. Nothing here
  draws any of that.

  It draws its own heading rather than SectionHeading. The section pattern is a
  small mono title with a faint number behind it; this page wants the opposite —
  the 404 is the protagonist, so it is the h1 at display size with /not-found as
  a quiet label above it. The h1 is an h1, not the h2 a section uses, because
  nothing sits above it.

  The sentence comes from src/data/copy.js and the labels from src/locales/,
  like every other string in the project.
*/
import { computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'

import BaseButton from '../components/base/BaseButton.vue'
import { useLang } from '../composables/useLang'
import { copy } from '../data'

const { t } = useI18n()
const { lang } = useLang()

const body = computed(() => copy.notFound[lang.value].body)

/*
  The page is served with a 200 — a soft 404, see decisions.md — so it has to
  say what it is: without this a crawler would treat any unknown URL as a real
  page. The tag lives only while this view is mounted, since the head is shared
  and it must not outlive the route.
*/
let robots = null

onMounted(() => {
  robots = document.createElement('meta')
  robots.name = 'robots'
  robots.content = 'noindex'
  document.head.appendChild(robots)
})

onUnmounted(() => {
  robots?.remove()
  robots = null
})
</script>

<template>
  <main class="not-found">
    <p class="label">{{ t('notFound.title') }}</p>
    <h1 class="code">[{{ t('notFound.code') }}]</h1>
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

/*
  The label, then the code. `clamp` on the code takes it to a display size that
  fills the left of a wide screen; the 72px floor keeps it from shrinking to
  nothing on a phone and the 220px ceiling keeps it from overflowing a large one.

  Bounded by HEIGHT as well as width: a width-only size grew on a wide but short
  window and pushed the page past the viewport, which put the scrollbar back on a
  page that is meant to fit. `min(16vw, 28vh)` does not bite until the window is
  short enough for the width-only size to overflow — 1280x800 and 1280x768 are
  untouched — and on a 650px-tall window it shrinks the number instead of
  scrolling.

  --acc-text, not --acc: at this size it is read as text, and #FFC800 on the light
  background is unreadable (decisions 11 and 27).
*/
.label {
  margin: 0;
  font-family: var(--font-mono);
  font-size: clamp(22px, 2.6vw, 30px);
  font-weight: 500;
  color: var(--fg-3);
}

.code {
  margin: 0;
  font-family: var(--font-mono);
  font-size: clamp(72px, min(16vw, 28vh), 220px);
  font-weight: 700;
  line-height: 0.9;
  letter-spacing: -0.05em;
  color: var(--acc-text);
}

.body {
  margin: 0;
  max-width: 46ch;
  font-size: clamp(17px, 1.6vw, 20px);
  line-height: 1.6;
  color: var(--fg-2);
}

/*
  A short window gets less air, so the block still fits. Same 700px breakpoint
  the hero uses for the same reason: below it, the vertical budget is what is
  scarce, not the width.
*/
@media (max-height: 700px) {
  .not-found {
    gap: 16px;
    padding-top: calc(var(--navbar-h, 88px) + 8px);
    padding-bottom: 20px;
  }
}
</style>
