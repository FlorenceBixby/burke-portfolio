import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

/**
 * Wraps children in a scroll-triggered fade-up reveal.
 * Usage: <Reveal delay={0.1}><p>content</p></Reveal>
 */
export default function Reveal({ children, delay = 0, className = '' }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </motion.div>
  )
}
