import { motion } from 'framer-motion'
import Button from '../ui/Button'
import Badge from '../ui/Badge'
import SafeProductImage from '../ui/SafeProductImage'

export default function HeroSection({ event }) {
  const MotionHeading = motion.h2
  const MotionPanel = motion.div

  const scrollToProducts = () => {
    const el = document.getElementById('shop-hot-drops') || document.getElementById('product-grid')
    el?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="grid items-end gap-6 text-center sm:text-left lg:grid-cols-[1.2fr_0.8fr] xl:gap-8">
      <div className="mx-auto flex max-w-xl flex-col items-center space-y-6 sm:mx-0 sm:max-w-none sm:items-start">
        <Badge>Limited Drop</Badge>
        <MotionHeading
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-4xl font-black uppercase leading-[0.9] tracking-tight sm:text-6xl lg:text-7xl"
        >
          {event.heroTitle || event.name}
          <span className="mt-2 block text-[0.42em] font-semibold tracking-[0.14em] text-[var(--color-accent)]/95 sm:text-[0.36em]">
            {event.heroSubtitle || 'Built To Convert'}
          </span>
        </MotionHeading>
        <p className="max-w-2xl text-sm leading-relaxed text-white/80 sm:text-base sm:text-white/85">
          {event.story}
        </p>
        <Button onClick={scrollToProducts}>{event.ctaLabel || 'Shop The Drop'}</Button>
      </div>
      <MotionPanel
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.45 }}
        className="relative mx-auto h-56 w-full max-w-md overflow-hidden rounded-[2rem] border border-white/20 bg-[var(--color-surface)] sm:mx-0 sm:max-w-none sm:h-72"
      >
        <div className="absolute inset-0">
          {event.heroImage ? (
            <SafeProductImage
              src={event.heroImage}
              alt={event.name}
              imgClassName="h-full w-full object-cover opacity-35"
            />
          ) : (
            <div className="absolute -left-20 top-10 h-52 w-52 rounded-full bg-[var(--color-accent)]/30 blur-3xl" />
          )}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/20" />
        <div className="absolute inset-x-0 bottom-0 p-5 text-center sm:bottom-6 sm:left-6 sm:right-6 sm:text-left">
          <p className="text-xs uppercase tracking-[0.3em] text-white/70">Campaign Focus</p>
          <p className="mt-2 text-xl font-bold sm:text-2xl">{event.campaignFocus || 'Urgency. Emotion. Action.'}</p>
        </div>
      </MotionPanel>
    </section>
  )
}
