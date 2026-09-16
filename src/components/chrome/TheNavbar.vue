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
import DotsIcon from '../base/DotsIcon.vue'
import LangButton from '../base/LangButton.vue'
import SettingsMenu from './SettingsMenu.vue'
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
const { lang } = useLang()
const { y } = useScroll()

const capsule = ref(null)
const narrowWidth = ref(null)
const wideWidth = ref(null)

/*
  The bar is fixed, so the hero has to pad itself past it or the name lands
  underneath — which is exactly what happened on a phone, where the padding was
  a hardcoded number two pixels short of the bar's real height and the compact
  state changes that height as you scroll.
*/
const bar = ref(null)
useElementHeight(bar, '--navbar-h')

const compact = computed(() => y.value > 60)
const maxWidth = computed(() => {
  if (compact.value && narrowWidth.value) return `${narrowWidth.value}px`
  return wideWidth.value ? `${wideWidth.value}px` : '1180px'
})

/*
  The compact capsule is a different strip of DOM: the controls are handed over
  — to the settings button on desktop, to nothing but the menu on a phone — so
  the measurement has to be taken with the capsule in its compact state. That is
  why it adds the class for one frame, with transitions off.

  It measures two numbers. The narrow one is the compact capsule's content
  width. The wide one is what the capsule occupies when it is not compact: the
  viewport minus the gutters, capped at 1180. The wide number is what makes the
  return to the top animate on a narrow screen — there `width:100%` sits below
  1180, so `max-width:1180px` never binds and the change would otherwise jump.
*/
function measureNatural() {
  const el = capsule.value
  if (!el) return

  const previous = el.getAttribute('style') ?? ''
  const wasCompact = el.classList.contains('compact')

  el.style.transition = 'none'

  // Wide: no compact class, width 100%, the bar's own padding.
  if (wasCompact) el.classList.remove('compact')
  el.style.maxWidth = '1180px'
  el.style.width = '100%'
  el.style.padding = ''
  const wide = el.getBoundingClientRect().width

  // Narrow: the class swaps the controls, and the width is the content's.
  el.classList.add('compact')
  el.style.maxWidth = 'none'
  el.style.width = 'auto'
  el.style.padding = '8px 12px'
  const narrow = el.getBoundingClientRect().width

  el.setAttribute('style', previous)
  if (!wasCompact) el.classList.remove('compact')
  void el.offsetWidth // flush the restore before transitions come back
  narrowWidth.value = Math.ceil(narrow)
  wideWidth.value = Math.ceil(wide)
}

/*
  A resize changes the wide width, and with a transition on max-width that would
  animate the capsule while the window is dragged. The class turns the
  transition off for the one frame the new value lands in.
*/
function onResize() {
  const el = capsule.value
  if (!el) return
  el.classList.add('no-transition')
  measureNatural()
  requestAnimationFrame(() => el.classList.remove('no-transition'))
}

onMounted(() => {
  measureNatural()
  window.addEventListener('resize', onResize)

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

onUnmounted(() => window.removeEventListener('resize', onResize))

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
        <div class="full">
          <AppearanceControl />
          <LangButton />
        </div>
        <SettingsMenu class="settings" :visible="compact" />
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
          <DotsIcon :open="props.menuOpen" />
        </button>
        <!-- Hidden once the capsule compacts; the menu carries them then. -->
        <div class="full">
          <AppearanceControl />
          <LangButton />
        </div>
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

.full {
  display: flex;
  align-items: center;
  gap: 9px;
}

/* Compact: the controls are handed over — to the settings button on desktop, to
   the menu on a phone — so the capsule can shrink to the brand and the rest. */
.capsule.compact .full {
  display: none;
}

.settings {
  display: none;
}

.capsule.compact .settings {
  display: block;
}

/* A resize changes the measured widths; the transition is off for that one
   frame so the capsule does not animate while the window is dragged. */
.capsule.no-transition {
  transition: none !important;
}

.menu-btn {
  width: 36px;
  height: 36px;
  /* A button ships a 1px 6px padding from the browser, and box-sizing:
     border-box, which leaves a 22px content box — narrow enough that a 30px
     icon gets shrunk by the flex layout. Zero it and the icon has the full
     34px. */
  padding: 0;
  border-radius: 10px;
  background: var(--acc);
  color: var(--on-acc);
  border: 1px solid var(--acc);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  transition:
    background-color 0.16s ease,
    border-color 0.16s ease,
    color 0.16s ease;
}

.menu-btn svg {
  width: 30px;
  height: 30px;
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
