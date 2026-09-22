<script setup>
/*
  Every button and button-shaped link on the site.

  Renders a <button> by default, an <a> when given `href`, and a RouterLink when
  given `to` — so an internal link is a real SPA navigation, and a link is always
  a real link for keyboard and screen-reader users rather than a div that happens
  to be clickable.

  Sizes map to real instances in the design spec:
    sm  14px  navbar CTA
    md  15px  CV button, secondary pills
    lg  18px  hero primary CTA
  Two instances in the spec sit a hair outside this scale (the contact CTA is
  19px / 12px 26px, the hero secondary is mono 15px / 14px 26px). Those
  sections override the padding in their own scoped styles rather than the
  scale growing a size for each one.
*/
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

const props = defineProps({
  variant: { type: String, default: 'outline' }, // 'solid' | 'outline'
  shape: { type: String, default: 'pill' }, //     'pill' | 'square'
  size: { type: String, default: 'md' }, //        'sm' | 'md' | 'lg'
  mono: { type: Boolean, default: false },
  href: { type: String, default: null },
  to: { type: String, default: null }, // internal route, navigated without a reload
  external: { type: Boolean, default: false },
  magnetic: { type: Boolean, default: false },
  // Only the <button> branch uses it, and only a form needs anything but 'button'.
  type: { type: String, default: 'button' },
})

const emit = defineEmits(['click'])

const classes = computed(() => [
  `v-${props.variant}`,
  `s-${props.shape}`,
  `z-${props.size}`,
  { mono: props.mono },
])

const magneticAttr = computed(() => (props.magnetic ? '' : undefined))
</script>

<!--
  Three elements rather than one `<component :is>`: the dynamic form rendered
  the RouterLink without the `to` reaching it, and the explicit branches are
  easier to read anyway. Order matters — `to` wins over `href` over a button.
-->
<template>
  <RouterLink
    v-if="to"
    :to="to"
    class="btn"
    :class="classes"
    :data-magnetic="magneticAttr"
    @click="emit('click', $event)"
  >
    <slot />
  </RouterLink>

  <a
    v-else-if="href"
    :href="href"
    :target="external ? '_blank' : undefined"
    :rel="external ? 'noopener' : undefined"
    class="btn"
    :class="classes"
    :data-magnetic="magneticAttr"
    @click="emit('click', $event)"
  >
    <slot />
  </a>

  <button
    v-else
    :type="type"
    class="btn"
    :class="classes"
    :data-magnetic="magneticAttr"
    @click="emit('click', $event)"
  >
    <slot />
  </button>
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

/* Shape. The pill is a rounded rectangle now, not a capsule: fully-round
   buttons read as the default AI shape. */
.s-pill {
  border-radius: 10px;
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
