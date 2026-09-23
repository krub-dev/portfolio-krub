<script setup>
/*
  What people say, between the Stack and Contact: one at a time, in a pager.

  The pager is a native scroll container with snap, not a transform rail. That is
  what makes the scroll behave like scroll: the wheel and the finger move it, and
  at either end the page takes over on its own — overscroll chaining — instead of
  the block swallowing the gesture. A custom transform drag could follow the
  finger, but it had to claim the touch (touch-action: none), and then the page
  stopped dead at the first and last quote.

  The window is a fixed height — the tallest quote — so the block does not jump
  as you page, and every entry is padded up to it (`--pane-h`) so a short quote
  cannot let the next one show through the gap. Opening a quote grows the window.

  The box carries its own header — the mono label and the position — because the
  label floating above an empty box said nothing about what the box was. Inside,
  with a rule under it, it is the same header the stack groups and the contact
  rows use.

  config.showTestimonials is checked by HomeView, not here: the page decides
  whether the block exists at all.
*/
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import TestimonialCard from './TestimonialCard.vue'
import { useLang } from '../../composables/useLang'
import { testimonials } from '../../data'

const { lang } = useLang()
const { t } = useI18n()

const items = computed(() => testimonials.map((entry) => ({ ...entry, ...entry[lang.value] })))

const pane = ref(null)
const index = ref(0)
const open = ref(-1)
const hidden = ref([])

let heights = []

/*
  Which quote is showing is read from the scroll position, so the dots and the
  counter follow a wheel or a swipe without anything having to drive them.
*/
function syncIndex() {
  const el = pane.value
  if (!el) return
  const entries = Array.from(el.children)
  let best = 0
  for (let i = 1; i < entries.length; i += 1) {
    if (entries[i].offsetTop <= el.scrollTop + 4) best = i
  }
  index.value = best
  hidden.value = entries.map((_, i) => i !== best)
}

/*
  The window is the tallest entry, and the entries are padded to the tallest of
  the ones that are NOT open: an open quote is taller than its clamped self, and
  feeding that back in raised the floor of every entry, which is why collapsing
  used to leave the block at the expanded size.
*/
function measure() {
  const el = pane.value
  if (!el) return
  const entries = Array.from(el.children)
  heights = entries.map((entry) => entry.getBoundingClientRect().height)

  const rest = heights.filter((_, i) => i !== open.value)
  const floor = rest.length ? Math.max(...rest) : Math.max(...heights)
  el.style.setProperty('--pane-h', `${floor}px`)
  el.style.height = `${Math.max(...heights)}px`
  syncIndex()
}

function onScroll() {
  syncIndex()
}

function goTo(wanted) {
  const el = pane.value
  if (!el) return
  const entries = Array.from(el.children)
  const next = Math.min(Math.max(wanted, 0), entries.length - 1)
  if (open.value !== -1 && open.value !== next) open.value = -1
  el.scrollTo({ top: entries[next].offsetTop, behavior: 'smooth' })
}

function toggle(i) {
  open.value = open.value === i ? -1 : i
  nextTick(measure)
}

onMounted(() => {
  measure()
  // And again once the fonts have landed: a reflow changes what fits.
  document.fonts?.ready.then(measure)
  window.addEventListener('resize', measure, { passive: true })
})

onUnmounted(() => window.removeEventListener('resize', measure))
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
          <div ref="pane" class="pane" @scroll.passive="onScroll">
            <TestimonialCard
              v-for="(item, i) in items"
              :key="i"
              :quote="item.quote"
              :name="item.name"
              :role="item.role"
              :avatar="item.avatar"
              :open="open === i"
              :inert="hidden[i] || undefined"
              @toggle="toggle(i)"
            />
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
  belongs to the box and not to an entry, so it stays put while the quotes move
  through it. --acc and not --acc-text: this is a fill, not text.
*/
.mark {
  position: absolute;
  /* Below the header's rule, not across it: the counter lives up there, and the
     two glyphs on top of each other read as a mistake rather than as a mark. */
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
  The block's own header, inside the box: the mono label and the position, as a
  filled band — the marquee's and the contact band's own treatment. It is the
  box's top edge, so the block opens with the accent instead of with a line.
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
  The window. A native scroll container with vertical snap: the wheel and the
  finger move it and it settles on a quote by itself. The mask turns the arrival
  and departure into a fade, and it is invisible at rest because the entries
  carry their own vertical padding. overflow-y: auto and touch-action: auto are
  the whole point — at either end the gesture chains to the page.
*/
.pane {
  position: relative;
  flex: 1;
  min-width: 0;
  overflow-y: auto;
  scroll-snap-type: y mandatory;
  scrollbar-width: none;
  padding: 0 clamp(18px, 2.6vw, 26px);
  -webkit-mask-image: linear-gradient(
    to bottom,
    transparent 0,
    #000 18px,
    #000 calc(100% - 18px),
    transparent 100%
  );
  mask-image: linear-gradient(
    to bottom,
    transparent 0,
    #000 18px,
    #000 calc(100% - 18px),
    transparent 100%
  );
  transition: height 0.5s cubic-bezier(0.22, 1, 0.36, 1);
}

.pane::-webkit-scrollbar {
  display: none;
}

.pane :deep(.entry) {
  scroll-snap-align: start;
  scroll-snap-stop: always;
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
  .pane {
    transition: none;
    scroll-behavior: auto;
  }

  .dot::before {
    transition: none;
  }
}
</style>
