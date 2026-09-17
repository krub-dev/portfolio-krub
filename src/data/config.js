/*
  Switches for the optional parts of the site (design spec §4, "config").
  Flip a boolean, reload, done — no component has to be touched.
*/
export const config = {
  /*
    Testimonials.

    ON since 2026-09-17, and it should not ship like this: the quotes in
    testimonials.js are still the bracketed placeholders, written so they could
    never be mistaken for real ones. They are on so the section can be seen and
    the real quotes dropped in one at a time. Turn it off again, or replace the
    quotes, before this reaches main.
  */
  showTestimonials: true,

  // Limonacho, the lemon mascot in the bottom-right corner.
  showLemon: true,

  /*
    The CV download button in About.

    ON since 2026-09-17, and it needs the file to exist: public/uploads/ holds
    no CV, so the button currently downloads nothing (a 404). The original PDF
    carried a phone number and a home address and was purged from the git
    history; the button is waiting on the ATS-friendly rewrite, in both
    languages, at the path below. Turn it off again before this reaches main if
    the file is not there yet.
  */
  showCv: true,

  // Timezone for the footer clock. Anything Intl accepts.
  timezone: 'Europe/Madrid',

  /*
    Where the contact form posts to. Our own endpoint, not Web3Forms directly:
    the key lives on the server (WEB3FORMS_KEY) and never in the bundle. See
    api/contact.js.
  */
  contactEndpoint: '/api/contact',
}

export default config
