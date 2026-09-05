<script setup>
/*
  One of the four Stack groups: a mono label with a rule under it, then the
  icons wrapping below.
*/
import TechIcon from './TechIcon.vue'

defineProps({
  label: { type: String, required: true }, // already translated
  items: { type: Array, default: () => [] }, // [{ name, icon, invertOnDark }]
})
</script>

<template>
  <div class="group">
    <p class="label">{{ label }}</p>
    <div class="icons">
      <TechIcon
        v-for="item in items"
        :key="item.name"
        :name="item.name"
        :src="item.icon"
        :invert-on-dark="item.invertOnDark"
      />
    </div>
  </div>
</template>

<style scoped>
.group {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.label {
  margin: 0;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--line);
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--fg-3);
}

.icons {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
</style>
