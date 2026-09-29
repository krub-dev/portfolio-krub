<script setup>
/*
  The image strip at the top of the project modal.

  It owns its own index — the modal does not care which slide is showing, only
  which project is open.

  With `images` it shows the real screenshots; without them it falls back to the
  striped frame and a `slides` count, which is still what the projects without
  screenshots use.

  Paging is the dots, the way the rail and the testimonials page: real buttons,
  a 24px target each with an 8px mark drawn inside (the WCAG 2.2 minimum the
  other pagers use), so the ← → arrows and the `IMAGE n / total · SLUG` label
  that used to sit over the shot are gone. The dots are only there when there is
  more than one slide to choose from.
*/
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  images: { type: Array, default: () => [] }, // real screenshots, in order
  slides: { type: Number, default: 1 }, // placeholder count when there are none
  slug: { type: String, required: true },
  name: { type: String, default: '' },
})

const { t } = useI18n()
const index = ref(0)

// Back to the first image whenever a different project opens.
watch(() => props.slug, () => (index.value = 0))

const total = computed(() => props.images.length || props.slides)
</script>

<template>
  <div class="carousel" :class="{ shot: images.length }">
    <img v-if="images.length" class="image" :src="images[index]" :alt="name" />

    <div v-if="total > 1" class="dots" role="group" :aria-label="t('a11y.projectImages')">
      <button
        v-for="n in total"
        :key="n"
        class="dot"
        :class="{ on: n - 1 === index }"
        type="button"
        :aria-label="t('a11y.goToImage', { n })"
        :aria-current="n - 1 === index ? 'true' : undefined"
        @click="index = n - 1"
      />
    </div>
  </div>
</template>

<style scoped>
.carousel {
  position: relative;
  /* width, explicitly. As a flex item with only an aspect-ratio and a
     max-height, the width was derived FROM the height — it left the right of the
     row empty. The aspect-ratio now only decides the height on narrow screens,
     where 100% × 10/16 is under the cap. */
  width: 100%;
  /*
    Taller than the 16/9 × 40svh it was: at that size the strip read as a
    letterbox and `object-fit: cover` cropped most of every screenshot away. 16/10
    with a 56svh ceiling gives the shot room without taking over the panel.
  */
  aspect-ratio: 16 / 10;
  max-height: 56svh;
  flex: 0 0 auto;
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

/* With real screenshots the stripes go. */
.carousel.shot {
  background: var(--ink);
}

.image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top;
  display: block;
}

/*
  Over the shot, so the dots need a ground of their own: the marks are the
  metal-grey of the page in `--fg-3` on a chip of `--ink`, which keeps them
  readable whatever the screenshot looks like, and the same in both themes.
*/
.dots {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 2px;
  padding: 3px 6px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--ink) 62%, transparent);
}

/* 24px target with the mark drawn inside: the target can be tapped without the
   mark having to be 24px across, the rule the other pagers follow. */
.dot {
  position: relative;
  width: 24px;
  height: 24px;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
}

.dot::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 8px;
  height: 8px;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  background: var(--fg-3);
  transition: background-color 0.16s ease;
}

.dot:hover::before {
  background: var(--fg-2);
}

/* A fill, so the brand yellow is right in both themes. */
.dot.on::before {
  background: var(--acc);
}

@media (prefers-reduced-motion: reduce) {
  .dot::before {
    transition: none;
  }
}
</style>
