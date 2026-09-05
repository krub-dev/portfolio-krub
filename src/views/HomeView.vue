<script setup>
/*
  The page. Sections top to bottom, in the order the design spec lists them.

  Step 6 is layout only — no scroll behaviour, no navbar, no footer, no cursor.
  Those arrive in steps 7 to 9.

  The hero and the marquee share a wrapper that is exactly one viewport tall:
  the hero flexes to fill it and the marquee sits flush at the bottom, so the
  band lands right at the fold. Below 700px of viewport height that would
  squash the hero, so the wrapper switches to auto height and the marquee just
  follows the content.
*/
import { computed, ref } from 'vue'

import ProjectModal from '../components/content/ProjectModal.vue'
import AboutSection from '../components/sections/AboutSection.vue'
import ContactSection from '../components/sections/ContactSection.vue'
import HeroSection from '../components/sections/HeroSection.vue'
import MarqueeBar from '../components/sections/MarqueeBar.vue'
import ProjectsSection from '../components/sections/ProjectsSection.vue'
import StackSection from '../components/sections/StackSection.vue'
import TestimonialsSection from '../components/sections/TestimonialsSection.vue'
import { useLang } from '../composables/useLang'
import { config, copy, projects } from '../data'

const { lang } = useLang()
const marqueeItems = computed(() => copy.marquee[lang.value])

/*
  Which project the modal is showing. The index lives here rather than in
  ProjectsSection because the modal is a sibling of it, not a child: it renders
  over the whole page, so the page is what owns the state.

  null means closed — one value carries both "is it open" and "which one",
  so the two can never disagree.
*/
const openIndex = ref(null)
const openProject = computed(() => (openIndex.value === null ? null : projects[openIndex.value]))
</script>

<template>
  <main>
    <div class="hero-wrap" data-hero-wrap>
      <HeroSection />
      <MarqueeBar :items="marqueeItems" />
    </div>

    <AboutSection />
    <ProjectsSection @open="openIndex = $event" />
    <StackSection />
    <TestimonialsSection v-if="config.showTestimonials" />
    <ContactSection />

    <ProjectModal
      :project="openProject"
      :index="openIndex ?? 0"
      @close="openIndex = null"
    />
  </main>
</template>

<style scoped>
.hero-wrap {
  position: relative;
  z-index: 1;
  height: 100svh;
  min-height: 640px;
  display: flex;
  flex-direction: column;
}

/*
  Two escapes from the fixed viewport height, and both are needed.

  The prototype only had the short-viewport one, which hid a bug: below 900px
  the hero grid collapses to a single column, so the stage stacks under the
  text and the section needs roughly twice the height. Forcing that into one
  viewport clipped the logo behind the marquee — 35px of overflow at 375x812.

  It went unnoticed because a real phone with browser chrome often reports a
  viewport under 700px tall, which fired the height rule and papered over it.
  Emulators, and phones with taller viewports, do not.

  Width is the honest trigger: the single-column layout is what needs the room.
*/
@media (max-width: 900px), (max-height: 700px) {
  .hero-wrap {
    height: auto;
    min-height: 100svh;
  }
}
</style>
