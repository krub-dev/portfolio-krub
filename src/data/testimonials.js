/*
  Testimonials, in display order.

  One real quote. If a second ever arrives, add an entry — the list closes up on
  its own and there are no filler cards by design.

    avatar  Path under public/, or null to draw the plain circle placeholder. The
            one below is the client's own mark, not a photograph, so the avatar
            circle gives it room rather than cropping it.
    quote   The client's words. Long quotes are clamped to three lines by
            TestimonialCard, which offers a "read more" only when there is
            something hidden.
    name    As the client agreed to be credited.
    role    The project, in the same mono caps the rest of the site uses.
*/
export const testimonials = [
  {
    avatar: '/assets/img/creandomientras.svg',
    en: {
      quote:
        'I’m delighted with the site Kiko built for my macramé project: he put on screen what I had in my head. He also left me a simple guide so I can update it myself: photos, texts, the calendar. Thank you for your professionalism, your help and your patience.',
      name: 'Lourdes Campuzano',
      role: 'CREANDOMIENTRAS',
    },
    es: {
      quote:
        'Estoy encantada con la web que hizo Kiko para mi proyecto de macramé: puso en pantalla lo que yo tenía en la cabeza. Además me dejó una guía sencilla para actualizarla yo misma: fotos, textos, el calendario. Gracias por tu profesionalidad, tu ayuda y tu paciencia.',
      name: 'Lourdes Campuzano',
      role: 'CREANDOMIENTRAS',
    },
  },
]

export default testimonials
