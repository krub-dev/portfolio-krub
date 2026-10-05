<script setup>
/*
  One 60px tile in the Stack grid.

  The logo is drawn twice, one copy grey and one in colour, and the group's
  spotlight fades the colour one in over the grey. Two copies instead of an
  animated `filter: grayscale()` because a filter repaints the tile on every
  frame, while an opacity is composited — and this runs at pointer speed.

  Every logo renders at 38px inside the 60px tile, and at 30px inside 48px on
  mobile, where the section is read at arm's length and a wall of 60px tiles was
  taking most of the screen. A wordmark (GSAP, almost 3:1) gets a wider box, or
  it would render as a thin stripe in the middle of its tile. box-sizing:
  border-box stays on the tile, since the project has no global border-box.

  The dark monochrome logos (Express, Prisma, Three.js, GitHub, Linux, Framer,
  OpenCode) would disappear against --surface-2 in the dark theme, so BOTH copies
  carry [data-invert-dark] and the global rule switches it off again in the light
  theme. The grey copy is the one that keeps the alt; the colour copy is the same
  picture and is aria-hidden, so a screen reader hears each technology once.
*/
defineProps({
  name: { type: String, required: true },
  src: { type: String, required: true },
  invertOnDark: { type: Boolean, default: false },
  wide: { type: Boolean, default: false },
  // A mark with no negative space that can carry a bigger box than the 38px
  // default without crowding its tile.
  big: { type: Boolean, default: false },
  // Marks the tile as something the cursor should open its ring over. The Stack
  // only asks for that when there is no Limonacho to name tiles, because that is
  // the only case where clicking one does anything.
  interactive: { type: Boolean, default: false },
})
</script>

<template>
  <span
    class="tile"
    :class="{ wide, big }"
    data-tile
    :data-name="name"
    :data-interactive="interactive || undefined"
  >
    <img
      class="icon base"
      :class="{ grey: !invertOnDark }"
      :src="src"
      :alt="name"
      :data-invert-dark="invertOnDark || undefined"
      width="38"
      height="38"
    />
    <img
      class="icon colour"
      :src="src"
      alt=""
      aria-hidden="true"
      :data-invert-dark="invertOnDark || undefined"
      width="38"
      height="38"
    />
  </span>
</template>

<style scoped>
.tile {
  position: relative;
  width: 60px;
  height: 60px;
  flex: 0 0 auto;
  box-sizing: border-box;
  border-radius: 13px;
  background: var(--surface-2);
  border: 1px solid var(--line);
  display: flex;
  align-items: center;
  justify-content: center;
  /* A mark that carries more of the tile than the default (the seasonal one) can
     spill past the rounded box; this keeps it inside. */
  overflow: hidden;
}

.icon {
  width: 38px;
  height: 38px;
  display: block;
}

/* A wordmark gets the width; the SVG letterboxes itself to its own ratio. */
.tile.wide .icon {
  width: 52px;
}

/* A solid mark that can carry more of its tile than the default. Nudged down so
   its own baseline sits under the tile's edge rather than level with it. */
.tile.big .icon {
  width: 50px;
  height: 50px;
  transform: translateY(4px);
}

@media (max-width: 900px) {
  .tile {
    width: 48px;
    height: 48px;
    border-radius: 11px;
  }

  .icon {
    width: 30px;
    height: 30px;
  }

  .tile.wide .icon {
    width: 42px;
  }

  .tile.big .icon {
    width: 40px;
    height: 40px;
  }
}

/* What shows when the spotlight is elsewhere: the same logo without its colour,
   and held back, so the grid reads as one quiet tone rather than as a chart of
   twenty-four brands. */
.base {
  opacity: 0.6;
}

.base.grey {
  filter: grayscale(1);
}

/* The colour copy, on top and invisible until the light reaches the tile.
   margin:auto centres it, since an absolutely positioned child is out of the
   flex flow. */
.colour {
  position: absolute;
  inset: 0;
  margin: auto;
  opacity: 0;
}
</style>
