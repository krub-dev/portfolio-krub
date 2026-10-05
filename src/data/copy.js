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
/*
  The three places, in one spot. The marquee loops them, and the banners read the
  same strings — by name, not by their index in the loop, which shifted the day
  the disciplines joined it.
*/
const locations = {
  en: 'Murcia · Barcelona · remote · Spain',
  es: 'Murcia · Barcelona · remoto · España',
}

export const copy = {
  locations,

  hero: {
    en: {
      badge: 'Available',
      // The badge while the season is on (Halloween).
      spooky: 'Spooky',
      line1: 'FULL STACK',
      line2: 'DEVELOPER',
      skills: 'Frontend · Backend · 3D · Applied AI',
      body: 'Based in Murcia after a few years in Barcelona. Open to remote, on-site or hybrid roles in either city. I come from 3D and it shows: detail, communication, deadlines.',
    },
    es: {
      badge: 'Disponible',
      spooky: 'Escalofriante',
      line1: 'DESARROLLADOR',
      line2: 'FULL STACK',
      skills: 'Frontend · Backend · 3D · IA Aplicada',
      body: 'Con base en Murcia tras varios años en Barcelona. Disponible en remoto, presencial o híbrido en cualquiera de las dos ciudades. Vengo del 3D y se nota: detalle, comunicación y plazos.',
    },
  },

  about: {
    en: {
      // What Limonacho says when the pointer lands on the photo.
      greet: 'Kiko!',
      p1: 'Making and building things is what I do. In 3D or in software, it does not matter.',
      p2: 'I build web applications end to end: backend in Java (Spring Boot) and Node (Express) over relational databases, and frontend in Vue 3. I work with clean architecture, automated testing (JUnit, Mockito, Jest, Supertest, Playwright) and production deploys.',
      p3: 'My time at 42 Barcelona gave me a grounding in C, algorithms, concurrency and low-level memory management, plus a strong autonomy for tackling complex problems and the habit of code review among peers. I bring AI tools into my daily flow without delegating the technical judgement: I direct the architecture, the specification (SDD) and the tests (TDD), always answering for the code I ship.',
      p4: 'I come from more than six years as a 3D professional, modelling and texturing for games, apps and e-commerce. It shapes how I work: attention to detail, iterating on feedback, direct contact with the client and a commitment to deadlines.',
      open: 'Open to Full Stack, Frontend or Backend roles.',
    },
    es: {
      greet: '¡Kiko!',
      p1: 'Hacer y construir es lo mío. En 3D o en software, da igual.',
      p2: 'Construyo aplicaciones web de extremo a extremo: backend en Java (Spring Boot) y Node (Express) sobre bases de datos relacionales, y frontend en Vue 3. Trabajo con arquitectura limpia, testing automatizado (JUnit, Mockito, Jest, Supertest, Playwright) y despliegues en producción.',
      p3: 'Mi paso por 42 Barcelona me dio base en C, algoritmia, concurrencia y gestión de memoria a bajo nivel, sumado a una gran autonomía para resolver retos complejos y el hábito del code review entre pares. Integro herramientas de IA en mi flujo diario sin delegar el criterio técnico: dirijo la arquitectura, la especificación (SDD) y las pruebas (TDD), respondiendo siempre por el código que entrego.',
      p4: 'Vengo de más de seis años como profesional 3D, modelando y texturizando para videojuegos, apps y e-commerce. Eso marca cómo trabajo: atención al detalle, iteración sobre feedback, trato directo con cliente y compromiso con los plazos.',
      open: 'Abierto a roles Full Stack, Frontend o Backend.',
    },
  },

  // The marquee loops these two phrases forever, joined by the separator.
  // Add or remove entries freely; the band duplicates whatever it is given.
  marquee: {
    en: ['Full Stack Developer', 'Frontend · Backend · 3D · Applied AI', locations.en],
    es: ['Desarrollador Full Stack', 'Frontend · Backend · 3D · IA Aplicada', locations.es],
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
      // What he says when the season has turned him into a pumpkin.
      pumpkin: "Boo! I'm Calabazacho",
      // And when he has just switched the lights back on.
      touched: 'You only had to touch me!',
      cv: 'Have a look',
      form: 'Fill the fields in first',
    },
    es: {
      bubble: '¡Bienvenido! Soy Limonacho',
      pumpkin: '¡Bu! Soy Calabazacho',
      touched: '¡Solo tenías que tocarme!',
      cv: 'Échale un ojo',
      form: 'Rellena antes los campos',
    },
  },
}

export default copy
