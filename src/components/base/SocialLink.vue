<script setup>
/*
  A 46px square social icon. Used in the Contact row and the mobile menu.

  The icons are inline SVG rather than files: they inherit currentColor, so the
  hover turns them accent without a second asset, and they are single paths small
  enough that a network request would cost more than they weigh. The paths live in
  src/data/socials.js, next to the entries they belong to, because the projects
  rail's last card draws the GitHub mark too.

  The button carries no text, so `name` becomes its aria-label. The SVG is
  aria-hidden: without that a screen reader would announce the graphic and then
  the label, twice.

  Adding a network: add an entry to src/data/socials.js AND a path to
  `socialIcons` in the same file.
*/
import { socialIcons } from '../../data/socials.js'

defineProps({
  name: { type: String, required: true },
  href: { type: String, required: true },
  icon: { type: String, required: true }, // key into socialIcons
})
</script>

<template>
  <a class="social" :href="href" :aria-label="name" target="_blank" rel="noopener" data-magnetic>
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
      <path :d="socialIcons[icon]" />
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
