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
import { copy, cvPath, education, experience } from '../../data'
import { formatPeriod } from '../../utils/format'

const { lang } = useLang()
const { t } = useI18n()

const tab = ref('exp')
const about = computed(() => copy.about[lang.value])
const options = computed(() => [
  { value: 'exp', label: t('tab.exp') },
  { value: 'edu', label: t('tab.edu') },
])
const entries = computed(() => (tab.value === 'exp' ? experience : education))

// A null `to` means still going, so the row stays correct as years pass
// without anyone editing the data. See src/utils/format.js.
const period = (entry) => formatPeriod(entry, t('time.now'))
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

        <ol class="timeline">
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
          variant="outline"
          size="md"
          magnetic
          external
          :href="cvPath"
          class="cv"
        >
          {{ t('actions.cv') }}
        </BaseButton>
      </div>

      <div class="photo-wrap" data-pfp-wrap>
        <img class="photo" src="/assets/img/krub-pfp.jpeg" alt="Kiko Rubio" data-pfp />
      </div>
    </div>
  </section>
</template>

<style scoped>
.about {
  position: relative;
  z-index: 1;
  padding: clamp(56px, 8vw, 110px) clamp(20px, 5vw, 64px);
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
  filter: grayscale(1) contrast(1.05);
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
