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
}

export default createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  // Section jumps are anchors within the same page, so we let the global
  // `scroll-behavior: smooth` handle the animation.
  scrollBehavior(to) {
    if (to.hash) return { el: to.hash }
    return { top: 0 }
  },
})
