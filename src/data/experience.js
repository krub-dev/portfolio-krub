/*
  The /experience tab of the About section, newest first.

  Fields:
    from     Start year, as a string.
    to       End year, or null for "still going". When null the timeline
             renders "2024 — now" using the translated word, so you never have
             to come back here to update it.
    current  Paints the years in var(--acc-text) instead of var(--fg-3). Usually
             the same as `to === null`, but kept separate so you can highlight a
             finished period if you want to.

  A single-year entry sets from and to to the same value; the timeline prints
  it once rather than "2025 — 2025".
*/
export const experience = [
  {
    from: '2024',
    to: null,
    current: true,
    en: {
      title: 'Fullstack developer · personal and collaborative projects',
      body: 'REST APIs in Java Spring Boot and Node.js with relational databases, Vue SPAs wired to the backend, Git and agile practices. Peer-to-peer technical challenges at 42 Barcelona.',
    },
    es: {
      title: 'Desarrollador fullstack · proyectos propios y colaborativos',
      body: 'APIs REST en Java Spring Boot y Node.js con bases de datos relacionales, SPAs en Vue conectadas al backend, Git y metodologías ágiles. Retos técnicos peer-to-peer en 42 Barcelona.',
    },
  },
  {
    from: '2018',
    to: '2024',
    current: false,
    en: {
      title: 'DIM Tech 3D · 3D artist and generalist',
      body: 'Modelling, sculpting and texturing for games, apps and e-commerce. Product digitalisation for El Corte Inglés, Mayoral, GOBIK and Tesoro Yachts. Cross-functional teams and international client delivery.',
    },
    es: {
      title: 'DIM Tech 3D · artista y generalista 3D',
      body: 'Modelado, escultura y texturizado para videojuegos, apps y e-commerce. Digitalización de producto para El Corte Inglés, Mayoral, GOBIK y Tesoro Yachts. Equipos multidisciplinares y entregas a cliente internacional.',
    },
  },
]

export default experience
