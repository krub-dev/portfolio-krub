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
    // The sheet documents the chrome, so it does not wear it: no bar, no footer,
    // no lemon over the page, and a single grid that scrolls instead of the
    // hero/global pair.
    meta: { bare: true },
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
    Section jumps are anchors within the same page, so we let the global
    `scroll-behavior: smooth` handle the animation.

    A plain route change lands here at the top at once, but that single jump is
    not enough on a phone: the page can be put back at its old offset while the
    browser settles. App.vue repeats the jump until it holds; see decision 91.
  */
  scrollBehavior(to) {
    if (to.hash) return { el: to.hash }
    return { top: 0, behavior: 'instant' }
  },
})
