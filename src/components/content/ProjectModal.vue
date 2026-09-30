<script setup>
/*
  The project detail dialog: the media, the copy and the spec list, inside the
  site's shared dialog shell.

  The shell (BaseModal) owns the backdrop, the panel, the scroll lock, the focus
  trap, the Escape key and the close button; this owns what is inside it — the
  `[0N]` label and the path in the header, then the media and the two columns.
*/
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import BaseModal from '../base/BaseModal.vue'
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

const open = computed(() => props.project !== null)
const content = computed(() => (props.project ? props.project[lang.value] : null))
// [01], [02]… one-based and zero-padded, matching the section numbering.
const label = computed(() => `[${String(props.index + 1).padStart(2, '0')}]`)
</script>

<template>
  <BaseModal
    :open="open"
    labelledby="project-modal-title"
    :close-label="t('a11y.closeModal')"
    @close="emit('close')"
  >
    <template #head>
      <div class="path">
        <span class="index">{{ label }}</span>
        <span class="slug">/projects/{{ project.slug }}</span>
      </div>
    </template>

    <MediaCarousel
      :images="project.images ?? []"
      :slides="project.slides"
      :slug="project.slug"
      :name="content.name"
      :shot-label="project.shotLabel"
    />

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
  </BaseModal>
</template>

<style scoped>
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
  border-radius: 10px;
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
