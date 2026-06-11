import { motion } from 'framer-motion'
import Reveal from '../components/Reveal.jsx'
import MagneticButton from '../components/MagneticButton.jsx'

export default function About({ navigate }) {
  return (
    <>
      <section className="section">
        <div className="container">
          <div className="about-grid">

            {/* Logo mark */}
            <Reveal>
              <motion.div
                className="about-mark"
                whileHover="hover"
              >
                <motion.span
                  className="about-mark-the"
                  variants={{
                    hover: { scale: 1.06, color: 'var(--accent)', transition: { duration: 0.3 } }
                  }}
                >
                  THE
                </motion.span>
                <motion.span
                  className="about-mark-name"
                  variants={{
                    hover: { letterSpacing: '0.32em', transition: { duration: 0.4 } }
                  }}
                >
                  Interesting Group
                </motion.span>
              </motion.div>
            </Reveal>

            {/* Copy */}
            <Reveal delay={0.1}>
              <div className="about-body">
                <h2>Enterprise-grade expertise. Built for every business.</h2>
                <p>
                  We're The Interesting Group. With a career spent in enterprise technology — selling to and alongside some of the fastest-growing companies in the world — we know how vendors think, how contracts get negotiated, and where the margin is hidden.
                </p>
                <p>
                  We started The Interesting Group because we kept seeing the same thing: smart business owners spending time and money on technology they didn't choose carefully — because they didn't have the time or a trusted expert in their corner.
                </p>
                <p>
                  We fix that. We act as your outside technology advisor: evaluating options, running the selection process, negotiating the contract, and managing the vendor relationship after. You don't pay us — the vendors do. Which means our incentive is always giving you the right answer.
                </p>
                <p style={{ color: 'var(--gray-mid)', fontSize: 15 }}>
                  Based in Buda, TX. Working everywhere.
                </p>
                <div style={{ marginTop: 36, display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                  <MagneticButton
                    className="btn btn-dark"
                    href="https://calendly.com/burke-theinterestinggroup"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Book a call →
                  </MagneticButton>
                  <MagneticButton
                    className="btn btn-outline"
                    href="mailto:info@theinterestinggroup.com"
                  >
                    Send an email
                  </MagneticButton>
                </div>
              </div>
            </Reveal>

          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section section-gray">
        <div className="container-mid">
          <Reveal>
            <span className="eyebrow">How we work</span>
            <h2 className="headline-md" style={{ marginBottom: 48 }}>Three things we never compromise on.</h2>
          </Reveal>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {[
              {
                title: 'Honesty over commission.',
                body: "We work with 30+ suppliers. We have no reason to push any one over another — and we won't. If the best answer is your current vendor, we'll tell you that too."
              },
              {
                title: 'Your time is the asset.',
                body: "You brought us in so you don't have to deal with this. We handle the RFPs, the calls, the vendor negotiations, and the paperwork. You show up to make the final call."
              },
              {
                title: 'Long-term over short-term.',
                body: "We're not closing a one-time deal. We want to be the team you call every time a contract comes up for renewal — for years. That only works if we take care of you."
              }
            ].map((item, i) => (
              <Reveal key={item.title} delay={i * 0.1}>
                <motion.div
                  whileHover={{ x: 6, transition: { duration: 0.2 } }}
                  style={{
                    background: 'var(--white)', padding: '36px 40px',
                    borderRadius: i === 0 ? '12px 12px 0 0' : i === 2 ? '0 0 12px 12px' : 0,
                    borderBottom: i < 2 ? '1px solid var(--gray-border)' : 'none',
                    cursor: 'default',
                  }}
                >
                  <h3 style={{ fontSize: 19, fontWeight: 600, letterSpacing: '-0.02em', marginBottom: 10 }}>
                    {item.title}
                  </h3>
                  <p className="body-sm">{item.body}</p>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
