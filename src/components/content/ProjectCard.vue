<script setup>
/*
  One project card. Emits `open` — it does not know the modal exists.

  The whole card is clickable, so the accessible name and the keyboard path go
  on a real <button> wrapping the content rather than a click handler on an
  <article>. A div with @click is invisible to keyboard and screen-reader
  users; this way Tab reaches it and Enter opens it, for free.

  The striped frame is a placeholder. Once `image` is set on the entry in
  src/data/projects.js, the <img> renders instead and shotLabel is ignored.
*/
defineProps({
  name: { type: String, required: true },
  tag: { type: String, required: true },
  summary: { type: String, required: true },
  shotLabel: { type: String, default: '' },
  image: { type: String, default: null },
  stack: { type: Array, default: () => [] },
})

defineEmits(['open'])
</script>

<template>
  <article class="card">
    <button class="hit" type="button" data-magnetic @click="$emit('open')">
      <span class="shot">
        <img v-if="image" :src="image" :alt="name" class="shot-img" />
        <span v-else class="shot-label">{{ shotLabel }}</span>
      </span>

      <span class="body">
        <span class="title-row">
          <span class="title">{{ name }}</span>
          <span class="tag">{{ tag }}</span>
        </span>
        <span class="summary">{{ summary }}</span>

        <span class="foot">
          <span class="stack">{{ stack.slice(0, 3).join(' · ') }}</span>
          <span class="arrow" aria-hidden="true">↗</span>
        </span>
      </span>
    </button>
  </article>
</template>

<style scoped>
.card {
  border: 1px solid var(--line);
  border-radius: 18px;
  background: var(--surface);
  overflow: hidden;
  display: flex;
  transition: border-color 0.16s ease;
}

.card:hover {
  border-color: var(--acc-text);
}

/* Reset the button back to a plain block so it can be the card's shape. */
.hit {
  flex: 1;
  display: flex;
  flex-direction: column;
  text-align: left;
  padding: 0;
  border: 0;
  background: none;
  color: inherit;
  font: inherit;
  cursor: pointer;
}

.shot {
  display: flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 16 / 10;
  background: repeating-linear-gradient(
    135deg,
    var(--surface-2) 0 12px,
    var(--ink) 12px 24px
  );
}

.shot-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.shot-label {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.12em;
  color: var(--fg-3);
}

.body {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 11px;
  flex: 1;
}

.title-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 12px;
}

.title {
  font-size: 19px;
  font-weight: 600;
  color: var(--fg);
}

.tag {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.1em;
  color: var(--acc-text);
  white-space: nowrap;
}

.summary {
  font-size: 15px;
  line-height: 1.55;
  color: var(--fg-2);
}

.foot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-top: auto;
  padding-top: 16px;
  border-top: 1px solid var(--line);
}

.stack {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--fg-3);
}

/* The arrow is ↗, diagonal — not →. Settled design decision. */
.arrow {
  width: 30px;
  height: 30px;
  flex: 0 0 auto;
  border-radius: 50%;
  border: 1px solid var(--line);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  color: var(--fg-2);
  transition:
    background-color 0.16s ease,
    border-color 0.16s ease,
    color 0.16s ease;
}

.card:hover .arrow {
  background: var(--acc);
  border-color: var(--acc);
  color: var(--on-acc);
}
</style>
