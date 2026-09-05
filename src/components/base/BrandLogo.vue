<script setup>
/*
  The krub logo.

  It is the PNG used as a CSS mask over a var(--mark) background, not an <img>.
  That is what makes one file work in both themes: yellow on dark, black on
  light. Its 1.682 aspect ratio is fixed by the asset.

  `height` is a number of pixels; width follows from the aspect ratio.
*/
defineProps({
  height: { type: Number, default: 22 },
  opacity: { type: Number, default: 1 },
})
</script>

<template>
  <span class="logo" :style="{ height: `${height}px`, opacity }" />
</template>

<style scoped>
.logo {
  display: inline-block;
  aspect-ratio: 1.682;
  background: var(--mark);
  -webkit-mask: url('/assets/img/krub-mark.png') center / contain no-repeat;
  mask: url('/assets/img/krub-mark.png') center / contain no-repeat;
  transition: height 0.55s cubic-bezier(0.22, 1, 0.36, 1);
}
</style>
