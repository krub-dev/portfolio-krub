<script setup>
/*
  Every button and button-shaped link on the site.

  Renders an <a> when given `href`, a <button> otherwise, so a link stays a
  link for keyboard and screen-reader users instead of being a div that
  happens to be clickable.

  Sizes map to real instances in the design spec:
    sm  14px  navbar CTA
    md  15px  CV button, secondary pills
    lg  18px  hero primary CTA
  Two instances in the spec sit a hair outside this scale (the contact CTA is
  19px / 12px 26px, the hero secondary is mono 15px / 14px 26px). Those
  sections override the padding in their own scoped styles rather than the
  scale growing a size for each one.
*/
defineProps({
  variant: { type: String, default: 'outline' }, // 'solid' | 'outline'
  shape: { type: String, default: 'pill' }, //     'pill' | 'square'
  size: { type: String, default: 'md' }, //        'sm' | 'md' | 'lg'
  mono: { type: Boolean, default: false },
  href: { type: String, default: null },
  external: { type: Boolean, default: false },
  magnetic: { type: Boolean, default: false },
})

defineEmits(['click'])
</script>

<template>
  <component
    :is="href ? 'a' : 'button'"
    :href="href || undefined"
    :type="href ? undefined : 'button'"
    :target="href && external ? '_blank' : undefined"
    :rel="href && external ? 'noopener' : undefined"
    :data-magnetic="magnetic ? '' : undefined"
    class="btn"
    :class="[`v-${variant}`, `s-${shape}`, `z-${size}`, { mono }]"
    @click="$emit('click', $event)"
  >
    <slot />
  </component>
</template>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 1px solid transparent;
  cursor: pointer;
  font-family: var(--font-sans);
  font-weight: 600;
  text-decoration: none;
  white-space: nowrap;
  transition:
    background-color 0.16s ease,
    border-color 0.16s ease,
    color 0.16s ease;
}

.btn.mono {
  font-family: var(--font-mono);
  font-weight: 500;
}

/* Shape */
.s-pill {
  border-radius: 999px;
}

.s-square {
  border-radius: 10px;
}

/* Size */
.z-sm {
  font-size: 14px;
  padding: 9px 16px;
}

.z-md {
  font-size: 15px;
  padding: 13px 24px;
}

.z-lg {
  font-size: 18px;
  padding: 11px 24px;
}

/*
  Solid uses --acc: it is a FILL, so the brand yellow is correct in both themes
  and --on-acc sits on top. Outline is text on the page, so its hover colour is
  --acc-text, which darkens in the light theme. See docs/decisions.md.
*/
.v-solid {
  background: var(--acc);
  color: var(--on-acc);
  border-color: var(--acc);
}

.v-solid:hover {
  background: var(--acc-2);
  border-color: var(--acc-2);
}

.v-outline {
  background: transparent;
  color: var(--fg);
  border-color: var(--line);
}

.v-outline:hover {
  color: var(--acc-text);
  border-color: var(--acc-text);
}
</style>
