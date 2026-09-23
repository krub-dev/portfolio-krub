<script setup>
/*
  The image strip at the top of the project modal.

  It owns its own index — the modal does not care which slide is showing, only
  which project is open. The index wraps in both directions with a modulo, so
  the arrows never dead-end; `(i + n) % n` rather than plain `%` because
  JavaScript's modulo keeps the sign and -1 % 4 is -1, not 3.

  With `images` it shows the real screenshots; without them it falls back to the
  striped frame and a `slides` count, which is still what the projects without
  screenshots use.
*/
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import { wrapIndex } from '../../utils/format'

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

const label = computed(
  () => `${t('modal.image')} ${index.value + 1} / ${total.value} · ${props.slug.toUpperCase()}`,
)

function go(step) {
  index.value = wrapIndex(index.value, step, total.value)
}
</script>

<template>
  <div class="carousel" :class="{ shot: images.length }">
    <img v-if="images.length" class="image" :src="images[index]" :alt="name" />

    <span class="label">{{ label }}</span>

    <button class="arrow left" type="button" :aria-label="t('a11y.prevImage')" @click="go(-1)">
      ←
    </button>
    <button class="arrow right" type="button" :aria-label="t('a11y.nextImage')" @click="go(1)">
      →
    </button>

    <div class="dots" aria-hidden="true">
      <span v-for="n in total" :key="n" class="dot" :class="{ on: n - 1 === index }" />
    </div>
  </div>
</template>

<style scoped>
.carousel {
  position: relative;
  /* width, explicitly. As a flex item with only an aspect-ratio and a
     max-height, the width was derived FROM the height — 40svh tall meant 40svh
     × 16/9 wide, about 600px in a 1000px panel, with the rest of the row left
     empty. The aspect-ratio now only decides the height on narrow screens,
     where 100% × 9/16 is under the cap. */
  width: 100%;
  aspect-ratio: 16 / 9;
  max-height: 40svh;
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

.label {
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.14em;
  color: var(--fg-3);
}

/* With real screenshots the stripes go, and the label sits over the image on a
   small dark chip so it stays readable whatever the shot looks like. */
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

.carousel.shot .label {
  position: absolute;
  top: 12px;
  left: 12px;
  padding: 4px 8px;
  border-radius: 6px;
  background: color-mix(in srgb, var(--ink) 70%, transparent);
  color: var(--fg-2);
}

.arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: color-mix(in srgb, var(--ink) 70%, transparent);
  border: 1px solid var(--line);
  color: var(--fg);
  cursor: pointer;
  font-size: 16px;
  transition:
    background-color 0.16s ease,
    border-color 0.16s ease,
    color 0.16s ease;
}

.left {
  left: 14px;
}

.right {
  right: 14px;
}

.arrow:hover {
  border-color: var(--acc-text);
  color: var(--acc-text);
}

.dots {
  position: absolute;
  bottom: 14px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 7px;
}

.dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--line);
}

/* A fill, so the brand yellow is right in both themes. */
.dot.on {
  background: var(--acc);
}
</style>
