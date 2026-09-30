/*
  Switches for the optional parts of the site (design spec §4, "config").
  Flip a boolean, reload, done — no component has to be touched.
*/
export const config = {
  /*
    Testimonials. ON, with one real quote so far; more are added to
    testimonials.js as they come and the pager grows with the list.
  */
  showTestimonials: true,

  // Limonacho, the lemon mascot in the bottom-right corner.
  showLemon: true,

  /*
    The grid cell that lights up under the pointer (GridCell.vue).

    Off for now: with everything else moving, the cell reads as busy. Flip it to
    true to bring the effect back — the component mounts and subscribes on its
    own, so nothing else has to change.
  */
  showGridCell: false,

  /*
    The CV download button in About.

  ON since 2026-09-17. Four PDFs live in public/uploads/, one per theme and
  language (cv-{es,en}.pdf for light, cv-{es,en}-dark.pdf for dark), generated
  by the standalone cv tool kept outside this repository. The button links to
  the pair matching the page theme and language. The original PDF carried a
  phone number and a home address and was purged from the git history.
  */
  showCv: true,

  // Timezone for the footer clock. Anything Intl accepts.
  timezone: 'Europe/Madrid',

  /*
    Where the contact form posts to. Our own endpoint, not the mail provider
    directly: the key lives on the server (RESEND_API_KEY) and never in the
    bundle. See api/contact.js.
  */
  contactEndpoint: '/api/contact',
}

export default config
