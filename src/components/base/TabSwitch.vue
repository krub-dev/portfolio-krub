<script setup>
/*
  The /me switch: /experience, /education, /certifications.

  Uses v-model, so the parent writes `v-model="tab"` and never thinks about
  events. That is what the `modelValue` prop plus the `update:modelValue`
  emit mean: Vue wires them together behind that one directive.

  A real tablist, not just the roles: the active tab is the only one in the tab
  order (roving tabindex) and the arrows move between them, which is what a
  screen reader expects once it has announced "tab". `panelId` is the id of the
  region they switch, so aria-controls points somewhere and the panel can point
  back with aria-labelledby.

  It reads as a row of folders: plain labels on a hairline track, the one you are
  on in the accent with a short accent rule under it. No pills — a row of capsule
  buttons is the default shape, and it competes with the content.

  The row does not scroll. It used to be a scroll container, and with
  `overflow-x: auto` the cross axis computes to `auto` too, so on a phone the
  labels could be dragged up and down as well as sideways. Instead they are sized
  to fit a phone's width, and the content is what slides — by tap or by a
  sideways swipe on it.
*/
import { nextTick, ref } from 'vue'

const props = defineProps({
  options: { type: Array, required: true }, // [{ value, label }]
  modelValue: { type: String, required: true },
  panelId: { type: String, required: true },
})

const emit = defineEmits(['update:modelValue'])

const tabs = ref([])

/*
  The arrows walk the row and wrap at the ends; Home and End jump to the corners.
  Selecting with an arrow also moves the focus, which is what makes it feel like
  one control rather than three buttons that happen to be next to each other.
*/
function onKeydown(event, i) {
  const last = props.options.length - 1
  let next = null
  if (event.key === 'ArrowRight') next = i === last ? 0 : i + 1
  else if (event.key === 'ArrowLeft') next = i === 0 ? last : i - 1
  else if (event.key === 'Home') next = 0
  else if (event.key === 'End') next = last
  if (next === null) return

  event.preventDefault()
  emit('update:modelValue', props.options[next].value)
  nextTick(() => tabs.value[next]?.focus())
}
</script>

<template>
  <div class="tabs" role="tablist">
    <button
      v-for="(option, i) in options"
      :key="option.value"
      ref="tabs"
      class="tab"
      :class="{ active: option.value === modelValue }"
      type="button"
      role="tab"
      :id="`${panelId}-tab-${option.value}`"
      :aria-controls="panelId"
      :aria-selected="option.value === modelValue"
      :tabindex="option.value === modelValue ? 0 : -1"
      @click="$emit('update:modelValue', option.value)"
      @keydown="onKeydown($event, i)"
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
