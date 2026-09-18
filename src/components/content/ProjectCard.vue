<script setup>
/*
  One project card. Emits `open` — it does not know the modal exists.

  The whole card is clickable, but the button is only around the TITLE, then
  stretched over the card with an ::after overlay. That is the standard pattern
  for a fully-clickable card, and it is worth understanding why:

  Wrapping the entire card in one <button> works with a mouse and with a
  keyboard, but the control's accessible name becomes everything inside it —
  title, type label, summary, three technologies, read out as the name of a
  single button. Adding an aria-label fixes the announcement but then the
  visible text is no longer contained in the accessible name, which breaks
  WCAG 2.5.3 (Label in Name): someone using voice control says "click
  Showroom" and nothing matches.

  With the overlay the name is just the title, the summary stays ordinary
  readable text next to it, and the entire card surface is still a click
  target.
*/
import { useI18n } from 'vue-i18n'

const props = defineProps({
  name: { type: String, required: true },
  tag: { type: String, required: true },
  summary: { type: String, required: true },
  shotLabel: { type: String, default: '' },
  image: { type: String, default: null },
  stack: { type: Array, default: () => [] },
  // True for the card the rail is parked on. Only read where there is no hover:
  // it is what marks the position there instead.
  current: { type: Boolean, default: false },
})

defineEmits(['open'])

const { t } = useI18n()
</script>

<template>
  <article class="card" :class="{ current }" data-magnetic>
    <div class="shot">
      <img v-if="image" :src="image" :alt="name" class="shot-img" />
      <span v-else class="shot-label">{{ shotLabel }}</span>
    </div>

    <div class="body">
      <div class="title-row">
        <h3 class="title">
          <button
            class="open"
            type="button"
            :aria-label="t('a11y.openProject', { name: props.name })"
            @click="$emit('open')"
          >
            {{ name }}
          </button>
        </h3>
        <span class="tag">{{ tag }}</span>
      </div>

      <p class="summary">{{ summary }}</p>

      <div class="foot">
        <span class="stack">{{ stack.slice(0, 3).join(' · ') }}</span>
        <span class="arrow" aria-hidden="true">↗</span>
      </div>
    </div>
  </article>
</template>

<style scoped>
.card {
  position: relative;
  border: 1px solid var(--line);
  border-radius: 18px;
  background: var(--surface);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: border-color 0.16s ease;
}

/*
  Hover only where there is a hover. On a phone a tap leaves `:hover` stuck on
  whatever was touched, so a card kept its yellow border after being opened and
  the next tap lit a different one — the marker was there or not depending on
  where you last put your finger.
*/
@media (hover: hover) {
  .card:hover {
    border-color: var(--acc-text);
  }

  .card:hover .arrow {
    background: var(--acc);
    border-color: var(--acc);
    color: var(--on-acc);
  }
}

/*
  And where there is no hover, the same border marks where you are instead: the
  card the rail is parked on, moving as you scroll the rail rather than as you
  touch it. The arrow fills with it too — it is the same "this is the one"
  treatment, and leaving the fill behind in the hover block made the marker look
  half-applied on a phone.
*/
@media (hover: none) {
  .card.current {
    border-color: var(--acc-text);
  }

  .card.current .arrow {
    background: var(--acc);
    border-color: var(--acc);
    color: var(--on-acc);
  }
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
  margin: 0;
  font-size: 19px;
  font-weight: 600;
  color: var(--fg);
}

/* Strip the button back to plain text so the title still looks like a title. */
.open {
  padding: 0;
  border: 0;
  background: none;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
}

/*
  This is what makes the whole card clickable while the button stays around
  the title alone. The overlay is transparent and sits over everything, so a
  click anywhere on the card lands on this button.
*/
.open::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 1;
}

/* Without this the focus ring would trace the invisible overlay — the whole
   card — instead of the title. Ring on the title, click target everywhere. */
.open:focus-visible::after {
  display: none;
}

.tag {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.1em;
  color: var(--acc-text);
  white-space: nowrap;
}

.summary {
  margin: 0;
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
</style>
