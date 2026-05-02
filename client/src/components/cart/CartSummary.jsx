import { Link } from 'react-router-dom'
import { formatCurrencyPKR } from '../../utils/dateUtils'
import Button from '../ui/Button'

export default function CartSummary({ total, count, isAuthenticated }) {
  return (
    <div className="h-fit space-y-5 rounded-2xl border border-white/12 bg-[color-mix(in_srgb,var(--color-surface)_65%,transparent)] p-5 shadow-lg lg:sticky lg:top-24">
      <div>
        <h3 className="text-lg font-bold tracking-tight">Order summary</h3>
        <p className="mt-0.5 text-xs text-white/45">{count} {count === 1 ? 'item' : 'items'} · PKR pricing</p>
      </div>
      <div className="space-y-3 text-sm">
        <div className="flex justify-between gap-4">
          <span className="text-white/55">Subtotal</span>
          <span className="font-medium tabular-nums">{formatCurrencyPKR(total)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-white/55">Shipping</span>
          <span className="max-w-[55%] text-right text-xs font-medium text-white/55">Set at checkout by destination</span>
        </div>
        <div className="border-t border-white/10 pt-4">
          <div className="flex justify-between gap-4 text-lg font-black">
            <span>Merchandise total</span>
            <span className="text-[var(--color-accent)] tabular-nums">{formatCurrencyPKR(total)}</span>
          </div>
          <p className="mt-2 text-[10px] text-white/35">Final total includes zone shipping at checkout.</p>
        </div>
      </div>
      {isAuthenticated ? (
        <Link to="/checkout" className="block">
          <Button className="w-full min-h-[44px] py-3 text-base font-semibold shadow-[0_12px_40px_color-mix(in_srgb,var(--color-accent)_28%,transparent)]">
            Proceed to checkout
          </Button>
        </Link>
      ) : (
        <Link to="/login" state={{ from: '/checkout' }} className="block">
          <Button className="w-full min-h-[44px] py-3 text-base font-semibold shadow-[0_12px_40px_color-mix(in_srgb,var(--color-accent)_28%,transparent)]">
            Sign in to checkout
          </Button>
        </Link>
      )}
      <p className="text-center text-[11px] leading-relaxed text-white/35">
        <span className="font-semibold text-white/50">Sign in</span> to enter shipping and choose{' '}
        <span className="font-semibold text-white/50">cash on delivery</span>, JazzCash, or Easypaisa. Easy returns on eligible items.
      </p>
    </div>
  )
}
