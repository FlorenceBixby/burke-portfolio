import { motion } from 'framer-motion'
import {
  Wifi, Phone, Cloud, Headphones, Shield, Smartphone,
  Settings, BarChart2, Radio
} from 'lucide-react'
import Reveal from '../components/Reveal.jsx'
import MagneticButton from '../components/MagneticButton.jsx'

const categories = [
  {
    icon: Wifi,
    title: 'Connectivity & Networking',
    items: [
      'Fiber, Cable, Fixed Wireless, DSL',
      'SD-WAN & SASE',
      'MPLS, VPN, Point-to-Point',
      'ISP aggregation & failover',
      'International data circuits',
      'Network monitoring & analytics',
    ]
  },
  {
    icon: Phone,
    title: 'Voice & Unified Communications',
    items: [
      'Hosted VoIP / UCaaS',
      'SIP trunking & PRI',
      'Video conferencing (Zoom, Teams, etc.)',
      'Instant messaging & presence',
      'Fax-to-email & eFax',
      'SMS / MMS / team messaging',
    ]
  },
  {
    icon: Headphones,
    title: 'Contact Center & CX',
    items: [
      'CCaaS — cloud contact center',
      'Omni-channel routing (voice, chat, email)',
      'IVR & call recording',
      'CRM integration',
      'Outbound dialer',
      'WFO / WFM / performance management',
    ]
  },
  {
    icon: Cloud,
    title: 'Cloud Infrastructure',
    items: [
      'Public, private & hybrid cloud',
      'Managed cloud (AWS, Azure, GCP)',
      'Virtual data centers & colocation',
      'Direct connect / cloud on-ramps',
      'Cloud migration & readiness assessments',
      'Cloud storage & backup',
    ]
  },
  {
    icon: Shield,
    title: 'Security',
    items: [
      'Managed firewall & SASE',
      'Endpoint protection & EDR',
      'Email & web security',
      'SIEM & SOC-as-a-Service',
      'Zero Trust framework',
      'Vulnerability assessments & pen testing',
    ]
  },
  {
    icon: Settings,
    title: 'Managed Services',
    items: [
      'Managed Wi-Fi',
      'Helpdesk & IT support',
      'Network operations center (NOC)',
      'Office 365 management & licenses',
      'Network monitoring & ticketing',
      'Cloud readiness & migration support',
    ]
  },
  {
    icon: Smartphone,
    title: 'Mobility & IoT',
    items: [
      'Business mobile plans (3G/4G/5G)',
      'Mobile device management (MDM)',
      'IoT connectivity & SIM cards',
      'Wireless backup & failover',
      'Device procurement',
      'Wireless expense management',
    ]
  },
  {
    icon: Radio,
    title: 'Business Continuity',
    items: [
      'Cloud backup & disaster recovery',
      'DaaS / virtual desktop',
      'Content delivery network (CDN)',
      'Redundant circuits & failover',
      'Data archiving & lifecycle management',
    ]
  },
  {
    icon: BarChart2,
    title: 'Analytics & AI',
    items: [
      'AI / machine learning integrations',
      'Custom analytics dashboards',
      'Thermal & occupancy detection',
      'Environmental monitoring',
      'Workforce analytics & reporting',
    ]
  },
]

const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.06 }
  }
}

const cardVariants = {
  hidden: { opacity: 0, y: 28 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] } }
}

export default function Portfolio({ navigate }) {
  return (
    <>
      <section className="section">
        <div className="container">
          <Reveal>
            <span className="eyebrow">Full capability portfolio</span>
            <h1 className="headline-lg" style={{ marginBottom: 20 }}>
              Everything we handle for you.
            </h1>
            <p className="body-lg" style={{ maxWidth: 600 }}>
              We work across every category of business technology through a network of 30+ suppliers. If your business needs it, we can source it, negotiate it, and manage it — at no cost to you.
            </p>
          </Reveal>

          <motion.div
            className="portfolio-grid"
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-60px' }}
          >
            {categories.map((cat) => {
              const Icon = cat.icon
              return (
                <motion.div
                  key={cat.title}
                  className="p-card"
                  variants={cardVariants}
                  whileHover={{ y: -3, transition: { duration: 0.18 } }}
                >
                  <div className="p-card-icon">
                    <Icon size={20} strokeWidth={1.75} />
                  </div>
                  <h3>{cat.title}</h3>
                  <ul>
                    {cat.items.map(item => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      <section className="statement">
        <Reveal>
          <p className="statement-text">
            <strong>Don't see what you need?</strong> If it runs over a wire, through the air, or lives in the cloud — we can probably help. Reach out and we'll tell you straight whether we can or can't.
          </p>
        </Reveal>
      </section>
    </>
  )
}
