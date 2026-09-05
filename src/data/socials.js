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

// Linked from the About section. Lives in public/, so this is a literal path.
export const cvPath = '/uploads/cv-es.pdf'

export default socials
