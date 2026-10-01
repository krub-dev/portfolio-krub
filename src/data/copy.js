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
  template renders line1 / line2, with line2 wrapped in a span coloured
  var(--acc-text), and then the skills line under it.
*/
export const copy = {
  hero: {
    en: {
      badge: 'Available',
      line1: 'FULL STACK',
      line2: 'DEVELOPER',
      skills: 'Frontend · Backend · 3D · Applied AI',
      body: 'Based in Murcia after a few years in Barcelona. Open to remote, on-site or hybrid roles in either city. I come from 3D and it shows: detail, communication, deadlines.',
    },
    es: {
      badge: 'Disponible',
      line1: 'DESARROLLADOR',
      line2: 'FULL STACK',
      skills: 'Frontend · Backend · 3D · IA Aplicada',
      body: 'Con base en Murcia tras unos años en Barcelona. Disponible en remoto, presencial o híbrido en cualquiera de las dos ciudades. Vengo del 3D y se nota: detalle, comunicación y plazos.',
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
    en: [
      'Full Stack Developer',
      'Frontend · Backend · 3D · Applied AI',
      'Murcia · Barcelona · remote · Spain',
    ],
    es: [
      'Desarrollador Full Stack',
      'Frontend · Backend · 3D · IA Aplicada',
      'Murcia · Barcelona · remoto · España',
    ],
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

  // The last card in the projects rail. Not a project: a way out to GitHub, for
  // whatever did not fit in four cards. The link's own label is in src/locales/.
  githubCard: {
    en: {
      title: 'Want to see more?',
      body: 'Take a look at my GitHub, I share projects and experiments there.',
    },
    es: {
      title: '¿Quieres ver más?',
      body: 'Pásate por mi GitHub, ahí comparto proyectos y experimentos.',
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
