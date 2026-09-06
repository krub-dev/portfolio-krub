import { useElementHeight } from './useElementHeight'

/*
  Publishes the footer's real height as --footer-h.

  The footer is position:fixed, so the page reserves room for it with
  `padding-bottom: var(--footer-h)`. The measuring itself, and the reason it
  has to be measured rather than hardcoded, live in useElementHeight — the
  navbar has exactly the same problem and used to have the same bug.
*/
export function useFooterHeight(elementRef) {
  useElementHeight(elementRef, '--footer-h')
}
