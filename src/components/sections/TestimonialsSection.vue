<script setup>
/*
  Optional section. HomeView decides whether to render it at all, from
  config.showTestimonials — this component assumes it is wanted.

  No section number: the prototype leaves this one without an index, because
  the numbering runs 00-03 across the four permanent sections and testimonials
  can disappear without leaving a hole in the sequence.
*/
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import SectionHeading from '../base/SectionHeading.vue'
import TestimonialCard from '../content/TestimonialCard.vue'
import { useLang } from '../../composables/useLang'
import { testimonials } from '../../data'

const { lang } = useLang()
const { t } = useI18n()

const items = computed(() => testimonials.map((entry) => ({ ...entry, ...entry[lang.value] })))
</script>

<template>
  <section id="testimonials" class="testimonials">
    <SectionHeading :title="t('section.test')" />

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
  </section>
</template>

<style scoped>
.testimonials {
  position: relative;
  z-index: 1;
  padding: clamp(56px, 8vw, 110px) clamp(20px, 5vw, 64px);
  max-width: 1180px;
  margin: 0 auto;
  border-top: 1px solid var(--line);
  display: flex;
  flex-direction: column;
  gap: 34px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}
</style>
