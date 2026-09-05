<script setup>
/*
  One 44px tile in the Stack grid.

  Two layouts, because the icons come in two kinds:

  - Full-colour logos (Vue, Java, Docker…) fill the tile at 44px with 8px of
    padding. box-sizing:border-box here is deliberate and local — the project
    has no global border-box, so without it the padding would push the tile to
    60px. See docs/decisions.md.

  - Dark monochrome logos (Express, Prisma, Three.js, GitHub, Linux) would
    disappear against --surface-2 in the dark theme. They render at 28px inside
    a flex tile and get inverted by the global [data-invert-dark] rule, which
    is switched off again in the light theme.
*/
defineProps({
  name: { type: String, required: true },
  src: { type: String, required: true },
  invertOnDark: { type: Boolean, default: false },
})
</script>

<template>
  <span v-if="invertOnDark" class="tile flex">
    <img :src="src" :alt="name" :title="name" width="28" height="28" data-invert-dark class="mono-icon" />
  </span>
  <img v-else :src="src" :alt="name" :title="name" width="44" height="44" class="tile padded" />
</template>

<style scoped>
.tile {
  width: 44px;
  height: 44px;
  flex: 0 0 auto;
  border-radius: 10px;
  background: var(--surface-2);
  border: 1px solid var(--line);
}

.padded {
  padding: 8px;
  box-sizing: border-box;
  display: block;
}

.flex {
  display: flex;
  align-items: center;
  justify-content: center;
}

.mono-icon {
  width: 28px;
  height: 28px;
  display: block;
}
</style>
