<script setup>
/*
  Section 01. The card grid auto-fits, so the layout follows however many
  projects exist — no filler cards, no reserved gaps. Add an entry to
  src/data/projects.js and a card appears.

  The testimonials sit at the end of the grid: they are about this work, and
  they are a block rather than a section, so they add no destination and no
  number. See docs/decisions.md 56.
*/
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import SectionHeading from '../base/SectionHeading.vue'
import ProjectCard from '../content/ProjectCard.vue'
import Testimonials from '../content/Testimonials.vue'
import { useLang } from '../../composables/useLang'
import { config, projects } from '../../data'

const { lang } = useLang()
const { t } = useI18n()

defineEmits(['open'])

const items = computed(() =>
  projects.map((project) => ({ ...project, ...project[lang.value] })),
)
</script>

<template>
  <section id="projects" class="projects">
    <SectionHeading index="01" :title="t('section.projects')" :count="items.length" />

    <div class="grid">
      <ProjectCard
        v-for="(project, i) in items"
        :key="project.slug"
        :name="project.name"
        :tag="project.tag"
        :summary="project.summary"
        :shot-label="project.shotLabel"
        :image="project.image"
        :stack="project.stack"
        @open="$emit('open', i)"
      />
    </div>

    <Testimonials v-if="config.showTestimonials" />
  </section>
</template>

<style scoped>
.projects {
  position: relative;
  z-index: 1;
  padding: clamp(56px, 8vw, 110px) var(--gutter-r) clamp(56px, 8vw, 110px) var(--gutter-l);
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
