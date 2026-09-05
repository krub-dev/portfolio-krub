<script setup>
/*
  One testimonial. <figure>/<blockquote>/<figcaption> rather than divs, so the
  quote is marked up as a quote and the attribution is tied to it.
*/
defineProps({
  quote: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, required: true },
  avatar: { type: String, default: null },
})
</script>

<template>
  <figure class="card">
    <blockquote class="quote">{{ quote }}</blockquote>
    <figcaption class="who">
      <img v-if="avatar" :src="avatar" :alt="name" class="avatar" />
      <span v-else class="avatar placeholder" aria-hidden="true" />
      <span class="who-text">
        <span class="name">{{ name }}</span>
        <span class="role">{{ role }}</span>
      </span>
    </figcaption>
  </figure>
</template>

<style scoped>
.card {
  margin: 0;
  border: 1px solid var(--line);
  border-radius: 18px;
  background: var(--surface);
  padding: 26px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.quote {
  margin: 0;
  font-size: 17px;
  line-height: 1.55;
  color: var(--fg);
}

.who {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: auto;
}

.avatar {
  width: 36px;
  height: 36px;
  flex: 0 0 auto;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid var(--line);
}

.placeholder {
  background: var(--surface-2);
}

.who-text {
  display: flex;
  flex-direction: column;
}

.name {
  font-size: 14px;
  font-weight: 600;
  color: var(--fg);
}

.role {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--fg-3);
}
</style>
