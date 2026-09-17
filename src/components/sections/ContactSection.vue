<script setup>
/*
  Section 03. The band, then the heading, the rows and the mailto. The form goes
  between the heading and the rows.

  The section no longer carries the page gutter: it is the full-bleed container
  the band needs, and an inner column carries the measurements every other
  section uses. The bottom padding on that column is what keeps the last row
  clear of the fixed footer, which arrives in step 7.

  The rows replaced the three 46px icon buttons. They say the same thing with
  the address written out, which is what gives the end of the page its weight —
  and the icons are still in the mobile menu, so nothing was lost.
*/
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import SectionHeading from '../base/SectionHeading.vue'
import ContactForm from './ContactForm.vue'
import TalkBand from './TalkBand.vue'
import { email, socials } from '../../data'
import { formatUrl } from '../../utils/format'

const { t } = useI18n()

/*
  The rows: the address first, then the networks. A network's visible text is
  derived from its href, so a link is edited in one place and cannot drift.
*/
const rows = computed(() => [
  { name: t('contact.email'), href: `mailto:${email}`, value: email, external: false },
  ...socials.map((social) => ({
    name: social.name,
    href: social.href,
    value: formatUrl(social.href),
    external: true,
  })),
])
</script>

<template>
  <section id="contact" class="contact">
    <TalkBand :text="t('contact.band')" />

    <div class="inner">
      <SectionHeading index="03" :title="t('section.contact')" />

      <ul class="rows">
        <li v-for="row in rows" :key="row.name">
          <a
            class="row"
            :href="row.href"
            :target="row.external ? '_blank' : undefined"
            :rel="row.external ? 'noopener' : undefined"
          >
            <span class="label">{{ row.name }}</span>
            <span class="value">{{ row.value }}</span>
            <span class="arrow" aria-hidden="true">↗</span>
          </a>
        </li>
      </ul>

      <ContactForm />
    </div>
  </section>
</template>

<style scoped>
.contact {
  position: relative;
  z-index: 1;
}

.inner {
  padding: clamp(40px, 6vw, 80px) var(--gutter-r) clamp(48px, 6vw, 90px) var(--gutter-l);
  max-width: 1180px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 30px;
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

@media (max-width: 900px) {
  .inner {
    padding-bottom: 34px;
    gap: 24px;
  }
}
</style>
