<script setup>
/*
  The yellow band under the hero.

  The loop is seamless because the phrase list is rendered TWICE and the
  marquee keyframe translates exactly -50%. When the first copy has scrolled
  fully off, the second is sitting where the first started, so the reset is
  invisible. Change the number of copies and the -50% stops matching.

  The whole band is aria-hidden: it is a decorative ticker, and its content is
  already said elsewhere on the page.
*/
defineProps({
  items: { type: Array, required: true },
  separator: { type: String, default: '//' },
  duration: { type: String, default: '26s' },
})
</script>

<template>
  <div class="marquee" aria-hidden="true">
    <div class="track" data-motion="decorative" :style="{ animationDuration: duration }">
      <div v-for="copy in 2" :key="copy" class="run">
        <template v-for="(item, i) in items" :key="`${copy}-${i}`">
          <span>{{ item }}</span>
          <span>{{ separator }}</span>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.marquee {
  position: relative;
  z-index: 1;
  flex: 0 0 auto;
  background: var(--acc);
  color: var(--on-acc);
  overflow: hidden;
  padding: 13px 0;
  border-top: 1px solid var(--acc);
  border-bottom: 1px solid var(--acc);
}

.track {
  display: flex;
  width: max-content;
  animation: marquee 26s linear infinite;
  font-family: var(--font-mono);
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.22em;
  text-transform: uppercase;
}

.run {
  display: flex;
  gap: 38px;
  padding-right: 38px;
}
</style>
