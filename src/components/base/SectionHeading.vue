<script setup>
/*
  The heading pattern shared by every section: a giant translucent number
  behind, the mono title in front.

  The overlap is deliberate — the number is decorative, sits at z-index 0 with
  pointer-events:none, and is aria-hidden so a screen reader reads the title
  and nothing else. It keeps var(--acc) rather than --acc-text: its legibility
  is governed by --sec-idx (.16 dark, .62 light), and it is not read as text.
*/
defineProps({
  index: { type: String, default: null }, // '00'…'03', or null for no number
  title: { type: String, required: true }, // already translated
  count: { type: Number, default: null }, // yellow superscript, projects only
  // Sections are h2 under the hero's h1. A page that has no hero — the 404 —
  // has nothing above, so its heading is the h1.
  level: { type: String, default: 'h2' },
})
</script>

<template>
  <div class="heading">
    <span v-if="index" class="index" aria-hidden="true">[{{ index }}]</span>
    <component :is="level" class="title">
      {{ title }}<sup v-if="count !== null" class="count">{{ count }}</sup>
    </component>
  </div>
</template>

<style scoped>
.heading {
  position: relative;
}

.index {
  position: absolute;
  left: -8px;
  bottom: -0.14em;
  z-index: 0;
  pointer-events: none;
  white-space: nowrap;
  font-family: var(--font-mono);
  font-size: clamp(48px, 6vw, 74px);
  font-weight: 700;
  letter-spacing: -0.05em;
  color: var(--acc);
  opacity: var(--sec-idx);
}

.title {
  position: relative;
  z-index: 1;
  margin: 0;
  font-family: var(--font-mono);
  font-size: clamp(22px, 2.6vw, 30px);
  font-weight: 500;
  color: var(--fg);
}

.count {
  font-size: 0.4em;
  font-weight: 700;
  color: var(--acc-text);
  vertical-align: super;
}
</style>
