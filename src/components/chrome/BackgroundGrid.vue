<script setup>
/*
  The faint 72px grid behind everything. Two instances, crossfading into each
  other as you leave the hero.

  Why two layers rather than one that changes: they are positioned differently
  and cannot be the same element.

  - 'hero' is absolute and exactly one viewport tall. It scrolls away with the
    page, so the grid feels attached to the hero.
  - 'global' is fixed, runs from the top down to the footer, and carries a mask
    that fades it out toward the bottom. It stays put while the page moves, so
    it reads as the paper the site is printed on.

  Both are aria-hidden and pointer-events:none: they are texture, not content,
  and nothing should be able to click or read them.
*/
defineProps({
  variant: { type: String, default: 'global' }, // 'hero' | 'global' | 'page'
  size: { type: Number, default: 72 },
  visible: { type: Boolean, default: true },
})
</script>

<template>
  <div
    class="bg-grid"
    :class="[variant, { visible }]"
    :style="{ backgroundSize: `${size}px ${size}px` }"
    data-motion="decorative"
    aria-hidden="true"
  />
</template>

<style scoped>
.bg-grid {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 0;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.35s ease;
  background-image: linear-gradient(var(--grid) 1px, transparent 1px),
    linear-gradient(90deg, var(--grid) 1px, transparent 1px);
}

.bg-grid.visible {
  opacity: 1;
}

.hero {
  height: 100svh;
}

/*
  The whole document, absolute and with no fade: one grid that scrolls with the
  content, top to bottom. It is what the design-system sheet wears — there is no
  hero to leave behind there, so there is nothing to crossfade into and no reason
  for a second layer.
*/
.page {
  height: 100%;
}

/*
  Stops at the footer rather than running under it, and fades out downward so
  the grid never competes with the text in the lower half of a section. The
  mask is the same gradient the design spec specifies.

  The #000 stops are not a colour and are not a token candidate: in a mask,
  what matters is the alpha channel, and #000 simply means "fully opaque here".
  Swapping it for var(--ink) would change nothing visually and would suggest a
  relationship to the theme that does not exist.
*/
.global {
  position: fixed;
  bottom: var(--footer-h, 52px);
  -webkit-mask: linear-gradient(#000 0%, #000 15%, transparent 65%);
  mask: linear-gradient(#000 0%, #000 15%, transparent 65%);
}
</style>
