import { motion, useReducedMotion } from 'framer-motion'

export default function Card({ children, className = '' }) {
  const MotionArticle = motion.article
  const reduce = useReducedMotion()

  return (
    <MotionArticle
      whileHover={reduce ? {} : { y: -6 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className={`rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur transition-[border-color,box-shadow,background-color] duration-300 ease-out hover:border-white/18 hover:shadow-lg hover:shadow-black/20 ${className}`}
    >
      {children}
    </MotionArticle>
  )
}
