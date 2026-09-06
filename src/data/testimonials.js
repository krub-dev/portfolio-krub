/*
  Testimonials. PLACEHOLDER CONTENT — none of these quotes are real.

  They are written in square brackets, with "Name Surname" as the attribution,
  on purpose: a placeholder testimonial that reads like a genuine one is the
  kind of thing that quietly ships. Kept obviously fake so it cannot.

  The section is hidden (config.showTestimonials is false) precisely because of
  that. Replace these with real quotes and flip the switch back on; the layout
  is already built and reviewed.

  If you only ever get one real quote, delete the second entry — the grid
  closes up on its own. There are no filler cards by design.

    avatar  Path under public/, or null to draw the plain circle placeholder.
*/
export const testimonials = [
  {
    avatar: null,
    en: {
      quote: '“[Client quote. Short, concrete, about a result.]”',
      name: 'Name Surname',
      role: 'CREANDOMIENTRAS',
    },
    es: {
      quote: '“[Cita del cliente. Corta, concreta y que hable de un resultado.]”',
      name: 'Nombre Apellido',
      role: 'CREANDOMIENTRAS',
    },
  },
  {
    avatar: null,
    en: {
      quote: '“[Another quote. If you only have one, delete this card and the grid adjusts.]”',
      name: 'Name Surname',
      role: 'COMPANY / ROLE',
    },
    es: {
      quote: '“[Otra cita. Si solo tienes una, borra esta tarjeta y la rejilla se ajusta.]”',
      name: 'Nombre Apellido',
      role: 'EMPRESA / ROL',
    },
  },
]

export default testimonials
