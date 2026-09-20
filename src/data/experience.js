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
    to: null,
    current: true,
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
    from: '2018',
    to: '2024',
    current: false,
    en: {
      title: '3D artist and modeller (freelance)',
      body: 'Six years of modelling, sculpting and texturing for games, apps and e-commerce, with direct client work and delivery to deadline. Miniatures and environments for 3D printing, 3D cards for a board game and exercise animation for a fitness app.',
    },
    es: {
      title: 'Artista 3D y modelador (freelance)',
      body: 'Seis años modelando, esculpiendo y texturizando para videojuegos, apps y e-commerce, con trato directo con cliente y entrega a plazo. Miniaturas y entornos para impresión 3D, cartas 3D para un juego de mesa y animación de ejercicios para una app de fitness.',
    },
  },
  {
    from: '2019',
    to: '2020',
    current: false,
    en: {
      title: 'DIM Tech 3D · 3D generalist',
      body: 'Product digitalisation for the e-commerce of El Corte Inglés, Mayoral, GOBIK, Bugaboo, Tesoro Yachts and Mobel. Modelling, sculpting, texturing, baking, scanning and cloth simulation, coordinating with each company and with international clients.',
    },
    es: {
      title: 'DIM Tech 3D · generalista 3D',
      body: 'Digitalización de producto para el e-commerce de El Corte Inglés, Mayoral, GOBIK, Bugaboo, Tesoro Yachts y Mobel. Modelado, escultura, texturizado, bakeado, escaneo y simulación de telas, coordinando con cada empresa y con cliente internacional.',
    },
  },
]

export default experience
