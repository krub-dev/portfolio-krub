<script setup>
/*
  Section 00. Three paragraphs and the experience/education timeline on the
  left, the photo on the right.

  The tab state lives here rather than in TabSwitch: the switch only reports
  what was clicked, this section decides what that means. That is the "a
  component that only paints does not own state" rule from COMPONENTS.md.

  The CV button opens the dialog the page owns, so it emits rather than holding
  the state itself; it also asks for the CV to be warmed before it is opened.
*/
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import AvailabilityBadge from '../base/AvailabilityBadge.vue'
import SectionHeading from '../base/SectionHeading.vue'
import TabSwitch from '../base/TabSwitch.vue'
import TimelineItem from '../base/TimelineItem.vue'
import { useLang } from '../../composables/useLang'
import { useLemonVoice } from '../../composables/useLemonVoice'
import { certifications, config, copy, education, experience, photoPath } from '../../data'
import { formatPeriod } from '../../utils/format'

const emit = defineEmits(['open-cv', 'warm-cv', 'set-variant'])

defineProps({
  // Which document is current, so the matching option reads as active.
  variant: { type: String, default: 'full' },
})

// The two documents the CV control offers, in order.
const CV_VARIANTS = ['full', 'onePage']

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

/*
  Two signs of intent warm the CV dialog (see useCv): the pointer over its button
  or the button focused, and — for a phone, where there is no hover before the tap
  — the photo column reaching the viewport. The second waits for idle time, so it
  never competes with what is being painted.
*/
const photoWrap = ref(null)
let observer = null

function warm() {
  emit('warm-cv')
}

function onCvEnter() {
  say(lemon.value.cv)
  warm()
}

onMounted(() => {
  observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) return
      observer.disconnect()
      // Safari has no requestIdleCallback; a plain delay is close enough.
      if (window.requestIdleCallback) window.requestIdleCallback(warm)
      else setTimeout(warm, 400)
    },
    { rootMargin: '200px' },
  )
  observer.observe(photoWrap.value)
})

onUnmounted(() => observer?.disconnect())
</script>

<template>
  <section id="me" class="about">
    <SectionHeading index="00" :title="t('section.me')" />

    <div class="cols" data-two-col>
      <div class="main">
        <p class="lead">{{ about.p1 }}</p>
        <p class="para">{{ about.p2 }}</p>
        <p class="para">{{ about.p3 }}</p>
        <p class="para">{{ about.p4 }}</p>
        <p class="open">{{ about.open }}</p>

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

      <div ref="photoWrap" class="photo-wrap" data-pfp-wrap>
        <AvailabilityBadge class="availability" :label="copy.hero[lang].badge" />
        <div class="photo-card">
          <div class="photo-box" @mouseenter="say(about.greet)" @mouseleave="hush()">
            <img class="photo" :src="photoPath" alt="Kiko Rubio" data-pfp />
          </div>

          <div v-if="config.showCv" class="cv-block">
            <span class="cv-label">{{ t('actions.cv') }}</span>
            <span class="cv-divider" aria-hidden="true" />
            <div class="cv-variants" role="group" :aria-label="t('cvModal.variants')">
            <button
              v-for="v in CV_VARIANTS"
              :key="v"
              class="cv-variant"
              :class="{ active: variant === v }"
              type="button"
              @click="emit('set-variant', v)"
            >
                {{ t(`cvModal.${v}`) }}
              </button>

              <span class="cv-sep" aria-hidden="true" />

              <button
                class="cv-open"
              type="button"
              :aria-label="t('actions.cv')"
              @mouseenter="onCvEnter"
              @focus="warm"
              @mouseleave="hush()"
              @click="emit('open-cv')"
            >
              <span class="cv-open-icon" aria-hidden="true" />
            </button>
          </div>
        </div>
        </div>
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

/* The closing line, on its own and at full strength: it is the ask, not more
   prose. */
.open {
  margin: 0;
  font-size: 17px;
  line-height: 1.65;
  color: var(--fg);
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

/* The CV panel is a touch wider than the photo and tucks a long way up behind
   it: its rounded top is hidden, but its sides run up alongside the photo's
   lower half, so the photo's frame reads as opening into it. The top padding
   clears the part behind the photo. */
.cv-block {
  position: relative;
  z-index: 0;
  width: 100%;
  margin: -40px 0 0;
  padding: 48px 20px 8px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 18px;
  box-sizing: border-box;
}

/* The accent, like the tag on a project card: it names the row without being
   the accent surface it used to be. */
.cv-label {
  font-family: var(--font-mono);
  font-size: 13px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--acc-text);
}

/* The same control the dialog carries: a hairline pill around the two options. */
.cv-variants {
  display: inline-flex;
  gap: 0;
  padding: 2px;
  border: 1px solid var(--line);
  border-radius: 9px;
}

.cv-variant {
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  padding: 6px 9px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--fg);
  cursor: pointer;
  transition:
    background-color 0.16s ease,
    color 0.16s ease;
}

.cv-variant:hover {
  background: color-mix(in srgb, currentColor 15%, transparent);
}

/* The document that is current, filled with the accent, like the dialog's own
   selector. Kept after :hover so it stays filled while the pointer is on it. */
.cv-variant.active {
  background: var(--acc);
  color: var(--on-acc);
}

/* The two options butt together: the corners they meet on are square, so the
   active fill joins the neighbour instead of reading as its own pill. */
.cv-variant:first-of-type {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}

.cv-variant:nth-of-type(2) {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}

/* Opens the dialog with the document the selector picked. It is the last cell of
   the selector rather than a button beside it: the two options pick, the glyph
   opens, so a tap on an option never surprises. */
.cv-open {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 7px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--fg);
  cursor: pointer;
  transition: color 0.16s ease;
}

/* A hairline, like the navbar's dividers, between the options and the glyph. */
.cv-sep {
  width: 1px;
  align-self: stretch;
  margin: 7px 0;
  background: var(--line);
  flex: 0 0 auto;
}

/* The same hairline, this time between the label and the whole control. */
.cv-divider {
  width: 1px;
  align-self: stretch;
  margin: 6px 0;
  background: var(--line);
  flex: 0 0 auto;
}

.cv-open:hover,
.cv-open:focus-visible {
  color: var(--acc-text);
}

/* The icon the owner drew, masked so it takes the button's colour and follows
   the theme. Same trick as the cursor's 360 glyph. */
.cv-open-icon {
  width: 16px;
  height: 16px;
  background: currentColor;
  -webkit-mask: url('/assets/img/file-icon.svg') center / contain no-repeat;
  mask: url('/assets/img/file-icon.svg') center / contain no-repeat;
  transition: transform 0.22s cubic-bezier(0.22, 1, 0.36, 1);
}

.cv-open:hover .cv-open-icon,
.cv-open:focus-visible .cv-open-icon {
  transform: scale(1.15) rotate(-8deg);
}

@media (prefers-reduced-motion: reduce) {
  .cv-open-icon {
    transition: none;
  }

  .cv-open:hover .cv-open-icon,
  .cv-open:focus-visible .cv-open-icon {
    transform: none;
  }
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

/* The CV panel tucks behind the photo: a rounded box the same width and radius,
   its top 18px hidden. The photo sits above it. */
.photo-card {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.photo-box {
  position: relative;
  z-index: 1;
}

.photo {
  display: block;
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: cover;
  /* Only the top is rounded: the photo's bottom meets the CV panel, which shares
     the frame, so any radius down here would let the panel show at the corners. */
  border-radius: 18px 18px 0 0;
  border: 1px solid var(--line);
  /* No global border-box (decision 6): without this the 1px frame adds 2px to
     the width and the photo ends a hair wider than the panel behind it. */
  box-sizing: border-box;
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
    The photo takes the full width. The badge stays where it is on a wide screen
    — above the photo's right corner — instead of dropping under it: down there it
    landed between the photo and the CV and read as a third item in the column
    rather than as part of the picture.
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
}
</style>
