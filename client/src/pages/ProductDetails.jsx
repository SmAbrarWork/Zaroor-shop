import { useEffect } from 'react'
import { useMemo, useState } from 'react'
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
  const colors = product?.options?.colors || []
  const sizes = product?.options?.sizes || []
  const waistSizes = product?.options?.waistSizes || []
  const [selectedColor, setSelectedColor] = useState('')
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedWaistSize, setSelectedWaistSize] = useState(null)

  useEffect(() => {
    setSelectedColor(colors[0] || '')
    setSelectedSize(sizes[0] || '')
    setSelectedWaistSize(waistSizes[0] ?? null)
  }, [id, product?._id, colors, sizes, waistSizes])

  const selectedOptions = useMemo(
    () => ({
      color: selectedColor,
      size: selectedSize,
      waistSize: selectedWaistSize,
    }),
    [selectedColor, selectedSize, selectedWaistSize]
  )

  const requiresSelection = useMemo(
    () =>
      (colors.length > 0 && !selectedColor) ||
      (sizes.length > 0 && !selectedSize) ||
      (waistSizes.length > 0 && selectedWaistSize === null),
    [colors.length, sizes.length, waistSizes.length, selectedColor, selectedSize, selectedWaistSize]
  )

  useEffect(() => {
    if (product) trackEvent('view_content', { productId: product._id || product.id })
  }, [product])

  const handleAddToCart = () => {
    if (!product) return
    trackEvent('add_to_cart', { productId: product._id || product.id })
    if (isAuthenticated) {
      dispatch(addToCartServer({ productId: product._id || product.id, selectedOptions }))
    } else {
      dispatch(addToCartLocal({ product, selectedOptions }))
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
        <p className="text-xs text-white/60">
          Event: {product.event?.name || 'General'} | Type: {(product.productType || 'other').toUpperCase()}
        </p>
        {colors.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-wider text-white/60">Color</p>
            <div className="flex flex-wrap gap-2">
              {colors.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`rounded-full border px-3 py-1 text-xs ${selectedColor === color ? 'border-[var(--color-accent)] text-[var(--color-accent)]' : 'border-white/20 text-white/70'}`}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>
        )}
        {sizes.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-wider text-white/60">Size</p>
            <div className="flex flex-wrap gap-2">
              {sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`rounded-full border px-3 py-1 text-xs ${selectedSize === size ? 'border-[var(--color-accent)] text-[var(--color-accent)]' : 'border-white/20 text-white/70'}`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}
        {waistSizes.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-wider text-white/60">Waist Size</p>
            <div className="flex flex-wrap gap-2">
              {waistSizes.map((waist) => (
                <button
                  key={waist}
                  onClick={() => setSelectedWaistSize(waist)}
                  className={`rounded-full border px-3 py-1 text-xs ${selectedWaistSize === waist ? 'border-[var(--color-accent)] text-[var(--color-accent)]' : 'border-white/20 text-white/70'}`}
                >
                  {waist}
                </button>
              ))}
            </div>
          </div>
        )}
        {product.discountedPrice ? (
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-2xl font-black text-[var(--color-accent)]">{formatCurrencyPKR(product.discountedPrice)}</p>
            <p className="text-sm text-white/40 line-through">{formatCurrencyPKR(product.initialPrice || product.price)}</p>
            <span className="rounded-full bg-emerald-500/20 px-2 py-1 text-xs font-semibold text-emerald-300">{product.discountPercent}% OFF</span>
          </div>
        ) : (
          <p className="text-2xl font-black text-[var(--color-accent)]">{formatCurrencyPKR(product.initialPrice || product.price)}</p>
        )}
        <div className="flex flex-wrap gap-3">
          <Button onClick={handleAddToCart} disabled={requiresSelection}>
            Add to Cart
          </Button>
          <Button variant="ghost">Buy with JazzCash / Easypaisa</Button>
        </div>
      </div>
    </div>
  )
}
