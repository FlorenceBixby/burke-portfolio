import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

/* ── Marquee items ────────────────────────────────────────── */
const marqueeItems = [
  'Connectivity', 'SD-WAN', 'UCaaS', 'CCaaS',
  'Cybersecurity', 'Cloud', 'Managed IT', 'IoT',
  'Mobility', 'Network Voice', 'Telecom',
];

/* ── Solution cards ───────────────────────────────────────── */
const portfolioCards = [
  {
    icon: '📡', title: 'Connectivity & Networking',
    bullets: ['Dedicated Internet Access', 'MPLS, VPN, Point-to-Point', 'SD-WAN & failover', 'Redundant circuits'],
  },
  {
    icon: '💬', title: 'Unified Communications',
    bullets: ['Cloud phone & softphones', 'Video & team messaging', 'Microsoft Teams voice', 'Mobile-first workflows'],
  },
  {
    icon: '🎧', title: 'Contact Center & CX',
    bullets: ['Omni-channel routing', 'AI-powered IVR & virtual agents', 'Workforce management', 'CRM integrations'],
  },
  {
    icon: '🔒', title: 'Cybersecurity',
    bullets: ['SASE & Zero Trust', 'Endpoint protection & EDR', 'SIEM & SOC-as-a-Service', 'Compliance (SOC 2, HIPAA)'],
  },
  {
    icon: '☁️', title: 'Cloud Infrastructure',
    bullets: ['AWS, Azure, Google Cloud', 'Managed cloud & migration', 'Direct connect / cloud on-ramps', 'DaaS / virtual desktop'],
  },
  {
    icon: '⚙️', title: 'Managed Services',
    bullets: ['Helpdesk & IT support', 'Office 365 management', 'Environmental monitoring', 'Custom analytics dashboards'],
  },
];

export default function Home() {
  const doubled = [...marqueeItems, ...marqueeItems];

  return (
    <div className="page">

      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="hero">

        <div className="hero-inner">
          <motion.span
            className="eyebrow"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Technology Advisor
          </motion.span>

          <motion.h1
            className="display"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          >
            Your tech<br />vendors,<br />handled.
          </motion.h1>

          <motion.p
            className="body-lg hero-sub"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.18 }}
          >
            We source, negotiate, and manage business technology on your behalf — so you can focus on running your business. At no cost to you.
          </motion.p>

          <motion.div
            className="hero-actions"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.28 }}
          >
            <Link to="/contact">
              <motion.span
                className="btn btn-dark"
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                style={{ display: 'inline-flex' }}
              >
                Book a 15-minute call →
              </motion.span>
            </Link>
            <Link to="/solutions">
              <motion.span
                className="btn btn-outline"
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                style={{ display: 'inline-flex' }}
              >
                See what we handle
              </motion.span>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── Marquee ────────────────────────────────────────────── */}
      <div className="marquee-outer">
        <div className="marquee-track">
          {doubled.map((item, i) => (
            <span key={i} className="marquee-item">
              {item}
              {i < doubled.length - 1 && <span className="marquee-dot" />}
            </span>
          ))}
        </div>
      </div>

      {/* ── How it works ───────────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <motion.span
            className="eyebrow"
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          >
            How it works
          </motion.span>
          <motion.h2
            className="headline-lg"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            Simple by design.
          </motion.h2>

          <div className="steps-grid">
            {[
              { n: '01', title: 'Tell us what you need',    body: 'A 15-minute call to understand your tech environment, your goals, and where you\'re feeling pain.' },
              { n: '02', title: 'We do the work',           body: 'We evaluate vendors, run the comparison, negotiate pricing, and bring you a clear recommendation.' },
              { n: '03', title: 'We stay with you',         body: 'After you\'re live, we manage the vendor relationship — escalations, renewals, and optimization.' },
            ].map((s, i) => (
              <motion.div
                key={s.n}
                className="step-card"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
              >
                <span className="step-num">{s.n}</span>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Statement ──────────────────────────────────────────── */}
      <motion.section
        className="statement"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.8 }}
      >
        <p className="statement-text">
          Most businesses are running on technology they didn't choose carefully —{' '}
          <strong>not because they made a bad decision, but because they never had time to look.</strong>
        </p>
      </motion.section>

      {/* ── Portfolio ───────────────────────────────────────────── */}
      <section className="section section-gray">
        <div className="container">
          <motion.span
            className="eyebrow"
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          >
            Full capability portfolio
          </motion.span>
          <motion.h2
            className="headline-lg"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            Everything we handle for you.
          </motion.h2>
          <motion.p
            className="body-md mt-sm"
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            We work across every category of business technology through a network of 200+ suppliers. If your business needs it, we can source it, negotiate it, and manage it — at no cost to you.
          </motion.p>

          <div className="portfolio-grid">
            {portfolioCards.map((card, i) => (
              <motion.div
                key={card.title}
                className="p-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.07 }}
              >
                <div className="p-card-icon">{card.icon}</div>
                <h3>{card.title}</h3>
                <ul>{card.bullets.map(b => <li key={b}>{b}</li>)}</ul>
              </motion.div>
            ))}
          </div>

          <motion.p
            style={{ marginTop: '2rem', fontSize: 15, color: 'var(--gray-mid)', textAlign: 'center' }}
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          >
            Don't see what you need?{' '}
            <Link to="/contact" style={{ color: 'var(--accent)', fontWeight: 600 }}>Let's talk →</Link>
          </motion.p>
        </div>
      </section>

      {/* ── Who we work with ───────────────────────────────────── */}
      <section className="section">
        <div className="container-mid">
          <motion.span
            className="eyebrow"
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          >
            Who we work with
          </motion.span>
          <motion.h2
            className="headline-lg"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            Any business. Any size. Anywhere.
          </motion.h2>
          <motion.p
            className="body-lg mt-md"
            initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }}
          >
            If your business runs on technology — and every business does — we can help. We work with companies across construction, healthcare, logistics, legal, finance, retail, manufacturing, and beyond.
          </motion.p>
          <motion.p
            className="body-lg mt-md"
            initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.18 }}
          >
            There's no industry we won't work in, no company too small, and no geography that's out of reach.
          </motion.p>
          <motion.div
            className="mt-lg" style={{ display: 'flex', gap: 14 }}
            initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.25 }}
          >
            <Link to="/contact">
              <motion.span className="btn btn-dark" whileHover={{ y: -2 }} style={{ display: 'inline-flex' }}>
                Book a call →
              </motion.span>
            </Link>
            <Link to="/solutions">
              <motion.span className="btn btn-outline" whileHover={{ y: -2 }} style={{ display: 'inline-flex' }}>
                See the full portfolio
              </motion.span>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── Principles ──────────────────────────────────────────── */}
      <section className="section section-gray">
        <div className="container">
          <motion.span
            className="eyebrow"
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          >
            How we work
          </motion.span>
          <motion.h2
            className="headline-lg"
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.7 }}
          >
            Three things we never compromise on.
          </motion.h2>
          <div className="principles-grid">
            {[
              { n: '01', title: 'Vendor neutrality',       body: 'We represent 200+ providers. Our only incentive is finding what\'s actually right for your business — not what pays us the most.' },
              { n: '02', title: 'No cost to you',          body: 'Our advisory services are funded entirely by the vendors we place. You get enterprise-grade expertise at zero cost to your budget.' },
              { n: '03', title: 'Long-term accountability', body: 'We don\'t disappear after the contract is signed. We manage the relationship, handle escalations, and optimize over time.' },
            ].map((p, i) => (
              <motion.div
                key={p.n} className="principle"
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.6, delay: i * 0.1 }}
              >
                <div className="principle-num">{p.n}</div>
                <h3>{p.title}</h3>
                <p>{p.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer CTA ──────────────────────────────────────────── */}
      <motion.section
        className="footer-cta"
        initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.8 }}
      >
        <h2>Ready to stop managing vendors?</h2>
        <p>15 minutes. No cost. No obligation.</p>
        <Link to="/contact">
          <motion.span
            className="btn btn-white"
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.97 }}
            style={{ display: 'inline-flex' }}
          >
            Book a Call →
          </motion.span>
        </Link>
      </motion.section>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <footer className="footer">
        <div className="footer-logo">
          <svg width="11" height="14" viewBox="0 0 14 18" fill="none" style={{ flexShrink: 0, marginRight: 2, color: '#86868b' }}>
            <path d="M8 1H3V17H8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="square" strokeLinejoin="miter"/>
          </svg>
          <span className="footer-logo-the">THE</span>
          <span className="footer-logo-rest">Interesting Group</span>
        </div>
        <div className="footer-meta">
          <span>© {new Date().getFullYear()} The Interesting Group · Based in Austin, TX · </span>
          <a href="mailto:info@theinterestinggroup.com">info@theinterestinggroup.com</a>
        </div>
      </footer>
    </div>
  );
}
