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
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 32px;
}
</style>
