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

  On a phone the three labels do not fit, so the row slides sideways instead of
  wrapping — the same gesture as the projects rail. It is a native scroll
  container with snap (touch and trackpad do the work) plus a small
  drag-to-scroll so a mouse can move it too, and a click guard so a drag does not
  pick a tab it ends over.
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
  // Mouse only. On touch the native scroll already moves the row, and driving
  // scrollLeft as well made the two fight — the row slid vertically.
  if (event.pointerType !== 'mouse') return
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
  gap: clamp(18px, 3vw, 34px);
  min-width: 0;
  border-bottom: 1px solid var(--line);
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
  position: relative;
  flex: 0 0 auto;
  scroll-snap-align: start;
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
</style>
