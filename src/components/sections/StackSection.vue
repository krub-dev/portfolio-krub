<script setup>
/*
  Section 02. Four groups of technology icons, straight from src/data/stack.js.
*/
import { useI18n } from 'vue-i18n'

import SectionHeading from '../base/SectionHeading.vue'
import StackGroup from '../base/StackGroup.vue'
import { stack } from '../../data'

const { t } = useI18n()
</script>

<template>
  <section id="stack" class="stack">
    <SectionHeading index="02" :title="t('section.stack')" />

    <div class="grid">
      <StackGroup
        v-for="group in stack"
        :key="group.labelKey"
        :label="t(group.labelKey)"
        :items="group.items"
      />
    </div>
  </section>
</template>

<style scoped>
.stack {
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

/* Two columns, not four across. At this tile size four columns read as one
   continuous band of logos; two make each group a block you can take in. */
.grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 44px 40px;
}

@media (max-width: 900px) {
  .grid {
    grid-template-columns: minmax(0, 1fr);
    gap: 32px;
  }
}</style>
