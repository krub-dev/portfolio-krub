<script setup>
/*
  Section 03. The heading, then the band, then the rows and the form.

  The section is the full-bleed container the band needs, so it carries no page
  gutter of its own: two inner columns carry the measurements every other
  section uses, one above the band and one below. The heading comes first so the
  band is not flush against the projects section. The bottom padding on the
  lower column is what keeps the form clear of the fixed footer, which arrives
  in step 7.

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
    <div class="inner head">
      <SectionHeading index="03" :title="t('section.contact')" />
    </div>

    <TalkBand :text="t('contact.band')" />

    <div class="inner body">
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

/*
  The page gutter and the 1180px cap the other sections use. The band is
  full-bleed, so it cannot live inside one of these and the section carries two.
*/
.inner {
  padding-left: var(--gutter-l);
  padding-right: var(--gutter-r);
  max-width: 1180px;
  margin: 0 auto;
}

/* The separator the other sections carry, at their 1180px rather than across
   the whole viewport: the heading starts the section, not the band. */
.head {
  padding-top: clamp(56px, 8vw, 110px);
  padding-bottom: clamp(40px, 6vw, 80px);
  border-top: 1px solid var(--line);
}

.body {
  padding-top: clamp(40px, 6vw, 80px);
  padding-bottom: clamp(48px, 6vw, 90px);
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
  .body {
    padding-bottom: 34px;
    gap: 24px;
  }
}
</style>
