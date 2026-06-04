export const adminNavItems = [
  { to: '/admin', label: 'Dashboard', shortLabel: 'Home', icon: 'dashboard' },
  { to: '/admin/users', label: 'Users', shortLabel: 'Users', icon: 'users' },
  { to: '/admin/events', label: 'Events', shortLabel: 'Events', icon: 'events' },
  { to: '/admin/categories', label: 'Categories', shortLabel: 'Cats', icon: 'categories' },
  { to: '/admin/products', label: 'Products', shortLabel: 'Products', icon: 'products' },
  { to: '/admin/orders', label: 'Orders', shortLabel: 'Orders', icon: 'orders' },
  { to: '/admin/shop-settings', label: 'Shop', shortLabel: 'Shop', icon: 'settings' },
  { to: '/admin/campaign-banners', label: 'Banners', shortLabel: 'Banners', icon: 'banners' },
]

export function isAdminNavActive(pathname, to) {
  if (to === '/admin') return pathname === '/admin'
  return pathname === to || pathname.startsWith(`${to}/`)
}
