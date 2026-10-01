/*
  DEV TOOLING — not part of the site.

  Records a short tour of the site and encodes it to a GIF: Playwright drives a
  browser through the sections while recording, then the ffmpeg binary that
  `ffmpeg-static` ships encodes the video with a two-pass palette (a single-pass
  GIF is the "deep-fried" one nobody wants).

  Not wired into any build: run it by hand against a local server.

    npm run dev            # or npm run preview, in another terminal
    node scripts/capture-tour.mjs

  Point it elsewhere with TOUR_URL (a deployment, a preview). Output lands in
  scripts/out/tour.gif. Both `scripts/out` and the frames are throwaway.
*/
import { execFileSync } from 'node:child_process'
import { mkdirSync, mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { chromium } from '@playwright/test'
import ffmpegPath from 'ffmpeg-static'

const url = process.env.TOUR_URL ?? 'http://localhost:5173'
const width = 1200
const height = 750
const outDir = join(process.cwd(), 'scripts', 'out')
const videoDir = mkdtempSync(join(tmpdir(), 'krub-tour-'))

mkdirSync(outDir, { recursive: true })

/*
  --disable-blink-features=AutomationControlled makes navigator.webdriver false,
  which is the flag the site's 3D stage reads to keep its WebGL scene off under
  test runners. Without it the hero records an empty frame.
*/
const browser = await chromium.launch({
  args: ['--disable-blink-features=AutomationControlled'],
})

const context = await browser.newContext({
  viewport: { width, height },
  recordVideo: { dir: videoDir, size: { width, height } },
})

const page = await context.newPage()
await page.goto(url)
// The hero arms and the 3D settles a beat after load.
await page.waitForTimeout(2500)

// One step per section, top to bottom, with a pause so each one reads.
const stops = ['#top', '#stack', '#projects', '#me', '#contact']
for (const stop of stops) {
  await page.evaluate((selector) => {
    document.documentElement.style.scrollBehavior = 'smooth'
    document.querySelector(selector)?.scrollIntoView({ block: 'start' })
  }, stop)
  await page.waitForTimeout(1600)
}
await page.waitForTimeout(1000)

// The video is finalised when the context closes, not the page.
const video = page.video()
await context.close()
await browser.close()

const recording = await video.path()
const gif = join(outDir, 'tour.gif')

execFileSync(
  ffmpegPath,
  [
    '-y',
    '-i',
    recording,
    '-vf',
    'fps=10,scale=480:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=96:stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=5',
    '-loop',
    '0',
    gif,
  ],
  { stdio: 'inherit' },
)

console.log(`\nGIF written to ${gif}`)
