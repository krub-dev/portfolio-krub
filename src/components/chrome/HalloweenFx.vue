<script setup>
/*
  The seasonal layer, mounted once in App.vue behind the config switch.

  It stamps data-season="halloween" on <html> while the season is on (the orange
  accent, per useSeason), takes it off when it is not, and draws the pieces of the
  theme that are fixed to the page rather than to a section — today the two
  corner webs. Every seasonal style hangs off that one attribute, so this
  component is the whole wiring: no page component knows the season exists. The
  stylesheet is imported here on purpose — it ships and dies with this component.

  Removing Halloween: delete this component, styles/halloween.css, the config
  line, and the two `season` flags in the data. Nothing else refers to it.
*/
import { onBeforeUnmount, watchEffect } from 'vue'

import { useSeason } from '../../composables/useSeason'
import SeasonDark from './SeasonDark.vue'
import SeasonGhost from './SeasonGhost.vue'
import '../../styles/halloween.css'

const { season } = useSeason()

watchEffect(() => {
  const root = document.documentElement
  if (season.value) root.setAttribute('data-season', season.value)
  else root.removeAttribute('data-season')
})

// Leave nothing behind if the app tears down mid-season.
onBeforeUnmount(() => document.documentElement.removeAttribute('data-season'))
</script>

<template>
  <slot />

  <!--
    A web in each top corner, over the page while the season is on. They are
    MASKED, not drawn: the asset is a black bitmap trace, and masking it against
    a token is what lets the web follow the theme (and stay faint). Static, so
    there is nothing to switch off for reduced motion.
  -->
  <template v-if="season === 'halloween'">
    <span class="web web-left" aria-hidden="true" />
    <span class="web web-right" aria-hidden="true" />
    <span class="web web-bottom" aria-hidden="true" />
    <SeasonGhost />
    <SeasonDark />
  </template>
</template>

<style scoped>
.web {
  position: fixed;
  top: 0;
  /* The right web is the smaller of the two; the left one overrides this. */
  width: clamp(150px, 20vw, 240px);
  aspect-ratio: 1;
  /*
    Above the sections (z-index 1) so it sits on the content, below the chrome
    (the navbar at 100) so it never covers a control. Pointer events off: it is
    texture, and nothing should click it.
  */
  z-index: 2;
  pointer-events: none;
  background: color-mix(in srgb, var(--fg) 13%, transparent);
  -webkit-mask: url('/assets/img/themeHalloween/spider-web.svg') top left / contain no-repeat;
  mask: url('/assets/img/themeHalloween/spider-web.svg') top left / contain no-repeat;
}

/* The left web is the bigger one on purpose, so the two corners read as a pair
   rather than as a copy of each other. */
.web-left {
  left: 0;
  width: clamp(200px, 27vw, 340px);
}

/* Mirrored, so the two corners read as a pair rather than as a copy. */
.web-right {
  right: 0;
  transform: scaleX(-1);
}

/*
  The foot of the page: one web edge to edge, sitting just above the fixed
  footer. Unlike the two corners it is not fixed — it belongs to the bottom of
  the document, so it is only there once you have scrolled down to it. The mask
  fills the box, so the web's own bottom edge spans the full width and touches
  both sides.
*/
.web-bottom {
  position: absolute;
  top: auto;
  right: auto;
  /* Just a touch below the footer's top edge, so the web's own bottom line is
     swallowed by the band without the webs themselves dropping out of sight. */
  bottom: calc(var(--footer-h, 52px) - 9px);
  left: 50%;
  width: clamp(450px, 102vw, 1660px);
  height: clamp(220px, 52vh, 620px);
  aspect-ratio: auto;
  transform: translateX(-50%);
  /*
    The asset is drawn full width at the foot with its webs hanging from a line,
    so the line spans the box edge to edge. `auto` keeps the asset's own ratio;
    the box clips the empty top.
  */
  -webkit-mask: url('/assets/img/themeHalloween/spider-web-bottom.svg') bottom center / 100% auto
    no-repeat;
  mask: url('/assets/img/themeHalloween/spider-web-bottom.svg') bottom center / 100% auto no-repeat;
  background: color-mix(in srgb, var(--fg) 13%, transparent);
}

[data-theme='light'] .web-bottom {
  background: color-mix(in srgb, var(--fg) 42%, transparent);
}

/* Against the cream page a 13% web all but disappears, so the light theme
   carries a darker one. */
[data-theme='light'] .web {
  background: color-mix(in srgb, var(--fg) 42%, transparent);
}
</style>
