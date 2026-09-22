<script setup>
/*
  The /me switch: /experience, /education, /certifications.

  Uses v-model, so the parent writes `v-model="tab"` and never thinks about
  events. That is what the `modelValue` prop plus the `update:modelValue`
  emit mean: Vue wires them together behind that one directive.

  role="tablist" + aria-selected tells a screen reader these are alternative
  views of the same region rather than three unrelated buttons.

  On a phone the three pills do not fit, so the row slides sideways instead of
  wrapping or stacking — the same gesture as the projects rail. It is a native
  scroll container with snap (touch and trackpad do the work) plus a small
  drag-to-scroll so a mouse can move it too, and a click guard so a drag does
  not pick a tab it ends over.
*/
import { ref } from 'vue'

defineProps({
  options: { type: Array, required: true }, // [{ value, label }]
  modelValue: { type: String, required: true },
})

defineEmits(['update:modelValue'])

const el = ref(null)
let down = false
let startX = 0
let startScroll = 0
let moved = 0

function onDown(event) {
  down = true
  moved = 0
  startX = event.clientX
  startScroll = el.value?.scrollLeft ?? 0
}

function onMove(event) {
  if (!down || !el.value) return
  const delta = event.clientX - startX
  moved = Math.max(moved, Math.abs(delta))
  if (moved > 6) el.value.scrollLeft = startScroll - delta
}

function onUp() {
  down = false
}

// A drag that ends over a tab must not pick it.
function onClickCapture(event) {
  if (moved <= 6) return
  moved = 0
  event.stopPropagation()
  event.preventDefault()
}
</script>

<template>
  <div
    ref="el"
    class="tabs"
    role="tablist"
    @pointerdown="onDown"
    @pointermove="onMove"
    @pointerup="onUp"
    @pointercancel="onUp"
    @click.capture="onClickCapture"
  >
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
  overflow-x: auto;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
  scroll-snap-type: x proximity;
  cursor: grab;
}

.tabs::-webkit-scrollbar {
  display: none;
}

.tabs:active {
  cursor: grabbing;
}

.tab {
  flex: 0 0 auto;
  scroll-snap-align: start;
  border-radius: 10px;
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
</style>
