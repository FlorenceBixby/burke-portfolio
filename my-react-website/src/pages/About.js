import { motion, useScroll, useTransform, useSpring } from 'motion/react';
import { useRef } from 'react';

const experience = [
  {
    company: 'Cloudflare',
    role: 'Senior Account Executive',
    years: '2021 – Present',
    color: '#F6821F',
    bullets: [
      'Consistently exceeded quota — 100%+ attainment each year',
      'Progressed from BDR → Channel → AE → Sr. AE',
      'Focused on enterprise security, networking, and edge solutions',
    ],
  },
  {
    company: 'Paycor',
    role: 'Account Executive',
    years: '2020 – 2021',
    color: '#4A9EFF',
    bullets: [
      'Sold HCM and payroll solutions to mid-market and enterprise',
      'Built pipeline from ground up in new territory',
    ],
  },
  {
    company: 'Vercara',
    role: 'Account Executive',
    years: '2019 – 2020',
    color: '#9B59B6',
    bullets: [
      'Sold DNS, DDoS, and web security solutions',
      'Managed strategic accounts across financial services vertical',
    ],
  },
  {
    company: 'Lighthouse Solar',
    role: 'Director of Procurement',
    years: '2016 – 2021',
    color: '#F1C40F',
    bullets: [
      'Managed $50M+ in procurement across projects',
      'Led sourcing strategy and vendor negotiations',
      'Built and scaled procurement operations from scratch',
    ],
  },
  {
    company: 'UPS',
    role: 'Multiple Roles',
    years: '2004 – 2016',
    color: '#8B6914',
    bullets: [
      'Grew from Package Handler to Operations Supervisor',
      'Managed teams of 30+ across peak seasons',
      'Developed deep expertise in logistics and process optimization',
    ],
  },
];

const stats = [
  { value: '20+', label: 'Years of Experience' },
  { value: '$50M+', label: 'Procurement Managed' },
  { value: '4×', label: 'Top Performer' },
  { value: '100%+', label: 'Quota Attainment' },
];

function StatCounter({ value, label, i }) {
  return (
    <motion.div
      className="about-stat"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4 }}
    >
      <motion.span
        className="about-stat-value"
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: i * 0.1 + 0.2, ease: [0.22, 1, 0.36, 1] }}
      >
        {value}
      </motion.span>
      <span className="about-stat-label">{label}</span>
    </motion.div>
  );
}

function ExpCard({ item, i }) {
  return (
    <motion.div
      className="exp-card"
      style={{ '--card-color': item.color }}
      initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6, transition: { duration: 0.22 } }}
    >
      <div className="exp-card-header">
        <div>
          <div className="exp-company">{item.company}</div>
          <div className="exp-role">{item.role}</div>
        </div>
        <span className="exp-years">{item.years}</span>
      </div>
      <ul className="exp-bullets">
        {item.bullets.map((b, j) => (
          <motion.li
            key={j}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.07 + j * 0.05 + 0.2 }}
          >
            {b}
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );
}

export default function About() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const smoothHeroY = useSpring(heroY, { stiffness: 40, damping: 18 });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <div className="about-page">

      {/* Hero */}
      <div ref={heroRef} className="about-hero">
        <motion.div
          className="about-hero-bg"
          style={{
            backgroundImage: `url(${process.env.PUBLIC_URL}/hero-bg.jpg)`,
            y: smoothHeroY,
          }}
        />
        <div className="about-hero-overlay" />
        <motion.div className="about-hero-content" style={{ opacity: heroOpacity }}>
          <motion.p
            className="section-label"
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            About
          </motion.p>
          <motion.h1
            className="about-hero-name"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            Burke Ruder
          </motion.h1>
          <motion.p
            className="about-hero-sub"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.55 }}
          >
            Sales leader. Procurement strategist. Photographer.
          </motion.p>
        </motion.div>
      </div>

      {/* Stats bar */}
      <div className="about-stats-bar">
        {stats.map((s, i) => <StatCounter key={s.label} {...s} i={i} />)}
      </div>

      {/* Bio */}
      <section className="about-bio">
        <motion.div
          className="about-bio-inner"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
        >
          {[
            "Twenty years across logistics, renewable energy, cybersecurity, and SaaS have given me one consistent edge: I know how to find the right solution at the right price and get deals done.",
            "At UPS I learned operations from the ground up — managing teams, optimizing processes, and delivering under pressure. At Lighthouse Solar I took that discipline into procurement, overseeing $50M+ in sourcing decisions for large-scale solar projects.",
            "Since 2019 I've been in enterprise technology sales — Vercara, Paycor, and now Cloudflare — building pipelines from scratch, navigating complex deals, and consistently hitting and exceeding quota.",
            "Outside of work, I'm usually behind a camera. Austin's streets, the light at golden hour, the energy of a city that never quite sits still — that's where I find my reset.",
          ].map((p, i) => (
            <motion.p
              key={i}
              className="about-bio-para"
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
              }}
            >
              {p}
            </motion.p>
          ))}
        </motion.div>
      </section>

      {/* Experience timeline */}
      <section className="about-experience">
        <motion.div
          className="about-exp-header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="section-label">Career</p>
          <h2 className="about-exp-title">Experience</h2>
        </motion.div>
        <div className="exp-grid">
          {experience.map((item, i) => <ExpCard key={item.company} item={item} i={i} />)}
        </div>
      </section>

      {/* Contact */}
      <motion.section
        className="about-contact"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Let's Connect
        </motion.h2>
        <div className="about-contact-links">
          <motion.a
            href="https://linkedin.com/in/burkeruder"
            target="_blank"
            rel="noopener noreferrer"
            className="about-contact-btn"
            whileHover={{ scale: 1.05, y: -3 }}
            whileTap={{ scale: 0.95 }}
          >
            LinkedIn
          </motion.a>
          <motion.a
            href="mailto:burke.ruder@gmail.com"
            className="about-contact-btn about-contact-btn--outline"
            whileHover={{ scale: 1.05, y: -3 }}
            whileTap={{ scale: 0.95 }}
          >
            Email Me
          </motion.a>
        </div>
      </motion.section>

    </div>
  );
}
