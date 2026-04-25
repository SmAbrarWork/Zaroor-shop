import { useEffect } from 'react'
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAppSelector } from '../../app/hooks'
import { selectUser } from '../../features/auth/authSelectors'

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: '□' },
  { to: '/admin/users', label: 'Users', icon: '◉' },
  { to: '/admin/products', label: 'Products', icon: '◇' },
  { to: '/admin/orders', label: 'Orders', icon: '▤' },
  { to: '/admin/events', label: 'Events', icon: '◈' },
]

export default function AdminLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const user = useAppSelector(selectUser)

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/', { replace: true })
    }
  }, [user, navigate])

  if (!user || user.role !== 'admin') return null

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/10 bg-slate-900/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-xs text-white/40 hover:text-white/70">← Store</Link>
            <h1 className="text-sm font-bold">Admin Dashboard</h1>
          </div>
          <span className="text-xs text-white/50">{user.email}</span>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6">
        <nav className="fixed bottom-0 left-0 right-0 z-20 flex items-center justify-around border-t border-white/10 bg-slate-900/95 px-2 py-2 md:hidden">
          {navItems.map((item) => {
            const active = location.pathname === item.to
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`rounded-md px-2 py-1 text-[11px] ${active ? 'text-white' : 'text-white/60'}`}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>
        <nav className="hidden w-48 shrink-0 space-y-1 md:block">
          {navItems.map((item) => {
            const active = location.pathname === item.to
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                  active
                    ? 'bg-white/10 font-medium text-white'
                    : 'text-white/50 hover:bg-white/5 hover:text-white/80'
                }`}
              >
                <span className="text-xs">{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </nav>

        <main className="min-w-0 flex-1 pb-16 md:pb-0">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
