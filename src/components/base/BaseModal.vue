<script setup>
/*
  The shell every dialog on the site uses: the fixed backdrop, the panel, the
  scroll lock behind it, the focus trap, the Escape key and the backdrop click.
  It knows nothing about what goes inside — that is the default slot, and the
  header is a slot too, because each dialog names itself differently.

  Extracted from the project modal when the CV became a second dialog, so there
  is one set of rules for a dialog rather than two that drift apart. The same
  reason the pagers were merged.

  Rendered in a <Teleport> to <body>: a dialog is fixed and must sit above
  everything, and inside .app it would be subject to that element's stacking
  context and its overflow-x: clip.
*/
import { computed, onUnmounted, ref, watch } from 'vue'

import { useBodyScrollLock } from '../../composables/useBodyScrollLock'
import { useFocusTrap } from '../../composables/useFocusTrap'

const props = defineProps({
  open: { type: Boolean, default: false },
  // The id of the element that names the dialog, for aria-labelledby.
  labelledby: { type: String, default: undefined },
  // The close button's label: "Close project" and "Close the CV" are not the
  // same announcement.
  closeLabel: { type: String, required: true },
  // The panel's own cap. The CV is a portrait page and wants a narrower one.
  width: { type: String, default: 'min(1000px, 100%)' },
})

const emit = defineEmits(['close'])

const panel = ref(null)
const isOpen = computed(() => props.open)

useBodyScrollLock(isOpen)
useFocusTrap(panel, isOpen)

/*
  The backdrop click checks `event.target === event.currentTarget`. Without that,
  a click that starts inside the panel and drifts onto the backdrop — selecting
  text, dragging — would close the dialog under you.
*/
function onBackdrop(event) {
  if (event.target === event.currentTarget) emit('close')
}

/*
  Escape is handled on the document, not on the dialog element. The focus trap
  means keystrokes would bubble up from inside anyway, but this way closing does
  not depend on where focus happens to be — and the listener only exists while
  the dialog is open.
*/
function onKeydown(event) {
  if (event.key === 'Escape') emit('close')
}

watch(isOpen, (open) => {
  if (open) document.addEventListener('keydown', onKeydown)
  else document.removeEventListener('keydown', onKeydown)
})

onUnmounted(() => document.removeEventListener('keydown', onKeydown))
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="backdrop" data-hide-cursor @click="onBackdrop">
      <div
        ref="panel"
        class="panel"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="labelledby"
        :style="{ '--panel-w': width }"
      >
        <header class="head">
          <slot name="head" />
          <button class="close" type="button" :aria-label="closeLabel" @click="emit('close')">
            ✕
          </button>
        </header>

        <slot />
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.backdrop {
  position: fixed;
  inset: 0;
  z-index: 250;
  /*
    A flat scrim, no blur. The blur turned the page behind into smudges that read
    as shapes of their own, and it made this element a backdrop root — the thing
    decision 48 ran into. One uniform layer of ink does the only job a backdrop
    has, pushing the page back, without drawing the eye to it.
  */
  background: color-mix(in srgb, var(--ink) 90%, transparent);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  overflow-y: auto;
  padding: clamp(12px, 4vw, 48px);
}

.panel {
  width: var(--panel-w, min(1000px, 100%));
  max-height: calc(100svh - clamp(24px, 8vw, 96px));
  border: 1px solid var(--line);
  border-radius: 22px;
  background: var(--surface);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 22px;
  border-bottom: 1px solid var(--line);
}

.close {
  width: 38px;
  height: 38px;
  flex: 0 0 auto;
  border-radius: 10px;
  background: transparent;
  border: 1px solid var(--line);
  color: var(--fg);
  cursor: pointer;
  font-size: 14px;
  transition:
    background-color 0.16s ease,
    border-color 0.16s ease,
    color 0.16s ease;
}

.close:hover {
  border-color: var(--acc-text);
  color: var(--acc-text);
}
</style>
