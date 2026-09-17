<script setup>
/*
  Section 03. The band, then the heading, the headline, the three networks as
  full-width rows, and the mailto.

  The section no longer carries the page gutter: it is the full-bleed container
  the band needs, and an inner column carries the measurements every other
  section uses. The bottom padding on that column is what keeps the last row
  clear of the fixed footer, which arrives in step 7.

  The rows replaced the three 46px icon buttons. They say the same thing with
  the address written out, which is what gives the end of the page its weight —
  and the icons are still in the mobile menu and the footer, so nothing was
  lost. The mailto button stays: the reference keeps a direct link beside its
  form, and the form is the next step.
*/
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import BaseButton from '../base/BaseButton.vue'
import SectionHeading from '../base/SectionHeading.vue'
import TalkBand from './TalkBand.vue'
import { useLang } from '../../composables/useLang'
import { copy, email, socials } from '../../data'
import { formatUrl } from '../../utils/format'

const { lang } = useLang()
const { t } = useI18n()

const contact = computed(() => copy.contact[lang.value])

// The address as it is shown comes from the href, so a link is edited once.
const rows = computed(() => socials.map((social) => ({ ...social, value: formatUrl(social.href) })))
</script>

<template>
  <section id="contact" class="contact">
    <TalkBand :text="t('contact.band')" />

    <div class="inner">
      <SectionHeading index="03" :title="t('section.contact')" />

      <p class="headline">{{ contact.body }}</p>

      <ul class="rows">
        <li v-for="row in rows" :key="row.name">
          <a class="row" :href="row.href" target="_blank" rel="noopener">
            <span class="label">{{ row.name }}</span>
            <span class="value">{{ row.value }}</span>
            <span class="arrow" aria-hidden="true">↗</span>
          </a>
        </li>
      </ul>

      <div class="actions" data-contact-actions>
        <BaseButton variant="solid" size="lg" magnetic :href="`mailto:${email}`" class="cta">
          {{ t('actions.talk') }}
        </BaseButton>
      </div>
    </div>
  </section>
</template>

<style scoped>
.contact {
  position: relative;
  z-index: 1;
  border-top: 1px solid var(--line);
}

.inner {
  padding: clamp(40px, 6vw, 80px) var(--gutter-r) clamp(48px, 6vw, 90px) var(--gutter-l);
  max-width: 1180px;
  margin: 0 auto;
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

/* One line per network, the label above the address and the arrow on the
   right, spanning both. */
.rows {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  border-top: 1px solid var(--line);
}

.row {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 2px 16px;
  padding: clamp(16px, 2.4vw, 26px) 0;
  border-bottom: 1px solid var(--line);
  color: var(--fg);
}

.label {
  grid-column: 1;
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--fg-3);
}

.value {
  grid-column: 1;
  font-size: clamp(22px, 3.2vw, 40px);
  font-weight: 700;
  letter-spacing: -0.02em;
  transition: color 0.16s ease;
}

/* ↗, not →. The same arrow as the project cards. */
.arrow {
  grid-column: 2;
  grid-row: 1 / span 2;
  font-size: clamp(20px, 2.4vw, 30px);
  color: var(--fg-2);
  transition: color 0.16s ease, transform 0.16s ease;
}

.row:hover .value,
.row:hover .arrow {
  color: var(--acc-text);
}

.row:hover .arrow {
  transform: translate(3px, -3px);
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

@media (max-width: 900px) {
  .inner {
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
