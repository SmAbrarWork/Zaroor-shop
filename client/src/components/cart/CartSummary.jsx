import { Link } from 'react-router-dom'
import { formatCurrencyPKR } from '../../utils/dateUtils'
import Button from '../ui/Button'

export default function CartSummary({ total, count, isAuthenticated }) {
  return (
    <div className="h-fit space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6">
      <h3 className="text-lg font-bold">Order Summary</h3>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-white/60">Items ({count})</span>
          <span>{formatCurrencyPKR(total)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/60">Shipping</span>
          <span className="text-green-400">Free</span>
        </div>
        <div className="border-t border-white/10 pt-2">
          <div className="flex justify-between text-lg font-black">
            <span>Total</span>
            <span className="text-[var(--color-accent)]">{formatCurrencyPKR(total)}</span>
          </div>
        </div>
      </div>
      {isAuthenticated ? (
        <Button className="w-full">Proceed to Checkout</Button>
      ) : (
        <Link to="/login" state={{ from: '/cart' }}>
          <Button className="w-full">Login to Checkout</Button>
        </Link>
      )}
    </div>
  )
}
