<script setup>
/*
  Section 03. Big headline, email CTA, three social icons.

  The extra bottom padding keeps the last line clear of the fixed footer, which
  arrives in step 7.
*/
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import BaseButton from '../base/BaseButton.vue'
import SectionHeading from '../base/SectionHeading.vue'
import SocialLink from '../base/SocialLink.vue'
import { useLang } from '../../composables/useLang'
import { copy, email, socials } from '../../data'

const { lang } = useLang()
const { t } = useI18n()

const contact = computed(() => copy.contact[lang.value])
</script>

<template>
  <section id="contact" class="contact">
    <SectionHeading index="03" :title="t('section.contact')" />

    <p class="headline">{{ contact.body }}</p>

    <div class="actions" data-contact-actions>
      <BaseButton variant="solid" size="lg" magnetic :href="`mailto:${email}`" class="cta">
        {{ t('actions.talk') }}
      </BaseButton>

      <div class="socials">
        <SocialLink v-for="s in socials" :key="s.name" v-bind="s" />
      </div>
    </div>
  </section>
</template>

<style scoped>
.contact {
  position: relative;
  z-index: 1;
  padding: clamp(56px, 8vw, 110px) var(--gutter-r) clamp(48px, 6vw, 90px) var(--gutter-l);
  max-width: 1180px;
  margin: 0 auto;
  border-top: 1px solid var(--line);
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.headline {
  margin: 0;
  font-size: clamp(26px, 4vw, 52px);
  line-height: 1.06;
  font-weight: 700;
  letter-spacing: -0.03em;
  max-width: 22ch;
  text-wrap: balance;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  align-items: center;
}

/* 19px / 12px 26px — a notch above BaseButton's lg. One instance, so it is
   overridden here rather than added to the size scale. */
.cta {
  font-size: 19px;
  padding: 12px 26px;
}

.socials {
  display: flex;
  gap: 12px;
}

@media (max-width: 900px) {
  .contact {
    padding-bottom: 34px;
    gap: 24px;
  }

  .actions {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
}
</style>
