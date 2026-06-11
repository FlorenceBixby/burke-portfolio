import { useRef, useEffect } from 'react'
import { motion, useMotionValue, useTransform, useInView, animate } from 'framer-motion'

/**
 * Counts up to a number when scrolled into view.
 * Usage: <Counter to={30} suffix="+" />
 */
export default function Counter({ to, suffix = '', prefix = '' }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const count = useMotionValue(0)
  const rounded = useTransform(count, (v) => Math.round(v))

  useEffect(() => {
    if (inView) {
      const controls = animate(count, to, {
        duration: 1.6,
        ease: [0.25, 0.1, 0.25, 1],
      })
      return controls.stop
    }
  }, [inView, to, count])

  return (
    <span ref={ref} className="stat-number">
      {prefix}
      <motion.span>{rounded}</motion.span>
      <span style={{ color: 'var(--accent)' }}>{suffix}</span>
    </span>
  )
}
