/*
  DEV TOOLING — not part of the site.

  Re-encodes the portfolio's card images down to what the page actually shows.
  The originals were captured at full size and shipped untouched, so the covers
  alone were over 800 KB. Reproducible on purpose: run it when the artwork is
  replaced, not once by hand.

    node scripts/optimize-images.mjs

  Every file is written next to itself (same name), after a `.orig` backup, and
  the backup is removed on success. ffmpeg comes from `ffmpeg-static`, so there
  is no system dependency.
*/
import { execFileSync } from 'node:child_process'
import { copyFileSync, statSync, unlinkSync } from 'node:fs'

import ffmpegPath from 'ffmpeg-static'

// width is the longest side kept; q is ffmpeg's JPEG quality (2 best, 31 worst).
const targets = [
  { file: 'public/assets/img/krub-dev/hero.jpg', width: 1600, q: 4 },
  { file: 'public/assets/img/krub-dev/about.jpg', width: 1600, q: 4 },
  { file: 'public/assets/img/krub-dev/projects.jpg', width: 1600, q: 4 },
  { file: 'public/assets/img/krub-dev/contact.jpg', width: 1600, q: 4 },
  { file: 'public/assets/img/creando/hero.jpg', width: 1600, q: 4 },
  { file: 'public/assets/img/showroom/desktop.jpg', width: 1600, q: 4 },
]

const kb = (path) => Math.round(statSync(path).size / 1024)

for (const { file, width, q } of targets) {
  const before = kb(file)
  copyFileSync(file, `${file}.orig`)
  try {
    execFileSync(
      ffmpegPath,
      [
        '-y',
        '-i',
        `${file}.orig`,
        '-vf',
        `scale='min(${width},iw)':-2:flags=lanczos`,
        '-q:v',
        String(q),
        file,
      ],
      { stdio: 'ignore' },
    )
    unlinkSync(`${file}.orig`)
    console.log(`${file.replace('public/assets/img/', '')}: ${before} KB -> ${kb(file)} KB`)
  } catch (error) {
    copyFileSync(`${file}.orig`, file)
    unlinkSync(`${file}.orig`)
    console.error(`${file}: failed, kept the original (${error.message})`)
  }
}
