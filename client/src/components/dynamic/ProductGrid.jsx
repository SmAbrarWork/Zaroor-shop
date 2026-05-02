import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Card from '../ui/Card'
import Badge from '../ui/Badge'
import SafeProductImage from '../ui/SafeProductImage'
import { formatCurrencyPKR } from '../../utils/dateUtils'

function productCardBlurb(product) {
  const raw = (product.description || '').trim()
  if (raw.length > 0) return raw
  const bits = []
  if (product.category?.name) bits.push(product.category.name)
  const pt = product.productType
  if (pt && pt !== 'other') bits.push(pt.charAt(0).toUpperCase() + pt.slice(1))
  if (bits.length) return `${bits.join(' · ')} — tap for sizes, colors & price.`
  return 'Limited drop — tap for details, options & pricing.'
}

/** Uniform tile: image sits in a fixed aspect box so huge uploads never stretch the grid. */
function ProductImage({ src, alt }) {
  return (
    <div className="relative aspect-[3/4] w-full shrink-0 overflow-hidden rounded-2xl bg-white/[0.06]">
      <SafeProductImage
        src={src}
        alt={alt}
        imgClassName="absolute inset-0 h-full w-full object-cover transition-[transform,opacity] duration-500 ease-out group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
      />
    </div>
  )
}

export default function ProductGrid({ products, layout = 'grid' }) {
  const MotionDiv = motion.div
  const getDiscountPercent = (product) => {
    if (product.discountPercent) return product.discountPercent
    if (!product.initialPrice || !product.discountedPrice) return null
    const percent = Math.round(((product.initialPrice - product.discountedPrice) / product.initialPrice) * 100)
    return percent > 0 ? percent : null
  }

  const renderCard = (product, index) => {
    const discountPercent = getDiscountPercent(product)
    return (
      <MotionDiv
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className="h-full"
      >
        <Card className="flex h-full flex-col p-3 sm:p-4">
          <Link to={`/product/${product._id || product.id}`} className="group flex min-h-0 flex-1 flex-col gap-3">
            <ProductImage src={product.image} alt={product.name} />
            <div className="flex min-h-0 flex-1 flex-col gap-2 px-0.5">
              <div className="flex flex-wrap gap-1">
                {(product.tags || []).map((tag) => (
                  <Badge key={`${product._id || product.id}-${tag}`}>{tag}</Badge>
                ))}
              </div>
              <h3 className="line-clamp-2 text-base font-bold leading-snug">{product.name}</h3>
              <p className="line-clamp-3 min-h-[3.25rem] text-xs leading-relaxed text-white/70">{productCardBlurb(product)}</p>
              <div className="mt-auto pt-1">
                {product.discountedPrice && discountPercent ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-base font-black text-[var(--color-accent)]">{formatCurrencyPKR(product.discountedPrice)}</p>
                    <p className="text-xs text-white/40 line-through">{formatCurrencyPKR(product.initialPrice || product.price)}</p>
                    <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">{discountPercent}% OFF</span>
                  </div>
                ) : (
                  <p className="text-base font-black text-[var(--color-accent)]">{formatCurrencyPKR(product.initialPrice || product.price)}</p>
                )}
              </div>
            </div>
          </Link>
        </Card>
      </MotionDiv>
    )
  }

  if (layout === 'strip') {
    return (
      <section className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-5">
        {products.map((product, index) => (
          <div
            key={product._id || product.id}
            className="w-[min(82vw,320px)] shrink-0 snap-start sm:w-[288px] md:w-[304px]"
          >
            {renderCard(product, index)}
          </div>
        ))}
      </section>
    )
  }

  return (
    <section id="product-grid" className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product, index) => (
        <div key={product._id || product.id} className="min-h-0">
          {renderCard(product, index)}
        </div>
      ))}
    </section>
  )
}
