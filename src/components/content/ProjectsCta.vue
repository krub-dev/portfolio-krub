<script setup>
/*
  The projects rail's last card, and not a project: it is the way out to GitHub
  for whatever did not fit in four cards. It takes the rail's card size, and the
  dashed border is what marks it as the exception — a slot rather than a card.

  The copy comes from src/data/ and the link's label from src/locales/, like
  everything else. The GitHub mark and its address are read from the socials, so
  the icon and the link cannot drift from the ones in Contact.
*/
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { useLang } from '../../composables/useLang'
import { copy, socialIcons, socials } from '../../data'

defineProps({
  // True where there is no hover: the marker the rail uses on a touch screen.
  current: { type: Boolean, default: false },
})

const { t } = useI18n()
const { lang } = useLang()

const text = computed(() => copy.projectsCta[lang.value])
const github = computed(() => socials.find((social) => social.icon === 'github'))
</script>

<template>
  <article class="cta" :class="{ current }" data-magnetic>
    <svg class="mark" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path :d="socialIcons.github" />
    </svg>

    <p class="title">{{ text.title }}</p>
    <p class="body">{{ text.body }}</p>

    <a class="link" :href="github.href" target="_blank" rel="noopener">
      {{ t('actions.github') }}
      <span class="arrow" aria-hidden="true">↗</span>
    </a>
  </article>
</template>

<style scoped>
.cta {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 32px 24px;
  text-align: center;
  /* Dashed: it is a slot in the rail, not a fifth project. */
  border: 1px dashed var(--line);
  border-radius: 18px;
  background: var(--surface);
  transition: border-color 0.16s ease;
}

@media (hover: hover) {
  .cta:hover {
    border-color: var(--acc-text);
  }
}

/* And where there is no hover, the same border marks where the rail is parked. */
@media (hover: none) {
  .cta.current {
    border-color: var(--acc-text);
  }
}

.mark {
  width: 34px;
  height: 34px;
  color: var(--fg-2);
}

.title {
  margin: 0;
  font-size: 19px;
  font-weight: 600;
  color: var(--fg);
}

.body {
  margin: 0;
  max-width: 26ch;
  font-size: 15px;
  line-height: 1.55;
  color: var(--fg-2);
}

/* The link, in the mono the site uses for anything that behaves like a label. */
.link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
  font-family: var(--font-mono);
  font-size: 13px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--acc-text);
  transition: color 0.16s ease;
}

.link:hover {
  color: var(--acc-text-2);
}

.arrow {
  transition: transform 0.16s ease;
}

.link:hover .arrow {
  transform: translate(3px, -3px);
}
</style>
