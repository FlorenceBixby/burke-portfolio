import { motion, useInView, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';

const jobs = [
  {
    company: 'Cloudflare',
    role: 'Senior Digital Native Named Account Executive',
    period: 'Dec 2025 – Present',
    location: 'Austin, TX · Hybrid',
    color: '#F6821F',
    bullets: [
      'Strategic Digital Native + Enterprise account coverage',
      'Zero Trust, Edge Computing, AI, and Connectivity Cloud',
    ],
  },
  {
    company: 'Paycor',
    role: 'Senior Enterprise Account Executive',
    period: 'Jun 2025 – Dec 2025',
    location: 'Austin, TX · Remote',
    color: '#0066CC',
    bullets: [
      'Navigated complex enterprise sales cycles with C-suite and HR leaders',
      'Drove HCM transformation for large organizations across payroll, compliance, and employee engagement',
    ],
  },
  {
    company: 'Vercara',
    role: 'Account Executive',
    period: 'Apr 2024 – May 2025',
    location: 'Austin, TX · Remote',
    color: '#00B4D8',
    bullets: [
      'Managed full sales cycle from cold outreach to close for DNS security and DDoS protection solutions',
      'Negotiated enterprise agreements with stakeholders at all organizational levels',
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
      'Executed cross-sell/upsell campaigns and maintained robust pipeline via MEDDPICC',
      'Engaged buyers from engineering to C-suite on Zero Trust and edge architecture',
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
      'Managed strategic partner relationships, co-marketing campaigns, and field events',
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
      'Built marketing department from scratch, grew Google reviews from 0 to 100+ in 4 months',
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
      'Analyzed operational data to drive continuous improvements in productivity and safety',
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
      'Supervised teams of 7–12, delivered coaching, performance evaluations, and safety compliance',
      'Built collaborative environment focused on operational excellence and on-time delivery',
    ],
  },
];

function JobCard({ job, index }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      className="exp-card"
      initial={{ opacity: 0, x: index % 2 === 0 ? -40 : 40 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
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
          <motion.span
            className="exp-badge"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={inView ? { scale: 1, opacity: 1 } : {}}
            transition={{ delay: 0.3, type: 'spring', stiffness: 300 }}
          >
            {job.badge}
          </motion.span>
        )}
        <ul className="exp-bullets">
          {job.bullets.map((b, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.15 + i * 0.1, duration: 0.5 }}
            >
              {b}
            </motion.li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}

export default function Experience() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start center', 'end center'] });
  const lineHeight = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  return (
    <section id="experience" className="experience">
      <div className="section-inner">
        <motion.p
          className="section-label"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          Experience
        </motion.p>
        <motion.h2
          className="section-heading"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          A career built on <span className="hero-accent">range</span>.
        </motion.h2>

        <div className="exp-timeline" ref={containerRef}>
          <div className="exp-line-track">
            <motion.div className="exp-line-fill" style={{ height: lineHeight }} />
          </div>
          <div className="exp-cards">
            {jobs.map((job, i) => (
              <JobCard key={`${job.company}-${i}`} job={job} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
