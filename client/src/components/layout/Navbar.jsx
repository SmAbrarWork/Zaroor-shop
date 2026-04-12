import { Link } from 'react-router-dom'
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
  const events = useAppSelector(selectAllEvents)
  const activeEvent = useAppSelector(selectActiveEvent)
  const user = useAppSelector(selectUser)

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[var(--color-primary)]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link to="/" className="shrink-0">
          <p className="text-[10px] uppercase tracking-[0.3em] text-white/50">ZA.pk Drops</p>
          <h1 className="text-base font-bold leading-tight text-[var(--color-text)]">{activeEvent.name}</h1>
        </Link>

        <div className="flex items-center gap-3">
          <div className="relative hidden sm:block">
            <select
              className="appearance-none rounded-full border border-white/20 bg-white/5 py-1.5 pl-3 pr-8 text-xs text-[var(--color-text)] transition-colors focus:border-white/40 focus:outline-none"
              value={activeEvent.slug}
              onChange={(e) => dispatch(setActiveEventBySlug(e.target.value))}
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
                  className="rounded-full bg-[var(--color-accent)]/20 px-3 py-1.5 text-xs font-medium text-[var(--color-accent)] hover:bg-[var(--color-accent)]/30"
                >
                  Admin
                </Link>
              )}
              <span className="hidden text-xs text-white/60 sm:block">{user.name}</span>
              <button
                onClick={() => dispatch(logout())}
                className="rounded-full border border-white/20 px-3 py-1.5 text-xs text-white/60 hover:bg-white/10"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="rounded-full border border-white/20 bg-white/5 px-4 py-1.5 text-xs font-medium hover:bg-white/10"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
