import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '../views/HomeView.vue'
import UrlVerifierView from '../views/UrlVerifierView.vue'
import TncSimplifierView from '../views/TncSimplifierView.vue'
import ScamQuizView from '../views/ScamQuizView.vue'

const routes = [
  { path: '/', name: 'home', component: HomeView, meta: { title: 'Home' } },
  { path: '/url-verifier', name: 'url-verifier', component: UrlVerifierView, meta: { title: 'URL Verifier' } },
  { path: '/tnc-simplifier', name: 'tnc-simplifier', component: TncSimplifierView, meta: { title: 'T&C Simplifier' } },
  { path: '/scam-quiz', name: 'scam-quiz', component: ScamQuizView, meta: { title: 'Scam Quiz' } },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

router.afterEach((to) => {
  document.title = `${to.meta.title || 'SafeCheck'} | SafeCheck`
})

export default router
