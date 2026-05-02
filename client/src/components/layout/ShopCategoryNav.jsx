import { NavLink } from 'react-router-dom'
import { useAppSelector } from '../../app/hooks'
import { selectActiveEvent } from '../../features/event/eventSelectors'
import { selectCategories } from '../../features/categories/categorySelectors'

const linkBase =
  'whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-bold transition-colors duration-200'
const inactive = 'border-white/15 bg-white/5 text-white/70 hover:border-white/25 hover:bg-white/10 hover:text-white'
const active = 'border-[color-mix(in_srgb,var(--color-accent)_55%,transparent)] bg-[color-mix(in_srgb,var(--color-accent)_14%,transparent)] text-[var(--color-accent)]'

export default function ShopCategoryNav() {
  const activeEvent = useAppSelector(selectActiveEvent)
  const categories = useAppSelector(selectCategories)

  if (!activeEvent) return null

  return (
    <nav aria-label="Shop by category" className="-mx-1 flex gap-2 overflow-x-auto pb-1 pt-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <NavLink
        to="/"
        end
        className={({ isActive }) => `${linkBase} ${isActive ? active : inactive}`}
      >
        Hot drops
      </NavLink>
      <NavLink
        to="/shop/all"
        className={({ isActive }) => `${linkBase} ${isActive ? active : inactive}`}
      >
        Full catalog
      </NavLink>
      {categories.map((c) => (
        <NavLink
          key={c._id}
          to={`/shop/${c.slug}`}
          className={({ isActive }) => `${linkBase} ${isActive ? active : inactive}`}
        >
          {c.name}
        </NavLink>
      ))}
    </nav>
  )
}
