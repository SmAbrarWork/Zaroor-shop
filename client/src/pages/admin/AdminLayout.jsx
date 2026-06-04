import { useEffect } from 'react'
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAppSelector } from '../../app/hooks'
import { selectUser } from '../../features/auth/authSelectors'
import AdminNavIcon from '../../components/admin/AdminNavIcon.jsx'
import { adminNavItems, isAdminNavActive } from '../../utils/adminNav.js'

function NavLink({ item, active, compact }) {
  const base = compact
    ? 'flex min-w-[4.25rem] shrink-0 flex-col items-center gap-1 rounded-lg px-2 py-2 transition-colors'
    : 'flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-colors'

  const state = active
    ? compact
      ? 'bg-white/10 text-white'
      : 'bg-white/10 font-medium text-white'
    : compact
      ? 'text-white/55 hover:bg-white/5 hover:text-white/85'
      : 'text-white/50 hover:bg-white/5 hover:text-white/80'

  return (
    <Link to={item.to} className={`${base} ${state}`}>
      <AdminNavIcon name={item.icon} className={compact ? 'h-5 w-5 shrink-0' : 'h-4 w-4 shrink-0'} />
      <span className={compact ? 'max-w-[4.5rem] truncate text-center text-[10px] leading-tight' : ''}>
        {compact ? item.shortLabel : item.label}
      </span>
    </Link>
  )
}

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
    <div className="min-h-screen bg-slate-950 text-white [color-scheme:dark]">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-900/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <Link to="/" className="shrink-0 text-xs text-white/40 hover:text-white/70">
              ← Store
            </Link>
            <h1 className="truncate text-sm font-bold sm:text-base">Admin</h1>
          </div>
          <span className="max-w-[45vw] truncate text-right text-xs text-white/50 sm:max-w-none">
            {user.email}
          </span>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-4 sm:py-6">
        <nav className="hidden w-52 shrink-0 space-y-0.5 md:block">
          {adminNavItems.map((item) => (
            <NavLink
              key={item.to}
              item={item}
              active={isAdminNavActive(location.pathname, item.to)}
            />
          ))}
        </nav>

        <main className="min-w-0 flex-1 pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] md:pb-0">
          <Outlet />
        </main>
      </div>

      <nav
        className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-slate-900/98 backdrop-blur-xl pb-[env(safe-area-inset-bottom,0px)] md:hidden"
        aria-label="Admin navigation"
      >
        <div className="flex gap-0.5 overflow-x-auto px-2 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {adminNavItems.map((item) => (
            <NavLink
              key={item.to}
              item={item}
              compact
              active={isAdminNavActive(location.pathname, item.to)}
            />
          ))}
        </div>
      </nav>
    </div>
  )
}
