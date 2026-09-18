/*
  Testimonials, in display order, one at a time in a vertical pager.

  One real quote and two placeholders. The placeholders are deliberately obvious
  — square brackets, "Name Surname" — so they cannot be mistaken for real ones
  and shipped by accident; they exist so the pager can be seen with more than one
  entry. **Delete them or replace them before this reaches main.**

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
  {
    avatar: null,
    en: {
      quote: '[Second quote. Shorter than the first, so the window has to shrink to it.]',
      name: 'Name Surname',
      role: 'COMPANY / ROLE',
    },
    es: {
      quote: '[Segunda cita. Más corta que la primera, para que la ventana tenga que encogerse.]',
      name: 'Nombre Apellido',
      role: 'EMPRESA / ROL',
    },
  },
  {
    avatar: null,
    en: {
      quote:
        '[Third quote, deliberately long enough that it does not fit the four-line clamp on a desktop either, so the "read more" can be tried there and not only on a phone. A paragraph of filler that runs on for a few lines, which is what a real quote does when someone has something to say and is not counting words: it keeps going, adds a detail, comes back to the first thing, and only then stops. Replace it or delete it.]',
      name: 'Name Surname',
      role: 'COMPANY / ROLE',
    },
    es: {
      quote:
        '[Tercera cita, a propósito lo bastante larga como para que tampoco quepa en el recorte de cuatro líneas en escritorio, y así poder probar el "leer más" ahí y no solo en el móvil. Un párrafo de relleno que ocupa varias líneas, que es lo que hace una cita real cuando alguien tiene algo que contar y no va contando palabras: sigue un poco más, añade un detalle, vuelve a lo primero y solo entonces termina. Sustitúyela o bórrala.]',
      name: 'Nombre Apellido',
      role: 'EMPRESA / ROL',
    },
  },
]

export default testimonials
