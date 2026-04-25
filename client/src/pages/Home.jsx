import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { selectActiveEvent } from '../features/event/eventSelectors'
import { filterProductsByEvent } from '../features/products/productSlice'
import { selectFilteredProducts } from '../features/products/productSelectors'
import { applyEventTheme } from '../utils/themeEngine'
import HeroSection from '../components/dynamic/HeroSection'
import EventBanner from '../components/dynamic/EventBanner'
import CountdownTimer from '../components/dynamic/CountdownTimer'
import ProductGrid from '../components/dynamic/ProductGrid'
import { trackEvent } from '../utils/tracking'

export default function Home() {
  const dispatch = useAppDispatch()
  const activeEvent = useAppSelector(selectActiveEvent)
  const filteredProducts = useAppSelector(selectFilteredProducts)

  useEffect(() => {
    if (!activeEvent) return
    applyEventTheme(activeEvent.theme)
    dispatch(filterProductsByEvent(activeEvent.slug))
    trackEvent('campaign_view', { eventSlug: activeEvent.slug })
  }, [activeEvent, dispatch])

  if (!activeEvent) {
    return (
      <div className="rounded-3xl border border-white/20 bg-white/5 p-8 text-center text-sm text-white/70">
        Loading event...
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-10">
      <HeroSection event={activeEvent} />
      {activeEvent.displayMode === 'countdown' && activeEvent.countdownDate
        ? <CountdownTimer key={activeEvent.countdownDate} targetDate={activeEvent.countdownDate} />
        : <EventBanner text={activeEvent.bannerText} />}
      <ProductGrid products={filteredProducts} />
    </div>
  )
}
