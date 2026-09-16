/*
  The accent palettes, in the order the switcher shows them. Yellow is first
  because it is the default and the site's identity colour.

  Only the id lives here. Every colour is a token in tokens.css, so adding a
  palette is an id in this list plus its blocks in tokens.css — no component has
  to change.
*/
export const accents = [
  { id: 'yellow' },
  { id: 'aqua' },
  { id: 'rose' },
  { id: 'mint' },
  { id: 'pink' },
]

export default accents
