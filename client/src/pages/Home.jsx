import { useEffect, useState } from 'react'
import { useAppSelector } from '../app/hooks'
import { selectActiveEvent } from '../features/event/eventSelectors'
import { selectHotDropProducts } from '../features/products/productSelectors'
import HeroSection from '../components/dynamic/HeroSection'
import EventBanner from '../components/dynamic/EventBanner'
import CountdownTimer from '../components/dynamic/CountdownTimer'
import ProductGrid from '../components/dynamic/ProductGrid'
import CampaignBannerCarousel from '../components/dynamic/CampaignBannerCarousel'
import CatalogCtaLink from '../components/ui/CatalogCtaLink'
import { trackEvent } from '../utils/tracking'
import api from '../utils/api'

/** Items shown in the horizontal strip before “Browse more” (full grid). */
const HOT_DROP_STRIP_PREVIEW = 6

export default function Home() {
  const activeEvent = useAppSelector(selectActiveEvent)
  const hotDrops = useAppSelector(selectHotDropProducts)
  const [campaignBanners, setCampaignBanners] = useState([])

  useEffect(() => {
    if (!activeEvent) return
    trackEvent('campaign_view', { eventSlug: activeEvent.slug })
  }, [activeEvent])

  useEffect(() => {
    if (!activeEvent?.slug) {
      setCampaignBanners([])
      return
    }
    api
      .get('/campaign-banners', { params: { eventSlug: activeEvent.slug } })
      .then(({ data }) => setCampaignBanners(data?.data ?? []))
      .catch(() => setCampaignBanners([]))
  }, [activeEvent?.slug])

  if (!activeEvent) {
    return (
      <div className="rounded-3xl border border-white/20 bg-white/5 p-8 text-center text-sm text-white/70">
        Loading event...
      </div>
    )
  }

  const stripProducts = hotDrops.slice(0, HOT_DROP_STRIP_PREVIEW)
  const hasHotDrops = hotDrops.length > 0

  return (
    <div className="space-y-10 pb-10">
      <HeroSection event={activeEvent} />
      <CampaignBannerCarousel banners={campaignBanners} />
      {activeEvent.displayMode === 'countdown' && activeEvent.countdownDate ? (
        <CountdownTimer key={activeEvent.countdownDate} targetDate={activeEvent.countdownDate} />
      ) : (
        <EventBanner text={activeEvent.bannerText} />
      )}

      <section id="shop-hot-drops" className="space-y-4 scroll-mt-24" aria-labelledby="hot-drops-heading">
        <div className="flex flex-col gap-3 border-b border-white/10 pb-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="min-w-0 flex-1">
            <h2 id="hot-drops-heading" className="text-xl font-black tracking-tight text-[var(--color-text)] sm:text-2xl">
              Hot drops
            </h2>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-white/55">
              <strong className="font-bold text-white/90">Hand-picked highlights</strong> for this campaign.
              {hasHotDrops && hotDrops.length > HOT_DROP_STRIP_PREVIEW ? (
                <span className="text-white/55"> Tap Browse more for the full list.</span>
              ) : null}
            </p>
          </div>
          {hasHotDrops ? (
            <CatalogCtaLink to="/shop/hot-drops" className="w-full sm:w-auto sm:shrink-0 sm:self-center">
              Browse more
            </CatalogCtaLink>
          ) : null}
        </div>

        {hasHotDrops ? (
          <ProductGrid products={stripProducts} layout="strip" />
        ) : (
          <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.03] px-4 py-10 text-center sm:px-6 sm:py-12">
            <p className="text-sm text-white/55">
              No hot drops yet for this campaign. Check back after the team publishes featured picks, or browse{' '}
              <strong className="text-white/80">Shirts</strong> in the menu above.
            </p>
          </div>
        )}
      </section>
    </div>
  )
}
