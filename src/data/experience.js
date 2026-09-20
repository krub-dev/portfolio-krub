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
    from: '2026',
    to: '2026',
    current: false,
    en: {
      title: 'Fullstack developer (freelance) · CreandoMientras',
      body: 'Public site and self-service admin panel for a handmade macramé business. Vue 3 with Vue Router and its own design system, content edited through a Git-based headless CMS (Sveltia), and automatic deployment on Vercel with image optimisation in CI.',
    },
    es: {
      title: 'Desarrollador fullstack (freelance) · CreandoMientras',
      body: 'Web pública y panel de autogestión para un negocio artesano de macramé. Vue 3 con Vue Router y design system propio, contenidos editables con un CMS headless sobre Git (Sveltia), y despliegue automático en Vercel con optimización de imágenes en CI.',
    },
  },
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
      title: '3D artist and modeller (freelance) · DIM Tech 3D',
      body: 'Characters, props and environments for games, and 3D generalist work in VFX with modelling and UV mapping. Miniatures for 3D printing, 3D cards for a board game, gym equipment and exercise animation for a fitness app. At DIM Tech 3D, product digitalisation for El Corte Inglés, Mayoral, GOBIK, Bugaboo, Tesoro Yachts and Mobel, with modelling, sculpting, texturing, baking and cloth simulation.',
    },
    es: {
      title: 'Artista 3D y modelador (freelance) · DIM Tech 3D',
      body: 'Personajes, props y entornos para videojuegos, y trabajo de generalista 3D en VFX con modelado y mapeado UV. Miniaturas para impresión 3D, cartas 3D para un juego de mesa, material de gimnasio y animación de ejercicios para una app de fitness. En DIM Tech 3D, digitalización de producto para El Corte Inglés, Mayoral, GOBIK, Bugaboo, Tesoro Yachts y Mobel, con modelado, escultura, texturizado, bakeado y simulación de telas.',
    },
  },
]

export default experience
