import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '../views/HomeView.vue'

// The site is a single page for now. The router is wired up from the start so
// that adding a second route later (a case study, a legal notice) does not mean
// restructuring the app.
const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    // The route that owns the hero wrapper. usePastHero reads this to know
    // whether there is a hero to scroll past at all.
    meta: { hero: true },
  },
  {
    // The form's privacy notice. Lazy-loaded: it is reached from the form, not
    // on the way in, and it has no business in the initial bundle.
    path: '/privacy',
    name: 'privacy',
    component: () => import('../views/PrivacyView.vue'),
  },
]

// Dev-only scaffolding: a visual sheet for the tokens now, and for the base
// components from step 5 on. Lazy-loaded and excluded from the production
// build, so it never reaches the deployed site.
if (import.meta.env.DEV) {
  routes.push({
    path: '/preview',
    name: 'preview',
    component: () => import('../views/PreviewView.vue'),
  })
  routes.push({
    path: '/logo-lab',
    name: 'logo-lab',
    component: () => import('../views/LogoLabView.vue'),
  })
}

// Last, so it only catches what nothing above matched. Lazy-loaded: the 404 is
// rarely reached and has no business in the initial bundle.
routes.push({
  path: '/:pathMatch(.*)*',
  name: 'not-found',
  component: () => import('../views/NotFoundView.vue'),
})

export default createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  /*
    A route change lands at the top at once. `html { scroll-behavior: smooth }`
    is global, so this has to beat it, and `behavior: 'instant'` is not enough on
    its own: a browser that does not know the value falls back to the global
    smooth and glides there, which is how the new page first showed at the old
    offset on a phone. Turning the smooth behaviour off for this one jump, then
    back on, is what makes it land. Section jumps are anchors within the same
    page, so those keep the global smooth, on purpose.
  */
  scrollBehavior(to) {
    if (to.hash) return { el: to.hash }

    const root = document.documentElement
    const smooth = root.style.scrollBehavior
    root.style.scrollBehavior = 'auto'
    // Reading layout first: without it the style is not applied yet and
    // Chromium still used the CSS smooth behaviour, gliding to the top instead.
    void root.offsetHeight
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    root.style.scrollBehavior = smooth

    // Handled here: the router must not scroll a second time.
    return false
  },
})
