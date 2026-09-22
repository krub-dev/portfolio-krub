<script setup>
/*
  Section 00. Three paragraphs and the experience/education timeline on the
  left, the photo on the right.

  The tab state lives here rather than in TabSwitch: the switch only reports
  what was clicked, this section decides what that means. That is the "a
  component that only paints does not own state" rule from COMPONENTS.md.
*/
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import BaseButton from '../base/BaseButton.vue'
import SectionHeading from '../base/SectionHeading.vue'
import TabSwitch from '../base/TabSwitch.vue'
import TimelineItem from '../base/TimelineItem.vue'
import { useLang } from '../../composables/useLang'
import { useTheme } from '../../composables/useTheme'
import { certifications, config, copy, cvPath, education, experience, photoPath } from '../../data'
import { formatPeriod } from '../../utils/format'

const { lang } = useLang()
const { theme } = useTheme()
const { t } = useI18n()

const tab = ref('exp')
const about = computed(() => copy.about[lang.value])
const options = computed(() => [
  { value: 'exp', label: t('tab.exp') },
  { value: 'edu', label: t('tab.edu') },
  { value: 'cert', label: t('tab.cert') },
])
const entries = computed(() => {
  if (tab.value === 'exp') return experience
  if (tab.value === 'edu') return education
  return certifications
})

// A null `to` means still going, so the row stays correct as years pass
// without anyone editing the data. See src/utils/format.js.
const period = (entry) => formatPeriod(entry, t('time.now'))

/*
  A sideways swipe on the content moves to the next or previous tab. It only
  fires when the gesture is clearly horizontal (longer than it is tall, and past
  a threshold), so a normal vertical scroll is left alone. The listeners are
  passive: nothing here needs to cancel the scroll.
*/
let touchX = 0
let touchY = 0

function onTouchStart(event) {
  const point = event.changedTouches[0]
  touchX = point.clientX
  touchY = point.clientY
}

function onTouchEnd(event) {
  const point = event.changedTouches[0]
  const dx = point.clientX - touchX
  const dy = point.clientY - touchY
  if (Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(dy)) return

  const values = options.value.map((option) => option.value)
  const next = values.indexOf(tab.value) + (dx < 0 ? 1 : -1)
  if (next >= 0 && next < values.length) tab.value = values[next]
}
</script>

<template>
  <section id="me" class="about">
    <SectionHeading index="00" :title="t('section.me')" />

    <div class="cols" data-two-col>
      <div class="main">
        <p class="lead">{{ about.p1 }}</p>
        <p class="para">{{ about.p2 }}</p>
        <p class="para">{{ about.p3 }}</p>

        <TabSwitch v-model="tab" :options="options" class="tabs" />

        <ol class="timeline" @touchstart.passive="onTouchStart" @touchend.passive="onTouchEnd">
          <li v-for="(entry, i) in entries" :key="entry.from + entry[lang].title">
            <TimelineItem
              :period="period(entry)"
              :current="entry.current"
              :title="entry[lang].title"
              :body="entry[lang].body"
              :is-last="i === entries.length - 1"
            />
          </li>
        </ol>

        <BaseButton
          v-if="config.showCv"
          variant="outline"
          size="md"
          magnetic
          external
          :href="cvPath[theme][lang]"
          class="cv"
        >
          {{ t('actions.cv') }}
        </BaseButton>
      </div>

      <div class="photo-wrap" data-pfp-wrap>
        <img class="photo" :src="photoPath" alt="Kiko Rubio" data-pfp />
      </div>
    </div>
  </section>
</template>

<style scoped>
.about {
  position: relative;
  z-index: 1;
  padding: clamp(56px, 8vw, 110px) var(--gutter-r) clamp(56px, 8vw, 110px) var(--gutter-l);
  max-width: 1180px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 34px;
}

.cols {
  display: grid;
  grid-template-columns: 1.3fr 0.7fr;
  gap: clamp(28px, 5vw, 64px);
  align-items: start;
}

.main {
  display: flex;
  flex-direction: column;
  gap: 22px;
  /*
    Without this the /me tab row, which is a scroll container, still forced this
    grid item to its content's width and the whole column overflowed the page
    instead of the tabs scrolling inside it.
  */
  min-width: 0;
}

.lead {
  margin: 0;
  font-size: clamp(18px, 2vw, 24px);
  line-height: 1.5;
  letter-spacing: -0.01em;
  max-width: 52ch;
  text-wrap: pretty;
}

.para {
  margin: 0;
  font-size: 17px;
  line-height: 1.65;
  color: var(--fg-2);
  max-width: 58ch;
  text-wrap: pretty;
}

.tabs {
  padding-top: 6px;
}

.timeline {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
}

/* The tab row already draws a rule under itself, so the timeline's first row
   would double it. */
.timeline :deep(li:first-child .row) {
  border-top: 0;
}

.cv {
  align-self: flex-start;
}

.photo-wrap {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.photo {
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: cover;
  border-radius: 18px;
  border: 1px solid var(--line);
}

@media (max-width: 900px) {
  .cols {
    grid-template-columns: 1fr;
  }

  .photo-wrap {
    flex-direction: row;
    align-items: flex-end;
    gap: 14px;
  }

  .photo {
    max-width: 210px;
    aspect-ratio: 4 / 5;
  }
}
</style>
