<script setup>
/*
  The appearance control: the theme toggle and the accent, side by side.

  One rounded box, two segments and a divider. The first is the ◐ button — one
  click alternates dark and light. The second is a disc split between the accent
  and its hover tone; one click moves to the next palette and the disc changes
  with it. No dropdown: the list is short and ordered, so one press per colour is
  simpler than opening and closing a panel.

  The aria-label names the current palette, since the disc has no visible text.
*/
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { useAccent } from '../../composables/useAccent'
import { useTheme } from '../../composables/useTheme'

const { t } = useI18n()
const { toggle: toggleTheme } = useTheme()
const { accent, cycle } = useAccent()

const name = computed(() => t(`accent.${accent.value}`))
</script>

<template>
  <div class="appearance">
    <div class="segments">
      <button
        class="seg seg-theme"
        type="button"
        :aria-label="t('a11y.toggleTheme')"
        :title="t('a11y.toggleTheme')"
        @click="toggleTheme"
      >
        <span class="glyph" aria-hidden="true">◐</span>
      </button>

      <span class="divider" aria-hidden="true" />

      <button
        class="seg seg-accent"
        type="button"
        :aria-label="`${t('accent.label')}: ${name}`"
        :title="`${t('accent.label')}: ${name}`"
        @click="cycle"
      >
        <span class="disc" aria-hidden="true" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.segments {
  display: flex;
  align-items: center;
  height: 36px;
  border: 1px solid var(--line);
  border-radius: 10px;
  transition: border-color 0.16s ease;
}

/* The hover the language button has: the frame and the glyphs turn to the
   accent, and the circle grows a little. */
.segments:hover {
  border-color: var(--acc-text);
}

.seg {
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  background: none;
  border: 0;
  cursor: pointer;
  color: var(--fg-2);
  transition: color 0.16s ease;
}

.seg:hover {
  color: var(--acc-text);
}

.seg-theme {
  font-size: 15px;
}

.glyph,
.disc {
  display: block;
  transition: transform 0.16s ease;
}

.seg-theme:hover .glyph,
.seg-accent:hover .disc {
  transform: scale(1.18);
}

/* The accent and its hover tone, in one face. It changes as the palette does. */
.disc {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--acc) 0 50%, var(--acc-2) 50% 100%);
}

.divider {
  width: 1px;
  height: 18px;
  flex: 0 0 auto;
  background: var(--line);
}

/* Hover colours stay under reduced motion (decision 25); the circle simply does
   not grow. */
@media (prefers-reduced-motion: reduce) {
  .glyph,
  .disc {
    transition: none;
  }

  .seg-theme:hover .glyph,
  .seg-accent:hover .disc {
    transform: none;
  }
}
</style>
