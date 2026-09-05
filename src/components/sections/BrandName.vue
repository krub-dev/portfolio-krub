<script setup>
/*
  The animated name at the top of the hero.

  It reads "K RUB" on load, then widens the hidden letters into "KIKO RUBIO",
  then drops RUBIO onto a second line. Three moving parts:

  - Two `reveal` spans hold the hidden letters at max-width:0, overflow hidden.
    nameOpen widens them at 1s. (max-width, not width: `auto` cannot be
    animated, so the trick is to animate to a value wider than the content and
    let overflow clip it.)
  - The `split` span carries RUB+IO and slides down-left at 2.35s, landing
    under KIKO.
  - The container reserves 2.16em of height so the second line has somewhere to
    go without the layout jumping when it arrives.

  `forwards` on every animation keeps the end state after it finishes.

  The letters are hardcoded rather than coming from src/data — this is the
  logo, not copy. It is the same in both languages, and the animation depends
  on where the word splits, so it is markup, not content.
*/
</script>

<template>
  <!--
    role="img" is what makes the aria-label legal here. aria-label is only
    allowed on elements with a role that supports a name, and a <p> has none —
    Lighthouse flags it as a prohibited attribute and a screen reader ignores
    it, so the name was silently doing nothing.

    role="img" is also the honest description: this is not a paragraph, it is a
    piece of lettering that happens to be made of characters. The role tells
    assistive tech to announce the label and skip the contents.
  -->
  <p class="name" role="img" aria-label="Kiko Rubio">
    <span aria-hidden="true">
      K<span class="reveal">IKO </span>
      <span class="split">RUB<span class="reveal">IO</span></span>
    </span>
  </p>
</template>

<style scoped>
.name {
  margin: 0;
  font-family: var(--font-mono);
  font-weight: 700;
  letter-spacing: 0.18em;
  font-size: clamp(22px, 2.4vw, 32px);
  line-height: 1;
  white-space: nowrap;
  color: var(--acc-text);
  height: 2.16em;
}

.reveal {
  display: inline-block;
  overflow: hidden;
  white-space: pre;
  vertical-align: bottom;
  max-width: 0;
  opacity: 0;
  color: var(--fg);
  animation: nameOpen 0.95s cubic-bezier(0.22, 1, 0.36, 1) 1s forwards;
}

.split {
  display: inline-block;
  animation: nameSplit 0.8s cubic-bezier(0.22, 1, 0.36, 1) 2.35s forwards;
}

/*
  Reduced motion: skip the choreography and show the finished state. The name
  still reads "KIKO / RUBIO", it just never moves.
*/
@media (prefers-reduced-motion: reduce) {
  .reveal {
    animation: none;
    max-width: 6ch;
    opacity: 1;
  }

  .split {
    animation: none;
    transform: translate(calc(-5ch - 0.9em), 1.08em);
  }
}
</style>
