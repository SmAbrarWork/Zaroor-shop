import { Link } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { selectIsAuthenticated } from '../features/auth/authSelectors'
import { selectCartItems, selectCartTotal, selectCartCount } from '../features/cart/cartSelectors'
import {
  addToCartLocal, updateQuantityLocal, removeFromCartLocal, clearCartLocal,
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

  const handleUpdateQuantity = (productId, quantity) => {
    if (quantity < 1) return
    if (isAuthenticated) {
      dispatch(updateCartItemServer({ productId, quantity }))
    } else {
      dispatch(updateQuantityLocal({ productId, quantity }))
    }
  }

  const handleRemove = (productId) => {
    if (isAuthenticated) {
      dispatch(removeFromCartServer(productId))
    } else {
      dispatch(removeFromCartLocal(productId))
    }
  }

  const handleClear = () => {
    dispatch(clearCartLocal())
  }

  if (items.length === 0) {
    return (
      <div className="rounded-3xl border border-white/20 bg-white/5 p-12 text-center">
        <p className="text-2xl font-bold">Your cart is empty</p>
        <p className="mt-2 text-sm text-white/60">Browse our drops and add something you love.</p>
        <Link to="/">
          <Button className="mt-6">Shop Now</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-black">Your Cart ({count})</h2>
        <button onClick={handleClear} className="text-sm text-white/50 underline hover:text-white/80">
          Clear All
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-4">
          {items.map((item) => {
            const product = item.product
            if (!product) return null
            return (
              <CartItem
                key={product._id || product.id}
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
