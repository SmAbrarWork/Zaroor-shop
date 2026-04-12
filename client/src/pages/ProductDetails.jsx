import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { selectProductById } from '../features/products/productSelectors'
import { selectIsAuthenticated } from '../features/auth/authSelectors'
import { addToCartLocal, addToCartServer } from '../features/cart/cartSlice'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import { formatCurrencyPKR } from '../utils/dateUtils'
import { trackEvent } from '../utils/tracking'

export default function ProductDetails() {
  const { id } = useParams()
  const dispatch = useAppDispatch()
  const product = useAppSelector((state) => selectProductById(state, id))
  const isAuthenticated = useAppSelector(selectIsAuthenticated)

  useEffect(() => {
    if (product) trackEvent('view_content', { productId: product._id || product.id })
  }, [product])

  const handleAddToCart = () => {
    if (!product) return
    trackEvent('add_to_cart', { productId: product._id || product.id })
    if (isAuthenticated) {
      dispatch(addToCartServer({ productId: product._id || product.id }))
    } else {
      dispatch(addToCartLocal({ product }))
    }
  }

  if (!product) {
    return (
      <div className="rounded-3xl border border-white/20 bg-white/5 p-8 text-center">
        <p className="text-xl font-semibold">Product not found.</p>
        <Link to="/" className="mt-4 inline-block underline">
          Back to home
        </Link>
      </div>
    )
  }

  return (
    <div className="grid gap-8 rounded-3xl border border-white/20 bg-white/5 p-5 md:grid-cols-2">
      <img src={product.image} alt={product.name} className="h-full min-h-80 w-full rounded-2xl object-cover" />
      <div className="space-y-4">
        <Badge>{product.tags.join(' / ')}</Badge>
        <h2 className="text-4xl font-black">{product.name}</h2>
        <p className="text-sm text-white/80">{product.description}</p>
        <p className="text-2xl font-black text-[var(--color-accent)]">
          {formatCurrencyPKR(product.price)}
        </p>
        <div className="flex flex-wrap gap-3">
          <Button onClick={handleAddToCart}>
            Add to Cart
          </Button>
          <Button variant="ghost">Buy with JazzCash / Easypaisa</Button>
        </div>
      </div>
    </div>
  )
}
