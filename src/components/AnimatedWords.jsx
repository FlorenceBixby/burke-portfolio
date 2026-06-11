import { motion } from 'framer-motion'

/**
 * Animates text word by word on mount.
 * Usage: <AnimatedWords text="Your tech vendors, handled." delay={0.2} />
 */
export default function AnimatedWords({ text, delay = 0, className = '' }) {
  const words = text.split(' ')

  return (
    <span className={className} aria-label={text}>
      {words.map((word, i) => (
        <span key={i} className="word-wrap">
          <motion.span
            style={{ display: 'inline-block' }}
            initial={{ y: '110%', opacity: 0 }}
            animate={{ y: '0%', opacity: 1 }}
            transition={{
              delay: delay + i * 0.07,
              duration: 0.55,
              ease: [0.25, 0.1, 0.25, 1],
            }}
          >
            {word}
          </motion.span>
          {i < words.length - 1 && <span style={{ display: 'inline-block', width: '0.28em' }} />}
        </span>
      ))}
    </span>
  )
}
