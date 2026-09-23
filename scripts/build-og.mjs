/*
  Builds public/assets/img/og-banner.png, the Open Graph card.

  The banner is the hero rendered at 1200x630 — the page background with its 72px
  grid, the three-line headline with `backend` in the accent, the 104x3 rule, a
  mono footer line, and the square stage with the mark. It is drawn in a real
  browser so the typography is the site's own rather than an approximation:
  Chromium loads the self-hosted .woff2 files, waits for them, and screenshots.

  That is the whole reason this is a script and not a hand-made file in a design
  tool: the headline lives in src/data/copy.js, and the banner carries a copy of
  it, so changing the hero copy means running this again. See decisions.md 33.

  Usage: node scripts/build-og.mjs
*/
import { createServer } from 'node:http'
import { readFile, unlink, writeFile } from 'node:fs/promises'
import { extname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { chromium } from '@playwright/test'

const root = fileURLToPath(new URL('..', import.meta.url))
const publicDir = join(root, 'public')
const out = join(publicDir, 'assets', 'img', 'og-banner.png')
// A temp page inside public/, served alongside the fonts and the mark. It has to
// go over HTTP: Chromium blocks a file:// page from loading its own file://
// subresources, so the mask (the logo) comes out empty and the fonts fall back.
const pageName = '_og.html'

// Root-relative, because the page is served from the public/ root.
const asset = (path) => `/${path}`

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<style>
  @font-face {
    font-family: 'Space Grotesk';
    font-weight: 300 700;
    src: url('${asset('fonts/space-grotesk-latin.woff2')}') format('woff2');
  }
  @font-face {
    font-family: 'JetBrains Mono';
    font-weight: 100 800;
    src: url('${asset('fonts/jetbrains-mono-latin.woff2')}') format('woff2');
  }

  /* The dark theme's tokens, copied from src/styles/tokens.css. */
  :root {
    --ink: #0c0c0d;
    --surface: #141416;
    --fg: #f2f0ea;
    --fg-2: #a3a29d;
    --fg-3: #868580;
    --acc: #ffc800;
    --acc-text: #ffc800;
    --grid: rgba(255, 255, 255, 0.045);
    --line: rgba(255, 255, 255, 0.11);
  }

  * { box-sizing: border-box; }
  html, body { margin: 0; width: 1200px; height: 630px; }
  body {
    background: var(--ink);
    color: var(--fg);
    font-family: 'Space Grotesk', system-ui, sans-serif;
    overflow: hidden;
  }

  .grid {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(var(--grid) 1px, transparent 1px),
      linear-gradient(90deg, var(--grid) 1px, transparent 1px);
    background-size: 72px 72px;
  }

  .wrap {
    position: relative;
    height: 100%;
    padding: 68px 80px;
    display: grid;
    grid-template-columns: 1.15fr 0.85fr;
    gap: 56px;
    align-items: center;
  }

  .top {
    margin: 0 0 28px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 14px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--fg-3);
  }

  h1 {
    margin: 0;
    font-size: 70px;
    font-weight: 700;
    letter-spacing: -0.035em;
    line-height: 0.98;
  }
  .accent { color: var(--acc-text); }

  .rule {
    width: 104px;
    height: 3px;
    margin: 30px 0;
    background: var(--acc);
  }

  .foot {
    margin: 0;
    font-family: 'JetBrains Mono', monospace;
    font-size: 14px;
    letter-spacing: 0.04em;
    color: var(--fg-2);
  }
  .foot b { color: var(--fg); font-weight: 500; }

  .stage {
    position: relative;
    justify-self: end;
    width: 430px;
    height: 430px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--line);
    border-radius: 24px;
    background: radial-gradient(80% 80% at 50% 40%, var(--surface) 0%, var(--ink) 100%);
    overflow: hidden;
  }
  .stage .inner {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(var(--grid) 1px, transparent 1px),
      linear-gradient(90deg, var(--grid) 1px, transparent 1px);
    background-size: 40px 40px;
  }
  .mark {
    width: 58%;
    aspect-ratio: 1.682;
    background: var(--acc);
    -webkit-mask: url('${asset('assets/img/krub-mark.png')}') center / contain no-repeat;
    mask: url('${asset('assets/img/krub-mark.png')}') center / contain no-repeat;
  }
</style>
</head>
<body>
  <div class="grid"></div>
  <div class="wrap">
    <div>
      <p class="top">krub.dev</p>
      <h1>I build things<br />that hold up<br />on the <span class="accent">backend</span>.</h1>
      <div class="rule"></div>
      <p class="foot"><b>Kiko Rubio</b> · Full Stack Developer · Murcia · Remote</p>
    </div>
    <div class="stage"><div class="inner"></div><div class="mark"></div></div>
  </div>
</body>
</html>
`

const types = { '.html': 'text/html', '.woff2': 'font/woff2', '.png': 'image/png' }

const server = createServer(async (req, res) => {
  const path = join(publicDir, decodeURIComponent(req.url.split('?')[0]))
  try {
    const body = await readFile(path)
    res.writeHead(200, { 'content-type': types[extname(path)] ?? 'application/octet-stream' })
    res.end(body)
  } catch {
    res.writeHead(404)
    res.end()
  }
})
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
const { port } = server.address()

await writeFile(join(publicDir, pageName), html)

const browser = await chromium.launch()
try {
  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 },
    deviceScaleFactor: 1,
  })
  await page.goto(`http://127.0.0.1:${port}/${pageName}`, { waitUntil: 'load' })
  // The screenshot must not race the webfonts, or it comes out in the fallback.
  await page.evaluate(() => document.fonts.ready)
  await page.screenshot({ path: out })
  console.log(out)
} finally {
  await browser.close()
  await unlink(join(publicDir, pageName))
  server.close()
}
