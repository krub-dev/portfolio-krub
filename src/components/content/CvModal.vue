<script setup>
/*
  The CV, in a dialog, at reading size: the same pages as the PDF, rendered from
  it with pdf.js, with the download at the foot. The document is the one the site
  already offers for the visitor's theme and language — the same URL the button
  used to download — so nothing new has to be kept in step.

  pdf.js and its worker are their own chunk, imported only when a dialog opens,
  so a visitor who never looks at the CV never downloads them. Each page is
  painted into a canvas sized to the device's pixel ratio (`transform`), because
  a PDF scaled to a CSS width and left at 1:1 is soft on a retina screen.

  The canvases are built by hand rather than with a `v-for`: the page count is
  only known after the document loads, and the renderer owns that DOM the way the
  3D scene owns its canvas.
*/
import { nextTick, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import BaseButton from '../base/BaseButton.vue'
import BaseModal from '../base/BaseModal.vue'

const props = defineProps({
  open: { type: Boolean, default: false },
  href: { type: String, required: true },
  // 'full' or 'onePage': the two documents on offer.
  variant: { type: String, default: 'full' },
})

const emit = defineEmits(['close', 'variant'])

const VARIANTS = ['full', 'onePage']

const { t } = useI18n()

const pages = ref(null)
const state = ref('idle') // idle | loading | ready | error
// The reason, in development only: a phone has no console to open, and "could
// not be shown" on its own is a dead end.
const detail = ref('')

// Bumped on every start and on every close: a render that a close overtook must
// not paint into a dialog that is gone, nor after a theme change.
let token = 0

async function render() {
  const mine = ++token
  state.value = 'loading'

  try {
    /*
      The legacy build, not the modern one. The modern core leans on APIs a
      slightly older iOS does not have (`Promise.withResolvers` and friends), and
      the failure is silent: the dialog just says it could not be shown. The
      legacy build is the same pdf.js transpiled and polyfilled for exactly this,
      and it costs a few kilobytes more.
    */
    const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs')
    const worker = await import('pdfjs-dist/legacy/build/pdf.worker.min.mjs?url')
    pdfjs.GlobalWorkerOptions.workerSrc = worker.default

    const doc = await pdfjs.getDocument({ url: props.href }).promise
    if (mine !== token) return

    await nextTick()
    const host = pages.value
    if (!host) return
    host.replaceChildren()

    const width = host.clientWidth
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    for (let n = 1; n <= doc.numPages; n += 1) {
      const page = await doc.getPage(n)
      if (mine !== token) return

      const base = page.getViewport({ scale: 1 })
      const viewport = page.getViewport({ scale: width / base.width })

      const canvas = document.createElement('canvas')
      canvas.className = 'page'
      canvas.width = Math.floor(viewport.width * dpr)
      canvas.height = Math.floor(viewport.height * dpr)
      canvas.style.width = `${viewport.width}px`
      canvas.style.height = `${viewport.height}px`
      host.appendChild(canvas)

      await page.render({
        canvasContext: canvas.getContext('2d'),
        viewport,
        transform: dpr === 1 ? undefined : [dpr, 0, 0, dpr, 0, 0],
      }).promise
      if (mine !== token) return
    }

    state.value = 'ready'
  } catch (error) {
    // Logged for the console, like the contact endpoint: a dialog that silently
    // shows "could not be shown" is a mystery to whoever has to fix it.
    console.error('[cv] the document could not be rendered:', error)
    if (mine === token) {
      state.value = 'error'
      detail.value = import.meta.env.DEV ? String(error?.message ?? error) : ''
    }
  }
}

watch(
  () => props.open,
  (open) => {
    if (open) {
      render()
    } else {
      token += 1
      state.value = 'idle'
      pages.value?.replaceChildren()
    }
  },
)

// Switching document while the dialog is open re-renders; the download follows
// through the `href` the page hands down.
watch(
  () => props.href,
  () => {
    if (props.open) render()
  },
)
</script>

<template>
  <BaseModal
    :open="open"
    labelledby="cv-modal-title"
    :close-label="t('a11y.closeCv')"
    width="min(760px, 100%)"
    @close="emit('close')"
  >
    <template #head>
      <div class="head-left">
        <span id="cv-modal-title" class="title">{{ t('actions.cv') }}</span>
        <div class="variants" role="group" :aria-label="t('cvModal.variants')">
          <button
            v-for="v in VARIANTS"
            :key="v"
            class="variant"
            :class="{ active: variant === v }"
            type="button"
            :aria-pressed="variant === v"
            @click="emit('variant', v)"
          >
            {{ t(`cvModal.${v}`) }}
          </button>
        </div>
      </div>
    </template>

    <!--
      The download lives in the header with the close, not at the foot of the
      document: it is the one thing you want whatever page you are on, and the
      header stays put while the pages scroll. Icon only — an arrow into a tray
      says "download" without a word, and the label is for the screen reader.
    -->
    <template #actions>
      <BaseButton
        variant="solid"
        size="sm"
        :href="href"
        download
        :aria-label="t('cvModal.download')"
        class="download"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M12 3v12M7 10l5 5 5-5M5 21h14" />
        </svg>
      </BaseButton>
    </template>

    <div class="body">
      <p v-if="state === 'loading'" class="note">{{ t('cvModal.loading') }}</p>
      <p v-else-if="state === 'error'" class="note">
        {{ t('cvModal.error') }}<span v-if="detail" class="detail">{{ detail }}</span>
      </p>

      <div ref="pages" class="pages" />
    </div>
  </BaseModal>
</template>

<style scoped>
.body {
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: clamp(16px, 3vw, 28px);
}

.title {
  font-family: var(--font-mono);
  font-size: 13px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--fg-2);
}

/* A square icon button: the same padding all round, no text to make room for. */
.download {
  padding: 9px;
}

.download svg {
  width: 15px;
  height: 15px;
  display: block;
}

.head-left {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

/* A phone has no room for the title, the selector, the download and the close on
   one row; the selector drops under the title. */
@media (max-width: 560px) {
  .head-left {
    flex-wrap: wrap;
    gap: 8px 12px;
  }
}

.variants {
  display: inline-flex;
  gap: 3px;
  padding: 2px;
  border: 1px solid var(--line);
  border-radius: 9px;
}

.variant {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  padding: 6px 9px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--fg-3);
  cursor: pointer;
  transition:
    background-color 0.16s ease,
    color 0.16s ease;
}

.variant:hover {
  background: color-mix(in srgb, currentColor 15%, transparent);
}

.variant.active {
  background: var(--acc);
  color: var(--on-acc);
}

.note {
  margin: 0;
  font-family: var(--font-mono);
  font-size: 12px;
  letter-spacing: 0.1em;
  color: var(--fg-3);
}

/* The reason, under the sentence and dimmer: development only. */
.detail {
  display: block;
  margin-top: 6px;
  letter-spacing: 0;
  opacity: 0.7;
}

/* The pages stack, each a sheet of its own. */
.pages {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.pages :deep(.page) {
  display: block;
  max-width: 100%;
  height: auto;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: var(--surface);
}
</style>
