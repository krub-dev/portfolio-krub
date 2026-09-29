/*
  THE WORDS. This is the file to open when you want to reword the site.

  Everything here is prose you wrote: the hero headline, the About paragraphs,
  the marquee phrases. Both languages sit side by side so you can change a
  sentence and its translation without leaving the file.

  Interface strings — nav paths, button labels, aria-labels — are NOT here.
  They live in src/locales/. The dividing line:

      sentences you wrote  ->  src/data/       (this folder)
      labels the UI needs  ->  src/locales/

  The headline is split into parts so no HTML has to live in a data file. The
  template renders line1 / line2 / then line3pre + accent + line3post, with the
  accent word wrapped in a span coloured var(--acc-text).
*/
export const copy = {
  hero: {
    en: {
      badge: 'Available',
      line1: 'I build things',
      line2: 'that hold up',
      line3pre: 'on the ',
      accent: 'backend',
      line3post: '.',
      body: 'Full Stack Developer in Murcia, open to Barcelona and remote, leaning into backend: Java 17 with Spring Boot, Node and Express, and relational databases. Vue on the front when needed. I used to do 3D, and it still shows in how I look at things.',
    },
    es: {
      badge: 'Disponible',
      line1: 'Desarrollo cosas',
      line2: 'que aguantan',
      line3pre: 'el ',
      accent: 'backend',
      line3post: '.',
      body: 'Desarrollador Full Stack en Murcia, abierto a Barcelona y remoto, girando hacia backend: Java 17 con Spring Boot, Node y Express, y bases de datos relacionales. Frontend en Vue cuando toca. Antes hacía 3D, y todavía se me nota en el ojo.',
    },
  },

  about: {
    en: {
      // What Limonacho says when the pointer lands on the photo.
      greet: 'Kiko!',
      p1: 'I came from 3D and ended up programming: same thing, fewer twelve-hour renders.',
      p2: 'Six years modelling and texturing for games, apps and e-commerce taught me to ship on time and to sweat the details. I bring the same to the code: careful, tested, documented, and delivered when I said it would be.',
      p3: 'Looking for a team where I can grow into backend while still poking at odd things in C on weekends.',
    },
    es: {
      greet: '¡Kiko!',
      p1: 'Vengo del 3D y acabé programando, que es lo mismo pero con menos renders de doce horas.',
      p2: 'Seis años modelando y texturizando para videojuegos, apps y e-commerce me enseñaron a entregar a tiempo y a mirar el detalle. Traigo eso mismo al código: cuidado, probado, documentado y entregado cuando dije que lo estaría.',
      p3: 'Busco equipo donde crecer hacia backend sin dejar de tocar cosas raras en C los fines de semana.',
    },
  },

  // The marquee loops these two phrases forever, joined by the separator.
  // Add or remove entries freely; the band duplicates whatever it is given.
  marquee: {
    en: ['Fullstack developer → backend', 'Murcia · Barcelona · remote · Spain'],
    es: ['Desarrollador fullstack → backend', 'Murcia · Barcelona · remoto · España'],
  },

  // The 404 page. The title and the button label are interface strings and live
  // in src/locales/; this is the sentence under them.
  notFound: {
    en: {
      body: 'That path leads nowhere, but the rest of the site is still there.',
    },
    es: {
      body: 'Ese camino no lleva a ningún sitio, pero el resto de la web sigue en pie.',
    },
  },

  /*
    What Limonacho says the first time you poke him in a visit — the bubble and
    the "acho" are one greeting. It hides itself after a few seconds; turn the
    whole mascot off in config.js.

    `cv` and `form` are the two hover hints: over the CV button, and over the
    send button while the form is not ready to go.
  */
  lemon: {
    en: {
      bubble: "Welcome! I'm Limonacho",
      cv: 'Have a look',
      form: 'Fill the fields in first',
    },
    es: {
      bubble: '¡Bienvenido! Soy Limonacho',
      cv: 'Échale un ojo',
      form: 'Rellena antes los campos',
    },
  },
}

export default copy
