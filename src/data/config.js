/*
  Switches for the optional parts of the site (design spec §4, "config").
  Flip a boolean, reload, done — no component has to be touched.
*/
export const config = {
  /*
    Testimonials.

    OFF because the quotes in testimonials.js are placeholders, written in
    brackets so they could never be mistaken for real ones. The section was
    visible during the build so it could be laid out and reviewed; it has no
    business being visible to a visitor until the quotes are real.

    Flip to true once the people I am asking have sent theirs. The section, the
    cards and the layout are all still here waiting.
  */
  showTestimonials: false,

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
