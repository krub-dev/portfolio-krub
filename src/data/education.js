/*
  The /education tab of the About section, newest first. Same shape as
  experience.js — see the comment there for what each field does.

  To add the DAW higher-level qualification when it starts, copy this block to
  the top of the list and fill it in. `to: null` makes the timeline print
  "2026 — now" using the translated word, so it stays correct on its own:

    {
      from: '2026',
      to: null,
      current: true,
      en: { title: '', body: '' },
      es: { title: '', body: '' },
    },
*/
export const education = [
  {
    from: '2024',
    to: '2026',
    current: false,
    en: {
      title: '42 Barcelona · programming and software development',
      body: 'Data structures and algorithms in C, Bash, Git and Unix environments. Peer-to-peer methodology: team projects and code review between peers.',
    },
    es: {
      title: '42 Barcelona · programación y desarrollo de software',
      body: 'Estructuras de datos y algoritmos en C, Bash, Git y entornos Unix. Metodología peer-to-peer: proyectos en equipo y revisión de código entre pares.',
    },
  },
  {
    from: '2025',
    to: '2025',
    current: false,
    en: {
      title: 'Ironhack · Full Stack web development (IFCD0210)',
      body: '590 intensive hours: Java with Spring Boot, Node.js, MySQL and PostgreSQL, Docker, testing with JUnit and Mockito, Vue.js, cloud deployment and documentation with Postman and Swagger. Level 3 professional certificate, including a company internship.',
    },
    es: {
      title: 'Ironhack · Full Stack (IFCD0210)',
      body: '590 h intensivas: Java con Spring Boot, Node.js, MySQL y PostgreSQL, Docker, testing con JUnit y Mockito, Vue.js, despliegue en la nube y documentación con Postman y Swagger. Certificado de profesionalidad nivel 3, con prácticas en empresa.',
    },
  },
  {
    from: '2025',
    to: '2025',
    current: false,
    en: {
      title: 'La Salle · Ramon Llull University',
      body: 'Java fundamentals aligned with Oracle certification, plus web development with PHP and MySQL: OOP, database design and SQL.',
    },
    es: {
      title: 'La Salle · Universidad Ramon Llull',
      body: 'Fundamentos de Java alineados con certificación Oracle y desarrollo web con PHP y MySQL: POO, diseño de bases de datos y SQL.',
    },
  },
]

export default education
