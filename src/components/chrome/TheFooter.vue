<script setup>
/*
  The fixed footer.

  It starts translated 102% down — just off-screen, the extra 2% covering the
  border — and slides in once the visitor has left the hero behind, at the same
  moment as Limonacho. usePastHero owns that threshold and explains it.

  It used to be present from the first frame on a phone, on the reasoning that
  a phone is always near the bottom of something. On a real device that was
  wrong: it took fixed space before anything had been scrolled, and it arrived
  before the lemon, which does animate in.

  useFooterHeight publishes the real height as --footer-h so the page can
  reserve room for it. See that composable for why it is measured and not
  hardcoded.
*/
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

import BrandLogo from '../base/BrandLogo.vue'
import { useFooterHeight } from '../../composables/useFooterHeight'
import { usePastHero } from '../../composables/usePastHero'
import { config } from '../../data'
import LiveClock from './LiveClock.vue'

defineEmits(['go-top'])

const { t } = useI18n()

const footer = ref(null)
useFooterHeight(footer)

const shown = usePastHero()
</script>

<template>
  <footer ref="footer" class="footer" :class="{ shown }" data-motion="decorative">
    <div class="credit">
      <span class="made">
        {{ t('footer.madePre') }}
        <svg class="heart" viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M12 21c-.4 0-.79-.15-1.09-.44l-6.6-6.36C2.2 12.2 2 9.06 3.95 7.1a5.06 5.06 0 0 1 7.16 0l.89.89.89-.89a5.06 5.06 0 0 1 7.16 0c1.95 1.96 1.75 5.1-.36 7.1l-6.6 6.36c-.3.29-.69.44-1.09.44Z"
          />
        </svg>
        {{ t('footer.madePost') }}
        <BrandLogo :height="13" :opacity="0.9" class="credit-logo" />
      </span>
      <span class="dot" aria-hidden="true">·</span>
      <span class="rights">{{ t('footer.rights') }}</span>
    </div>

    <!-- Not magnetic: the design spec lists it, but a control that drifts
         under the cursor at the moment you go to click it is worse than one
         that stays put. Owner decision. -->
    <button class="top" type="button" :aria-label="t('a11y.backToTop')" @click="$emit('go-top')">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M12 19V5M5 12l7-7 7 7" />
      </svg>
      {{ t('footer.top') }}
    </button>

    <span class="place">
      {{ t('footer.place') }} ·
      <LiveClock :timezone="config.timezone" />
    </span>
  </footer>
</template>

<style scoped>
.footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 95;
  background: var(--ink);
  border-top: 1px solid var(--line);
  transform: translateY(102%);
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  /*
    The bottom inset is the home indicator on an iPhone. With the browser's
    toolbar collapsed the viewport reaches past it, and without this the credit
    line is cut in half by it. The side insets are the notch in landscape.
    Every one is 0 on a device that has none.

    max() for the bottom, not a sum: the inset already leaves enough room on
    its own, and adding the 9px on top of it pushed the credit line further
    from the edge than it needs to be.

    Longhand rather than the four-value shorthand, and repeated in the phone
    block below rather than reset there — a shorthand is a single declaration,
    so `padding: 9px 20px` in a media query silently threw all four of these
    away. It did exactly that, and the fix looked like it had no effect at all.

    useFooterHeight measures the result, so the room the page reserves and the
    lemon's resting position both follow on their own.
  */
  padding-top: 9px;
  padding-right: var(--gutter-r);
  padding-bottom: max(9px, env(safe-area-inset-bottom, 0px));
  padding-left: var(--gutter-l);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
  font-family: var(--font-mono);
  font-size: 10px;
  line-height: 1;
  letter-spacing: 0.12em;
  color: var(--fg-3);
}

.footer.shown {
  transform: translateY(0);
}

.credit {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.made {
  display: flex;
  align-items: center;
  gap: 7px;
}

/* var(--mark), so the heart is yellow on dark and black on light. */
.heart {
  width: 11px;
  height: 11px;
  fill: var(--mark);
}

.credit-logo {
  transform: translateY(-1.5px);
}

.dot {
  opacity: 0.5;
  letter-spacing: 0;
}

.top {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 30px;
  padding: 0 14px;
  border-radius: 8px;
  /* Filled with the accent so it does not disappear into the footer's own
     background. --on-acc on top, like every other filled control. */
  background: var(--acc);
  border: 1px solid var(--acc);
  color: var(--on-acc);
  cursor: pointer;
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.16em;
  white-space: nowrap;
  transition:
    background-color 0.18s ease,
    border-color 0.18s ease,
    color 0.18s ease;
}

.top:hover {
  background: var(--acc-2);
  border-color: var(--acc-2);
  color: var(--on-acc);
}

/* On a filled accent control the accent ring would vanish, so it goes --fg,
   the same rule the solid buttons follow in tokens.css. */
.top:focus-visible {
  outline-color: var(--fg);
}

.top svg {
  width: 11px;
  height: 11px;
}

.place {
  white-space: nowrap;
}

@media (max-width: 900px) {
  .footer {
    padding-right: var(--gutter-r);
    padding-left: var(--gutter-l);
    /*
      A column, not a row. Side by side, the credit and the place squeeze the
      credit until it breaks mid-phrase — which is what happened in Spanish,
      where the words are longer: "DISEÑADO Y CONSTRUIDO / CON". Stacked and
      centred, each block gets the full width.

      The tracking is halved on a phone. At the spec's .12em the Spanish credit
      is a handful of pixels wider than the English one at 390px, which is
      enough to push it onto a second line; at .06em both fit on one, the
      wording is untouched and the separator dot stays between them.
    */
    flex-direction: column;
    align-items: center;
    gap: 4px;
    text-align: center;
    letter-spacing: 0.06em;
  }

  .credit {
    flex-wrap: wrap;
    justify-content: center;
    gap: 6px;
  }

  .made {
    flex-wrap: wrap;
    justify-content: center;
    gap: 6px;
    row-gap: 2px;
  }

  .top {
    display: none;
  }
}
</style>
