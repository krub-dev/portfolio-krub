<script setup>
/*
  Section 00. Three paragraphs and the experience/education timeline on the
  left, the photo on the right.

  The tab state lives here rather than in TabSwitch: the switch only reports
  what was clicked, this section decides what that means. That is the "a
  component that only paints does not own state" rule from COMPONENTS.md.

  The CV button opens the dialog the page owns, so it emits rather than holding
  the state itself.
*/
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import BaseButton from '../base/BaseButton.vue'
import AvailabilityBadge from '../base/AvailabilityBadge.vue'
import SectionHeading from '../base/SectionHeading.vue'
import TabSwitch from '../base/TabSwitch.vue'
import TimelineItem from '../base/TimelineItem.vue'
import { useLang } from '../../composables/useLang'
import { useLemonVoice } from '../../composables/useLemonVoice'
import { certifications, config, copy, education, experience, photoPath } from '../../data'
import { formatPeriod } from '../../utils/format'

defineEmits(['open-cv'])

const { lang } = useLang()
const { t } = useI18n()
// Limonacho greets you when the pointer lands on the photo.
const { say, hush } = useLemonVoice()

const tab = ref('exp')
// The id that ties the tab row to the panel it switches, for the ARIA tablist.
const panelId = 'me-tabs'
const about = computed(() => copy.about[lang.value])
const lemon = computed(() => copy.lemon[lang.value])
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

// Which way the content slides when the tab changes, for the transition.
const direction = ref('left')

watch(tab, (next, previous) => {
  const values = options.value.map((option) => option.value)
  direction.value = values.indexOf(next) > values.indexOf(previous) ? 'left' : 'right'
})

/*
  A sideways swipe on the content moves to the next or previous tab, and the
  content slides the way the finger went. It only takes over once the gesture is
  clearly horizontal (longer than it is tall), so a vertical scroll is left to
  the page; from that point it cancels the scroll, because otherwise the content
  slid and the page scrolled at the same time.
*/
let touchX = 0
let touchY = 0
let horizontal = false

function onTouchStart(event) {
  const point = event.changedTouches[0]
  touchX = point.clientX
  touchY = point.clientY
  horizontal = false
}

function onTouchMove(event) {
  if (horizontal) {
    event.preventDefault()
    return
  }
  const point = event.changedTouches[0]
  const dx = point.clientX - touchX
  const dy = point.clientY - touchY
  if (Math.abs(dx) > 12 && Math.abs(dx) > Math.abs(dy) * 1.5) {
    horizontal = true
    event.preventDefault()
  }
}

function onTouchEnd(event) {
  if (!horizontal) return
  horizontal = false
  const point = event.changedTouches[0]
  const dx = point.clientX - touchX
  if (Math.abs(dx) < 48) return

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

        <div class="switcher">
          <TabSwitch v-model="tab" :options="options" :panel-id="panelId" class="tabs" />

          <Transition :name="`tab-slide-${direction}`" mode="out-in">
            <!--
              role="tabpanel" on the wrapper and not on the <ol>: a non-list role
              on the list itself takes the list role off it, and the <li> rows
              below stop being list items.
            -->
            <div
              :key="tab"
              :id="panelId"
              role="tabpanel"
              :aria-labelledby="`${panelId}-tab-${tab}`"
              tabindex="0"
            >
              <ol
                class="timeline"
                @touchstart="onTouchStart"
                @touchmove="onTouchMove"
                @touchend="onTouchEnd"
              >
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
            </div>
          </Transition>
        </div>
      </div>

      <div class="photo-wrap" data-pfp-wrap>
        <AvailabilityBadge class="availability" :label="copy.hero[lang].badge" />
        <div class="photo-box" @mouseenter="say(about.greet)" @mouseleave="hush()">
          <img class="photo" :src="photoPath" alt="Kiko Rubio" data-pfp />
        </div>

        <BaseButton
          v-if="config.showCv"
          variant="solid"
          size="md"
          magnetic
          class="cv"
          @mouseenter="say(lemon.cv)"
          @mouseleave="hush()"
          @click="$emit('open-cv')"
        >
          {{ t('actions.cv') }}
        </BaseButton>
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

/* The tab row and the content are one block, no gap: the tab track sits right
   on the content, and the timeline's first row drops its own top border so the
   two rules do not double. */
.switcher {
  display: flex;
  flex-direction: column;
}

.timeline {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
}

.timeline :deep(li:first-child .row) {
  border-top: 0;
}

/* The content slides the way the tab did. out-in so the two panels do not sit
   on top of each other while they cross. */
.tab-slide-left-enter-active,
.tab-slide-left-leave-active,
.tab-slide-right-enter-active,
.tab-slide-right-leave-active {
  transition:
    transform 0.24s cubic-bezier(0.22, 1, 0.36, 1),
    opacity 0.24s ease;
}

.tab-slide-left-enter-from {
  transform: translateX(44px);
  opacity: 0;
}

.tab-slide-left-leave-to {
  transform: translateX(-44px);
  opacity: 0;
}

.tab-slide-right-enter-from {
  transform: translateX(-44px);
  opacity: 0;
}

.tab-slide-right-leave-to {
  transform: translateX(44px);
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .tab-slide-left-enter-active,
  .tab-slide-left-leave-active,
  .tab-slide-right-enter-active,
  .tab-slide-right-leave-active {
    transition: none;
  }
}

/* The CV closes the photo's column now, at the photo's own width, and travels
   with it. */
.cv {
  align-self: stretch;
  margin-top: 6px;
}

.photo-wrap {
  display: flex;
  flex-direction: column;
  gap: 10px;
  /*
    The photo travels with the scroll instead of sitting still while the timeline
    runs past it. It sticks under the bar and rides down until the column ends, so
    its foot stops just above the section's own bottom — that is the section's
    padding, and it is what keeps the last row of the timeline from ending level
    with the photo.
  */
  position: sticky;
  top: calc(var(--navbar-h, 88px) + 20px);
  align-self: start;
}

/* The photo, and the badge that sits on it. */
.photo-box {
  position: relative;
}

.photo {
  display: block;
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: cover;
  border-radius: 18px;
  border: 1px solid var(--line);
}

/* Above the photo, out of the picture and nudged in off the corner. */
.availability {
  align-self: flex-end;
  transform: translate(-8px, 6px);
}

@media (max-width: 900px) {
  .cols {
    grid-template-columns: 1fr;
  }

  /*
    The photo takes the full width and the badge goes under its left edge. Beside
    it, at this size, the label was left hanging in a gap and read as stray.
  */
  .photo-wrap {
    /* No travel on a phone: the photo lands at the end of the section here, so
       there is nothing to ride past. */
    position: static;
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .photo {
    max-width: none;
  }

  .availability {
    order: 2;
    align-self: flex-start;
    transform: none;
  }

  /* Under the badge, still at the photo's width, so the section closes with the
     same block it closes with on a wide screen. */
  .cv {
    order: 3;
  }
}
</style>
