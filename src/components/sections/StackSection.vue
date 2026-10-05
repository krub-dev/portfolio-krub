<script setup>
/*
  Section 02. Four groups of technology icons, straight from src/data/stack.js.
*/
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import SectionHeading from '../base/SectionHeading.vue'
import StackGroup from '../base/StackGroup.vue'
import { useSeason } from '../../composables/useSeason'
import { stack } from '../../data'

const { t } = useI18n()
const { season } = useSeason()

/*
  The groups as they show right now: seasonal tiles only while their season is on,
  and a group left empty dropped. With the season off this is the plain list. The
  count passed down is the reduced one, since the touch reveal divides the grid's
  travel between the groups actually on screen.
*/
const groups = computed(() =>
  stack
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => !item.season || item.season === season.value),
    }))
    .filter((group) => group.items.length > 0),
)
</script>

<template>
  <section id="stack" class="stack">
    <div class="head">
      <SectionHeading index="02" :title="t('section.stack')" />
      <!--
        On a phone the hero has no shutter to stick it to, so the seasonal
        sticker is pasted in the gap beside the heading instead. Desktop keeps it
        on the blind, where it belongs.
      -->
      <span v-if="season === 'halloween'" class="heading-sticker" aria-hidden="true" />
    </div>

    <div class="grid">
      <StackGroup
        v-for="(group, i) in groups"
        :key="group.labelKey"
        :label="t(group.labelKey)"
        :items="group.items"
        :index="i"
        :total="groups.length"
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

.head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

/* Only on a phone: on a desktop the sticker rides the shutter. Not tilted, so
   the spider on its thread hangs straight. */
.heading-sticker {
  display: none;
  flex: 0 0 auto;
  width: 78px;
  aspect-ratio: 586 / 515;
  background: url('/assets/img/themeHalloween/codeortreat-sticker.svg') center / contain no-repeat;
  pointer-events: none;
}

@media (max-width: 900px) {
  .grid {
    grid-template-columns: minmax(0, 1fr);
    gap: 32px;
  }

  .heading-sticker {
    display: block;
  }
}</style>
