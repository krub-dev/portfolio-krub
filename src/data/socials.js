/*
  Social links. Used in three places: the Contact section icons, the mobile
  menu grid, and (potentially) the footer.

    name  Visible label in the mobile menu, and the aria-label on the icon
          button in Contact, which has no text of its own.
    href  Full URL. Every one of these renders with target="_blank" and
          rel="noopener".
    icon  Which inline SVG the SocialLink component should draw. These are
          hand-drawn single-colour paths that inherit currentColor so they can
          turn yellow on hover — not the Devicon files in public/icons/, which
          are full-colour and meant for the Stack grid.

  Adding a network means adding an entry here AND a path in the icon map inside
  SocialLink. That is the one place this file cannot be self-contained.
*/
export const socials = [
  { name: 'GitHub', href: 'https://github.com/krub-dev', icon: 'github' },
  { name: 'LinkedIn', href: 'https://linkedin.com/in/krub', icon: 'linkedin' },
  { name: 'X', href: 'https://x.com/krub_dev', icon: 'x' },
]

// The email behind every "Let's talk ↗" button on the page.
export const email = 'krubioillan@gmail.com'

/*
  Paths to files in public/, kept here rather than written into a template.

  Beyond the no-hardcoded-URLs rule, there is a concrete reason for the photo:
  Vite's SFC compiler rewrites a literal `<img src="...">` into an import and
  emits a hashed copy — even when the path is absolute. The photo was being
  shipped twice, once hashed by the bundler and once copied from public/. A
  bound `:src` is not statically analysable, so the bundler leaves it alone and
  the public copy is the only one.
*/
export const cvPath = '/uploads/cv-es.pdf'
export const photoPath = '/assets/img/krub-pfp.jpeg'

export default socials
