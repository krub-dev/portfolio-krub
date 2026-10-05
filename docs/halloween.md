# The Halloween layer

A seasonal theme, off by default and switched on by picking the **orange accent** in the appearance
control. The reasoning behind it is decision 105; this is the practical map — what is in it, how it is
wired, and how to take it out again.

## How it switches on

`useSeason()` is the one place that decides: it is `'halloween'` when `config.showHalloween` is true
**and** the accent is `orange`, and `null` otherwise. Nothing else asks "is it Halloween"; they ask the
season, or read the marker it leaves behind.

`HalloweenFx.vue`, mounted once in `App.vue` behind the config flag, does two things:

- stamps `data-season="halloween"` on `<html>` while the season is on (and removes it when it is not);
- mounts the two pieces that are fixed to the page rather than to a section — `SeasonGhost` and
  `SeasonDark` — and draws the corner and foot webs.

`styles/halloween.css`, imported by that component, holds the seasonal looks, all keyed off
`[data-season='halloween']`.

## What is in it

- **The sticker.** `SeasonSticker` sits inside the shutter's slats and rides up with the blind on a
  desktop; on a phone, which has no stage, the same artwork sits in the gap beside the Stack heading
  (`StackSection`).
- **The webs.** Two corners (left bigger than right, mirrored) and one across the foot of the page, in
  `HalloweenFx`. Masked from the black SVGs so they take a token and follow the theme; darker in light.
- **The bats.** With the season on, `MarqueeBar` swaps each `//` for the bat (masked, so it takes the
  band's text colour).
- **Calabazacho.** `LemonPet` swaps its CSS lemon for the pumpkin and its eyes while the season is on:
  the body is the pumpkin, the eyes are one layer that drifts toward the cursor, and the greeting
  becomes "Boo! I'm Calabazacho". The poke, the voice and the bubble are unchanged.
- **The spectre.** The Stack gains one more tile — an animated GIF of the spectre — flagged
  `season: 'halloween'` in `stack.js` and filtered in `StackSection`.
- **The ghost.** One more testimonial, the ghost, flagged in `testimonials.js` and filtered in
  `Testimonials`. It is written first, so while the season is on it opens the pager.
- **The flying ghost.** `SeasonGhost` drops out of the Stack's tile once, when the section climbs into
  view: it grows and drifts off the top, and the tile empties.
- **The photo and the badge.** `AboutSection` swaps the portrait for the Halloween one and the
  availability badge for "Spooky".
- **The card glow.** `halloween.css` adds an inset accent glow to a project card on hover (and on the
  parked card on touch), on top of the card's own orange state.
- **The pumpkin in the CV.** `CvModal` shows the animated pumpkin while the dialog renders its pages.
- **The lights-out.** The whole game; see below.

## The lights-out

`SeasonDark.vue`, desktop only and never under reduced motion.

Open the shutter and, once the blind has lifted and the mark and the tube have finished striking (a
3.6 s wait), the page goes dark — a `color-mix` of `--ink` at 97%. Two holes are cut out of it: the
torch, a hard circle that trails the cursor, and a **square** matching the inside of the stage's metal
frame, so the scene is not swallowed. The square is a `clip-path` (a gradient cannot draw a rectangle);
the torch is the `mask`; the two intersect, so the holes add up.

Everything but the mascot goes dark — the navbar and the footer too — so the one lit thing left is
Calabazacho. He also shivers every few seconds to catch the eye (`petTremble` in `halloween.css`,
keyed off a `data-season-dark` marker `SeasonDark` leaves on `<html>`, so the pet knows nothing of it).

The light comes back three ways, all with the tube's flicker:

- **poking Calabazacho**, who then says "You only had to touch me!" (his welcome is skipped for that
  poke, since the line would talk over it);
- **waiting ~20 s**, so nobody is stranded;
- **reaching the foot of the page**.

## The assets

Everything lives in `public/assets/img/themeHalloween/`. The `.af` (the Affinity source) is ignored.

- The **GIFs** (`spectrePls`, `pumpkinsus`) are generated from the **AVIFs**: a phone's browser does not
  play an animated AVIF. The AVIF keeps its alpha in a second stream, so `ffmpeg` needs `alphamerge`
  before `palettegen=reserve_transparent` or the GIF comes out opaque.
- `pumpkin.svg` is `pumpkin.svg` with its embedded PNG re-encoded small; the eyes and the pumpkin share
  one canvas, which is what keeps them aligned.
- `ghost.svg` carries a hand-added `fill`, since it is drawn as a black path.

## Taking it out

Delete `HalloweenFx`, `SeasonGhost`, `SeasonDark`, `styles/halloween.css`, the `showHalloween` line in
`config.js`, and the `season` flags in `stack.js` and `testimonials.js`. Nothing else refers to the
season.
