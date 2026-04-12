import { motion } from 'framer-motion'

export default function EventBanner({ text }) {
  const MotionSection = motion.section

  return (
    <MotionSection
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-r from-[var(--color-surface)] to-[var(--color-primary)] p-5"
    >
      <p className="text-center text-base font-semibold sm:text-lg">{text}</p>
    </MotionSection>
  )
}
