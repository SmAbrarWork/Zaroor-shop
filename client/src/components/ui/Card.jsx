import { motion } from 'framer-motion'

export default function Card({ children, className = '' }) {
  const MotionArticle = motion.article

  return (
    <MotionArticle
      whileHover={{ y: -6 }}
      transition={{ duration: 0.2 }}
      className={`rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur ${className}`}
    >
      {children}
    </MotionArticle>
  )
}
