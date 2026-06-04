import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion as Motion } from 'framer-motion'
import { useAppSelector } from '../../app/hooks'
import { selectCartCount } from '../../features/cart/cartSelectors'

export default function CartIcon() {
  const count = useAppSelector(selectCartCount)
  const bump = useAppSelector((s) => s.cart.cartIconBump)
  const prevBump = useRef(0)
  const [shakeToken, setShakeToken] = useState(0)

  useEffect(() => {
    if (bump > prevBump.current && bump > 0) {
      setShakeToken((t) => t + 1)
    }
    prevBump.current = bump
  }, [bump])

  return (
    <Link
      to="/cart"
      aria-label={`Shopping bag${count ? `, ${count} items` : ''}`}
      className="relative inline-flex h-10 w-10 shrink-0 touch-manipulation items-center justify-center rounded-full p-1.5 transition-colors hover:bg-white/5 sm:h-auto sm:w-auto"
    >
      <Motion.span
        key={shakeToken}
        className="inline-flex origin-center"
        initial={{ rotate: 0, scale: 1 }}
        animate={
          shakeToken > 0
            ? {
                rotate: [0, -14, 12, -10, 8, -5, 0],
                scale: [1, 1.12, 1.05, 1],
              }
            : {}
        }
        transition={{ duration: 0.55, ease: [0.34, 1.56, 0.64, 1] }}
      >
        <svg className="h-6 w-6 text-white/85 hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
        </svg>
      </Motion.span>
      {count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-[var(--color-accent)] px-1 text-[10px] font-bold tabular-nums text-black shadow-[0_0_12px_color-mix(in_srgb,var(--color-accent)_55%,transparent)]">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Link>
  )
}
