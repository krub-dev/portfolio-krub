/*
  The scrollable sections, in page order. Drives the navbar links, the mobile
  menu list and (from step 9) the scroll spy.

    id        The section's DOM id — the anchor target.
    labelKey  Translation key for the visible label, e.g. "/projects".
    index     The [00]…[03] number shown in the mobile menu.

  `top` (the hero) is not here: it has no nav link. The scroll spy adds it
  separately so that being at the top means no link is highlighted.
*/
export const sections = [
  { id: 'me', labelKey: 'nav.me', index: '00' },
  { id: 'projects', labelKey: 'nav.projects', index: '01' },
  { id: 'stack', labelKey: 'nav.stack', index: '02' },
  { id: 'contact', labelKey: 'nav.contact', index: '03' },
]

export default sections
