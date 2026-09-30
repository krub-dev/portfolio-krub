<script setup>
/*
  The projects rail's last card, and not a project: it is the way out to GitHub
  for whatever did not fit in four cards.

  It borrows the project card's rhythm — a media slot on top, then the body and a
  foot with a hairline — so it reads as one of them, and the dashed border is what
  says it is not. That shared slot is also what makes the two the same height.

  The copy comes from src/data/ and the link's label from src/locales/, like
  everything else. The GitHub mark and its address are read from the socials, so
  the icon and the link cannot drift from the ones in Contact.
*/
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { useLang } from '../../composables/useLang'
import { copy, socialIcons, socials } from '../../data'

defineProps({
  // True where there is no hover: the marker the rail uses on a touch screen.
  current: { type: Boolean, default: false },
})

const { t } = useI18n()
const { lang } = useLang()

const text = computed(() => copy.projectsCta[lang.value])
const github = computed(() => socials.find((social) => social.icon === 'github'))

/*
  The mosaic behind the mark: a grid of rounded squares in the accent, at varying
  opacities, so the media slot is not an empty panel. Drawn as an SVG rather than
  in CSS because a gradient cannot round its own tiles, and the pattern is fixed
  rather than random so it is the same on every render.

  The colour is `--acc-solid`, the accent at full saturation: the same value in
  both themes, so what changes with the theme is the panel behind it, and what
  changes with the palette is the accent itself.
*/
const COLUMNS = 8
const ROWS = 5

const MOSAIC = Array.from({ length: COLUMNS * ROWS }, (_, i) => {
  const x = i % COLUMNS
  const y = Math.floor(i / COLUMNS)
  return {
    key: `${x}-${y}`,
    x: x + 0.07,
    y: y + 0.07,
    opacity: (0.07 + (((x * 3 + y * 5) % 7) / 7) * 0.45).toFixed(2),
  }
})
</script>

<template>
  <article class="cta" :class="{ current }" data-magnetic>
    <div class="mark-box">
      <svg class="mosaic" viewBox="0 0 8 5" preserveAspectRatio="none" aria-hidden="true">
        <rect
          v-for="tile in MOSAIC"
          :key="tile.key"
          :x="tile.x"
          :y="tile.y"
          width="0.86"
          height="0.86"
          rx="0.22"
          :opacity="tile.opacity"
        />
      </svg>

      <svg class="mark" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path :d="socialIcons.github" />
      </svg>
    </div>

    <div class="body">
      <p class="title">{{ text.title }}</p>
      <p class="text">{{ text.body }}</p>

      <div class="foot">
        <!--
          The link is around the label, stretched over the card with an ::after
          overlay: the same pattern the project cards use, so the whole card is the
          target while the accessible name stays the label alone.
        -->
        <a class="link" :href="github.href" target="_blank" rel="noopener" draggable="false">
          {{ t('actions.github') }}
        </a>
        <span class="arrow" aria-hidden="true">↗</span>
      </div>
    </div>
  </article>
</template>

<style scoped>
.cta {
  position: relative;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  /*
    Dashed, and two pixels rather than one: the border is what says "a slot in the
    rail, not a fifth project", and the browser draws its dashes longer the thicker
    it is. border-box so the box stays the size of the cards beside it.
  */
  border: 2px dashed var(--line);
  border-radius: 18px;
  background: var(--surface);
  overflow: hidden;
  transition: border-color 0.16s ease;
}

/* The media slot, in the cards' own 16/10, which is what equalises the heights. */
.mark-box {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 16 / 10;
  background: var(--surface-2);
}

.mosaic {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  fill: var(--acc-solid);
}

.mark {
  position: relative;
  width: 64px;
  height: 64px;
  color: var(--fg-2);
  transition: color 0.16s ease;
}

.body {
  display: flex;
  flex-direction: column;
  gap: 11px;
  flex: 1;
  padding: 24px;
}

.title {
  margin: 0;
  font-size: 19px;
  font-weight: 600;
  color: var(--fg);
}

.text {
  margin: 0;
  font-size: 15px;
  line-height: 1.55;
  color: var(--fg-2);
}

/* The same foot the project cards carry: a hairline, the label and the arrow. */
.foot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-top: auto;
  padding-top: 16px;
  border-top: 1px solid var(--line);
}

.link {
  font-family: var(--font-mono);
  font-size: 12px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--acc-text);
  /*
    An <a> is draggable by default, and a drag that starts on it becomes a drag of
    the link rather than of the rail — the cards next to it are buttons, so they do
    not have this. `draggable="false"` in the markup is the real fix; this is the
    same thing for engines that only honour the property.
  */
  -webkit-user-drag: none;
}

/* The whole card is the target: this stretches the link over it. */
.link::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 1;
}

/* Without this the focus ring would trace the invisible overlay, not the label. */
.link:focus-visible::after {
  display: none;
}

.arrow {
  width: 30px;
  height: 30px;
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--line);
  border-radius: 50%;
  font-size: 13px;
  color: var(--fg-2);
  transition:
    background-color 0.16s ease,
    border-color 0.16s ease,
    color 0.16s ease;
}

/* The same "this is the one" treatment the cards use. */
@media (hover: hover) {
  .cta:hover {
    border-color: var(--acc-text);
  }

  .cta:hover .mark {
    color: var(--acc-text);
  }

  .cta:hover .arrow {
    background: var(--acc);
    border-color: var(--acc);
    color: var(--on-acc);
  }
}

@media (hover: none) {
  .cta.current {
    border-color: var(--acc-text);
  }

  .cta.current .arrow {
    background: var(--acc);
    border-color: var(--acc);
    color: var(--on-acc);
  }
}
</style>
