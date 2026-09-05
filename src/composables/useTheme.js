import { readonly, ref } from 'vue'

/*
  Colour theme: 'dark' (the default) or 'light'.

  The `theme` ref is declared HERE, at module scope, not inside the function.
  A module is evaluated once no matter how many files import it, so every
  component that calls useTheme() gets the same ref and they all stay in sync
  automatically. Declaring it inside the function would give each caller its
  own private copy, and the navbar toggle would not move the rest of the page.
  Same pattern in useLang().
*/

const STORAGE_KEY = 'krub-theme'
const DEFAULT_THEME = 'dark'

const theme = ref(DEFAULT_THEME)

/** Reads the saved choice. Returns null when there isn't a valid one. */
function readStored() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved === 'dark' || saved === 'light' ? saved : null
  } catch {
    // Private browsing and blocked site data both throw here. Not being able
    // to remember the choice is not a reason to fail to render.
    return null
  }
}

/*
  Dark is the ABSENCE of the attribute, matching the stylesheet: :root holds
  the dark values and [data-theme="light"] overrides them. So light sets the
  attribute and dark removes it — never data-theme="dark".
*/
function apply(next) {
  const root = document.documentElement
  if (next === 'light') root.setAttribute('data-theme', 'light')
  else root.removeAttribute('data-theme')
}

function persist(next) {
  try {
    localStorage.setItem(STORAGE_KEY, next)
  } catch {
    // Ignore: the theme still works for this visit, it just won't be remembered.
  }
}

function set(next) {
  theme.value = next === 'light' ? 'light' : 'dark'
  apply(theme.value)
  persist(theme.value)
}

/*
  Called once from main.js, before the app mounts. The inline script in
  index.html has already painted the right theme to avoid a flash; this only
  brings the ref into agreement with what is on screen.
*/
export function initTheme() {
  theme.value = readStored() ?? DEFAULT_THEME
  apply(theme.value)
}

export function useTheme() {
  return {
    // readonly so a component cannot assign to it directly and skip the side
    // effects (writing the attribute, saving the choice). Go through toggle().
    theme: readonly(theme),
    toggle: () => set(theme.value === 'dark' ? 'light' : 'dark'),
    set,
  }
}
