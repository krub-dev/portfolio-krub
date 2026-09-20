/*
  The /certifications tab of the About section, newest first. Same shape as
  experience.js — see the comment there for what each field does.

  A certification has no period worth printing twice, so from and to are the
  same year and the timeline prints it once. The issuer goes in `body`, which is
  the line the row already gives to a description.
*/
export const certifications = [
  {
    from: '2026',
    to: '2026',
    current: false,
    en: { title: 'AI Skills Fest', body: 'Microsoft' },
    es: { title: 'AI Skills Fest', body: 'Microsoft' },
  },
  {
    from: '2026',
    to: '2026',
    current: false,
    en: { title: 'AWS Fundamentals: Cloud, Serverless and Operations', body: 'Commit Academy' },
    es: { title: 'Fundamentos de AWS: Cloud, Serverless y Operación', body: 'Commit Academy' },
  },
  {
    from: '2025',
    to: '2025',
    current: false,
    en: { title: 'Introduction to AI-assisted Development', body: 'BIGschool' },
    es: { title: 'Curso de Iniciación al Desarrollo con IA', body: 'BIGschool' },
  },
]

export default certifications
