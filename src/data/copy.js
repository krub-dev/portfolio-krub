/*
  THE WORDS. This is the file to open when you want to reword the site.

  Everything here is prose you wrote: the hero headline, the About paragraphs,
  the marquee phrases, the contact line. Both languages sit side by side so you
  can change a sentence and its translation without leaving the file.

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
      badge: 'Available for work',
      line1: 'I build things',
      line2: 'that hold up',
      line3pre: 'on the ',
      accent: 'backend',
      line3post: '.',
      body: 'Fullstack developer in Barcelona, leaning into backend: Java with Spring Boot, Node and databases. Vue on the front when needed. I used to do 3D, and it still shows in how I look at things.',
    },
    es: {
      badge: 'Disponible para trabajar',
      line1: 'Desarrollo cosas',
      line2: 'que aguantan',
      line3pre: 'el ',
      accent: 'backend',
      line3post: '.',
      body: 'Desarrollador fullstack en Barcelona, girando hacia backend: Java con Spring Boot, Node y bases de datos. Frontend en Vue cuando toca. Antes hacía 3D, y todavía se me nota en el ojo.',
    },
  },

  about: {
    en: {
      p1: 'I came from 3D and ended up programming — same thing, fewer twelve-hour renders.',
      p2: 'Six years modelling and texturing for games, apps and e-commerce taught me to ship on time and to sweat the details. Now I do the same with REST APIs in Java Spring Boot and Node, relational databases and Vue SPAs.',
      p3: 'From Murcia, living in Barcelona. Looking for a team where I can grow into backend while still poking at odd things in C on weekends.',
    },
    es: {
      p1: 'Vengo del 3D y acabé programando, que es lo mismo pero con menos renders de doce horas.',
      p2: 'Seis años modelando y texturizando para videojuegos, apps y e-commerce me enseñaron a entregar a tiempo y a mirar el detalle. Ahora hago lo mismo con APIs REST en Java Spring Boot y Node, bases de datos relacionales y SPAs en Vue.',
      p3: 'De Murcia, en Barcelona. Busco equipo donde crecer hacia backend sin dejar de tocar cosas raras en C los fines de semana.',
    },
  },

  // The marquee loops these two phrases forever, joined by the separator.
  // Add or remove entries freely; the band duplicates whatever it is given.
  marquee: {
    en: ['Fullstack developer → backend', 'From Murcia, based in Barcelona · Spain'],
    es: ['Desarrollador fullstack → backend', 'De Murcia, afincado en Barcelona · España'],
  },

  contact: {
    en: {
      body: "Tell me the problem. I'll tell you how I'd solve it and how long it takes.",
    },
    es: {
      body: 'Cuéntame el problema. Te digo cómo lo resolvería y cuánto tardo.',
    },
  },

  // What Limonacho says when you poke him. The bubble hides itself after a few
  // seconds; turn the whole mascot off in config.js.
  lemon: {
    en: { bubble: "Welcome! I'm Limonacho" },
    es: { bubble: '¡Bienvenido! Soy Limonacho' },
  },
}

export default copy
