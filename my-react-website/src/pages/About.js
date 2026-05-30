import { motion, useInView } from 'motion/react';
import { useRef } from 'react';

const jobs = [
  {
    company: 'Cloudflare',
    role: 'Senior Digital Native Named Account Executive',
    period: 'Dec 2025 – Present',
    location: 'Austin, TX · Hybrid',
    color: '#F6821F',
    badge: 'Current Role',
    bullets: [
      'Strategic Digital Native + Enterprise account coverage',
      'Zero Trust, Edge Computing, AI, and Connectivity Cloud solutions',
    ],
  },
  {
    company: 'Paycor',
    role: 'Senior Enterprise Account Executive',
    period: 'Jun 2025 – Dec 2025',
    location: 'Austin, TX · Remote',
    color: '#0066CC',
    bullets: [
      'Navigated complex enterprise HCM sales cycles with C-suite and HR leaders',
      'Drove payroll, compliance, and employee engagement transformation for large organizations',
    ],
  },
  {
    company: 'Vercara',
    role: 'Account Executive',
    period: 'Apr 2024 – May 2025',
    location: 'Austin, TX · Remote',
    color: '#00B4D8',
    bullets: [
      'Managed full sales cycle from cold outreach to close for DNS security & DDoS protection',
      'Negotiated enterprise agreements at all organizational levels',
    ],
  },
  {
    company: 'Cloudflare',
    role: 'Commercial → Account Executive',
    period: 'Oct 2022 – Apr 2024',
    location: 'Austin, TX · Remote',
    color: '#F6821F',
    badge: 'Top 5 Performer · 100%+ Attainment',
    bullets: [
      'Drove net-new business across Security, Networking, and Cloud for Enterprise accounts',
      'Executed cross-sell/upsell campaigns via MEDDPICC; engaged buyers from engineering to C-suite',
    ],
  },
  {
    company: 'Cloudflare',
    role: 'Channel Development Specialist',
    period: 'Jul 2022 – Sep 2022',
    location: 'Austin, TX · Remote',
    color: '#F6821F',
    badge: '#1 Performer · 100%+ Attainment',
    bullets: [
      'Managed strategic partner relationships and co-marketing campaigns',
      'Onboarded and trained new partners; championed partner needs internally',
    ],
  },
  {
    company: 'Cloudflare',
    role: 'Outbound BDR',
    period: 'Sep 2021 – Jun 2022',
    location: 'Austin, TX · Remote',
    color: '#F6821F',
    badge: '#2 Performer · 100%+ Attainment',
    bullets: [
      'High-volume outbound prospecting via calling, email, and social campaigns',
      'Built deep product knowledge across networking, Zero Trust, and applications',
    ],
  },
  {
    company: 'Lighthouse Solar Austin',
    role: 'Director of Procurement & Logistics',
    period: 'Feb 2016 – Sep 2021',
    location: 'Austin, TX',
    color: '#22C55E',
    bullets: [
      'Approved nearly $50M in total expenditures; negotiated multi-million dollar manufacturer agreements',
      'Reduced project lifecycle from 210 to 70 days — a 67% improvement',
      'Built marketing department from scratch; grew Google reviews from 0 to 100+ in 4 months',
      'Minimized system costs by 15% through strategic supplier relationships',
    ],
  },
  {
    company: 'UPS',
    role: 'Operations Manager',
    period: 'Feb 2015 – Feb 2016',
    location: 'Austin, TX',
    color: '#A78800',
    bullets: [
      'Managed preload operations for 30+ employees across 3 supervisory teams',
      'Drove continuous improvements in productivity, safety, and service through data analysis',
    ],
  },
  {
    company: 'UPS',
    role: 'Logistics Operations Manager',
    period: 'Feb 2007 – Feb 2015',
    location: 'Austin, TX',
    color: '#A78800',
    bullets: [
      'Built dashboards and analytics models to optimize routing, load planning, and warehouse slotting',
      'Cross-functional analytical support for transportation decision-making at scale',
    ],
  },
  {
    company: 'UPS',
    role: 'Preload Supervisor → Specialist',
    period: 'Jun 2004 – Jan 2007',
    location: 'Austin, TX',
    color: '#A78800',
    bullets: [
      'Supervised teams of 7–12; coached, evaluated, and developed package handlers and clerks',
      'Built high-performance team culture focused on on-time delivery and safety',
    ],
  },
];

const stats = [
  { value: '20+', label: 'Years Experience' },
  { value: '$50M+', label: 'Procurement Managed' },
  { value: '4×', label: 'Top Performer' },
  { value: '100%+', label: 'Quota Attainment' },
];

function JobCard({ job, index }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });
  return (
    <motion.div
      ref={ref}
      className="exp-card"
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: (index % 3) * 0.08, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
    >
      <div className="exp-card-accent" style={{ background: job.color }} />
      <div className="exp-card-body">
        <div className="exp-card-header">
          <div>
            <p className="exp-company">{job.company}</p>
            <h3 className="exp-role">{job.role}</h3>
          </div>
          <div className="exp-meta">
            <span className="exp-period">{job.period}</span>
            <span className="exp-location">{job.location}</span>
          </div>
        </div>
        {job.badge && (
          <span className="exp-badge">{job.badge}</span>
        )}
        <ul className="exp-bullets">
          {job.bullets.map((b, i) => <li key={i}>{b}</li>)}
        </ul>
      </div>
    </motion.div>
  );
}

export default function About() {
  const heroRef = useRef(null);
  const inView = useInView(heroRef, { once: true });

  return (
    <div className="about-page">
      {/* Hero */}
      <section className="about-hero">
        <div className="about-hero-img-wrap">
          <img src="/photos/photo4.jpg" alt="Burke Ruder" className="about-hero-img" />
          <div className="about-hero-img-overlay" />
        </div>
        <motion.div
          className="about-hero-text"
          ref={heroRef}
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="section-label">About</p>
          <h1 className="about-page-name">Burke Ruder</h1>
          <p className="about-page-title">Named Accounts @ Cloudflare · Austin, TX</p>
        </motion.div>
      </section>

      {/* Stats bar */}
      <section className="about-stats-bar">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            className="about-stat-item"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
          >
            <span className="about-stat-item-value">{s.value}</span>
            <span className="about-stat-item-label">{s.label}</span>
          </motion.div>
        ))}
      </section>

      {/* Bio */}
      <section className="about-bio-section">
        <div className="section-inner">
          {[
            "I didn't take the straight path — and that's exactly the point.",
            "I started on the floor of a UPS facility in 2004, loading trucks before the sun came up. Over the next decade I worked my way from package handler to operations manager, overseeing 30+ employees and running the numbers that kept a logistics network moving.",
            "That operational foundation became my superpower when I moved into procurement & leadership at a fast-growing solar company — managing nearly $50M in expenditures, compressing project timelines by 67%, and building a marketing department from scratch.",
            "Then came tech sales. At Cloudflare I found an environment that rewards the same skills I honed on those docks: urgency, precision, and the ability to earn trust fast. Today I sell enterprise security and networking to the companies building the next internet.",
            "The common thread? A relentless drive to understand complex systems and make them work better for the people inside them.",
          ].map((line, i) => (
            <motion.p
              key={i}
              className={i === 0 ? 'about-lead' : 'about-body'}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.7, delay: i * 0.1 }}
            >
              {line}
            </motion.p>
          ))}
        </div>
      </section>

      {/* Experience */}
      <section className="about-exp-section">
        <div className="section-inner">
          <motion.p
            className="section-label"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Experience
          </motion.p>
          <motion.h2
            className="section-heading"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            A career built on <span className="hero-accent">range</span>.
          </motion.h2>
          <div className="exp-cards">
            {jobs.map((job, i) => (
              <JobCard key={`${job.company}-${i}`} job={job} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="about-contact-section">
        <div className="section-inner">
          <motion.h2
            className="section-heading contact-heading"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            Let's <span className="hero-accent">connect</span>.
          </motion.h2>
          <div className="contact-links">
            {[
              { label: 'LinkedIn', href: 'https://www.linkedin.com/in/burke-ruder/', icon: '↗' },
              { label: 'Email', href: 'mailto:burke.ruder@gmail.com', icon: '→' },
            ].map((l, i) => (
              <motion.a
                key={l.label}
                href={l.href}
                target={l.label === 'LinkedIn' ? '_blank' : undefined}
                rel="noopener noreferrer"
                className="contact-link"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                whileHover={{ x: 6, transition: { duration: 0.2 } }}
              >
                <span>{l.label}</span>
                <span className="contact-link-icon">{l.icon}</span>
              </motion.a>
            ))}
          </div>
        </div>
        <footer className="footer">
          <p>© 2026 Burke Ruder · Austin, TX</p>
        </footer>
      </section>
    </div>
  );
}
