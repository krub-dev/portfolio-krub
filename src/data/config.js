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

  /*
    The CV download button in About.

    OFF because there is no file to download: the original PDF carried a phone
    number and a home address, and shipping it would have put both at a
    guessable public URL. It is waiting on an ATS-friendly rewrite without the
    personal details, in both languages.

    The button and its wiring are untouched — flip this to true once
    public/uploads/ holds the new file and it comes straight back. A visible
    button that 404s would be worse than no button: a recruiter clicks it once
    and forms an opinion.
  */
  showCv: false,

  // Timezone for the footer clock. Anything Intl accepts.
  timezone: 'Europe/Madrid',
}

export default config
