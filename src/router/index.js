import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '../views/HomeView.vue'
import UrlVerifierView from '../views/UrlVerifierView.vue'
import TncSimplifierView from '../views/TncSimplifierView.vue'
import ScamQuizView from '../views/ScamQuizView.vue'
import AwarenessView from '../views/AwarenessView.vue'
import DataSourcesView from '../views/DataSourcesView.vue'
import PrivacyView from '../views/PrivacyView.vue'
import EmergencyHelpView from '../views/EmergencyHelpView.vue'

const routes = [
  { path: '/', name: 'home', component: HomeView, meta: { title: 'Home' } },
  { path: '/url-verifier', name: 'url-verifier', component: UrlVerifierView, meta: { title: 'URL Verifier' } },
  { path: '/tnc-simplifier', name: 'tnc-simplifier', component: TncSimplifierView, meta: { title: 'Explain my Terms' } },
  { path: '/scam-quiz', name: 'scam-quiz', component: ScamQuizView, meta: { title: 'Scam Quiz' } },
  { path: '/awareness', name: 'awareness', component: AwarenessView, meta: { title: 'Awareness' } },
  { path: '/data-sources', name: 'data-sources', component: DataSourcesView, meta: { title: 'Our data sources' } },
  { path: '/privacy', name: 'privacy', component: PrivacyView, meta: { title: 'Privacy' } },
  { path: '/emergency-help', name: 'emergency-help', component: EmergencyHelpView, meta: { title: 'Get emergency help' } },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to) {
    if (to.hash) {
      return {
        el: to.hash,
        top: 24,
      }
    }

    return { top: 0 }
  },
})

router.afterEach((to) => {
  document.title = `${to.meta.title || 'SafeCheck'} | SafeCheck`
})

export default router
