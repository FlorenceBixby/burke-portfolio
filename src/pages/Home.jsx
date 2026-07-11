import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import Reveal from '../components/Reveal.jsx'
import AnimatedWords from '../components/AnimatedWords.jsx'
import MagneticButton from '../components/MagneticButton.jsx'
import Counter from '../components/Counter.jsx'
import Marquee from '../components/Marquee.jsx'
import HeroBackground from '../components/HeroBackground.jsx'

const steps = [
  {
    num: '01',
    title: 'Tell us what you have',
    body: 'A 15-minute call. Walk us through your current tech setup — internet, phones, cloud, whatever. No prep needed.'
  },
  {
    num: '02',
    title: 'We go to market for you',
    body: 'We evaluate 30+ suppliers across every category, negotiate pricing, and bring you options. An honest recommendation, not a pitch.'
  },
  {
    num: '03',
    title: 'You pay nothing — vendors do',
    body: "We're compensated by the suppliers we place. Our incentive is finding you the best fit — not selling you on any one vendor."
  }
]

const stats = [
  { to: 200, suffix: '+', label: 'Vendor partners' },
  { to: 15, suffix: ' min', label: 'To get started' },
  { to: 0, suffix: '', prefix: '$', label: 'Cost to you' },
  { to: 100, suffix: '%', label: 'Vendor-funded' },
]

export default function Home({ navigate }) {
  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '18%'])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="hero" ref={heroRef} style={{ overflow: 'hidden', position: 'relative' }}>
        <HeroBackground />
        <motion.div className="hero-inner" style={{ y: heroY, opacity: heroOpacity, position: 'relative', zIndex: 1 }}>

          <motion.span
            className="eyebrow"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Technology Advisor
          </motion.span>

          <h1 className="display" style={{ marginBottom: 28 }}>
            <AnimatedWords text="Your tech vendors," delay={0.2} />
            <br />
            <AnimatedWords text="handled." delay={0.55} />
          </h1>

          <motion.p
            className="body-lg hero-sub"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            We source, negotiate, and manage business technology on your behalf — so you can focus on running your business. At no cost to you.
          </motion.p>

          <motion.div
            className="hero-actions"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.0 }}
          >
            <MagneticButton
              className="btn btn-dark"
              href="/book"
              target="_blank"
              rel="noopener noreferrer"
            >
              Book a 15-minute call →
            </MagneticButton>
            <MagneticButton className="btn btn-outline" onClick={() => navigate('portfolio')}>
              See what we handle
            </MagneticButton>
          </motion.div>
        </motion.div>
      </section>

      {/* ── Marquee ──────────────────────────────────────── */}
      <Marquee />

      {/* ── Stats ────────────────────────────────────────── */}
      <section className="stats-band">
        <div className="container">
          <div className="stats-grid">
            {stats.map((s, i) => (
              <Reveal key={s.label} delay={i * 0.08}>
                <div className="stat-item">
                  <Counter to={s.to} suffix={s.suffix} prefix={s.prefix} />
                  <span className="stat-label">{s.label}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────── */}
      <section className="section section-gray">
        <div className="container">
          <Reveal>
            <span className="eyebrow">How it works</span>
            <h2 className="headline-lg">Simple by design.</h2>
          </Reveal>

          <div className="steps-grid">
            {steps.map((s, i) => (
              <Reveal key={s.num} delay={i * 0.12}>
                <motion.div
                  className="step-card"
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                >
                  <span className="step-num">{s.num}</span>
                  <h3>{s.title}</h3>
                  <p>{s.body}</p>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Statement ────────────────────────────────────── */}
      <section className="statement">
        <div className="container-mid">
          <Reveal>
            <p className="statement-text">
              Most businesses are overpaying on at least one technology contract —{' '}
              <strong>not because they made a bad decision, but because they never had time to look.</strong>{' '}
              That's exactly what we do.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── No limits ────────────────────────────────────── */}
      <section className="section">
        <div className="container-mid">
          <Reveal>
            <span className="eyebrow">Who we work with</span>
            <h2 className="headline-lg" style={{ marginBottom: 24 }}>
              Any business. Any size. Anywhere.
            </h2>
            <p className="body-lg" style={{ marginBottom: 20 }}>
              If your business runs on technology — and every business does — we can help. We work with companies across construction, healthcare, logistics, legal, finance, retail, manufacturing, and beyond.
            </p>
            <p className="body-md">
              There's no industry we won't work in, no company too small, and no geography that's out of reach. We've spent careers in enterprise technology. Now we put that to work for businesses that deserve the same level of attention.
            </p>
          </Reveal>

          <Reveal delay={0.15}>
            <div style={{ marginTop: 44, display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <MagneticButton
                className="btn btn-dark"
                href="/book"
                target="_blank"
                rel="noopener noreferrer"
              >
                Book a call →
              </MagneticButton>
              <MagneticButton className="btn btn-outline" onClick={() => navigate('portfolio')}>
                See the full portfolio
              </MagneticButton>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}
