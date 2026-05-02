import { Link, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import {
  selectActiveEvent,
  selectAllEvents,
} from '../../features/event/eventSelectors'
import { setActiveEventBySlug } from '../../features/event/eventSlice'
import { selectUser } from '../../features/auth/authSelectors'
import { logout } from '../../features/auth/authSlice'
import CartIcon from '../cart/CartIcon'

export default function Navbar() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const events = useAppSelector(selectAllEvents)
  const activeEvent = useAppSelector(selectActiveEvent)
  const user = useAppSelector(selectUser)

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[var(--color-primary)]/80 backdrop-blur-xl transition-[background-color,border-color,backdrop-filter] duration-300 ease-out">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-y-2 px-3 py-3 sm:px-4">
        <Link to="/" className="min-w-0 shrink transition-opacity duration-200 hover:opacity-90">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/60">ZA.pk Drops</p>
          <h1 className="max-w-[42vw] truncate text-base font-extrabold leading-tight text-[var(--color-text)] sm:max-w-[14rem] md:max-w-xs lg:max-w-md">
            {activeEvent?.name || 'Loading...'}
          </h1>
        </Link>

        <div className="flex items-center gap-3">
          <div className="relative hidden sm:block">
            <select
              className="appearance-none rounded-full border border-white/20 bg-white/5 py-1.5 pl-3 pr-8 text-xs text-[var(--color-text)] transition-[border-color,background-color,color] duration-200 ease-out focus:border-white/40 focus:outline-none"
              value={activeEvent?.slug || ''}
              onChange={(e) => {
                dispatch(setActiveEventBySlug(e.target.value))
                if (location.pathname !== '/') navigate('/')
              }}
              disabled={!activeEvent}
            >
              {events.map((event) => (
                <option key={event.slug} value={event.slug} className="bg-slate-900">
                  {event.name}
                </option>
              ))}
            </select>
            <span
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-white/70"
              aria-hidden="true"
            >
              ▼
            </span>
          </div>

          <CartIcon />

          {user ? (
            <div className="flex items-center gap-2">
              {user.role === 'admin' && (
                <Link
                  to="/admin"
                  title="Open admin — events, products, orders, users"
                  className="relative z-20 rounded-full border border-[var(--color-accent)]/35 bg-[var(--color-accent)]/15 px-3 py-1.5 text-xs font-semibold text-[var(--color-accent)] shadow-sm transition-colors duration-200 hover:bg-[var(--color-accent)]/25"
                >
                  Admin
                </Link>
              )}
              <span className="hidden text-xs text-white/60 sm:block">{user.name}</span>
              <button
                type="button"
                onClick={() => {
                  dispatch(logout())
                  toast.success('Signed out', { description: 'See you at the next drop.' })
                }}
                className="rounded-full border border-white/20 px-3 py-1.5 text-xs text-white/60 transition-colors duration-200 hover:bg-white/10"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="rounded-full border border-white/20 bg-white/5 px-4 py-1.5 text-xs font-medium transition-colors duration-200 hover:bg-white/10"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
