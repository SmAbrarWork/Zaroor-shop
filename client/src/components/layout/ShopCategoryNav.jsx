import { NavLink } from 'react-router-dom'
import { useAppSelector } from '../../app/hooks'
import { selectActiveEvent } from '../../features/event/eventSelectors'

const linkBase =
  'inline-flex min-h-10 items-center whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold transition-colors duration-200 sm:min-h-9 sm:border sm:px-3 sm:py-1.5'
const inactive = 'text-white/75 hover:text-white max-sm:bg-white/[0.06] sm:border-white/15 sm:bg-white/5 sm:text-white/70 sm:hover:border-white/25 sm:hover:bg-white/10 sm:hover:text-white'
const active = 'text-[var(--color-accent)] max-sm:bg-[color-mix(in_srgb,var(--color-accent)_16%,transparent)] sm:border-[color-mix(in_srgb,var(--color-accent)_55%,transparent)] sm:bg-[color-mix(in_srgb,var(--color-accent)_14%,transparent)] sm:text-[var(--color-accent)]'

export default function ShopCategoryNav() {
  const activeEvent = useAppSelector(selectActiveEvent)

  if (!activeEvent) return null

  return (
    <nav
      aria-label="Shop by category"
      className="flex gap-2 overflow-x-auto px-3 py-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:gap-2 sm:px-0.5 sm:pb-1 sm:pt-0.5 [&::-webkit-scrollbar]:hidden"
    >
      <NavLink
        to="/"
        end
        className={({ isActive }) => `${linkBase} ${isActive ? active : inactive}`}
      >
        Hot drops
      </NavLink>
      <NavLink
        to="/shop/shirts"
        className={({ isActive }) => `${linkBase} ${isActive ? active : inactive}`}
      >
        Shirts
      </NavLink>
    </nav>
  )
}
