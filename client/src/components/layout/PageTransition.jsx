import { motion as Motion, useReducedMotion } from 'framer-motion'

const easeOut = [0.22, 1, 0.36, 1]

export default function PageTransition({ pathname, children }) {
  const reduce = useReducedMotion()

  return (
    <Motion.div
      key={pathname}
      initial={reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
      transition={{ duration: reduce ? 0 : 0.38, ease: easeOut }}
      className="will-change-[opacity,transform]"
    >
      {children}
    </Motion.div>
  )
}
