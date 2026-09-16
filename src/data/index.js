/*
  START HERE when you want to change what the site says.

  Every piece of content on this site is in this folder, and nowhere else. No
  component contains a sentence, a URL or a project name. Change a file here
  and the page follows.

    copy.js          hero headline, About paragraphs, marquee, contact line
    projects.js      the project grid and the detail modals
    experience.js    the /experience tab
    education.js     the /education tab
    stack.js         the four technology groups
    socials.js       social links, email address, CV path
    testimonials.js  quotes (placeholder for now, section off by default)
    config.js        on/off switches for the optional bits

  Two languages, one file. Anything translatable carries an `en` and an `es`
  object side by side, so rewording a sentence and its translation is a single
  edit in a single place. Collections keep their own copy rather than pointing
  at the dictionary, which means adding a project is one file, not three, and
  there is no way to leave a stale key behind.

  What is NOT here: interface strings — nav paths, button labels, aria-labels.
  Those live in src/locales/en.json and es.json. The line is:

      sentences you wrote   ->   src/data/
      labels the UI needs   ->   src/locales/

  Reading the right language in a component:

      import { copy } from '../../data'          // adjust depth to taste
      const { lang } = useLang()
      const hero = computed(() => copy.hero[lang.value])
*/
export { accents } from './accents.js'
export { config } from './config.js'
export { copy } from './copy.js'
export { education } from './education.js'
export { experience } from './experience.js'
export { projects } from './projects.js'
export { sections } from './sections.js'
export { socials, email, cvPath, photoPath } from './socials.js'
export { stack } from './stack.js'
export { testimonials } from './testimonials.js'
