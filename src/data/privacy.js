/*
  The privacy notice behind the form, for the /privacy page.

  Prose the owner can reword, so it lives here rather than in src/locales/: the
  dividing line is sentences versus labels, the same as copy.js. The page labels
  ("/privacy", "Last updated") stay in src/locales/.

  It is written for a portfolio contact form and nothing else: one controller,
  one purpose, one recipient path. Both languages sit side by side. Keep it in
  step with what the site actually does — if the form starts sending to another
  service, this text is part of the change.
*/
export const privacy = {
  en: {
    date: 'September 2026',
    intro:
      'This policy explains what happens to the data you send through the contact form. It is short because the form is simple: a name, an email and a message, used only to answer you.',
    sections: [
      {
        heading: 'Who is responsible',
        body: 'The data controller is Kiko Rubio (krub.dev). For anything about this policy you can write to contact@krub.dev.',
      },
      {
        heading: 'What I collect',
        body: 'Only what you type into the form: your name, your email and your message. So that bots cannot abuse it, sending the form also passes your IP address through Cloudflare Turnstile, a spam check, and counts the request against a per-IP rate limit. The site uses no tracking cookies: it keeps your theme and language in your own browser storage, and that never leaves your device.',
      },
      {
        heading: 'What it is for',
        body: 'To read your message and answer it. Nothing else: no newsletter, no advertising, no profiles, no automated decisions.',
      },
      {
        heading: 'On what basis',
        body: 'Your consent, which you give by ticking the box before sending (article 6.1.a of the GDPR). The spam and rate checks rest on the legitimate interest of keeping the form working (article 6.1.f).',
      },
      {
        heading: 'How long I keep it',
        body: 'Only as long as it takes to answer you and close the conversation, and then it is deleted. No copy is kept for anything else.',
      },
      {
        heading: 'Who else sees it',
        body: 'Only the providers that make the form work, as data processors: the site is hosted on Vercel, the message is delivered by Resend, and the spam check and the email routing belong to Cloudflare. Some of them process data outside the EU, under their own contractual safeguards. Your data is never sold or shared for advertising.',
      },
      {
        heading: 'Your rights',
        body: 'You can ask to see, correct, delete or get a copy of your data, to limit or stop its use, or to withdraw your consent at any time. Write to contact@krub.dev and I will answer. If you think I have mishandled it, you can complain to the Spanish data protection authority, the AEPD, at aepd.es.',
      },
      {
        heading: 'Changes',
        body: 'If this policy changes, the date at the top changes with it, and the new text replaces this one on the same page.',
      },
    ],
  },
  es: {
    date: 'Septiembre de 2026',
    intro:
      'Esta política explica qué pasa con los datos que me mandas desde el formulario de contacto. Es corta porque el formulario es simple: un nombre, un correo y un mensaje, usados solo para contestarte.',
    sections: [
      {
        heading: 'Quién es el responsable',
        body: 'El responsable del tratamiento es Kiko Rubio (krub.dev). Para cualquier cosa de esta política puedes escribirme a contact@krub.dev.',
      },
      {
        heading: 'Qué recojo',
        body: 'Solo lo que escribes en el formulario: tu nombre, tu correo y tu mensaje. Para que los bots no lo usen, enviarlo hace que tu IP pase por Cloudflare Turnstile, una comprobación antispam, y cuenta para un límite de peticiones por IP. La web no usa cookies de seguimiento: guarda tu tema y tu idioma en el almacenamiento de tu propio navegador, y eso no sale de tu dispositivo.',
      },
      {
        heading: 'Para qué es',
        body: 'Para leer tu mensaje y contestarte. Nada más: sin boletines, sin publicidad, sin perfiles y sin decisiones automáticas.',
      },
      {
        heading: 'Con qué base',
        body: 'Con tu consentimiento, que das al marcar la casilla antes de enviar (artículo 6.1.a del RGPD). Las comprobaciones antispam y de límite se apoyan en el interés legítimo de mantener el formulario en pie (artículo 6.1.f).',
      },
      {
        heading: 'Cuánto tiempo lo guardo',
        body: 'Solo el tiempo necesario para contestarte y cerrar la conversación, y después se borra. No guardo copia para nada más.',
      },
      {
        heading: 'Quién más lo ve',
        body: 'Solo los proveedores que hacen funcionar el formulario, como encargados del tratamiento: la web está alojada en Vercel, el mensaje lo entrega Resend y la comprobación antispam y el enrutado del correo son de Cloudflare. Algunos tratan datos fuera de la UE, con sus propias garantías contractuales. Tus datos no se venden ni se comparten para publicidad.',
      },
      {
        heading: 'Tus derechos',
        body: 'Puedes pedirme ver, corregir, borrar u obtener una copia de tus datos, limitar o parar su uso, o retirar tu consentimiento cuando quieras. Escríbeme a contact@krub.dev y te contesto. Si crees que lo he hecho mal, puedes reclamar ante la Agencia Española de Protección de Datos, la AEPD, en aepd.es.',
      },
      {
        heading: 'Cambios',
        body: 'Si esta política cambia, cambiará la fecha de arriba con ella, y el texto nuevo sustituirá a este en la misma página.',
      },
    ],
  },
}

export default privacy
