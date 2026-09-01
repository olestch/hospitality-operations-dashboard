import { createRouter, createWebHistory } from 'vue-router'

import { createDocumentTitle } from '@/app/router/pageTitle'
import { routes } from '@/app/router/routes'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

router.afterEach((to) => {
  document.title = createDocumentTitle(to.meta.title)
})

export default router
