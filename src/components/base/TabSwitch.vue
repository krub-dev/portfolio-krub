<script setup>
/*
  The /me switch: /experience, /education, /certifications.

  Uses v-model, so the parent writes `v-model="tab"` and never thinks about
  events. That is what the `modelValue` prop plus the `update:modelValue`
  emit mean: Vue wires them together behind that one directive.

  role="tablist" + aria-selected tells a screen reader these are alternative
  views of the same region rather than three unrelated buttons.

  It reads as a row of folders: plain labels on a hairline track, the one you are
  on in the accent with a short accent rule under it. No pills — a row of capsule
  buttons is the default shape, and it competes with the content.

  The row does not scroll. It used to be a scroll container, and with
  `overflow-x: auto` the cross axis computes to `auto` too, so on a phone the
  labels could be dragged up and down as well as sideways. Instead they are sized
  to fit a phone's width, and the content is what slides — by tap or by a
  sideways swipe on it.
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
  gap: clamp(14px, 3vw, 30px);
  min-width: 0;
  border-bottom: 1px solid var(--line);
}

.tab {
  position: relative;
  flex: 0 0 auto;
  padding: 0 0 12px;
  border: 0;
  background: none;
  cursor: pointer;
  font-family: var(--font-mono);
  font-size: 13px;
  letter-spacing: 0.04em;
  color: var(--fg-2);
  white-space: nowrap;
  transition: color 0.16s ease;
}

.tab:hover:not(.active) {
  color: var(--fg);
}

/* The folder edge: a short rule in the accent, sitting on the track. */
.tab.active {
  color: var(--acc-text);
}

/* The folder edge: a short rule in the accent, sitting on the track. */
.tab.active::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: -1px;
  height: 3px;
  border-radius: 3px;
  background: var(--acc);
}

/*
  Sized to fit a phone. Three labels at 13px with tracking are a few pixels wider
  than the gutter, which is what made the row overflow in the first place.
*/
@media (max-width: 900px) {
  .tabs {
    gap: 14px;
  }

  .tab {
    font-size: 12px;
    letter-spacing: 0;
  }
}
</style>
