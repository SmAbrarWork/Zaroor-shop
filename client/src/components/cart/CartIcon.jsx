import { Link } from 'react-router-dom'
import { useAppSelector } from '../../app/hooks'
import { selectCartCount } from '../../features/cart/cartSelectors'

export default function CartIcon() {
  const count = useAppSelector(selectCartCount)

  return (
    <Link to="/cart" className="relative">
      <svg className="h-6 w-6 text-white/80 hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
      </svg>
      {count > 0 && (
        <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-accent)] text-[10px] font-bold text-black">
          {count}
        </span>
      )}
    </Link>
  )
}
