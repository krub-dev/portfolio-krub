<script setup>
/*
  The fixed navigation bar.

  Two states. At the top it is a full-width capsule with no background — it
  floats over the hero. Past 60px of scroll it goes compact: smaller padding,
  smaller logo, a translucent blurred background, and it shrinks to hug its own
  contents.

  That last part is the interesting bit. You cannot animate `width: auto`, so
  the natural width has to be a number. measureNatural() briefly applies the
  compact geometry with width:auto, reads the resulting width, and puts
  everything back — with transitions off, inside one frame, so nothing flashes.
  It re-runs on resize and on language change, because the labels are what
  determine that width and Spanish is wider than English.
*/
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import AppearanceControl from './AppearanceControl.vue'
import BrandLogo from '../base/BrandLogo.vue'
import { useElementHeight } from '../../composables/useElementHeight'
import { useLang } from '../../composables/useLang'
import { useScroll } from '../../composables/useScroll'
import { email, sections } from '../../data'

const props = defineProps({
  activeId: { type: String, default: '' },
  menuOpen: { type: Boolean, default: false },
})

defineEmits(['toggle-menu'])

const { t } = useI18n()
const { lang, toggle: toggleLang } = useLang()
const { y } = useScroll()

const capsule = ref(null)
const naturalWidth = ref(null)

/*
  The bar is fixed, so the hero has to pad itself past it or the name lands
  underneath — which is exactly what happened on a phone, where the padding was
  a hardcoded number two pixels short of the bar's real height and the compact
  state changes that height as you scroll.
*/
const bar = ref(null)
useElementHeight(bar, '--navbar-h')

const compact = computed(() => y.value > 60)
const maxWidth = computed(() =>
  compact.value && naturalWidth.value ? `${naturalWidth.value}px` : '1180px',
)

function measureNatural() {
  const el = capsule.value
  if (!el) return

  const previous = el.getAttribute('style') ?? ''
  el.style.transition = 'none'
  el.style.maxWidth = 'none'
  el.style.width = 'auto'
  el.style.padding = '8px 12px'

  const width = el.getBoundingClientRect().width

  el.setAttribute('style', previous)
  void el.offsetWidth // flush the restore before transitions come back
  naturalWidth.value = Math.ceil(width)
}

onMounted(() => {
  measureNatural()
  window.addEventListener('resize', measureNatural)

  /*
    The compact capsule's width is the number measured above, so a measurement
    taken before the webfont has swapped in is too small: the labels widen when
    the real font lands, the row overflows the capsule and "Let's talk" is what
    gets cut. It is intermittent because it depends on whether the font was
    already loaded when the component mounted. document.fonts.ready resolves
    once the swap is done, and the measurement is redone then.
  */
  if (document.fonts) document.fonts.ready.then(measureNatural)
})

onUnmounted(() => window.removeEventListener('resize', measureNatural))

/*
  Labels change width with the language, so the measurement is stale the moment
  it switches. nextTick waits for Vue to put the new text in the DOM;
  requestAnimationFrame alone could fire before the patch and re-measure the
  old labels.
*/
watch(lang, async () => {
  await nextTick()
  measureNatural()
})
</script>

<template>
  <header ref="bar" class="bar">
    <div ref="capsule" class="capsule" :class="{ compact }" :style="{ maxWidth }" data-motion="decorative">
      <a class="brand" href="/#top" aria-label="krub.dev">
        <BrandLogo :height="compact ? 18 : 22" class="brand-logo" />
        <span class="brand-dev">.dev</span>
      </a>

      <span class="divider" aria-hidden="true" />

      <nav class="links" :aria-label="t('menu.sub')">
        <!--
          Absolute `/#id`, not `#id`: the navbar is shared chrome and also
          renders on the 404, where there are no sections to jump to. On the
          home page the path is unchanged, so the browser still treats this as
          a plain in-page jump — no reload.
        -->
        <a
          v-for="section in sections"
          :key="section.id"
          class="link"
          :class="{ active: section.id === props.activeId }"
          :href="`/#${section.id}`"
        >
          {{ t(section.labelKey) }}
        </a>
      </nav>

      <span class="divider" aria-hidden="true" />

      <div class="controls desktop">
        <AppearanceControl />
        <button class="lang-btn" type="button" :aria-label="`${lang.toUpperCase()} — ${t('a11y.toggleLang')}`" @click="toggleLang">
          {{ lang.toUpperCase() }}
        </button>
        <a class="cta" :href="`mailto:${email}`">{{ t('actions.talk') }}</a>
      </div>

      <div class="controls mobile">
        <button
          class="menu-btn"
          type="button"
          :aria-label="props.menuOpen ? t('a11y.closeMenu') : t('a11y.openMenu')"
          :aria-expanded="props.menuOpen"
          @click="$emit('toggle-menu')"
        >
          <svg v-if="props.menuOpen" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
          <svg v-else viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <circle cx="8" cy="8" r="2.5" />
            <circle cx="16" cy="8" r="2.5" />
            <circle cx="8" cy="16" r="2.5" />
            <circle cx="16" cy="16" r="2.5" />
          </svg>
        </button>
        <AppearanceControl />
        <button class="lang-btn" type="button" :aria-label="`${lang.toUpperCase()} — ${t('a11y.toggleLang')}`" @click="toggleLang">
          {{ lang.toUpperCase() }}
        </button>
      </div>
    </div>
  </header>
</template>

<style scoped>
.bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  display: flex;
  justify-content: center;
  /* The side insets are the notch in landscape; 0 everywhere else. */
  /* Longhand for the same reason as the footer: a shorthand that fails to
     parse takes the vertical padding down with it. */
  padding-top: 14px;
  padding-bottom: 14px;
  padding-right: calc(clamp(14px, 4vw, 40px) + env(safe-area-inset-right, 0px));
  padding-left: calc(clamp(14px, 4vw, 40px) + env(safe-area-inset-left, 0px));
}

.capsule {
  box-sizing: border-box;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  padding: 12px 16px;
  border: 1px solid transparent;
  border-radius: 16px;
  background: transparent;
  transition:
    max-width 0.55s cubic-bezier(0.22, 1, 0.36, 1),
    padding 0.55s cubic-bezier(0.22, 1, 0.36, 1),
    gap 0.55s cubic-bezier(0.22, 1, 0.36, 1),
    background-color 0.45s ease,
    border-color 0.45s ease;
}

.capsule.compact {
  padding: 8px 12px;
  background: color-mix(in srgb, var(--surface) 84%, transparent);
  backdrop-filter: blur(14px);
  border-color: var(--line);
}

.brand {
  display: flex;
  align-items: baseline;
  gap: 2px;
  flex: 0 0 auto;
}

.brand-logo {
  transform: translateY(2px);
}

.brand-dev {
  font-family: var(--font-mono);
  font-size: 15px;
  font-weight: 500;
  letter-spacing: -0.02em;
  color: var(--fg);
}

/* The dividers only make sense once the capsule has a background to divide. */
.divider {
  display: block;
  width: 1px;
  height: 22px;
  background: var(--line);
  flex: 0 0 auto;
  opacity: 0;
  transition: opacity 0.45s ease;
}

.compact .divider {
  opacity: 1;
}

.links {
  display: flex;
  align-items: center;
  gap: 24px;
  font-family: var(--font-mono);
  font-size: 13px;
}

/*
  The inactive colour is set explicitly rather than left alone: the global rule
  in tokens.css paints every <a> yellow, so "not active" has to be stated.
*/
/*
  nowrap is not cosmetic. When the language switches, the capsule is still at
  the width measured for the previous language for one frame; Spanish is wider,
  so the links used to break mid-path — "/" on one line and the section name
  underneath. A nav label is a path, not a sentence: it should never wrap, and
  saying so removes the glitch at its source rather than racing the measurement.
*/
.link {
  color: var(--fg-2);
  white-space: nowrap;
  transition: color 0.16s ease;
}

.link:hover,
.link.active {
  color: var(--acc-text);
}

.controls {
  align-items: center;
  flex: 0 0 auto;
}

.desktop {
  display: flex;
  gap: 9px;
}

.mobile {
  display: none;
  gap: 8px;
}

.lang-btn,
.menu-btn {
  height: 36px;
  border-radius: 10px;
  background: transparent;
  border: 1px solid var(--line);
  color: var(--fg);
  cursor: pointer;
  transition:
    background-color 0.16s ease,
    border-color 0.16s ease,
    color 0.16s ease;
}

.lang-btn {
  padding: 0 12px;
  font-family: var(--font-mono);
  font-size: 12px;
  letter-spacing: 0.1em;
}

.lang-btn:hover {
  border-color: var(--acc-text);
  color: var(--acc-text);
}

.menu-btn {
  width: 36px;
  background: var(--acc);
  color: var(--on-acc);
  border-color: var(--acc);
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
}

.menu-btn svg {
  width: 17px;
  height: 17px;
}

.cta {
  background: var(--acc);
  color: var(--on-acc);
  border-radius: 10px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
  transition: background-color 0.16s ease;
}

.cta:hover {
  background: var(--acc-2);
  color: var(--on-acc);
}

@media (max-width: 900px) {
  .links,
  .divider,
  .desktop {
    display: none;
  }

  .mobile {
    display: flex;
  }
}
</style>
