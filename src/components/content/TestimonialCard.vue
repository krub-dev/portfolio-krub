<script setup>
/*
  One testimonial, as the pager's content: the attribution and the quote.
  <figure>/<blockquote>/<figcaption> rather than divs, so the quote is marked up
  as a quote and the attribution is tied to it.

  No box of its own — the pager's window is the box and every entry slides
  through it. As a grid of boxes these read as a second set of projects, which is
  what decision 56 was about; one window is not a grid.

  No clamp and no "read more" either. Those existed because a column of entries
  had to stay short; the pager shows one quote at a time and the window is sized
  to it, so there is nothing hidden to reveal.
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
    <figcaption class="who">
      <img v-if="avatar" :src="avatar" :alt="name" class="avatar" />
      <span v-else class="avatar" aria-hidden="true" />
      <span class="name">{{ name }}</span>
      <span class="role">{{ role }}</span>
    </figcaption>

    <blockquote class="quote">{{ quote }}</blockquote>
  </figure>
</template>

<style scoped>
.entry {
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
  /* Vertical padding only: the pager's window is the box, and the entries are
     stacked inside it with no gap, so this is what separates one quote from the
     next as it slides past. */
  padding: 22px 0;
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
  gap: 12px;
}

.avatar {
  width: 48px;
  height: 48px;
  flex: 0 0 auto;
  box-sizing: border-box;
  border-radius: 50%;
  /* contain, not cover: the one avatar here is a mark rather than a photograph,
     and cropping a logo cuts away the part that says who it is. Four pixels of
     padding and not six: the mark is a detailed drawing, and every pixel it
     gains is one it can be read at. */
  object-fit: contain;
  padding: 4px;
  background: var(--surface-2);
  border: 1px solid var(--line);
}

/* The same mono the site uses for every other piece of metadata, a step larger
   than the 10–11px labels: this one is read, not scanned. */
.name {
  font-family: var(--font-mono);
  font-size: 13px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--fg-2);
}

.role {
  font-family: var(--font-mono);
  font-size: 13px;
  color: var(--fg-3);
}
</style>
