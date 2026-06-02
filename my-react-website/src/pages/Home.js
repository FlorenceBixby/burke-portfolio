import { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  motion,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
  animate,
} from 'motion/react';
import {
  ClipReveal,
  Parallax,
  ScaleReveal,
  ScrollProgressBar,
  HorizontalScroll,
  StaggerContainer,
  fadeUpItem,
} from '../components/ScrollReveal';
import VinylRecord from '../components/VinylRecord';

/* ── Animated counter ─────────────────────────────────────── */
function Counter({ to, prefix = '', suffix = '' }) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  const motionVal = useMotionValue(0);
  const [display, setDisplay] = useState('0');

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold: 0.5 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!inView) return;
    const ctrl = animate(motionVal, to, { duration: 2, ease: [0.16, 1, 0.3, 1] });
    const unsub = motionVal.on('change', (v) => setDisplay(Math.round(v).toString()));
    return () => { ctrl.stop(); unsub(); };
  }, [inView, motionVal, to]);

  return <span ref={ref}>{prefix}{display}{suffix}</span>;
}

/* ── Cursor glow ──────────────────────────────────────────── */
function CursorGlow() {
  const x = useMotionValue(-400);
  const y = useMotionValue(-400);
  const sx = useSpring(x, { stiffness: 60, damping: 18 });
  const sy = useSpring(y, { stiffness: 60, damping: 18 });

  useEffect(() => {
    const move = (e) => { x.set(e.clientX); y.set(e.clientY); };
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, [x, y]);

  return (
    <motion.div className="cursor-glow" style={{ left: sx, top: sy }} />
  );
}

const solutions = [
  { icon: '📡', title: 'Network & Voice',          desc: 'Enterprise connectivity and carrier-grade voice from every major provider.',           path: '/solutions/network-voice' },
  { icon: '💬', title: 'Unified Communications',   desc: 'Cloud phone, video, and messaging platforms for modern teams.',                       path: '/solutions/unified-communications' },
  { icon: '🎧', title: 'Contact Center',            desc: 'AI-powered CCaaS that scales from 10 seats to enterprise operations.',                path: '/solutions/contact-center' },
  { icon: '🔒', title: 'Cybersecurity',             desc: 'Zero Trust, SASE, MDR, and compliance-ready security frameworks.',                   path: '/solutions/cybersecurity' },
  { icon: '☁️', title: 'Cloud Computing',           desc: 'Public, private, and hybrid cloud strategies across AWS, Azure, and GCP.',            path: '/solutions/cloud-computing' },
  { icon: '📱', title: 'Mobility & IoT & AI',       desc: 'MDM, IoT connectivity, and AI automation for distributed operations.',                path: '/solutions/mobility-iot-ai' },
  { icon: '⚙️', title: 'Managed Services',          desc: 'Fully outsourced IT, NOC, and helpdesk support from top MSPs.',                      path: '/solutions/managed-services' },
  { icon: '🌐', title: 'SD-WAN',                    desc: 'Intelligent networking that cuts WAN costs by 30–50%.',                              path: '/solutions/sd-wan' },
];

const whyItems = [
  { icon: '🎯', title: 'Vendor-Neutral Advice',  desc: 'We represent 200+ providers. Our recommendations are always based on your needs, not margins.' },
  { icon: '💰', title: 'No Additional Cost',     desc: 'Advisory services funded by vendors — you get expert guidance at zero charge to you.' },
  { icon: '⚡', title: 'Faster Procurement',     desc: 'Skip months of RFP cycles. Competitive quotes in days through our network.' },
  { icon: '🔧', title: 'Ongoing Support',        desc: 'We stay engaged after contracts are signed — managing escalations and renewals.' },
];

const vendors = [
  'AT&T', 'Lumen', 'Comcast Business', 'Spectrum Enterprise', 'Verizon',
  'RingCentral', 'Zoom', 'Microsoft Teams', 'Dialpad', 'Vonage',
  'Five9', 'Genesys', 'NICE CXone', 'Talkdesk', 'Palo Alto Networks',
  'CrowdStrike', 'Fortinet', 'Zscaler', 'AWS', 'Azure', 'Google Cloud',
  'Airespring', 'Broadvoice', 'Logically', 'Graphiant', 'Crown Castle',
];

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.7, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] },
  }),
};

export default function Home() {
  const heroRef = useRef(null);
  const { scrollYProgress: heroScroll } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY       = useTransform(heroScroll, [0, 1], [0, 100]);
  const heroOpacity = useTransform(heroScroll, [0, 0.65], [1, 0]);
  const heroScale   = useTransform(heroScroll, [0, 1], [1, 0.96]);

  return (
    <main style={{ background: 'var(--bg)' }}>
      <CursorGlow />
      <ScrollProgressBar />

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="hero" ref={heroRef}>
        <div className="hero-noise" />
        <Parallax speed={-0.15} style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
          <div className="hero-glow" style={{ position: 'absolute', top: '50%', right: '-10%', transform: 'translateY(-50%)' }} />
          <div className="hero-glow-2" style={{ position: 'absolute', bottom: '10%', left: '5%' }} />
        </Parallax>

        {/* Vinyl record — right side background decoration */}
        <div style={{ position: 'absolute', right: '-40px', top: '50%', transform: 'translateY(-46%)', zIndex: 1, pointerEvents: 'none' }}>
          <VinylRecord size={580} opacity={0.16} />
        </div>

        <motion.div
          className="hero-content container"
          style={{ y: heroY, opacity: heroOpacity, scale: heroScale }}
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
              <motion.span className="btn-primary" whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                Get a Free Assessment →
              </motion.span>
            </Link>
            <Link to="/solutions">
              <motion.span className="btn-outline" whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                Explore Solutions
              </motion.span>
            </Link>
          </motion.div>

          <motion.div className="hero-stats" variants={fadeUp} initial="hidden" animate="visible" custom={4}>
            {[
              { to: 200, suffix: '+', label: 'Technology Vendors' },
              { to: 8,   suffix: '',  label: 'Solution Categories' },
              { to: 0,   prefix: '$', suffix: '', label: 'Advisory Cost to You' },
              { to: 1,   suffix: '',  label: 'Trusted Partner' },
            ].map((s) => (
              <div key={s.label} className="hero-stat">
                <div className="hero-stat-num">
                  <Counter to={s.to} prefix={s.prefix || ''} suffix={s.suffix} />
                </div>
                <div className="hero-stat-label">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ── Ticker ───────────────────────────────────────────── */}
      <div className="ticker-bar">
        <div className="ticker-track">
          {[...vendors, ...vendors].map((v, i) => (
            <div key={i} className="ticker-item"><span>◆</span>{v}</div>
          ))}
        </div>
      </div>

      {/* ── Horizontal scroll text ───────────────────────────── */}
      <HorizontalScroll text="Network  ·  Cloud  ·  Security  ·  Telecom  ·  SD-WAN  ·  AI" direction={1} />
      <HorizontalScroll text="Managed Services  ·  UCaaS  ·  CCaaS  ·  IoT  ·  Mobility" direction={-1} />

      {/* ── Solutions ────────────────────────────────────────── */}
      <section className="section-shell">
        <div className="container">
          <span className="section-num">01</span>

          <ClipReveal>
            <div className="section-header">
              <div className="label">Solutions</div>
              <h2 className="section-title">
                Every Category<br /><span>Your Business Needs</span>
              </h2>
              <p className="section-sub">
                We source and manage best-fit solutions across every major technology category.
              </p>
            </div>
          </ClipReveal>

          <StaggerContainer staggerDelay={0.07}>
            <div className="sol-grid">
              {solutions.map((s, i) => (
                <motion.div key={s.path} variants={fadeUpItem}>
                  <Link to={s.path} className="sol-card"
                    style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    <motion.div
                      whileHover={{ y: -4 }}
                      transition={{ duration: 0.2 }}
                      style={{ display: 'contents' }}
                    >
                      <div className="sol-card-num">0{i + 1}</div>
                      <div className="sol-card-icon">{s.icon}</div>
                      <div className="sol-card-title">{s.title}</div>
                      <div className="sol-card-desc">{s.desc}</div>
                      <div className="sol-card-arrow">View solution →</div>
                    </motion.div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </StaggerContainer>
        </div>
      </section>

      {/* ── Statement ────────────────────────────────────────── */}
      <section className="statement-section">
        <div className="container">
          <ScaleReveal>
            <h2 className="statement-h2">
              Stop overpaying for technology.<br />
              <span>We fix that.</span>
            </h2>
          </ScaleReveal>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <Link to="/contact">
              <motion.span className="btn-primary"
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
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

          <ClipReveal direction="left">
            <div className="section-header">
              <div className="label">Why Us</div>
              <h2 className="section-title">
                The Smarter Way<br /><span>to Buy Technology</span>
              </h2>
              <p className="section-sub">
                Most businesses overpay because navigating hundreds of vendors is complex. We simplify the entire process.
              </p>
            </div>
          </ClipReveal>

          <div className="why-row">
            {whyItems.map((w, i) => (
              <ClipReveal key={w.title} delay={i * 0.05} direction={i % 2 === 0 ? 'up' : 'right'}>
                <motion.div
                  className="why-cell"
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                >
                  <div className="why-cell-num">0{i + 1}</div>
                  <div className="why-cell-icon">{w.icon}</div>
                  <div className="why-cell-title">{w.title}</div>
                  <div className="why-cell-desc">{w.desc}</div>
                </motion.div>
              </ClipReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Vendors ──────────────────────────────────────────── */}
      <section className="vendors-section">
        <div className="container">
          <ClipReveal>
            <div className="label">Vendor Network</div>
            <h2 className="section-title">200+ Carriers &amp; Providers</h2>
            <p className="section-sub">
              Access to every major technology vendor — giving you unbiased comparisons and competitive pricing.
            </p>
          </ClipReveal>
        </div>
        <div className="vendors-marquee-wrap" style={{ marginTop: '3rem' }}>
          <div className="vendors-marquee">
            {[...vendors, ...vendors].map((v, i) => (
              <div key={i} className="vendor-chip">{v}</div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="cta-band">
        <div className="cta-band-glow" />
        <div className="container" style={{ position: 'relative' }}>
          <ScaleReveal>
            <div className="label" style={{ justifyContent: 'center' }}>Ready to Start?</div>
            <h2 className="section-title"
              style={{ maxWidth: '640px', margin: '0 auto 1rem', textAlign: 'center' }}>
              Let's Find the Right Technology<br /><span>for Your Business</span>
            </h2>
            <p className="section-sub"
              style={{ maxWidth: '440px', margin: '0 auto 3rem', textAlign: 'center' }}>
              Free assessment. We review your environment, identify savings, and present the best options across our 200+ vendor network.
            </p>
            <div className="cta-actions">
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
            </div>
          </ScaleReveal>
        </div>
      </section>
    </main>
  );
}
