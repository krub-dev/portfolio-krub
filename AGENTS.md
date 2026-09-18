# Working rules for this repository

Read [`docs/design-spec.md`](docs/design-spec.md) before touching anything visual and
[`docs/components.md`](docs/components.md) before creating a component. Follow
[`docs/roadmap.md`](docs/roadmap.md) for the order of work.

## Non-negotiable

1. **Nothing hardcoded.** No visible string, URL, or data literal inside a `.vue` template.
   It comes from a prop, from `src/locales/`, or from `src/data/`. If you find yourself typing
   a literal into a template, stop and move it.
2. **No literal colours.** Always `var(--token)`. The documented exceptions are colours that
   belong to a specific element rather than to the theme, and the design spec names each one:
   - the availability dot's green, `#39D98A` (spec §3.2);
   - Limonacho's own palette (spec §3.16) — leaf `#3EA34B` outlined `#2C7A36`, white eyes,
     `#0C0C0D` pupils, and the pores mixed from `var(--acc)` toward black.

   The test is whether the colour should follow the theme. A white eye that turned dark in the
   light theme would be a bug, not a feature — so it is not a token.
3. **Do not invent values.** Every measurement is in the design spec. If one is missing,
   measure it in `Home.dc.html` or `Design System.dc.html` (present locally, gitignored) —
   never approximate.
4. **JavaScript, not TypeScript.**
5. **Do not port the prototype's HTML.** It runs on a prototyping runtime (`support.js`,
   `<x-dc>`, `<sc-for>`, `<sc-if>`, inline styles). Rewrite as idiomatic Vue with
   `<script setup>` and `<style scoped>`.
6. **One `requestAnimationFrame` for everything that follows the mouse** — cursor, lemon
   pupils, logo parallax, magnetic hover. Never one loop per component. Every listener
   registered on mount is removed on unmount.

## Language

The repository is written in **English**: identifiers, comments, commit messages, and the
`.md` files. Conversation with the owner happens in Spanish.

## Comments

The owner is learning Vue on this project. Every composable and every block of scroll or
animation logic gets a short comment explaining *why*, not *what*. Do not comment the obvious.

## Commits

**Do not run `git commit`.** Stage the work, then hand over a ready-to-run command — the owner
commits.

He works in a **bash terminal inside VS Code**, but the Run button on a fenced block in the
Claude Code app fires **Windows PowerShell 5.1**. So keep handed-over commands valid in both:
no `&&`, no `printf`, no POSIX heredocs, and `git commit -m "subject" -m "body"` for multi-line
messages. Plain `git` and `npm` commands satisfy this on their own.

(PowerShell blocks the unsigned `npm.ps1` shim on this machine — every execution-policy scope is
`Undefined`, so it falls back to `Restricted`. `npm.cmd run dev` is the workaround if he is ever
back in PowerShell.)

One commit per roadmap step, subject in the imperative.

## Working rhythm

Finish a step, then stop and summarise what changed and which files were touched, so it can be
reviewed in the browser before the next one starts. Record any decision that is not obvious
from the code in [`docs/decisions.md`](docs/decisions.md).

## Settled design decisions — do not "improve" these

- The yellow `#FFC800` is the same in both themes; what changes is what is painted with `--mark`.
- The giant section number overlaps the title on purpose.
- The square hero stage is empty on purpose — it is the slot for a future 3D scene. No
  explanatory text inside it.
- No filler project cards, no user hints ("click to open", "optional section", photo captions).
- The lemon enters in a straight line from the right, no tilt, flat yellow body, no gradient.
- The project card arrow is `↗`, not `→`.
- The availability dot does not blink: the core is fixed, the outer ring pulses.
