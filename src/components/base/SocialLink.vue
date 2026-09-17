<script setup>
/*
  A 46px square social icon. Used in the Contact row and the mobile menu.

  The icons are inline SVG rather than files, for two reasons: they inherit
  currentColor, so the hover turns them yellow without a second asset, and they
  are single paths small enough that a network request would cost more than
  they weigh. The full-colour Devicon files in public/icons/ are a different
  job — those are the Stack grid.

  The button carries no text, so `name` becomes its aria-label. The SVG is
  aria-hidden: without that a screen reader would announce the graphic and then
  the label, twice.

  Adding a network: add an entry to src/data/socials.js AND a path here.
*/
defineProps({
  name: { type: String, required: true },
  href: { type: String, required: true },
  icon: { type: String, required: true }, // key into PATHS below
})

// Single-path glyphs, 24×24 viewBox.
const PATHS = {
  github:
    'M12 .5C5.73.5.9 5.33.9 11.6c0 4.9 3.17 9.06 7.57 10.53.55.1.76-.24.76-.53l-.02-1.86c-3.08.67-3.73-1.49-3.73-1.49-.5-1.28-1.23-1.62-1.23-1.62-1.01-.69.08-.67.08-.67 1.11.08 1.7 1.14 1.7 1.14.99 1.7 2.6 1.21 3.23.93.1-.72.39-1.21.7-1.49-2.46-.28-5.05-1.23-5.05-5.48 0-1.21.43-2.2 1.14-2.98-.11-.28-.49-1.41.11-2.94 0 0 .93-.3 3.05 1.14a10.6 10.6 0 0 1 5.55 0c2.12-1.44 3.05-1.14 3.05-1.14.6 1.53.22 2.66.11 2.94.71.78 1.14 1.77 1.14 2.98 0 4.26-2.6 5.2-5.07 5.47.4.35.76 1.03.76 2.08l-.01 3.08c0 .3.2.64.77.53 4.4-1.47 7.56-5.63 7.56-10.53C23.1 5.33 18.27.5 12 .5Z',
  linkedin:
    'M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.42v1.56h.05c.47-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13Zm1.78 13.02H3.55V9h3.57v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0Z',
}
</script>

<template>
  <a class="social" :href="href" :aria-label="name" target="_blank" rel="noopener" data-magnetic>
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
      <path :d="PATHS[icon]" />
    </svg>
  </a>
</template>

<style scoped>
.social {
  width: 46px;
  height: 46px;
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--line);
  border-radius: 12px;
  color: var(--fg-2);
  transition:
    color 0.16s ease,
    border-color 0.16s ease,
    background-color 0.16s ease;
}

.social svg {
  width: 18px;
  height: 18px;
  display: block;
}

.social:hover {
  color: var(--acc-text);
  border-color: var(--acc-text);
}

/* Pressed state fills yellow: --acc is a fill here, so --on-acc goes on top. */
.social:active {
  background: var(--acc);
  border-color: var(--acc);
  color: var(--on-acc);
}
</style>
