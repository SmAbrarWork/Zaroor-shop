import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Card from '../ui/Card'
import Badge from '../ui/Badge'
import { formatCurrencyPKR } from '../../utils/dateUtils'

export default function ProductGrid({ products }) {
  const MotionDiv = motion.div

  return (
    <section id="product-grid" className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product, index) => (
        <MotionDiv
          key={product._id || product.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <Card className="h-full">
            <Link to={`/product/${product._id || product.id}`} className="flex flex-col gap-3">
              <img
                src={product.image}
                alt={product.name}
                className="h-48 w-full rounded-2xl object-cover"
              />
              <div className="space-y-2 px-1">
                <div className="flex flex-wrap gap-1">
                  {(product.tags || []).map((tag) => (
                    <Badge key={`${product._id || product.id}-${tag}`}>{tag}</Badge>
                  ))}
                </div>
                <h3 className="text-lg font-bold leading-snug">{product.name}</h3>
                <p className="line-clamp-2 text-xs text-white/60">{product.description}</p>
                {product.discountedPrice ? (
                  <div className="flex items-center gap-2">
                    <p className="text-base font-black text-[var(--color-accent)]">{formatCurrencyPKR(product.discountedPrice)}</p>
                    <p className="text-xs text-white/40 line-through">{formatCurrencyPKR(product.initialPrice || product.price)}</p>
                    <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">{product.discountPercent}% OFF</span>
                  </div>
                ) : (
                  <p className="text-base font-black text-[var(--color-accent)]">{formatCurrencyPKR(product.initialPrice || product.price)}</p>
                )}
              </div>
            </Link>
          </Card>
        </MotionDiv>
      ))}
    </section>
  )
}
