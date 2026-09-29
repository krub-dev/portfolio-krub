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
})

const emit = defineEmits(['close'])

const { t } = useI18n()

const pages = ref(null)
const state = ref('idle') // idle | loading | ready | error

// Bumped on every start and on every close: a render that a close overtook must
// not paint into a dialog that is gone, nor after a theme change.
let token = 0

async function render() {
  const mine = ++token
  state.value = 'loading'

  try {
    const pdfjs = await import('pdfjs-dist')
    const worker = await import('pdfjs-dist/build/pdf.worker.min.mjs?url')
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
    if (mine === token) state.value = 'error'
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
      <span id="cv-modal-title" class="title">{{ t('actions.cv') }}</span>
    </template>

    <div class="body">
      <p v-if="state === 'loading'" class="note">{{ t('cvModal.loading') }}</p>
      <p v-else-if="state === 'error'" class="note">{{ t('cvModal.error') }}</p>

      <div ref="pages" class="pages" />

      <div class="foot">
        <BaseButton variant="solid" size="md" :href="href" download>
          {{ t('cvModal.download') }}
        </BaseButton>
      </div>
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

.note {
  margin: 0;
  font-family: var(--font-mono);
  font-size: 12px;
  letter-spacing: 0.1em;
  color: var(--fg-3);
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

.foot {
  display: flex;
  justify-content: flex-end;
  padding-top: 4px;
  border-top: 1px solid var(--line);
}
</style>
