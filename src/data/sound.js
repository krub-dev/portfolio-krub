/*
  The audio the site plays. One clip, for now: the "acho" Limonacho says the
  first time you poke him in a visit.

  MP3, not the WAV it came from: one second of stereo WAV is 177 KB and the
  same second at 128 kbps is 17 KB, which every browser and every phone plays.
  The original is kept in assets/sound/, outside public/, so it is not served.

  The path lives here rather than in the component for the same reason as the
  photo in socials.js — nothing visible or fetchable is written into a
  template, and the file keeps the name it has on disk, so it can be replaced
  without a rebuild changing its URL.
*/
export const achoSound = '/assets/sound/acho.mp3'

export default achoSound
