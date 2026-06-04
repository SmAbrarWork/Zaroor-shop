import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import SafeProductImage from '../ui/SafeProductImage'

const GLASS_PANEL = {
  light: 'border border-white/20 bg-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.12)] backdrop-blur-md',
  medium: 'border border-white/25 bg-white/[0.14] shadow-[0_12px_40px_rgba(0,0,0,0.2)] backdrop-blur-xl',
  heavy: 'border border-white/20 bg-black/40 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-2xl',
}

const titleVariants = {
  fadeUp: { initial: { opacity: 0, y: 28 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -12 } },
  fade: { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } },
  slideRight: { initial: { opacity: 0, x: -36 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: 24 } },
}

function Cta({ label, href }) {
  if (!label?.trim()) return null
  const isExternal = /^https?:\/\//i.test(href)
  const className =
    'inline-flex min-h-[44px] items-center justify-center rounded-full border border-[color-mix(in_srgb,var(--color-accent)_55%,transparent)] bg-[color-mix(in_srgb,var(--color-accent)_18%,transparent)] px-6 text-sm font-bold text-[var(--color-text)] shadow-[0_10px_40px_-12px_color-mix(in_srgb,var(--color-accent)_45%,transparent)] transition-transform hover:-translate-y-px'
  if (isExternal) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={className}>
        {label}
      </a>
    )
  }
  return (
    <Link to={href || '/shop/all'} className={className}>
      {label}
    </Link>
  )
}

export default function CampaignBannerCarousel({ banners = [] }) {
  const reduceMotion = useReducedMotion()
  const slides = useMemo(() => banners.filter((b) => b.enabled !== false && b.image && b.title), [banners])
  const [index, setIndex] = useState(0)

  useEffect(() => {
    setIndex(0)
  }, [slides.length])

  useEffect(() => {
    if (reduceMotion || slides.length <= 1) return undefined
    const t = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length)
    }, 6000)
    return () => clearInterval(t)
  }, [slides.length, reduceMotion])

  if (slides.length === 0) return null

  const current = slides[index] || slides[0]
  const glass = GLASS_PANEL[current.glassStyle] || GLASS_PANEL.medium
  const tv = titleVariants[current.textAnimation] || titleVariants.fadeUp
  const bgTransition = reduceMotion ? { duration: 0 } : { duration: 0.7, ease: [0.22, 1, 0.36, 1] }
  const panelTransition = reduceMotion ? { duration: 0 } : { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
  const textTransition = (delay) => (reduceMotion ? { duration: 0 } : { duration: 0.55, delay: delay ?? 0 })

  return (
    <section aria-label="Promotional banners" className="relative overflow-hidden rounded-[2rem] border border-white/12 shadow-[0_24px_80px_-24px_rgba(0,0,0,0.45)]">
      <div className="relative aspect-[21/9] min-h-[220px] w-full sm:min-h-[260px] lg:aspect-[24/9] lg:min-h-[300px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={current._id}
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduceMotion ? { opacity: 1 } : { opacity: 0 }}
            transition={bgTransition}
            className="absolute inset-0"
          >
            <SafeProductImage
              src={current.image}
              alt=""
              imgClassName="h-full w-full object-cover scale-[1.02] motion-reduce:scale-100"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/10 sm:from-black/70 sm:via-black/35" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_50%,color-mix(in_srgb,var(--color-accent)_22%,transparent),transparent_55%)] opacity-90" />
          </motion.div>
        </AnimatePresence>

        <div className="absolute inset-0 flex items-end p-4 sm:items-center sm:p-8 lg:p-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={current._id + '-panel'}
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
              transition={panelTransition}
              className={`max-w-xl rounded-2xl p-5 sm:p-7 ${glass}`}
            >
              {current.eyebrow ? (
                <motion.p
                  {...(reduceMotion ? { initial: false, animate: { opacity: 1, y: 0, x: 0 } } : tv)}
                  transition={textTransition(0.05)}
                  className="text-[11px] font-bold uppercase tracking-[0.28em] text-white/75"
                >
                  {current.eyebrow}
                </motion.p>
              ) : null}
              <motion.h2
                {...(reduceMotion ? { initial: false, animate: { opacity: 1, y: 0, x: 0 } } : tv)}
                transition={reduceMotion ? { duration: 0 } : { duration: 0.6, delay: 0.1 }}
                className="mt-2 text-2xl font-black leading-tight tracking-tight text-white sm:text-3xl lg:text-4xl"
              >
                {current.title}
              </motion.h2>
              {current.subtitle ? (
                <motion.p
                  {...(reduceMotion ? { initial: false, animate: { opacity: 1, y: 0, x: 0 } } : tv)}
                  transition={reduceMotion ? { duration: 0 } : { duration: 0.55, delay: 0.18 }}
                  className="mt-3 text-sm leading-relaxed text-white/80 sm:text-base"
                >
                  {current.subtitle}
                </motion.p>
              ) : null}
              <motion.div
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={reduceMotion ? { duration: 0 } : { duration: 0.45, delay: 0.28 }}
                className="mt-5 flex flex-wrap items-center gap-3"
              >
                <Cta label={current.ctaLabel} href={current.ctaHref} />
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {slides.length > 1 ? (
        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2 sm:bottom-4">
          {slides.map((s, i) => (
            <button
              key={s._id}
              type="button"
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`h-2 rounded-full transition-all ${i === index ? 'w-8 bg-[var(--color-accent)]' : 'w-2 bg-white/35 hover:bg-white/55'}`}
            />
          ))}
        </div>
      ) : null}
    </section>
  )
}
