/*
  The four technology groups of the Stack section, in display order.

  Four, in a two-column grid. The AI tools close the last group rather than
  opening it: they are the newest thing there and the ones a reader is most
  likely to be looking for, and a pair at the end of a row is easier to find
  than a pair at the start of it.

  Group labels come from the dictionary (stack.g1…g4) because they are
  interface words, not prose — they happen to be identical in both languages
  today, but going through i18n means that stays a one-line change.

  Per technology:
    name          Shown in `alt` and in the readout the pointer drives. The only
                  text a screen reader gets.
    icon          Path under public/. Literal string, no bundler import —
                  see docs/decisions.md on why assets live in public/.
    invertOnDark  For dark monochrome logos (Express, Prisma, Three.js, GitHub,
                  Linux, Framer, OpenCode, GSAP) that would vanish against
                  --surface-2. These render at 38px inside the 60px tile and get
                  inverted in dark theme only. Everything else keeps its own
                  colours, which is what the spotlight brings back.
    wide          For a logo that is a wordmark rather than a mark. GSAP's is
                  almost 3:1, so it is given a wider box or it would render as a
                  thin stripe in the middle of its tile.

  Adding a technology: drop the SVG in public/icons/<name>/ and add a line.
*/
export const stack = [
  {
    labelKey: 'stack.g1',
    items: [
      { name: 'Java', icon: '/icons/java/java-original.svg', invertOnDark: false },
      { name: 'C', icon: '/icons/c/c-original.svg', invertOnDark: false },
      { name: 'JavaScript', icon: '/icons/javascript/javascript-original.svg', invertOnDark: false },
      { name: 'TypeScript', icon: '/icons/typescript/typescript-original.svg', invertOnDark: false },
    ],
  },
  {
    labelKey: 'stack.g2',
    items: [
      { name: 'Spring Boot', icon: '/icons/spring/spring-original.svg', invertOnDark: false },
      { name: 'Node.js', icon: '/icons/nodejs/nodejs-original.svg', invertOnDark: false },
      { name: 'Express', icon: '/icons/express/express-original.svg', invertOnDark: true },
      { name: 'MySQL', icon: '/icons/mysql/mysql-original.svg', invertOnDark: false },
      { name: 'PostgreSQL', icon: '/icons/postgresql/postgresql-original.svg', invertOnDark: false },
      { name: 'Prisma', icon: '/icons/prisma/prisma-original.svg', invertOnDark: true },
      { name: 'Supabase', icon: '/icons/supabase/supabase-original.svg', invertOnDark: false },
    ],
  },
  {
    labelKey: 'stack.g3',
    items: [
      { name: 'Vue', icon: '/icons/vuejs/vuejs-original.svg', invertOnDark: false },
      { name: 'HTML5', icon: '/icons/html5/html5-original.svg', invertOnDark: false },
      { name: 'CSS3', icon: '/icons/css3/css3-original.svg', invertOnDark: false },
      { name: 'Vite', icon: '/icons/vitejs/vitejs-original.svg', invertOnDark: false },
      { name: 'Three.js', icon: '/icons/threejs/threejs-original.svg', invertOnDark: true },
      { name: 'GSAP', icon: '/icons/gsap/gsap-original.svg', invertOnDark: true, wide: true },
      { name: 'Figma', icon: '/icons/figma/figma-original.svg', invertOnDark: false },
      { name: 'Framer', icon: '/icons/framer/framer-original.svg', invertOnDark: true },
      { name: 'Blender', icon: '/icons/blender/blender-original.svg', invertOnDark: false },
    ],
  },
  {
    labelKey: 'stack.g4',
    items: [
      { name: 'Git', icon: '/icons/git/git-original.svg', invertOnDark: false },
      { name: 'GitHub', icon: '/icons/github/github-original.svg', invertOnDark: true },
      { name: 'Docker', icon: '/icons/docker/docker-original.svg', invertOnDark: false },
      { name: 'Postman', icon: '/icons/postman/postman-original.svg', invertOnDark: false },
      { name: 'VS Code', icon: '/icons/vscode/vscode-original.svg', invertOnDark: false },
      { name: 'IntelliJ IDEA', icon: '/icons/intellij/intellij-original.svg', invertOnDark: false },
      { name: 'Vim', icon: '/icons/vim/vim-plain.svg', invertOnDark: false },
      { name: 'Linux', icon: '/icons/linux/linux-plain.svg', invertOnDark: true },
      { name: 'Claude', icon: '/icons/claude/claude-original.svg', invertOnDark: false },
      { name: 'OpenCode', icon: '/icons/opencode/opencode-original.svg', invertOnDark: true },
    ],
  },
]

export default stack
