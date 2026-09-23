<script setup>
/*
  What people say, between the Stack and Contact: one at a time.

  ONE testimonial is in the DOM — the current one — and changing swaps it with a
  vertical <Transition>. That is the whole point: the pager is not a scroll
  container and nothing is stacked, so there is no scroll to fight, no window to
  keep a fixed height, and no entry sliding past the one on show. Each quote is
  its own block and is created when it is needed.

  Navigation is the dots and a vertical swipe on the card. The page scrolls
  normally over the block: the pager never claims the gesture.

  config.showTestimonials is checked by HomeView, not here: the page decides
  whether the block exists at all.
*/
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import TestimonialCard from './TestimonialCard.vue'
import { useLang } from '../../composables/useLang'
import { testimonials } from '../../data'

const { lang } = useLang()
const { t } = useI18n()

const items = computed(() => testimonials.map((entry) => ({ ...entry, ...entry[lang.value] })))

const index = ref(0)
const open = ref(false)
const direction = ref('next')

const current = computed(() => items.value[index.value])

function goTo(wanted) {
  const next = Math.min(Math.max(wanted, 0), items.value.length - 1)
  if (next === index.value) return
  direction.value = next > index.value ? 'next' : 'prev'
  index.value = next
  open.value = false
}

/*
  The box is as tall as the quote on show, and it eases from one height to the
  next. Left to itself the pane's height is its content, so swapping the card
  changed it in a single frame — the text slid but the box jumped.
*/
const pane = ref(null)
let observer = null

function fit() {
  const el = pane.value
  const card = el?.firstElementChild
  if (!el || !card) return
  el.style.height = `${card.getBoundingClientRect().height}px`
}

/*
  The height is measured when the new card is IN, not on nextTick: with
  mode="out-in" the old card is still leaving at that point and the new one is not
  mounted yet. And the observer watches the card itself, because its height also
  changes after it lands — the fonts swap, the clamp resolves — which a single
  measurement missed and left the box too short.
*/
function watchCard() {
  observer?.disconnect()
  const card = pane.value?.firstElementChild
  if (card) observer?.observe(card)
  fit()
}

watch(open, () => nextTick(fit))

onMounted(() => {
  observer = new ResizeObserver(fit)
  watchCard()
  document.fonts?.ready.then(fit)
})

onUnmounted(() => observer?.disconnect())

/*
  Desktop: the wheel pages it. It only takes the gesture while there is somewhere
  to go — at either end the page keeps the scroll — and a short lock stops one
  flick running through several quotes. While a quote is open and taller than the
  box, the wheel is left to scroll that quote instead.
*/
let wheelLock = 0

function onWheel(event) {
  const el = pane.value
  if (open.value && el && el.scrollHeight > el.clientHeight + 1) return
  if (Math.abs(event.deltaY) < 4) return
  const next = index.value + (event.deltaY > 0 ? 1 : -1)
  if (next < 0 || next >= items.value.length) return

  event.preventDefault()
  const now = performance.now()
  if (now - wheelLock < 480) return
  wheelLock = now
  goTo(next)
}

/*
  Touch: a vertical swipe pages it, and the page keeps its own scroll. The swipe
  is read on touchend without cancelling anything — the pager is not a scroll
  container, so there is nothing to claim — and it only fires when the gesture is
  clearly vertical and long enough, which leaves a normal scroll alone.
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
  if (Math.abs(dy) < 56 || Math.abs(dy) < Math.abs(dx) * 1.4) return
  goTo(index.value + (dy < 0 ? 1 : -1))
}
</script>

<template>
  <div class="testimonials">
    <div class="pager">
      <div class="box">
        <span class="mark" aria-hidden="true">”</span>

        <div class="head">
          <p class="label">{{ t('section.test') }}</p>
          <span class="position">{{ index + 1 }} / {{ items.length }}</span>
        </div>

        <div class="body">
          <div
            ref="pane"
            class="pane"
            @touchstart.passive="onTouchStart"
            @touchend.passive="onTouchEnd"
            @wheel="onWheel"
          >
            <Transition :name="`quote-${direction}`" mode="out-in" @after-enter="watchCard">
              <TestimonialCard
                :key="index"
                :quote="current.quote"
                :name="current.name"
                :role="current.role"
                :avatar="current.avatar"
                :open="open"
                @toggle="open = !open"
              />
            </Transition>
          </div>

          <div class="dots" role="group" :aria-label="t('section.test')">
            <button
              v-for="(item, i) in items"
              :key="i"
              class="dot"
              :class="{ active: i === index }"
              type="button"
              :aria-label="t('a11y.goToTestimonial', { n: i + 1 })"
              :aria-current="i === index ? 'true' : undefined"
              @click="goTo(i)"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/*
  The block sits between the Stack and Contact, so it carries the page gutter and
  the 1180px cap every section uses. The top margin is on top of the Stack's own
  bottom padding, and the bottom margin keeps the card off Contact's separator.
*/
.testimonials {
  max-width: 1180px;
  margin: clamp(28px, 4vw, 56px) auto clamp(56px, 8vw, 110px);
  padding: 0 var(--gutter-r) 0 var(--gutter-l);
}

.pager {
  display: flex;
  align-items: center;
}

.box {
  position: relative;
  flex: 1;
  min-width: 0;
  border: 1px solid var(--line);
  border-radius: 18px;
  background: var(--surface);
  overflow: hidden;
}

/*
  A quote mark in the accent, large and faint, in the window's top right. It
  belongs to the box and not to a quote, so it stays put while they swap.
  --acc and not --acc-text: this is a fill, not text.
*/
.mark {
  position: absolute;
  top: 50px;
  right: 16px;
  font-family: var(--font-sans);
  font-size: clamp(76px, 8vw, 104px);
  font-weight: 700;
  line-height: 1;
  color: var(--acc);
  opacity: 0.08;
  pointer-events: none;
  user-select: none;
}

/*
  The block's own header: the mono label and the position, as a filled band —
  the marquee's and the contact band's own treatment. It is the box's top edge,
  so the block opens with the accent instead of with a line.
*/
.head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  padding: 14px clamp(18px, 2.6vw, 26px);
  background: var(--acc);
  color: var(--on-acc);
}

.label {
  margin: 0;
  font-family: var(--font-mono);
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.position {
  font-family: var(--font-mono);
  font-size: 11px;
  opacity: 0.62;
  white-space: nowrap;
}

/* The window and the dots side by side, so the dots centre on the window and
   not on the whole box — which includes the header band. */
.body {
  display: flex;
  align-items: center;
}

/*
  The window is as tall as the quote on show and eases between heights. overflow
  clips the sideways swap; the height transition is what stops the box jumping
  when a longer or shorter quote comes in.
*/
.pane {
  flex: 1;
  min-width: 0;
  /* overflow-x hidden clips the sideways swap; overflow-y auto lets an open quote
     taller than the box be scrolled, which the wheel hands over to it. */
  overflow-x: hidden;
  overflow-y: auto;
  scrollbar-width: none;
  padding: 0 clamp(18px, 2.6vw, 26px);
  transition: height 0.32s cubic-bezier(0.22, 1, 0.36, 1);
}

.pane::-webkit-scrollbar {
  display: none;
}

/* The one quote at a time, swapped sideways: the way it moves says whether you
   went forward or back. out-in so the two never sit on top of each other. */
.quote-next-enter-active,
.quote-next-leave-active,
.quote-prev-enter-active,
.quote-prev-leave-active {
  transition:
    transform 0.3s cubic-bezier(0.22, 1, 0.36, 1),
    opacity 0.3s ease;
}

.quote-next-enter-from {
  transform: translateX(40px);
  opacity: 0;
}

.quote-next-leave-to {
  transform: translateX(-40px);
  opacity: 0;
}

.quote-prev-enter-from {
  transform: translateX(-40px);
  opacity: 0;
}

.quote-prev-leave-to {
  transform: translateX(40px);
  opacity: 0;
}

/*
  The position indicator: a vertical column of dots on the right of the box. The
  one you are on is a longer pill in the accent. Each dot is a 20px button with
  an 8px mark drawn inside it, so it stays tappable on a phone.
*/
.dots {
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-right: 6px;
}

.dot {
  position: relative;
  width: 20px;
  height: 20px;
  padding: 0;
  border: 0;
  background: none;
  cursor: pointer;
}

.dot::before {
  content: '';
  position: absolute;
  top: 6px;
  right: 6px;
  bottom: 6px;
  left: 6px;
  border-radius: 999px;
  background: var(--fg-3);
  transition:
    top 0.4s cubic-bezier(0.22, 1, 0.36, 1),
    bottom 0.4s cubic-bezier(0.22, 1, 0.36, 1),
    background-color 0.3s ease;
}

.dot:hover::before {
  background: var(--fg-2);
}

.dot.active::before {
  top: 2px;
  bottom: 2px;
  background: var(--acc);
}

@media (max-width: 900px) {
  /*
    The mark drops and moves right on a phone, and grows. In a window this
    narrow it lands behind the quote instead of behind the name, which is where
    a watermark belongs.
  */
  .mark {
    top: 52px;
    right: 6px;
    font-size: 112px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .pane,
  .quote-next-enter-active,
  .quote-next-leave-active,
  .quote-prev-enter-active,
  .quote-prev-leave-active {
    transition: none;
  }

  .dot::before {
    transition: none;
  }
}
</style>
