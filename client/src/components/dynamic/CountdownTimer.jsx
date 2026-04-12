import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { getTimeLeft } from '../../utils/dateUtils'

const TimeBlock = ({ label, value }) => (
  <div className="rounded-2xl border border-white/20 bg-black/20 px-4 py-3 text-center">
    <p className="text-2xl font-black tabular-nums sm:text-4xl">{value}</p>
    <p className="text-xs uppercase tracking-[0.2em] text-white/70">{label}</p>
  </div>
)

export default function CountdownTimer({ targetDate }) {
  const MotionSection = motion.section
  const [timeLeft, setTimeLeft] = useState(getTimeLeft(targetDate))

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTimeLeft(getTimeLeft(targetDate))
    }, 1000)

    return () => clearInterval(intervalId)
  }, [targetDate])

  if (timeLeft.isExpired) {
    return (
      <div className="rounded-3xl border border-[var(--color-accent)]/40 bg-[var(--color-accent)]/10 p-5">
        <p className="text-center text-sm uppercase tracking-[0.2em]">Drop has ended</p>
      </div>
    )
  }

  return (
    <MotionSection
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="grid grid-cols-2 gap-3 rounded-3xl border border-white/20 bg-white/5 p-4 sm:grid-cols-4"
    >
      <TimeBlock label="Days" value={timeLeft.days} />
      <TimeBlock label="Hours" value={timeLeft.hours} />
      <TimeBlock label="Minutes" value={timeLeft.minutes} />
      <TimeBlock label="Seconds" value={timeLeft.seconds} />
    </MotionSection>
  )
}
