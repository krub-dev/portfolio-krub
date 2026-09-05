<script setup>
/*
  One row of the experience / education timeline.

  Rows draw only a top border; the last one adds a bottom border too, so the
  list closes without every row doubling its neighbour's line. That is what
  `isLast` is for — the parent knows the length, the row does not.

  A current period paints its years in --acc-text rather than --acc: this is
  12px mono text on the page background, which is exactly the case that needs
  the darker yellow in the light theme.
*/
defineProps({
  period: { type: String, required: true }, // '2024 — now', '2018 — 2024', '2025'
  current: { type: Boolean, default: false },
  title: { type: String, required: true },
  body: { type: String, required: true },
  isLast: { type: Boolean, default: false },
})
</script>

<template>
  <div class="row" :class="{ last: isLast }">
    <span class="period" :class="{ current }">{{ period }}</span>
    <div class="content">
      <p class="title">{{ title }}</p>
      <p class="body">{{ body }}</p>
    </div>
  </div>
</template>

<style scoped>
.row {
  display: grid;
  grid-template-columns: minmax(90px, 130px) 1fr;
  gap: clamp(14px, 3vw, 32px);
  padding: 22px 0;
  border-top: 1px solid var(--line);
}

.row.last {
  border-bottom: 1px solid var(--line);
}

.period {
  font-family: var(--font-mono);
  font-size: 12px;
  letter-spacing: 0.06em;
  color: var(--fg-3);
}

.period.current {
  color: var(--acc-text);
}

.content {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--fg);
}

.body {
  margin: 0;
  max-width: 60ch;
  font-size: 15px;
  line-height: 1.55;
  color: var(--fg-2);
  text-wrap: pretty;
}

@media (max-width: 900px) {
  .row {
    grid-template-columns: 1fr;
    gap: 8px;
  }
}
</style>
