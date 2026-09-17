/*
  Social links. Used in two places: the rows in the Contact section and the
  mobile menu grid.

    name  Visible label in the row and the mobile menu, and the aria-label on
          the icon button, which has no text of its own.
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
  { name: 'LinkedIn', href: 'https://linkedin.com/in/krub', icon: 'linkedin' },
  { name: 'GitHub', href: 'https://github.com/krub-dev', icon: 'github' },
]

// The address behind every "Let's talk ↗" button on the page, and the one the
// contact form writes to.
export const email = 'kikorubioillan@gmail.com'

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
