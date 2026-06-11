import { motion } from 'framer-motion'

const ITEMS = [
  'Connectivity', 'SD-WAN', 'UCaaS', 'Cloud Infrastructure',
  'Contact Center', 'Cybersecurity', 'Mobility & IoT',
  'Managed Services', 'Voice & SIP', 'Colocation', 'Disaster Recovery',
  'Analytics & AI',
]

export default function Marquee() {
  const doubled = [...ITEMS, ...ITEMS]

  return (
    <div className="marquee-outer">
      <motion.div
        className="marquee-track"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
      >
        {doubled.map((item, i) => (
          <span key={i} className="marquee-item">
            {item}
            <span className="marquee-dot" />
          </span>
        ))}
      </motion.div>
    </div>
  )
}
