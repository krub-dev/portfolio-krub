<script setup>
/*
  The /experience — /education switch.

  Uses v-model, so the parent writes `v-model="tab"` and never thinks about
  events. That is what the `modelValue` prop plus the `update:modelValue`
  emit mean: Vue wires them together behind that one directive.

  role="tablist" + aria-selected tells a screen reader these are alternative
  views of the same region rather than three unrelated buttons.
*/
defineProps({
  options: { type: Array, required: true }, // [{ value, label }]
  modelValue: { type: String, required: true },
})

defineEmits(['update:modelValue'])
</script>

<template>
  <div class="tabs" role="tablist">
    <button
      v-for="option in options"
      :key="option.value"
      class="tab"
      :class="{ active: option.value === modelValue }"
      type="button"
      role="tab"
      :aria-selected="option.value === modelValue"
      @click="$emit('update:modelValue', option.value)"
    >
      {{ option.label }}
    </button>
  </div>
</template>

<style scoped>
.tabs {
  display: flex;
  flex-wrap: nowrap;
  gap: 8px;
  min-width: 0;
}

.tab {
  flex: 0 0 auto;
  border-radius: 999px;
  padding: 9px 16px;
  cursor: pointer;
  font-family: var(--font-mono);
  font-size: 12px;
  letter-spacing: 0.06em;
  background: transparent;
  color: var(--fg-2);
  border: 1px solid var(--line);
  transition:
    background-color 0.16s ease,
    border-color 0.16s ease,
    color 0.16s ease;
}

.tab:hover:not(.active) {
  color: var(--acc-text);
  border-color: var(--acc-text);
}

/* Active is a fill, so --acc stays put in both themes with --on-acc on top. */
.tab.active {
  background: var(--acc);
  color: var(--on-acc);
  border-color: var(--acc);
}

/*
  On a phone the three pills stack, one full-width row each. Three do not fit a
  phone's width — "/certificaciones" alone is wider than a third of it — and a
  sideways scroll left the third cut off at the edge, which read as broken rather
  than as something to swipe. Stacked, all three are visible and easy to tap.
*/
@media (max-width: 900px) {
  .tabs {
    flex-direction: column;
    align-items: stretch;
  }

  .tab {
    text-align: left;
  }
}
</style>
