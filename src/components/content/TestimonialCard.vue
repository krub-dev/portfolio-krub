<script setup>
/*
  One testimonial, as the pager's content: the attribution and the quote.
  <figure>/<blockquote>/<figcaption> rather than divs, so the quote is marked up
  as a quote and the attribution is tied to it.

  No box of its own — the pager's window is the box and every entry slides
  through it. As a grid of boxes these read as a second set of projects, which is
  what decision 56 was about; one window is not a grid.

  The quote is clamped to four lines and a "read more" appears when there is more
  of it. That is what keeps the block a predictable size: the window is the same
  height for every quote that overflows the clamp, however long the quote is.
  Expanding one is the reader's choice, and the window grows with it.

  The measurement runs after the DOM has caught up, never inside the click
  handler: read there it happens before Vue has put the clamp back, so on the way
  closed the two heights are equal, the button decides there is nothing to
  reveal, and it never comes back.
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
  hasMore.value = expanded.value || el.scrollHeight > el.clientHeight + 1
}

function toggle() {
  expanded.value = !expanded.value
}

watch(expanded, measure, { flush: 'post' })

onMounted(() => {
  measure()
  // And again once the fonts have landed: a reflow changes what fits.
  document.fonts?.ready.then(measure)
  window.addEventListener('resize', measure, { passive: true })
})

onUnmounted(() => window.removeEventListener('resize', measure))
</script>

<template>
  <figure class="entry">
    <!--
      The attribution on two lines: the name over the project. Side by side they
      are two mono strings of different lengths fighting for one line, and on a
      phone the second one wraps under the first anyway.
    -->
    <figcaption class="who">
      <img v-if="avatar" :src="avatar" :alt="name" class="avatar" />
      <span v-else class="avatar" aria-hidden="true" />
      <span class="lines">
        <span class="name">{{ name }}</span>
        <span class="role">{{ role }}</span>
      </span>
    </figcaption>

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
  </figure>
</template>

<style scoped>
.entry {
  margin: 0;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 16px;
  /*
    At least the window's height, whatever this quote needs. The window is as
    tall as the tallest entry, so without this a short quote leaves its share of
    the window empty and the next entry shows through the gap.
  */
  min-height: var(--pane-h, 0);
  /* Vertical padding only: the pager's window is the box, and the entries are
     stacked inside it with no gap, so this is what separates one quote from the
     next as it slides past. */
  padding: 22px 0;
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
  -webkit-line-clamp: 4;
  line-clamp: 4;
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

.lines {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.avatar {
  width: 48px;
  height: 48px;
  flex: 0 0 auto;
  box-sizing: border-box;
  border-radius: 50%;
  /* contain, not cover: the one avatar here is a mark rather than a photograph,
     and cropping a logo cuts away the part that says who it is. Four pixels of
     padding and not six: the mark is a detailed drawing, and every pixel it
     gains is one it can be read at. */
  object-fit: contain;
  padding: 4px;
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
