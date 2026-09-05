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
