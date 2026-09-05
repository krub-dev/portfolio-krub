<script setup>
/*
  The project detail dialog.

  Three ways out, and all three matter: the ✕ button, a click on the backdrop,
  and Escape. Escape is not in the prototype — it was added here, because a
  dialog you cannot dismiss from the keyboard is a trap for anyone not using a
  mouse, and it is what every user expects.

  The backdrop click checks `event.target === event.currentTarget`. Without
  that, a click that starts inside the panel and drifts onto the backdrop —
  selecting text, dragging — would close the dialog under you.

  role="dialog" + aria-modal + aria-labelledby is what tells a screen reader
  this is a layer over the page and gives it a name to announce. The focus trap
  is what makes that true in practice.

  Rendered in a <Teleport> to <body>: the modal is fixed and must sit above
  everything, and inside .app it would be subject to that element's stacking
  context and its overflow-x: hidden.
*/
import { computed, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import { useBodyScrollLock } from '../../composables/useBodyScrollLock'
import { useFocusTrap } from '../../composables/useFocusTrap'
import { useLang } from '../../composables/useLang'
import MediaCarousel from './MediaCarousel.vue'
import SpecList from './SpecList.vue'

const props = defineProps({
  project: { type: Object, default: null }, // null = closed
  index: { type: Number, default: 0 },
})

const emit = defineEmits(['close'])

const { lang } = useLang()
const { t } = useI18n()

const panel = ref(null)
const open = computed(() => props.project !== null)
const content = computed(() => (props.project ? props.project[lang.value] : null))
// [01], [02]… one-based and zero-padded, matching the section numbering.
const label = computed(() => `[${String(props.index + 1).padStart(2, '0')}]`)

useBodyScrollLock(open)
useFocusTrap(panel, open)

function onBackdrop(event) {
  if (event.target === event.currentTarget) emit('close')
}

/*
  Escape is handled on the document, not on the dialog element. The focus trap
  means keystrokes would bubble up from inside anyway, but this way closing
  does not depend on where focus happens to be — and the listener only exists
  while the dialog is open.
*/
function onKeydown(event) {
  if (event.key === 'Escape') emit('close')
}

watch(open, (isOpen) => {
  if (isOpen) document.addEventListener('keydown', onKeydown)
  else document.removeEventListener('keydown', onKeydown)
})

onUnmounted(() => document.removeEventListener('keydown', onKeydown))
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="backdrop"
      @click="onBackdrop"
    >
      <div
        ref="panel"
        class="panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-modal-title"
      >
        <header class="head">
          <div class="path">
            <span class="index">{{ label }}</span>
            <span class="slug">/projects/{{ project.slug }}</span>
          </div>
          <button class="close" type="button" :aria-label="t('a11y.closeModal')" @click="emit('close')">
            ✕
          </button>
        </header>

        <MediaCarousel :slides="project.slides" :slug="project.slug" />

        <div class="body" data-two-col>
          <div class="main">
            <h2 id="project-modal-title" class="name">{{ content.name }}</h2>
            <p class="lead">{{ content.lead }}</p>
            <p class="para">{{ content.body }}</p>
            <p class="para">{{ content.body2 }}</p>

            <div class="links">
              <a class="link outline" :href="project.repo" target="_blank" rel="noopener" data-magnetic>
                {{ content.repoLabel }}
              </a>
              <a class="link solid" :href="project.live" target="_blank" rel="noopener" data-magnetic>
                {{ content.liveLabel }}
              </a>
            </div>
          </div>

          <SpecList :role="content.role" :year="content.year" :stack="project.stack" />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.backdrop {
  position: fixed;
  inset: 0;
  z-index: 250;
  background: color-mix(in srgb, var(--ink) 82%, transparent);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  overflow-y: auto;
  padding: clamp(12px, 4vw, 48px);
}

.panel {
  width: min(1000px, 100%);
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

.path {
  display: flex;
  align-items: baseline;
  gap: 12px;
  min-width: 0;
}

.index {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--acc-text);
}

.slug {
  font-family: var(--font-mono);
  font-size: 13px;
  color: var(--fg-2);
  overflow: hidden;
  text-overflow: ellipsis;
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

.body {
  display: grid;
  grid-template-columns: 1.4fr 0.6fr;
  gap: clamp(20px, 4vw, 44px);
  padding: clamp(22px, 4vw, 40px);
}

.main {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.name {
  margin: 0;
  font-size: clamp(26px, 3.4vw, 40px);
  font-weight: 700;
  letter-spacing: -0.03em;
}

.lead {
  margin: 0;
  font-size: 18px;
  line-height: 1.55;
  color: var(--fg);
}

.para {
  margin: 0;
  font-size: 16px;
  line-height: 1.65;
  color: var(--fg-2);
  text-wrap: pretty;
}

.links {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding-top: 6px;
}

.link {
  border-radius: 999px;
  padding: 12px 22px;
  font-family: var(--font-mono);
  font-size: 14px;
  transition:
    background-color 0.16s ease,
    border-color 0.16s ease,
    color 0.16s ease;
}

.outline {
  color: var(--fg);
  border: 1px solid var(--line);
}

.outline:hover {
  border-color: var(--acc-text);
  color: var(--acc-text);
}

.solid {
  background: var(--acc);
  color: var(--on-acc);
  border: 1px solid var(--acc);
  font-weight: 600;
}

.solid:hover {
  background: var(--acc-2);
  border-color: var(--acc-2);
  color: var(--on-acc);
}

@media (max-width: 900px) {
  .body {
    grid-template-columns: 1fr;
  }
}
</style>
