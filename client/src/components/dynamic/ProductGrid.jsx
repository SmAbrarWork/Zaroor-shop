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
                <Badge>{product.tags[0]}</Badge>
                <h3 className="text-lg font-bold leading-snug">{product.name}</h3>
                <p className="line-clamp-2 text-xs text-white/60">{product.description}</p>
                <p className="text-base font-black text-[var(--color-accent)]">
                  {formatCurrencyPKR(product.price)}
                </p>
              </div>
            </Link>
          </Card>
        </MotionDiv>
      ))}
    </section>
  )
}
