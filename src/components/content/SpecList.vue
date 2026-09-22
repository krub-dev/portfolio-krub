<script setup>
/*
  The Role / Year / Stack column of the project modal.

  A <dl> rather than divs: these are term-and-definition pairs, and the markup
  should say so. Screen readers announce them as a list of properties instead
  of a run of loose text.
*/
import { useI18n } from 'vue-i18n'

defineProps({
  role: { type: String, required: true },
  year: { type: String, required: true },
  stack: { type: Array, default: () => [] },
})

const { t } = useI18n()
</script>

<template>
  <dl class="specs">
    <div class="block">
      <dt class="term">{{ t('modal.role') }}</dt>
      <dd class="value">{{ role }}</dd>
    </div>

    <div class="block">
      <dt class="term">{{ t('modal.year') }}</dt>
      <dd class="value">{{ year }}</dd>
    </div>

    <div class="block">
      <dt class="term">{{ t('modal.stack') }}</dt>
      <dd class="value chips">
        <span v-for="item in stack" :key="item" class="chip">{{ item }}</span>
      </dd>
    </div>
  </dl>
</template>

<style scoped>
.specs {
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 18px;
  font-family: var(--font-mono);
}

.block {
  border-top: 1px solid var(--line);
  padding-top: 12px;
}

.term {
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--fg-3);
}

.value {
  margin: 6px 0 0;
  font-size: 13px;
  color: var(--fg);
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.chip {
  font-size: 11px;
  border-radius: 8px;
  border: 1px solid var(--line);
  padding: 4px 8px;
  color: var(--fg-2);
}
</style>
