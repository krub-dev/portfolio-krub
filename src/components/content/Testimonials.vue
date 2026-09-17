<script setup>
/*
  What people say, at the end of the Projects grid.

  It used to be a section of its own, with an id and a heading and no number,
  which read as an orphan: the numbering runs 00–03 across the four permanent
  sections, and this one can disappear without leaving a hole. It belongs beside
  the work it is about, so it lives inside Projects and carries a mono label
  instead of a heading. See docs/decisions.md 56.

  config.showTestimonials is checked by ProjectsSection, not here: the parent
  decides whether the block exists at all.
*/
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import TestimonialCard from './TestimonialCard.vue'
import { useLang } from '../../composables/useLang'
import { testimonials } from '../../data'

const { lang } = useLang()
const { t } = useI18n()

const items = computed(() => testimonials.map((entry) => ({ ...entry, ...entry[lang.value] })))
</script>

<template>
  <div class="testimonials">
    <p class="label">{{ t('section.test') }}</p>

    <div class="grid">
      <TestimonialCard
        v-for="(item, i) in items"
        :key="i"
        :quote="item.quote"
        :name="item.name"
        :role="item.role"
        :avatar="item.avatar"
      />
    </div>
  </div>
</template>

<style scoped>
.testimonials {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

/* The same mono label the contact rows use, not a section heading: this is a
   block inside a section, not a destination. */
.label {
  margin: 0;
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--fg-3);
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}
</style>
