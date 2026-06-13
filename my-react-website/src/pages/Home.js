import { useRef } from 'react';
import {
  motion,
  useScroll,
  useTransform,
  useInView,
  useSpring,
} from 'motion/react';

/* ── helpers ── */
function FadeUp({ children, delay = 0, className }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function RevealLine({ children, delay = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  return (
    <div ref={ref} style={{ overflow: 'hidden' }}>
      <motion.div
        initial={{ y: '110%' }}
        animate={inView ? { y: '0%' } : {}}
        transition={{ duration: 1.1, delay, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </div>
  );
}

/* ── timeline data ── */
const timeline = [
  {
    year: '2004 – 2016',
    role: 'Pre-loader → Operations Supervisor',
    company: 'UPS',
    desc: 'Started loading package cars at 3am. Worked every role in the building. Learned that grit, systems thinking, and showing up matter more than pedigree.',
  },
  {
    year: '2016 – 2021',
    role: 'Director of Procurement',
    company: 'Lighthouse Solar',
    desc: 'Moved into solar at the inflection point of the industry. Managed $50M+ in procurement, built supplier relationships from scratch, and scaled operations.',
  },
  {
    year: '2021',
    role: 'Business Development Representative',
    company: 'Cloudflare',
    desc: 'Bet on myself. Joined the fastest-growing infrastructure company on the planet as a BDR — hungry to learn the enterprise tech world.',
  },
  {
    year: '2022',
    role: 'Channel Account Executive',
    company: 'Cloudflare',
    desc: 'Built out partner channels, closed deals, and found my stride in enterprise sales.',
  },
  {
    year: '2023 – Present',
    role: 'Account Executive → Senior AE',
    company: 'Cloudflare',
    desc: "100%+ quota attainment. 4× Top Performer recognition. Named one of the top performers in the region. Still just getting started.",
  },
];

const photos = [
  '/best/3R2A5336.jpg',
  '/best/3R2A5382.jpg',
  '/best/3R2A5356.jpg',
  '/best/3R2A5362.jpg',
  '/best/3R2A5332.jpg',
];

/* ── Hero ── */
function Hero() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const opacity = useTransform(scrollYProgress, [0, 0.65], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);

  const line1 = ['Just', 'curious.'];
  const line2 = ["That's", 'the', 'whole', 'thing.'];

  return (
    <section className="hero" ref={ref}>
      <motion.div
        className="hero-bg"
        style={{
          backgroundImage: `url(${process.env.PUBLIC_URL}/photos/photo5.jpg)`,
          y: bgY,
          scale,
        }}
      />
      <div className="hero-overlay" />

      {/* Floating ambient orbs */}
      <motion.div
        className="hero-orb"
        style={{ width: 600, height: 600, background: '#4a7c59', top: '10%', left: '-10%' }}
        animate={{ x: [0, 40, -20, 0], y: [0, -30, 20, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="hero-orb"
        style={{ width: 400, height: 400, background: '#2a4a35', top: '50%', right: '-5%' }}
        animate={{ x: [0, -30, 15, 0], y: [0, 40, -20, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
      />
      <motion.div
        className="hero-orb"
        style={{ width: 300, height: 300, background: '#4a7c59', bottom: '15%', left: '30%' }}
        animate={{ x: [0, 20, -30, 0], y: [0, -20, 10, 0] }}
        transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut', delay: 6 }}
      />

      <motion.div className="hero-content" style={{ opacity }}>
        <h1 className="hero-quote">
          <span style={{ display: 'block', overflow: 'hidden', marginBottom: '0.05em' }}>
            {line1.map((w, i) => (
              <motion.span
                key={w}
                style={{ display: 'inline-block', marginRight: '0.22em' }}
                initial={{ y: '110%', opacity: 0 }}
                animate={{ y: '0%', opacity: 1 }}
                transition={{ duration: 1.1, delay: 0.3 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
              >
                {w}
              </motion.span>
            ))}
          </span>
          <span style={{ display: 'block', overflow: 'hidden' }}>
            {line2.map((w, i) => (
              <motion.span
                key={w + i}
                style={{ display: 'inline-block', marginRight: '0.22em' }}
                initial={{ y: '110%', opacity: 0 }}
                animate={{ y: '0%', opacity: 1 }}
                transition={{ duration: 1.1, delay: 0.55 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              >
                {w === 'whole' ? <em>{w}</em> : w}
              </motion.span>
            ))}
          </span>
        </h1>

        <motion.p
          className="hero-sub"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.2, ease: [0.22, 1, 0.36, 1] }}
        >
          Burke Ruder · Austin, Texas
        </motion.p>
      </motion.div>

      {/* Animated scroll hint */}
      <motion.div
        className="hero-scroll-hint"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2, duration: 1 }}
      >
        <motion.div
          className="hero-scroll-line"
          animate={{ scaleY: [0, 1, 0] }}
          style={{ transformOrigin: 'top' }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut', repeatDelay: 0.3 }}
        />
        <span>Scroll</span>
      </motion.div>
    </section>
  );
}

/* ── Intro ── */
function Intro() {
  return (
    <section style={{ padding: '9rem 5vw', maxWidth: 1100, margin: '0 auto' }}>
      <FadeUp delay={0.05}>
        <p className="intro-label">About</p>
      </FadeUp>
      <h2 style={{
        fontFamily: 'var(--serif)',
        fontSize: 'clamp(2.2rem, 5vw, 4.2rem)',
        fontWeight: 700,
        lineHeight: 1.15,
        letterSpacing: '-0.02em',
        color: 'var(--text)',
        marginBottom: '2.5rem',
        maxWidth: 800,
      }}>
        <RevealLine delay={0.1}>From loading package cars at 3am</RevealLine>
        <RevealLine delay={0.22}>to closing enterprise deals</RevealLine>
        <RevealLine delay={0.34}>at one of the world's fastest-growing</RevealLine>
        <RevealLine delay={0.46}>tech companies.</RevealLine>
      </h2>
      <FadeUp delay={0.3}>
        <p style={{
          fontSize: 'clamp(1rem, 1.8vw, 1.15rem)',
          fontWeight: 300,
          lineHeight: 1.9,
          color: 'var(--text-muted)',
          maxWidth: 620,
        }}>
          I started my career at <strong style={{ color: 'var(--text)', fontWeight: 500 }}>UPS</strong> throwing boxes in the dark. Twelve years later I was running procurement for a solar company moving <strong style={{ color: 'var(--text)', fontWeight: 500 }}>$50M+</strong> in materials. Then I made the jump into enterprise tech — and I haven't looked back. I'm a Senior Account Executive at <strong style={{ color: 'var(--text)', fontWeight: 500 }}>Cloudflare</strong>, 4× Top Performer, and I approach every problem the same way I did at 22: with curiosity, a lot of hustle, and zero attachment to how things are "supposed" to work.
        </p>
      </FadeUp>
    </section>
  );
}

/* ── Stats ── */
function Stats() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  const items = [
    { num: '20', suffix: '+', label: 'Years of experience' },
    { num: '$50', suffix: 'M+', label: 'Procurement managed' },
    { num: '4×', suffix: '', label: "Top Performer" },
    { num: '100', suffix: '%+', label: 'Quota attainment' },
  ];

  return (
    <div className="stats-section" ref={ref}>
      <div className="stats-grid">
        {items.map((s, i) => (
          <motion.div
            key={s.label}
            className="stat-item"
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="stat-num">
              {s.num}<span>{s.suffix}</span>
            </div>
            <div className="stat-label">{s.label}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ── Timeline item ── */
function TimelineItem({ item, index }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: false, margin: '-30% 0px -30% 0px' });

  return (
    <motion.div
      ref={ref}
      className={`timeline-item ${inView ? 'active' : ''}`}
      initial={{ opacity: 0, x: -24 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="timeline-year">{item.year}</div>
      <div className="timeline-role">{item.role}</div>
      <div className="timeline-company">{item.company}</div>
      <div className="timeline-desc">{item.desc}</div>
    </motion.div>
  );
}

/* ── Story / Timeline ── */
function Story() {
  return (
    <section className="story-section">
      <div className="story-inner">
        <div className="story-sticky">
          <FadeUp>
            <p className="story-label">The journey</p>
            <h2 className="story-headline">
              Every chapter taught me something the last one couldn't.
            </h2>
            <p className="story-desc">
              I didn't plan a career. I followed curiosity, said yes to hard things, and kept moving forward. Here's what that looked like.
            </p>
          </FadeUp>
        </div>

        <div className="timeline">
          {timeline.map((item, i) => (
            <TimelineItem key={item.year} item={item} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Horizontal Photo Strip with parallax ── */
function PhotoStrip() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const x = useTransform(scrollYProgress, [0, 1], ['5%', '-20%']);
  const smoothX = useSpring(x, { stiffness: 50, damping: 18 });

  return (
    <section className="photo-strip" ref={ref}>
      <FadeUp>
        <p className="photo-strip-label">Through the lens</p>
      </FadeUp>
      <div style={{ overflow: 'hidden' }}>
        <motion.div className="photo-strip-track" style={{ x: smoothX }}>
          {photos.map((src, i) => (
            <motion.div
              key={src}
              className="photo-strip-item"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.85, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ scale: 1.04, zIndex: 2 }}
            >
              <img
                src={`${process.env.PUBLIC_URL}${src}`}
                alt=""
                loading="lazy"
                draggable={false}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ── Contact ── */
function Contact() {
  const socials = [
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/burke-ruder/' },
    { label: 'GitHub', href: 'https://github.com/FlorenceBixby' },
    { label: 'Instagram', href: 'https://instagram.com/burkeruder' },
    { label: 'Discord', href: 'https://discord.com/users/Mr.Bixby' },
    { label: 'X / Twitter', href: 'https://x.com/BurkeRuder' },
  ];

  return (
    <section className="contact-section">
      <FadeUp>
        <h2 className="contact-headline">
          Let's talk.<br /><em>I'm always curious.</em>
        </h2>
        <p className="contact-sub">Drop a line. I actually respond.</p>
        <motion.a
          href="mailto:burke.ruder@gmail.com"
          className="contact-email"
          whileHover={{ letterSpacing: '0.05em' }}
          transition={{ duration: 0.3 }}
        >
          burke.ruder@gmail.com
        </motion.a>
      </FadeUp>

      <div className="contact-socials">
        {socials.map((s, i) => (
          <motion.a
            key={s.label}
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            className="contact-social-link"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.07, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -4 }}
          >
            {s.label}
          </motion.a>
        ))}
      </div>
    </section>
  );
}

/* ── Page ── */
export default function Home() {
  return (
    <div style={{ background: 'var(--bg)' }}>
      <Hero />
      <Intro />
      <Stats />
      <Story />
      <PhotoStrip />
      <Contact />
    </div>
  );
}
