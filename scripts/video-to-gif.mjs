/*
  DEV TOOLING — not part of the site.

  Turns a screen recording (the Windows Game Bar, ScreenToGif, whatever) into a
  GIF with the same two-pass palette capture-tour.mjs uses, so a hand-made
  recording can be trimmed, sped up and shrunk without opening an editor.

    node scripts/video-to-gif.mjs <input> [output]

  The dials are environment variables, because a recording of the whole site at
  full length is far too big to land in a repository:

    GIF_START     seconds to skip at the head (default 0)
    GIF_DURATION  seconds to keep from there (default: to the end)
    GIF_SPEED     playback multiplier, e.g. 8 turns a minute into ~7s (default 1)
    GIF_WIDTH     output width in px; height follows the aspect (default 560)
    GIF_FPS       frames per second (default 10)
    GIF_COLORS    palette size (default 96)

  Output defaults to scripts/out/clip.gif.
*/
import { execFileSync } from 'node:child_process'
import { mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'

import ffmpegPath from 'ffmpeg-static'

const input = process.argv[2]
if (!input) {
  console.error('usage: node scripts/video-to-gif.mjs <input> [output]')
  process.exit(1)
}

const output = process.argv[3] ?? join('scripts', 'out', 'clip.gif')
const start = process.env.GIF_START ?? '0'
const duration = process.env.GIF_DURATION ?? ''
const speed = Number(process.env.GIF_SPEED ?? '1')
const width = process.env.GIF_WIDTH ?? '560'
const fps = process.env.GIF_FPS ?? '10'
const colors = process.env.GIF_COLORS ?? '96'

mkdirSync(dirname(output), { recursive: true })

// setpts changes the video's own clock, so speeding it up is not a dropped-frame
// trick: the palette pass then samples the sped-up stream.
const chain = [
  speed === 1 ? null : `setpts=${(1 / speed).toFixed(4)}*PTS`,
  `fps=${fps}`,
  `scale=${width}:-1:flags=lanczos`,
  'split[a][b]',
].filter(Boolean)

const filter = `${chain.join(',')};[a]palettegen=max_colors=${colors}:stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=5`

const args = ['-y']
if (start !== '0') args.push('-ss', start)
if (duration) args.push('-t', duration)
args.push('-i', input, '-vf', filter, '-loop', '0', output)

execFileSync(ffmpegPath, args, { stdio: 'inherit' })
console.log(`\nGIF written to ${output}`)
