<script setup>
/*
  The panel that drops under the menu button below 900px.

  It closes on every link, on Escape, and when you click outside it. Escape and
  the outside click are not in the prototype — but a panel you can only close
  by hitting the same small button again is a trap, and both are one listener.

  The listeners are attached only while the menu is open and removed when it
  closes, so nothing stays wired up in the background.
*/
import { onUnmounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import SocialLink from '../base/SocialLink.vue'
import { email, sections, socials } from '../../data'

const props = defineProps({
  open: { type: Boolean, default: false },
  activeId: { type: String, default: '' },
})

const emit = defineEmits(['close', 'go-top'])

const { t } = useI18n()

function onKeydown(event) {
  if (event.key === 'Escape') emit('close')
}

function onPointerDown(event) {
  // The button that opens the menu is outside the panel, so a click on it
  // would close and reopen. Let the navbar's own toggle handle that case.
  if (!event.target.closest('[data-mobile-menu], [aria-expanded]')) emit('close')
}

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      document.addEventListener('keydown', onKeydown)
      document.addEventListener('pointerdown', onPointerDown)
    } else {
      document.removeEventListener('keydown', onKeydown)
      document.removeEventListener('pointerdown', onPointerDown)
    }
  },
)

onUnmounted(() => {
  document.removeEventListener('keydown', onKeydown)
  document.removeEventListener('pointerdown', onPointerDown)
})
</script>

<template>
  <div v-if="open" class="menu" data-mobile-menu>
    <div class="head">
      <span class="title">{{ t('menu.label') }}</span>
      <span class="sub">{{ t('menu.sub') }}</span>
    </div>

    <div class="quick">
      <SocialLink v-for="s in socials" :key="s.name" v-bind="s" class="quick-social" />
      <a class="quick-cta" :href="`mailto:${email}`">{{ t('actions.talk') }}</a>
    </div>

    <nav class="list">
      <a
        v-for="section in sections"
        :key="section.id"
        class="row"
        :href="`#${section.id}`"
        @click="emit('close')"
      >
        <span class="row-index" :class="{ active: section.id === activeId }">[{{ section.index }}]</span>
        <span class="row-label">{{ t(section.labelKey) }}</span>
      </a>
    </nav>

    <button class="to-top" type="button" @click="emit('go-top'); emit('close')">
      ↑ {{ t('menu.top') }}
    </button>
  </div>
</template>

<style scoped>
.menu {
  position: fixed;
  top: 74px;
  /* Centred rather than pinned under the button it opens from: owner
     decision. On a phone the panel is most of the width anyway, and hanging
     off one corner read as lopsided. */
  left: 50%;
  transform: translateX(-50%);
  z-index: 150;
  width: min(300px, calc(100vw - 40px));
  /*
    A phone in landscape is about 390px tall, and the panel is taller than that
    with nowhere to go — the socials and the back-to-top link were simply cut
    off the bottom of the screen, unreachable.

    svh so the height does not change when the browser's toolbar collapses, and
    the bottom inset so the last row clears the home indicator.
  */
  /* border-box so max-height means the whole panel. There is no global
     border-box in this project by design, so the 16px of padding and the
     border would otherwise be added outside the limit and the panel would
     still hang 18px off the bottom. */
  box-sizing: border-box;
  max-height: calc(100svh - 74px - 16px - env(safe-area-inset-bottom, 0px));
  overflow-y: auto;
  overscroll-behavior: contain;
  border-radius: 20px;
  background: var(--surface);
  border: 1px solid var(--line);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.45);
}

/* The panel is a scrolling flex column, so its children would otherwise be
   squeezed to fit rather than overflowing into the scroll — in landscape the
   back-to-top button was rendering 15px tall instead of 28. */
.menu > * {
  flex-shrink: 0;
}

.head {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.title {
  font-size: 15px;
  font-weight: 600;
  color: var(--fg);
}

.sub {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--fg-3);
}

.quick {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.quick-social {
  width: 100%;
  border-radius: 10px;
}

.quick-cta {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 46px;
  border-radius: 10px;
  background: var(--acc);
  color: var(--on-acc);
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
}

.quick-cta:hover {
  background: var(--acc-2);
  color: var(--on-acc);
}

.list {
  display: flex;
  flex-direction: column;
}

.row {
  display: flex;
  align-items: baseline;
  gap: 10px;
  padding: 10px 0;
  border-top: 1px solid var(--line);
  font-family: var(--font-mono);
  font-size: 13px;
  color: var(--fg-2);
}

.row:hover {
  color: var(--acc-text);
}

.row-index {
  font-size: 10px;
  letter-spacing: 0.1em;
  color: var(--fg-3);
}

.row-index.active {
  color: var(--acc-text);
}

.to-top {
  align-self: center;
  height: 28px;
  padding: 0 16px;
  border-radius: 999px;
  background: transparent;
  border: 1px solid var(--line);
  color: var(--fg-3);
  cursor: pointer;
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.16em;
  transition:
    border-color 0.16s ease,
    color 0.16s ease;
}

.to-top:hover {
  border-color: var(--acc-text);
  color: var(--acc-text);
}
</style>
