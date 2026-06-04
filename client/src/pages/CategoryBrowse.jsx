import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAppSelector } from '../app/hooks'
import { selectActiveEvent } from '../features/event/eventSelectors'
import { selectFilteredProducts, selectHotDropProducts } from '../features/products/productSelectors'
import ProductGrid from '../components/dynamic/ProductGrid'

export default function CategoryBrowse() {
  const { categorySlug } = useParams()
  const activeEvent = useAppSelector(selectActiveEvent)
  const filtered = useAppSelector(selectFilteredProducts)
  const hotDrops = useAppSelector(selectHotDropProducts)

  const { title, subtitle, products } = useMemo(() => {
    if (!categorySlug) {
      return { title: 'Shop', subtitle: '', products: [] }
    }
    if (categorySlug === 'hot-drops') {
      return {
        title: 'Hot drops',
        subtitle: `All featured picks for ${activeEvent?.name ?? 'this campaign'}.`,
        products: hotDrops,
      }
    }
    if (categorySlug === 'shirts') {
      const list = filtered
        .filter((p) => p.productType === 'shirt')
        .sort((a, b) => String(a.name).localeCompare(String(b.name)))
      return {
        title: 'Shirts',
        subtitle: `All shirts for ${activeEvent?.name ?? 'this campaign'}.`,
        products: list,
      }
    }
    return {
      title: 'Shop',
      subtitle: '',
      products: [],
    }
  }, [categorySlug, filtered, hotDrops, activeEvent?.name])

  if (!activeEvent) {
    return (
      <div className="rounded-3xl border border-white/20 bg-white/5 p-8 text-center text-sm text-white/70">
        Loading campaign…
      </div>
    )
  }

  const empty = products.length === 0
  const isHotDropsPage = categorySlug === 'hot-drops'

  return (
    <div className="space-y-6 pb-10">
      <div className="border-b border-white/10 pb-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/55">{activeEvent.name}</p>
        <h1 className="mt-1 text-2xl font-black tracking-tight text-[var(--color-text)] capitalize sm:text-3xl">
          {title}
        </h1>
        {subtitle ? <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/60">{subtitle}</p> : null}
      </div>

      {empty ? (
        <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.03] px-4 py-12 text-center sm:px-6 sm:py-14">
          <p className="text-sm text-white/55">
            {isHotDropsPage ? 'No hot drops published for this campaign yet.' : 'No products in this section yet.'}
          </p>
          <Link to="/" className="mt-4 inline-block text-sm font-medium text-[var(--color-accent)] hover:underline">
            Back to home
          </Link>
        </div>
      ) : (
        <ProductGrid products={products} layout="grid" />
      )}
    </div>
  )
}
