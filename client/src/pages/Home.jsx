import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
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

const sheetMotion = {
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
}

export default function Home() {
  const activeEvent = useAppSelector(selectActiveEvent)
  const hotDrops = useAppSelector(selectHotDropProducts)
  const [campaignBanners, setCampaignBanners] = useState([])
  const hasBanners = campaignBanners.some((b) => b.enabled !== false && b.image && b.title)

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

  const belowHero = (
    <>
      {activeEvent.displayMode === 'countdown' && activeEvent.countdownDate ? (
        <CountdownTimer key={activeEvent.countdownDate} targetDate={activeEvent.countdownDate} />
      ) : (
        <EventBanner text={activeEvent.bannerText} />
      )}

      <section id="shop-hot-drops" className="space-y-4 scroll-mt-24" aria-labelledby="hot-drops-heading">
        <div className="flex flex-col items-center gap-3 border-b border-white/10 pb-4 text-center sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:text-left">
          <div className="min-w-0 flex-1">
            <h2 id="hot-drops-heading" className="text-xl font-black tracking-tight text-[var(--color-text)] sm:text-2xl">
              Hot drops
            </h2>
            <p className="mx-auto mt-1 max-w-2xl text-sm leading-relaxed text-white/55 sm:mx-0">
              <strong className="font-bold text-white/90">Hand-picked highlights</strong> for this campaign.
              {hasHotDrops && hotDrops.length > HOT_DROP_STRIP_PREVIEW ? (
                <span className="text-white/55"> Tap Browse more for the full list.</span>
              ) : null}
            </p>
          </div>
          {hasHotDrops ? (
            <CatalogCtaLink to="/shop/hot-drops" className="w-full max-w-xs sm:w-auto sm:max-w-none sm:shrink-0 sm:self-center">
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
    </>
  )

  return (
    <div className="pb-10 md:space-y-10">
      {hasBanners ? (
        <>
          <div
            className="fixed inset-x-0 z-0 md:hidden"
            style={{ top: 'var(--site-sticky-top)', height: 'var(--mobile-hero-h)' }}
            aria-hidden={false}
          >
            <CampaignBannerCarousel banners={campaignBanners} mobileHero />
          </div>
          <div className="md:hidden" style={{ height: 'var(--mobile-hero-h)' }} aria-hidden />

          <motion.div
            {...sheetMotion}
            className="relative z-10 space-y-8 rounded-t-[1.75rem] bg-[var(--color-primary)] px-0 pt-8 shadow-[0_-20px_60px_rgba(0,0,0,0.35)] md:space-y-10 md:rounded-none md:bg-transparent md:px-0 md:pt-0 md:shadow-none"
          >
            <HeroSection event={activeEvent} />
            <div className="hidden md:block">
              <CampaignBannerCarousel banners={campaignBanners} />
            </div>
            {belowHero}
          </motion.div>
        </>
      ) : (
        <div className="space-y-8 md:space-y-10">
          <HeroSection event={activeEvent} />
          {belowHero}
        </div>
      )}
    </div>
  )
}
