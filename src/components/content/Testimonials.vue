<script setup>
/*
  What people say, between the Stack and Contact: one at a time.

  ONE testimonial is in the DOM — the current one — and changing swaps it with a
  vertical <Transition>. That is the whole point: the pager is not a scroll
  container and nothing is stacked, so there is no scroll to fight, no window to
  keep a fixed height, and no entry sliding past the one on show. Each quote is
  its own block and is created when it is needed.

  Navigation is the dots and a click on the card, which always goes forward and
  wraps from the last quote to the first. The page scrolls normally over the
  block: the pager never claims the gesture.

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
  A click on the card is always forward, and the last quote wraps to the first.
  The direction is set here and not derived, so the wrap still slides as "next"
  instead of snapping back the other way.
*/
function advance() {
  if (items.value.length < 2) return
  direction.value = 'next'
  index.value = (index.value + 1) % items.value.length
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
  A click anywhere on the card advances. Two things are not that click: the
  "read more" button (or any link), and a drag that selects the quote — so the
  pointer's travel is measured between down and up. The dots stay the control,
  and this adds nothing to the tab order.
*/
const press = { x: 0, y: 0 }

function onPressDown(event) {
  press.x = event.clientX
  press.y = event.clientY
}

function onCardClick(event) {
  if (event.target.closest('button, a')) return
  const travelled = Math.hypot(event.clientX - press.x, event.clientY - press.y)
  if (travelled > 8 || window.getSelection()?.toString()) return
  advance()
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
            aria-live="polite"
            @pointerdown="onPressDown"
            @click="onCardClick"
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
  overflow: hidden;
  padding: 0 clamp(18px, 2.6vw, 26px);
  transition: height 0.32s cubic-bezier(0.22, 1, 0.36, 1);
}

/* The one quote at a time, swapped vertically: the way it moves says whether you
   went forward or back. Forward carries the old quote up and brings the next one
   in from below; back does the opposite. out-in so the two never sit on top of
   each other. */
.quote-next-enter-active,
.quote-next-leave-active,
.quote-prev-enter-active,
.quote-prev-leave-active {
  transition:
    transform 0.3s cubic-bezier(0.22, 1, 0.36, 1),
    opacity 0.3s ease;
}

.quote-next-enter-from {
  transform: translateY(40px);
  opacity: 0;
}

.quote-next-leave-to {
  transform: translateY(-40px);
  opacity: 0;
}

.quote-prev-enter-from {
  transform: translateY(-40px);
  opacity: 0;
}

.quote-prev-leave-to {
  transform: translateY(40px);
  opacity: 0;
}

/*
  The position indicator: a vertical column of dots on the right of the box. The
  one you are on is a longer pill in the accent. Each dot is a 24px button with
  an 8px mark drawn inside it: the target clears the 24px WCAG 2.2 asks for
  without the mark itself growing.
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
  width: 24px;
  height: 24px;
  padding: 0;
  border: 0;
  background: none;
  cursor: pointer;
}

.dot::before {
  content: '';
  position: absolute;
  top: 8px;
  right: 8px;
  bottom: 8px;
  left: 8px;
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
  top: 4px;
  bottom: 4px;
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
