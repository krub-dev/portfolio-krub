<script setup>
/*
  One testimonial. <figure>/<blockquote>/<figcaption> rather than divs, so the
  quote is marked up as a quote and the attribution is tied to it.

  No card. As a box with a border it read as another grid of projects sitting
  under the projects — the same shape twice, saying different things. The site
  already has a way of listing things that are not cards: text, a mono label and
  a rule between entries, which is what the timeline in About and the contact
  rows do. See docs/decisions.md 56.
*/
defineProps({
  quote: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, required: true },
  avatar: { type: String, default: null },
})
</script>

<template>
  <figure class="entry">
    <blockquote class="quote">{{ quote }}</blockquote>
    <figcaption class="who">
      <img v-if="avatar" :src="avatar" :alt="name" class="avatar" />
      <span v-else class="avatar placeholder" aria-hidden="true" />
      <span class="name">{{ name }}</span>
      <span class="role">{{ role }}</span>
    </figcaption>
  </figure>
</template>

<style scoped>
.entry {
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: clamp(20px, 3vw, 28px) 0;
  border-bottom: 1px solid var(--line);
}

.quote {
  margin: 0;
  max-width: 62ch;
  font-size: clamp(18px, 2vw, 23px);
  line-height: 1.5;
  letter-spacing: -0.01em;
  color: var(--fg);
  text-wrap: pretty;
}

.who {
  display: flex;
  align-items: center;
  gap: 10px;
}

.avatar {
  width: 28px;
  height: 28px;
  flex: 0 0 auto;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid var(--line);
}

.placeholder {
  background: var(--surface-2);
}

/* The same mono the site uses for every other piece of metadata. */
.name {
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--fg-2);
}

.role {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--fg-3);
}
</style>
