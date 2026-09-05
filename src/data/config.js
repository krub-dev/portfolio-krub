/*
  Switches for the optional parts of the site (design spec §4, "config").
  Flip a boolean, reload, done — no component has to be touched.
*/
export const config = {
  // Testimonials. ON while building, so the section is visible and laid out.
  // The quotes in testimonials.js are PLACEHOLDERS — deliberately written in
  // brackets so they cannot be mistaken for real ones. Replace them with real
  // quotes before launch, or set this to false and the section disappears.
  showTestimonials: true,

  // Limonacho, the lemon mascot in the bottom-right corner.
  showLemon: true,

  // Timezone for the footer clock. Anything Intl accepts.
  timezone: 'Europe/Madrid',
}

export default config
