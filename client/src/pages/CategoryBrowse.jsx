import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAppSelector } from '../app/hooks'
import { selectActiveEvent } from '../features/event/eventSelectors'
import { selectCategories } from '../features/categories/categorySelectors'
import { selectFilteredProducts } from '../features/products/productSelectors'
import ProductGrid from '../components/dynamic/ProductGrid'

export default function CategoryBrowse() {
  const { categorySlug } = useParams()
  const activeEvent = useAppSelector(selectActiveEvent)
  const categories = useAppSelector(selectCategories)
  const filtered = useAppSelector(selectFilteredProducts)

  const { title, subtitle, products } = useMemo(() => {
    if (!categorySlug) {
      return { title: 'Shop', subtitle: '', products: [] }
    }
    if (categorySlug === 'all') {
      const list = [...filtered].sort((a, b) => String(a.name).localeCompare(String(b.name)))
      return {
        title: 'Full catalog',
        subtitle: `Everything in ${activeEvent?.name ?? 'this campaign'} — browse every piece.`,
        products: list,
      }
    }
    const cat = categories.find((c) => c.slug === categorySlug)
    const list = filtered.filter((p) => (p.category?.slug || '') === categorySlug)
    return {
      title: cat?.name ?? categorySlug.replace(/-/g, ' '),
      subtitle: cat?.description ?? '',
      products: list,
    }
  }, [categorySlug, filtered, categories, activeEvent?.name])

  if (!activeEvent) {
    return (
      <div className="rounded-3xl border border-white/20 bg-white/5 p-8 text-center text-sm text-white/70">
        Loading campaign…
      </div>
    )
  }

  const empty = products.length === 0

  return (
    <div className="space-y-6 pb-10">
      <div className="border-b border-white/10 pb-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/55">{activeEvent.name}</p>
        <h1 className="mt-1 text-2xl font-black tracking-tight text-[var(--color-text)] capitalize sm:text-3xl">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-2 max-w-2xl text-sm">
            {categorySlug === 'all' ? (
              <>
                <strong className="font-bold text-white/90">Full catalog</strong>
                <span className="text-white/60"> — everything in this campaign in one scrollable grid.</span>
              </>
            ) : (
              <strong className="font-semibold text-white/75">{subtitle}</strong>
            )}
          </p>
        ) : null}
      </div>

      {empty ? (
        <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.03] px-6 py-14 text-center">
          <p className="text-sm text-white/55">No products in this section yet.</p>
          <Link to="/" className="mt-4 inline-block text-sm font-medium text-[var(--color-accent)] hover:underline">
            Back to Hot drops
          </Link>
        </div>
      ) : (
        <ProductGrid products={products} layout="grid" />
      )}
    </div>
  )
}
