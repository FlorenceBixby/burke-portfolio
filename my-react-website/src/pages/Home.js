import { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  motion,
  useScroll,
  useTransform,
  useInView,
  useMotionValue,
  useSpring,
  animate,
  stagger,
} from 'motion/react';

/* ── Animated counter ─────────────────────────────────────── */
function Counter({ to, suffix = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const motionVal = useMotionValue(0);
  const [display, setDisplay] = useState('0');

  useEffect(() => {
    if (!inView) return;
    const controls = animate(motionVal, to, {
      duration: 1.8,
      ease: [0.16, 1, 0.3, 1],
    });
    const unsub = motionVal.on('change', (v) => setDisplay(Math.round(v).toString()));
    return () => { controls.stop(); unsub(); };
  }, [inView, motionVal, to]);

  return <span ref={ref}>{display}{suffix}</span>;
}

/* ── Cursor glow ──────────────────────────────────────────── */
function CursorGlow() {
  const x = useMotionValue(-400);
  const y = useMotionValue(-400);
  const sx = useSpring(x, { stiffness: 80, damping: 20 });
  const sy = useSpring(y, { stiffness: 80, damping: 20 });

  useEffect(() => {
    const move = (e) => { x.set(e.clientX); y.set(e.clientY); };
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, [x, y]);

  return (
    <motion.div
      className="cursor-glow"
      style={{ left: sx, top: sy }}
    />
  );
}

const solutions = [
  { icon: '📡', title: 'Network & Voice', desc: 'Enterprise connectivity and carrier-grade voice from every major provider.', path: '/solutions/network-voice' },
  { icon: '💬', title: 'Unified Communications', desc: 'Cloud phone, video, and messaging platforms for modern teams.', path: '/solutions/unified-communications' },
  { icon: '🎧', title: 'Contact Center', desc: 'AI-powered CCaaS that scales from 10 seats to enterprise.', path: '/solutions/contact-center' },
  { icon: '🔒', title: 'Cybersecurity', desc: 'Zero Trust, SASE, MDR, and compliance-ready security frameworks.', path: '/solutions/cybersecurity' },
  { icon: '☁️', title: 'Cloud Computing', desc: 'Public, private, and hybrid cloud strategies across AWS, Azure, GCP.', path: '/solutions/cloud-computing' },
  { icon: '📱', title: 'Mobility & IoT & AI', desc: 'MDM, IoT connectivity, and AI automation for distributed operations.', path: '/solutions/mobility-iot-ai' },
  { icon: '⚙️', title: 'Managed Services', desc: 'Fully outsourced IT, NOC, and helpdesk support from top MSPs.', path: '/solutions/managed-services' },
  { icon: '🌐', title: 'SD-WAN', desc: 'Intelligent networking that cuts WAN costs by 30–50%.', path: '/solutions/sd-wan' },
];

const whyItems = [
  { icon: '🎯', title: 'Vendor-Neutral Advice', desc: 'We represent 200+ providers. Our recommendations are always based on your needs, not margins.' },
  { icon: '💰', title: 'No Additional Cost', desc: 'Advisory services funded by vendors — you get expert guidance at no charge.' },
  { icon: '⚡', title: 'Faster Procurement', desc: 'Skip months of RFP cycles. Competitive quotes in days through our Sandler Partners network.' },
  { icon: '🔧', title: 'Ongoing Support', desc: 'We stay engaged after contracts are signed — managing escalations and renewals.' },
];

const vendors = [
  'AT&T', 'Lumen', 'Comcast Business', 'Spectrum Enterprise', 'Verizon',
  'RingCentral', 'Zoom', 'Microsoft Teams', 'Dialpad', 'Vonage',
  'Five9', 'Genesys', 'NICE CXone', 'Talkdesk', 'Palo Alto Networks',
  'CrowdStrike', 'Fortinet', 'Zscaler', 'AWS', 'Azure', 'Google Cloud',
  'Airespring', 'Broadvoice', 'Logically', 'Graphiant', 'Crown Castle',
];

/* ── Fade-up variant ──────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.7, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] },
  }),
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: (i = 0) => ({
    opacity: 1,
    transition: { duration: 0.6, delay: i * 0.08 },
  }),
};

export default function Home() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  const doubledVendors = [...vendors, ...vendors];

  return (
    <main style={{ background: 'var(--bg)' }}>
      <CursorGlow />

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="hero" ref={heroRef}>
        <div className="hero-noise" />
        <div className="hero-glow" />
        <div className="hero-glow-2" />

        <motion.div
          className="hero-content container"
          style={{ y: heroY, opacity: heroOpacity }}
        >
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0}>
            <div className="label">Technology Advisory</div>
          </motion.div>

          <motion.h1 className="hero-h1" variants={fadeUp} initial="hidden" animate="visible" custom={1}>
            Smarter Technology.
            <em>Simpler Decisions.</em>
          </motion.h1>

          <motion.p className="hero-sub" variants={fadeUp} initial="hidden" animate="visible" custom={2}>
            Your independent technology advisor — helping businesses source the right telecom, cloud, cybersecurity, and IT solutions from 200+ top vendors, at no additional cost.
          </motion.p>

          <motion.div className="hero-actions" variants={fadeUp} initial="hidden" animate="visible" custom={3}>
            <Link to="/contact">
              <motion.span
                className="btn-primary"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
              >
                Get a Free Assessment →
              </motion.span>
            </Link>
            <Link to="/solutions">
              <motion.span
                className="btn-outline"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
              >
                Explore Solutions
              </motion.span>
            </Link>
          </motion.div>

          <motion.div
            className="hero-stats"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={4}
          >
            {[
              { to: 200, suffix: '+', label: 'Technology Vendors' },
              { to: 8, suffix: '', label: 'Solution Categories' },
              { to: 0, prefix: '$', suffix: '', label: 'Advisory Cost to You' },
              { to: 1, suffix: '', label: 'Trusted Partner' },
            ].map((s, i) => (
              <div key={s.label} className="hero-stat">
                <div className="hero-stat-num">
                  {s.prefix || ''}<Counter to={s.to} suffix={s.suffix} />
                  {s.suffix === '+' ? null : null}
                </div>
                <div className="hero-stat-label">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ── Ticker bar ───────────────────────────────────────── */}
      <div className="ticker-bar">
        <div className="ticker-track">
          {[...vendors, ...vendors].map((v, i) => (
            <div key={i} className="ticker-item">
              <span>◆</span>{v}
            </div>
          ))}
        </div>
      </div>

      {/* ── Solutions ────────────────────────────────────────── */}
      <section className="section-shell">
        <div className="container">
          <span className="section-num">01</span>
          <motion.div
            className="section-header"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={fadeUp}
          >
            <div className="label">Solutions</div>
            <h2 className="section-title">
              Every Category<br /><span>Your Business Needs</span>
            </h2>
            <p className="section-sub">
              We source and manage best-fit solutions across every major technology category — from connectivity to cloud to cybersecurity.
            </p>
          </motion.div>

          <motion.div
            className="sol-grid"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
          >
            {solutions.map((s, i) => (
              <motion.div key={s.path} variants={fadeIn} custom={i}>
                <Link to={s.path} className="sol-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  <motion.div whileHover={{ scale: 1.02 }} style={{ height: '100%', display: 'contents' }}>
                    <div className="sol-card-num">0{i + 1}</div>
                    <div className="sol-card-icon">{s.icon}</div>
                    <div className="sol-card-title">{s.title}</div>
                    <div className="sol-card-desc">{s.desc}</div>
                    <div className="sol-card-arrow">View solution →</div>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Statement ────────────────────────────────────────── */}
      <section className="statement-section">
        <div className="container">
          <motion.h2
            className="statement-h2"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          >
            Stop overpaying for technology.<br />
            <span>We fix that.</span>
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <Link to="/contact">
              <motion.span
                className="btn-primary"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
              >
                Schedule a Free Assessment →
              </motion.span>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── Why Us ───────────────────────────────────────────── */}
      <section className="section-shell">
        <div className="container">
          <span className="section-num">02</span>
          <motion.div
            className="section-header"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={fadeUp}
          >
            <div className="label">Why Us</div>
            <h2 className="section-title">
              The Smarter Way<br /><span>to Buy Technology</span>
            </h2>
            <p className="section-sub">
              Most businesses overpay because navigating hundreds of vendors is complex. We simplify the entire process.
            </p>
          </motion.div>

          <motion.div
            className="why-row"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          >
            {whyItems.map((w, i) => (
              <motion.div
                key={w.title}
                className="why-cell"
                variants={fadeUp}
                custom={i}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
              >
                <div className="why-cell-num">0{i + 1}</div>
                <div className="why-cell-icon">{w.icon}</div>
                <div className="why-cell-title">{w.title}</div>
                <div className="why-cell-desc">{w.desc}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Vendors ──────────────────────────────────────────── */}
      <section className="vendors-section">
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <div className="label">Vendor Network</div>
            <h2 className="section-title">200+ Carriers &amp; Providers</h2>
            <p className="section-sub">
              Access to every major technology vendor — giving you unbiased comparisons and competitive pricing.
            </p>
          </motion.div>
        </div>
        <div className="vendors-marquee-wrap" style={{ marginTop: '3rem' }}>
          <div className="vendors-marquee">
            {doubledVendors.map((v, i) => (
              <div key={i} className="vendor-chip">{v}</div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="cta-band">
        <div className="cta-band-glow" />
        <div className="container" style={{ position: 'relative' }}>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
          >
            <motion.div variants={fadeUp}>
              <div className="label" style={{ justifyContent: 'center' }}>Ready to Start?</div>
            </motion.div>
            <motion.h2 className="section-title cta-band .section-title" variants={fadeUp}
              style={{ maxWidth: '640px', margin: '0 auto 1rem', textAlign: 'center' }}>
              Let's Find the Right Technology<br /><span>for Your Business</span>
            </motion.h2>
            <motion.p className="section-sub" variants={fadeUp}
              style={{ maxWidth: '440px', margin: '0 auto 3rem', textAlign: 'center' }}>
              Free assessment. We review your environment, identify savings, and present the best options across our 200+ vendor network.
            </motion.p>
            <motion.div className="cta-actions" variants={fadeUp}>
              <Link to="/contact">
                <motion.span className="btn-primary"
                  whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                  Schedule a Free Assessment →
                </motion.span>
              </Link>
              <Link to="/solutions">
                <motion.span className="btn-outline"
                  whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                  Browse Solutions
                </motion.span>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
