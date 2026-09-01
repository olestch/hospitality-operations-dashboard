import type { RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
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
    path: '/settings',
    name: 'settings',
    component: () => import('@/modules/profile/pages/SettingsPage.vue'),
    meta: { title: 'Settings' },
  },
  { path: '/profile', redirect: '/settings' },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/app/pages/NotFoundPage.vue'),
    meta: { title: 'Page not found' },
  },
]
