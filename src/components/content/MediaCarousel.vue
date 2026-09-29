<script setup>
/*
  The image strip at the top of the project modal.

  It owns its own index — the modal does not care which slide is showing, only
  which project is open.

  The slides are a horizontal track moved by `transform`, the way the projects
  rail moves: every screenshot sits side by side at 100% of the box and the index
  picks which one is framed, so a change slides rather than swapping in a frame.
  With no `images` each slide is the striped frame and a `slides` count stands in
  for the screenshots that are coming.

  The dots are the rail's and the testimonials' indicator, laid on its side: a
  24px target each with an 8px mark inside (the WCAG 2.2 minimum), the current one
  a longer pill in the accent. That is why the arrows and the `IMAGE n / total`
  label are gone.
*/
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  images: { type: Array, default: () => [] }, // real screenshots, in order
  slides: { type: Number, default: 1 }, // placeholder count when there are none
  slug: { type: String, required: true },
  name: { type: String, default: '' },
  shotLabel: { type: String, default: '' }, // the striped frame's caption
})

const { t } = useI18n()
const index = ref(0)

// Back to the first image whenever a different project opens.
watch(() => props.slug, () => (index.value = 0))

const total = computed(() => props.images.length || props.slides)

const trackStyle = computed(() => ({ transform: `translate3d(-${index.value * 100}%, 0, 0)` }))
</script>

<template>
  <div class="media">
    <div class="carousel">
      <div class="track" :style="trackStyle">
        <div v-for="n in total" :key="n" class="slide">
          <img v-if="images.length" class="image" :src="images[n - 1]" :alt="name" />
          <span v-else class="shot-label">{{ shotLabel }}</span>
        </div>
      </div>
    </div>

    <div v-if="total > 1" class="dots" role="group" :aria-label="t('a11y.projectImages')">
      <button
        v-for="n in total"
        :key="n"
        class="dot"
        :class="{ active: n - 1 === index }"
        type="button"
        :aria-label="t('a11y.goToImage', { n })"
        :aria-current="n - 1 === index ? 'true' : undefined"
        @click="index = n - 1"
      />
    </div>
  </div>
</template>

<style scoped>
.media {
  display: flex;
  flex-direction: column;
  /* The panel is a column that scrolls; the media keeps its measured height and
     lets the body be the part that scrolls. */
  flex: 0 0 auto;
}

.carousel {
  /* width, explicitly. As a flex item with only an aspect-ratio and a
     max-height, the width was derived FROM the height — it left the right of the
     row empty. The aspect-ratio now only decides the height on narrow screens. */
  width: 100%;
  /*
    16/10 matches the card's own frame, and a 56svh ceiling keeps it off the roof
    on a laptop. It was 16/9 × 40svh, which read as a letterbox.
  */
  aspect-ratio: 16 / 10;
  max-height: 56svh;
  flex: 0 0 auto;
  display: flex;
  overflow: hidden;
  background: var(--ink);
}

/* The travel: the same arrive-and-settle curve the pagers use, so the slide
   lands with the pill rather than after it. */
.track {
  display: flex;
  flex: 1 1 auto;
  min-width: 0;
  transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}

.slide {
  position: relative;
  flex: 0 0 100%;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  /* Wider stripes than the project card's, so the two placeholders read as
     related but not identical. */
  background: repeating-linear-gradient(
    135deg,
    var(--surface-2) 0 14px,
    var(--ink) 14px 28px
  );
}

/* Fills the slide, which is the box the aspect-ratio and the track settle. */
.image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top;
  display: block;
}

.shot-label {
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.12em;
  color: var(--fg-3);
}

/*
  The rail's indicator, horizontal: a 24px target with an 8px mark inside it
  (WCAG 2.2 asks for 24px), and the active one a longer pill in the accent. It
  sits under the media on the panel, not over the shot, so the marks are read
  against the panel rather than against whatever the screenshot happens to show.
*/
.dots {
  display: flex;
  justify-content: center;
  gap: 2px;
  padding: 10px 0;
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
  bottom: 8px;
  left: 8px;
  right: 8px;
  border-radius: 999px;
  background: var(--fg-3);
  transition:
    left 0.4s cubic-bezier(0.22, 1, 0.36, 1),
    right 0.4s cubic-bezier(0.22, 1, 0.36, 1),
    background-color 0.3s ease;
}

.dot:hover::before {
  background: var(--fg-2);
}

/* A fill, so the brand yellow is right in both themes. */
.dot.active::before {
  left: 4px;
  right: 4px;
  background: var(--acc);
}

@media (prefers-reduced-motion: reduce) {
  .track,
  .dot::before {
    transition: none;
  }
}
</style>
