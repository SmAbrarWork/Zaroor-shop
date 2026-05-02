import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { selectIsAuthenticated } from '../features/auth/authSelectors'
import { selectCartItems, selectCartTotal, selectCartCount } from '../features/cart/cartSelectors'
import {
  updateQuantityLocal, removeFromCartLocal, clearCartLocal,
  updateCartItemServer, removeFromCartServer,
} from '../features/cart/cartSlice'
import { formatCurrencyPKR } from '../utils/dateUtils'
import Button from '../components/ui/Button'
import CartItem from '../components/cart/CartItem'
import CartSummary from '../components/cart/CartSummary'

export default function Cart() {
  const dispatch = useAppDispatch()
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const items = useAppSelector(selectCartItems)
  const total = useAppSelector(selectCartTotal)
  const count = useAppSelector(selectCartCount)

  const toLineId = (item) => {
    const productId = item.product?._id || item.product?.id
    const fallbackKey = [
      item.selectedOptions?.color || '',
      item.selectedOptions?.size || '',
      item.selectedOptions?.waistSize ?? '',
    ].join('|')
    return `${productId}::${item.variantKey || fallbackKey}`
  }

  const handleUpdateQuantity = async (item, quantity) => {
    if (quantity < 1) return
    const productId = item.product?._id || item.product?.id
    const variantKey = item.variantKey || ''
    if (isAuthenticated) {
      try {
        await dispatch(updateCartItemServer({ productId, quantity, variantKey })).unwrap()
      } catch (msg) {
        toast.error(typeof msg === 'string' ? msg : 'Could not update quantity', {
          description: 'Stock may have changed — refresh and try again.',
        })
      }
    } else {
      dispatch(updateQuantityLocal({ lineId: toLineId(item), quantity }))
    }
  }

  const handleRemove = async (item) => {
    const productId = item.product?._id || item.product?.id
    const name = item.product?.name || 'Item'
    const variantKey = item.variantKey || ''
    if (isAuthenticated) {
      try {
        await dispatch(removeFromCartServer({ productId, variantKey })).unwrap()
        toast.success('Removed from bag', { description: name })
      } catch (msg) {
        toast.error(typeof msg === 'string' ? msg : 'Could not remove item')
      }
    } else {
      dispatch(removeFromCartLocal(toLineId(item)))
      toast.success('Removed from bag', { description: name })
    }
  }

  const handleClear = () => {
    dispatch(clearCartLocal())
    toast.message('Bag cleared', { description: 'Your cart is empty.' })
  }

  if (items.length === 0) {
    return (
      <div className="rounded-3xl border border-white/15 bg-[color-mix(in_srgb,var(--color-surface)_55%,transparent)] px-6 py-12 text-center shadow-inner sm:px-12">
        <p className="text-xl font-black tracking-tight sm:text-2xl">Your bag is empty</p>
        <p className="mt-2 text-sm text-white/55">Browse the drop and add pieces you love.</p>
        <Link to="/">
          <Button className="mt-8">Shop the collection</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 overflow-x-hidden">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-2xl font-black tracking-tight sm:text-3xl">Your bag ({count})</h2>
          <p className="mt-1 text-xs text-white/50 sm:text-sm">
            <strong className="font-bold text-white/80">Merchandise</strong> {formatCurrencyPKR(total)} ·{' '}
            <strong className="font-bold text-white/80">Secure checkout</strong> — shipping added by zone at checkout
          </p>
        </div>
        <button
          type="button"
          onClick={handleClear}
          className="self-start text-sm text-white/45 underline decoration-white/15 underline-offset-4 transition-colors hover:text-white/75 sm:self-auto"
        >
          Clear all
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(260px,380px)] lg:items-start">
        <div className="min-w-0 space-y-3 sm:space-y-4">
          {items.map((item) => {
            const product = item.product
            if (!product) return null
            return (
              <CartItem
                key={toLineId(item)}
                item={item}
                product={product}
                quantity={item.quantity}
                onUpdateQuantity={handleUpdateQuantity}
                onRemove={handleRemove}
              />
            )
          })}
        </div>

        <CartSummary total={total} count={count} isAuthenticated={isAuthenticated} />
      </div>
    </div>
  )
}
