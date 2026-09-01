import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'overview',
    component: () => import('@/modules/dashboard/pages/OverviewPage.vue'),
    meta: { title: 'Overview' },
  },
  {
    path: '/bookings',
    name: 'bookings',
    component: () => import('@/modules/bookings/pages/BookingsPage.vue'),
    meta: { title: 'Bookings' },
  },
  {
    path: '/analytics',
    name: 'analytics',
    component: () => import('@/modules/analytics/pages/AnalyticsPage.vue'),
    meta: { title: 'Analytics' },
  },
  {
    path: '/quality',
    name: 'quality',
    component: () => import('@/modules/quality/pages/QualityPage.vue'),
    meta: { title: 'Quality' },
  },
  {
    path: '/inventory',
    name: 'inventory',
    component: () => import('@/modules/inventory/pages/InventoryPage.vue'),
    meta: { title: 'Inventory' },
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('@/modules/profile/pages/ProfilePage.vue'),
    meta: { title: 'Profile' },
  },
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

router.afterEach((to) => {
  const pageTitle = typeof to.meta.title === 'string' ? to.meta.title : 'Dashboard'
  document.title = `${pageTitle} · Hospitality Operations Dashboard`
})

export default router
