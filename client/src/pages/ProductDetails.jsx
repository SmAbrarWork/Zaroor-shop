import { useEffect } from 'react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Link, useParams } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { selectProductById } from '../features/products/productSelectors'
import { selectIsAuthenticated } from '../features/auth/authSelectors'
import { addToCartLocal, addToCartServer } from '../features/cart/cartSlice'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import SafeProductImage from '../components/ui/SafeProductImage'
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

  const discountPercent = useMemo(() => {
    if (!product) return null
    if (product.discountPercent) return product.discountPercent
    if (!product.initialPrice || !product.discountedPrice) return null
    const percent = Math.round(((product.initialPrice - product.discountedPrice) / product.initialPrice) * 100)
    return percent > 0 ? percent : null
  }, [product])

  const handleAddToCart = async () => {
    if (!product) return
    if (requiresSelection) {
      toast.error('Choose every option', {
        description: 'Select color, size, or waist size before adding to your bag.',
      })
      return
    }
    trackEvent('add_to_cart', { productId: product._id || product.id })
    try {
      if (isAuthenticated) {
        const result = await dispatch(
          addToCartServer({ productId: product._id || product.id, selectedOptions })
        )
        if (addToCartServer.rejected.match(result)) {
          toast.error(result.payload || 'Could not add to bag', {
            description: 'Try again or pick different options.',
          })
          return
        }
        toast.success('Added to your bag', {
          description: product.name,
        })
      } else {
        dispatch(addToCartLocal({ product, selectedOptions }))
        toast.success('Added to your bag', {
          description: product.name,
        })
      }
    } catch {
      toast.error('Something went wrong')
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
    <div className="grid gap-6 overflow-hidden rounded-3xl border border-white/15 bg-[color-mix(in_srgb,var(--color-surface)_35%,transparent)] p-4 sm:gap-8 sm:p-5 md:grid-cols-2 md:p-6">
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-white/[0.06] md:max-h-[min(85vh,720px)]">
        <SafeProductImage
          src={product.image}
          alt={product.name}
          imgClassName="absolute inset-0 h-full w-full object-cover"
        />
      </div>
      <div className="space-y-4">
        {(product.tags || []).length > 0 && <Badge>{(product.tags || []).join(' / ')}</Badge>}
        <h2 className="break-words text-2xl font-black tracking-tight sm:text-3xl md:text-4xl">{product.name}</h2>
        <p className="text-sm leading-relaxed text-white/80">
          {(product.description || '').trim()
            ? product.description
            : `${product.category?.name ? `${product.category.name} · ` : ''}Limited campaign piece — choose options below and add to your bag.`}
        </p>
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
        {product.discountedPrice && discountPercent ? (
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-2xl font-black text-[var(--color-accent)]">{formatCurrencyPKR(product.discountedPrice)}</p>
            <p className="text-sm text-white/40 line-through">{formatCurrencyPKR(product.initialPrice || product.price)}</p>
            <span className="rounded-full bg-emerald-500/20 px-2 py-1 text-xs font-semibold text-emerald-300">{discountPercent}% OFF</span>
          </div>
        ) : (
          <p className="text-2xl font-black text-[var(--color-accent)]">{formatCurrencyPKR(product.initialPrice || product.price)}</p>
        )}
        <p className="text-xs text-white/45">
          Shipping is calculated per item × quantity for your city zone at checkout (set by the team per product).
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Button className="w-full min-h-[44px] sm:w-auto" onClick={handleAddToCart}>
            Add to bag
          </Button>
        </div>
      </div>
    </div>
  )
}
