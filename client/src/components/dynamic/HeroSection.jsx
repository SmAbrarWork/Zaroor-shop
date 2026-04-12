import { motion } from 'framer-motion'
import Button from '../ui/Button'
import Badge from '../ui/Badge'

export default function HeroSection({ event }) {
  const MotionHeading = motion.h2
  const MotionPanel = motion.div

  const scrollToProducts = () => {
    document.getElementById('product-grid')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="grid items-end gap-8 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="space-y-6">
        <Badge>Limited Drop</Badge>
        <MotionHeading
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-4xl font-black uppercase leading-[0.9] tracking-tight sm:text-6xl lg:text-7xl"
        >
          {event.name}
          <span className="mt-2 block text-[0.42em] font-semibold tracking-[0.14em] text-[var(--color-accent)]/95 sm:text-[0.36em]">
            Built To Convert
          </span>
        </MotionHeading>
        <p className="max-w-2xl text-sm leading-relaxed text-white/80 sm:text-base sm:text-white/85">
          {event.story}
        </p>
        <Button onClick={scrollToProducts}>Shop The Drop</Button>
      </div>
      <MotionPanel
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.45 }}
        className="relative h-56 overflow-hidden rounded-[2rem] border border-white/20 bg-[var(--color-surface)] sm:h-72"
      >
        <div className="absolute -left-20 top-10 h-52 w-52 rounded-full bg-[var(--color-accent)]/30 blur-3xl" />
        <div className="absolute bottom-6 left-6 right-6">
          <p className="text-xs uppercase tracking-[0.3em] text-white/70">Campaign Focus</p>
          <p className="mt-2 text-2xl font-bold">Urgency. Emotion. Action.</p>
        </div>
      </MotionPanel>
    </section>
  )
}
