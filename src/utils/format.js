/*
  Small pure functions, pulled out of the components that used them.

  Two reasons they live here rather than inside a .vue file: the period
  formatter was copy-pasted in two places and had already started to drift, and
  a function with no DOM and no reactivity is the cheapest possible thing to
  test — no mounting, no jsdom, no fixtures.
*/

/**
 * A timeline entry's year range, as the design spec writes it.
 *
 *   { from: '2024', to: null }    -> "2024 — now"    (still going)
 *   { from: '2018', to: '2024' }  -> "2018 — 2024"
 *   { from: '2025', to: '2025' }  -> "2025"          (a single year, printed once)
 *
 * `nowLabel` is passed in rather than imported so this stays free of i18n —
 * the caller already has `t`, and this file has no business knowing about
 * translations.
 */
export function formatPeriod(entry, nowLabel) {
  if (entry.to === null || entry.to === undefined) return `${entry.from} — ${nowLabel}`
  if (entry.to === entry.from) return String(entry.from)
  return `${entry.from} — ${entry.to}`
}

/**
 * Move `step` places through a list of `total` items, wrapping at both ends.
 *
 * The obvious version, `(current + step + total) % total`, works only while
 * `step` is never smaller than -total. JavaScript's % keeps the sign of the
 * left operand — -1 % 4 is -1, not 3 — so a single unguarded subtraction is
 * enough to produce a negative index. Taking the modulo twice is what makes it
 * correct for any step, in either direction.
 */
export function wrapIndex(current, step, total) {
  if (total <= 0) return 0
  return (((current + step) % total) + total) % total
}

/**
 * A link as it is shown in the contact rows: no protocol, no trailing slash.
 *
 *   'https://github.com/krub-dev' -> 'github.com/krub-dev'
 *   'https://example.com/a/'      -> 'example.com/a'
 *
 * Derived from the href rather than written next to it, so the two can never
 * drift apart and a link is changed in one place.
 */
export function formatUrl(href) {
  return String(href)
    .replace(/^https?:\/\//, '')
    .replace(/\/+$/, '')
}
