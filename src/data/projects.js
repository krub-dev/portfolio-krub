/*
  Projects shown in the grid and in the detail modal, in display order.

  Translatable copy lives INSIDE each entry, in an `en` / `es` object, rather
  than in src/locales/. Adding or editing a project is then a single-file job,
  and there is no way to leave orphan keys behind in a dictionary. See
  docs/decisions.md.

  A component reads the right half with:
    const content = computed(() => project[lang.value])

  Fields:
    slug      URL-ish id. Also the modal path (/projects/<slug>) and the
              carousel label. Lowercase, no spaces.
    shotLabel Placeholder text drawn over the striped frame until there is a
              real screenshot. Drop it once `image` is set.
    image     Path under public/, or null while there is no screenshot.
    slides    How many images the modal carousel shows. Placeholder count for
              now; becomes the length of a real image list later.
    repo      Repository or admin panel URL.
    live      Live site or docs URL.
    stack     Full technology list. The card shows the first three joined by ·;
              the modal shows all of them as chips.
*/
export const projects = [
  {
    slug: 'creandomientras',
    shotLabel: 'SHOT · CREANDOMIENTRAS',
    image: null,
    slides: 4,
    repo: 'https://creandomientras.com/admin',
    live: 'https://creandomientras.com',
    stack: ['Vue 3', 'Vue Router', 'Vite', 'Sveltia CMS', 'Vercel', 'Sharp'],
    en: {
      name: 'CreandoMientras',
      tag: 'CLIENT',
      role: 'Design + development',
      year: '2025',
      repoLabel: '/panel',
      liveLabel: '/live ↗',
      summary:
        'Site and admin panel for a handmade macramé business. Vue 3 with a Git-based headless CMS.',
      lead: "Public site and self-service admin panel for CreandoMientras, Lourdes Campuzano's handmade macramé business.",
      body: 'Vue 3 SPA with Vue Router and its own CSS design system. Content is edited at /admin through a self-hosted Sveltia CMS: every save commits JSON to the repo and Vercel ships in about a minute, so there’s history and rollback with no server to maintain.',
      body2:
        'Events sort themselves by comparing dates, and images are optimised in CI with Sharp: WebP and AVIF at three widths, hash-skipping anything unchanged. Contact form on Web3Forms with honeypot, hCaptcha and GDPR consent. PageSpeed 99 on desktop, 100 on accessibility, best practices and SEO.',
    },
    es: {
      name: 'CreandoMientras',
      tag: 'CLIENTE',
      role: 'Diseño + desarrollo',
      year: '2025',
      repoLabel: '/panel',
      liveLabel: '/live ↗',
      summary:
        'Web y panel de gestión para un negocio artesano de macramé. Vue 3 con CMS headless sobre Git.',
      lead: 'Web pública y panel de autogestión para CreandoMientras, el negocio de macramé artesanal de Lourdes Campuzano.',
      body: 'SPA en Vue 3 con Vue Router y un design system propio en CSS. Los contenidos se editan desde /admin con Sveltia CMS autoalojado: cada guardado hace commit de JSON al repositorio y Vercel despliega en un minuto, así que hay historial y rollback sin mantener servidor.',
      body2:
        'Los eventos se clasifican solos comparando fechas, y las fotos se optimizan en CI con Sharp: WebP y AVIF en tres anchos, saltando por hash lo que no ha cambiado. Formulario con Web3Forms, honeypot, hCaptcha y consentimiento RGPD. PageSpeed 99 en escritorio y 100 en accesibilidad, best practices y SEO.',
    },
  },
  {
    slug: 'sideforge',
    shotLabel: 'SHOT · SIDEFORGE',
    image: null,
    slides: 3,
    repo: 'https://github.com/krub-dev/sideForge',
    live: 'https://github.com/krub-dev/sideForge#readme',
    stack: [
      'Java 17',
      'Spring Boot',
      'Spring Data JPA',
      'Spring Security',
      'MySQL',
      'Swagger',
      'JUnit',
      'Mockito',
    ],
    en: {
      name: 'sideForge',
      tag: 'BACKEND',
      role: 'Backend',
      year: '2025',
      repoLabel: '/repo',
      liveLabel: '/docs ↗',
      summary: 'Java Spring Boot REST API to manage and customise 3D assets for the web.',
      lead: 'Java and Spring Boot REST API to manage and customise 3D assets (t-shirts, mugs, mouse pads) for web visualisation.',
      body: 'Domain model with users, admins, customers, assets, scenes and designs: an authenticated user creates scenes, links assets and defines designs on specific parts of a model, with colours, materials, logos and text. 42 endpoints over 6 related entities and 18 DTOs, with Spring Data JPA over MySQL, pagination, search and centralised error handling.',
      body2:
        'Spring Security with role-based access, hashed passwords, Swagger/OpenAPI docs and a Postman collection for the demo. 112 tests — controllers with MockMvc, services with Mockito — at 81% line coverage. On the roadmap: JWT, cloud image storage, design versioning and the 3D integration on the front end.',
    },
    es: {
      name: 'sideForge',
      tag: 'BACKEND',
      role: 'Backend',
      year: '2025',
      repoLabel: '/repo',
      liveLabel: '/docs ↗',
      summary:
        'API REST en Java con Spring Boot para gestionar y personalizar assets 3D en la web.',
      lead: 'API REST en Java y Spring Boot para gestionar y personalizar assets 3D (camisetas, tazas, alfombrillas) de cara a visualizarlos en web.',
      body: 'Modelo de dominio con usuarios, admins, clientes, assets, escenas y diseños: un usuario autenticado crea escenas, asocia assets y define diseños por partes concretas del modelo, con colores, materiales, logos y textos. 42 endpoints sobre 6 entidades relacionadas y 18 DTOs, con Spring Data JPA sobre MySQL, paginación, búsqueda y manejo de errores centralizado.',
      body2:
        'Spring Security con acceso por rol, contraseñas hasheadas, documentación en Swagger/OpenAPI y colección de Postman para la demo. 112 tests — controladores con MockMvc, servicios con Mockito — con un 81 % de cobertura de líneas. En la hoja de ruta: JWT, almacenamiento de imágenes en la nube, versionado de diseños y la integración 3D en el front.',
    },
  },
  {
    slug: 'krub-dev',
    shotLabel: 'SHOT · KRUB.DEV',
    image: null,
    slides: 3,
    repo: 'https://github.com/krub-dev/portfolio-krub',
    live: 'https://krub.dev',
    stack: ['Vue 3', 'Vite', 'vue-i18n', 'Vitest', 'Playwright', 'Vercel'],
    en: {
      name: 'krub.dev',
      tag: 'PORTFOLIO',
      role: 'Design + development',
      year: '2026',
      repoLabel: '/repo',
      liveLabel: '/live ↗',
      summary:
        'This site: a Vue 3 SPA with a design system of its own, built from a reference and tested end to end.',
      lead: 'The portfolio you are reading. Designed from a reference, rewritten as idiomatic Vue, and tested in a real browser.',
      body: 'Vue 3 with Vite and vue-i18n for the two languages, on a design system of its own: one token file drives two themes and six accent palettes, and no component keeps a colour or a string of its own. The scroll behaviour, the mascot, the project modal and the custom cursor share a single requestAnimationFrame loop, and every piece of motion switches off under prefers-reduced-motion.',
      body2:
        'The contact form posts to a serverless function, so the Web3Forms key stays on the server and never reaches the bundle. A unit suite with Vitest and a Playwright suite covering the flows that only fail in a real browser: the scroll spy, the focus trap and the footer on iOS. Deployed on Vercel.',
    },
    es: {
      name: 'krub.dev',
      tag: 'PORTFOLIO',
      role: 'Diseño + desarrollo',
      year: '2026',
      repoLabel: '/repo',
      liveLabel: '/live ↗',
      summary:
        'Esta web: una SPA en Vue 3 con design system propio, hecha desde una referencia y probada de punta a punta.',
      lead: 'El portfolio que estás leyendo. Diseñado desde una referencia, reescrito como Vue idiomático y probado en un navegador real.',
      body: 'Vue 3 con Vite y vue-i18n para los dos idiomas, sobre un design system propio: un solo fichero de tokens gobierna dos temas y seis paletas de acento, y ningún componente guarda un color ni un texto suyo. El scroll, la mascota, el modal de proyectos y el cursor comparten un único bucle de requestAnimationFrame, y todo el movimiento se apaga con prefers-reduced-motion.',
      body2:
        'El formulario de contacto envía a una función serverless, así que la clave de Web3Forms se queda en el servidor y nunca llega al bundle. Suite unitaria con Vitest y suite de Playwright cubriendo los flujos que solo fallan en un navegador real: el scroll spy, la trampa de foco y el pie en iOS. Desplegado en Vercel.',
    },
  },
  {
    slug: 'showroom',
    shotLabel: 'SHOT · SHOWROOM',
    image: null,
    slides: 4,
    repo: 'https://github.com/krub-dev/SHOWROOM-FULLSTACK-M3',
    live: 'https://showroom-fullstack-m3-production.up.railway.app/',
    stack: ['Vue 3', 'Express', 'PostgreSQL', 'Prisma', 'Jest', 'Railway'],
    en: {
      name: 'Showroom',
      tag: 'BOOTCAMP',
      role: 'Fullstack',
      year: '2025',
      repoLabel: '/repo',
      liveLabel: '/live ↗',
      summary: 'Fullstack app to manage and show projects: full CRUD, search and an admin panel.',
      lead: 'Ironhack Module 3 final project: a portfolio that administers itself.',
      body: 'Vue 3 frontend with Composition API and Vue Router; Express backend with PostgreSQL and Prisma ORM. Full CRUD, featured-projects system, search by title and technologies, and server-side pagination. Write operations are protected by an API key.',
      body2:
        'Deployed on Railway with Prisma migrations on every deploy and a health-check endpoint. 17 integration tests with Jest and Supertest against a real database, skeleton loaders, recoverable error states and a 100/100 Lighthouse accessibility score.',
    },
    es: {
      name: 'Showroom',
      tag: 'BOOTCAMP',
      role: 'Fullstack',
      year: '2025',
      repoLabel: '/repo',
      liveLabel: '/live ↗',
      summary:
        'App fullstack para gestionar y mostrar proyectos: CRUD completo, buscador y panel de administración.',
      lead: 'Proyecto final del Módulo 3 de Ironhack: un portfolio que se administra a sí mismo.',
      body: 'Frontend en Vue 3 con Composition API y Vue Router; backend en Express con PostgreSQL y Prisma ORM. CRUD completo, sistema de proyectos destacados, búsqueda por título y tecnologías, y paginación en servidor. Las operaciones de escritura van protegidas por API key.',
      body2:
        'Desplegado en Railway con migraciones de Prisma en cada deploy y endpoint de health check. 17 tests de integración con Jest y Supertest contra base de datos real, skeleton loaders, estados de error recuperables y 100/100 de accesibilidad en Lighthouse.',
    },
  },
]

export default projects
