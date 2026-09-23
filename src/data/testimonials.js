/*
  Testimonials, in display order, one at a time in a vertical pager.

  One entry so far. Add more as they come — the pager grows with the list, one
  dot per quote, and nothing else has to change.

    avatar  Path under public/, or null to draw the plain circle placeholder. The
            one below is the client's own mark, not a photograph, so the avatar
            circle gives it room rather than cropping it.
    quote   The client's words, in quotation marks: a testimonial is a quote, and
            the marks are what say so before anyone reads the attribution.
    name    As the client agreed to be credited.
    role    The project, in the same mono caps the rest of the site uses.
*/
export const testimonials = [
  {
    avatar: '/assets/img/creandomientras.svg',
    en: {
      quote:
        '“I’m delighted with the site Kiko built for my macramé project. He knew how to put on screen what I had in my head. He also left me a simple guide so I can update it myself: photos, texts, calendar, labels... Thank you for your professionalism, your help and your patience.”',
      name: 'Lourdes Campuzano',
      role: 'CREANDOMIENTRAS',
    },
    es: {
      quote:
        '“Estoy encantada con la web que hizo Kiko para mi proyecto de macramé. Supo poner en pantalla lo que yo tenía en la cabeza. Además me dejó una guía sencilla para poder actualizarla yo misma: fotos, textos, calendario, etiquetas... Gracias por tu profesionalidad, tu ayuda y tu paciencia.”',
      name: 'Lourdes Campuzano',
      role: 'CREANDOMIENTRAS',
    },
  },
]

export default testimonials
