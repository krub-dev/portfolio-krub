<script setup>
/*
  One testimonial. <figure>/<blockquote>/<figcaption> rather than divs, so the
  quote is marked up as a quote and the attribution is tied to it.

  No card. As a box with a border it read as another grid of projects sitting
  under the projects — the same shape twice, saying different things. The site
  already has a way of listing things that are not cards: text, a mono label and
  a rule between entries, which is what the timeline in About and the contact
  rows do. See docs/decisions.md 56.

  A long quote is clamped to three lines with a "read more" under it. The button
  only exists when there is something to reveal — measured, not assumed, because
  a quote that already fits would get a control that does nothing. Two things
  about that measurement: it is re-run once the fonts have loaded, since a
  reflow changes what fits, and once open it stays open through a resize,
  because with the clamp off the measurement would always say it fits and the
  button would disappear under the reader.
*/
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

defineProps({
  quote: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, required: true },
  avatar: { type: String, default: null },
})

const { t } = useI18n()

const quoteEl = ref(null)
const expanded = ref(false)
const hasMore = ref(false)

function measure() {
  const el = quoteEl.value
  if (!el) return
  /*
    The clamp is on by default, and that is what makes this measurable: the box
    shows three lines while reporting the height of all of them, and the gap
    between the two is the whole test. Asking for the clamp only when there is
    something to hide is the other way round, and it never fires.
  */
  hasMore.value = expanded.value || el.scrollHeight > el.clientHeight + 1
}

function toggle() {
  expanded.value = !expanded.value
}

/*
  Measured once the DOM has caught up, never inside the click handler. Reading
  the box there happens before Vue has put the class back, so on the way closed
  the two heights are equal, the button decides there is nothing to reveal and
  never comes back — which is exactly what it did.
*/
watch(expanded, measure, { flush: 'post' })

onMounted(() => {
  measure()
  document.fonts?.ready.then(measure)
  window.addEventListener('resize', measure, { passive: true })
})

onUnmounted(() => window.removeEventListener('resize', measure))
</script>

<template>
  <figure class="entry">
    <blockquote ref="quoteEl" class="quote" :class="{ clamped: !expanded }">
      {{ quote }}
    </blockquote>

    <button
      v-if="hasMore"
      class="more"
      type="button"
      :aria-expanded="expanded"
      @click="toggle"
    >
      {{ expanded ? t('actions.readLess') : t('actions.readMore') }}
    </button>

    <figcaption class="who">
      <img v-if="avatar" :src="avatar" :alt="name" class="avatar" />
      <span v-else class="avatar" aria-hidden="true" />
      <span class="name">{{ name }}</span>
      <span class="role">{{ role }}</span>
    </figcaption>
  </figure>
</template>

<style scoped>
.entry {
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: clamp(20px, 3vw, 28px) 0;
  border-bottom: 1px solid var(--line);
}

.quote {
  margin: 0;
  max-width: 62ch;
  font-size: clamp(18px, 2vw, 23px);
  line-height: 1.5;
  letter-spacing: -0.01em;
  color: var(--fg);
  text-wrap: pretty;
}

.quote.clamped {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  overflow: hidden;
}

/* A real button, styled as the inline action it is: the accent and an underline
   are the affordance, because nothing else on the site is one of these. It sits
   on the right, under the end of the quote it belongs to. */
.more {
  align-self: flex-end;
  padding: 0;
  border: 0;
  background: none;
  font-family: var(--font-mono);
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--acc-text);
  text-decoration: underline;
  text-underline-offset: 3px;
  cursor: pointer;
}

.who {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  width: 40px;
  height: 40px;
  flex: 0 0 auto;
  box-sizing: border-box;
  border-radius: 50%;
  /* contain, not cover: the one avatar here is a mark rather than a photograph,
     and cropping a logo cuts away the part that says who it is. */
  object-fit: contain;
  padding: 6px;
  background: var(--surface-2);
  border: 1px solid var(--line);
}

/* The same mono the site uses for every other piece of metadata, a step larger
   than the 10–11px labels: this one is read, not scanned. */
.name {
  font-family: var(--font-mono);
  font-size: 13px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--fg-2);
}

.role {
  font-family: var(--font-mono);
  font-size: 13px;
  color: var(--fg-3);
}
</style>
