export interface NavigationItem {
  label: string
  to: string
}

export const primaryNavigation: readonly NavigationItem[] = [
  { label: 'Overview', to: '/' },
  { label: 'Bookings', to: '/bookings' },
  { label: 'Analytics', to: '/analytics' },
  { label: 'Quality', to: '/quality' },
  { label: 'Inventory', to: '/inventory' },
]
