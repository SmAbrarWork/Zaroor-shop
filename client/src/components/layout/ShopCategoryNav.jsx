import { NavLink } from 'react-router-dom'
import { useAppSelector } from '../../app/hooks'
import { selectActiveEvent } from '../../features/event/eventSelectors'

const linkBase =
  'inline-flex min-h-9 items-center whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-bold transition-colors duration-200'
const inactive = 'border-white/15 bg-white/5 text-white/70 hover:border-white/25 hover:bg-white/10 hover:text-white'
const active = 'border-[color-mix(in_srgb,var(--color-accent)_55%,transparent)] bg-[color-mix(in_srgb,var(--color-accent)_14%,transparent)] text-[var(--color-accent)]'

export default function ShopCategoryNav() {
  const activeEvent = useAppSelector(selectActiveEvent)

  if (!activeEvent) return null

  return (
    <nav aria-label="Shop by category" className="-mx-0.5 flex gap-2 overflow-x-auto px-0.5 pb-1 pt-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
