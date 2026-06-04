import { useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Outlet, useLocation } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { selectActiveEvent } from '../../features/event/eventSelectors'
import { filterProductsByEvent } from '../../features/products/productSlice'
import { selectProducts } from '../../features/products/productSelectors'
import { fetchCategoriesForEvent } from '../../features/categories/categoriesSlice'
import { applyEventTheme } from '../../utils/themeEngine'
import Navbar from './Navbar'
import ShopCategoryNav from './ShopCategoryNav'
import Footer from './Footer'
import PageTransition from './PageTransition'

export default function MainLayout() {
  const dispatch = useAppDispatch()
  const location = useLocation()
  const activeEvent = useAppSelector(selectActiveEvent)
  const showShopNav = Boolean(activeEvent) && !location.pathname.startsWith('/login')
  const productItems = useAppSelector(selectProducts)

  useEffect(() => {
    if (activeEvent?.theme) applyEventTheme(activeEvent.theme)
  }, [activeEvent])

  /** Keep catalog filter aligned with persisted campaign after reload (any route, any fetch order). */
  useEffect(() => {
    const slug = activeEvent?.slug
    if (!slug || productItems.length === 0) return
    dispatch(filterProductsByEvent(slug))
  }, [activeEvent?.slug, productItems, dispatch])

  useEffect(() => {
    if (activeEvent?.slug) dispatch(fetchCategoriesForEvent(activeEvent.slug))
  }, [activeEvent?.slug, dispatch])

  return (
    <div className="min-h-screen bg-[var(--color-primary)] text-[var(--color-text)] transition-[background-color,color] duration-500 ease-out">
      <Navbar />
      {showShopNav ? (
        <div className="sticky top-[var(--site-header-h)] z-40 bg-[var(--color-primary)]/95 backdrop-blur-xl sm:border-b sm:border-white/10 sm:bg-[color-mix(in_srgb,var(--color-primary)_88%,black)]/90">
          <div className="mx-auto max-w-7xl py-2 sm:px-4 sm:py-2.5">
            <ShopCategoryNav />
          </div>
        </div>
      ) : null}
      <main className="mx-auto max-w-7xl px-3 py-5 sm:px-4 sm:py-8 max-md:overflow-x-clip">
        <AnimatePresence mode="wait">
          <PageTransition pathname={location.pathname}>
            <Outlet />
          </PageTransition>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  )
}
