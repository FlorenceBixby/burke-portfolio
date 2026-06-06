import { motion, useInView } from 'motion/react';
import { useRef } from 'react';

const stats = [
  { value: '20+', label: 'Years of Experience' },
  { value: '$50M+', label: 'In Procurement Managed' },
  { value: '4×', label: 'Top Performer Awards' },
  { value: '100%+', label: 'Quota Attainment' },
];

function Stat({ value, label, index }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      className="about-stat"
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
    >
      <span className="about-stat-value">{value}</span>
      <span className="about-stat-label">{label}</span>
    </motion.div>
  );
}

export default function About() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  const lines = [
    "I didn't take the straight path — and that's exactly the point.",
    'I started on the floor of a UPS facility in 2004, loading trucks before the sun came up. Over the next decade I worked my way from package handler to operations manager, overseeing 30+ employees and running the numbers that kept a logistics network moving.',
    'That operational foundation became my superpower when I moved into procurement & leadership at a fast-growing solar company — managing nearly $50M in expenditures, compressing project timelines by 67%, and building a marketing department from scratch.',
    'Then came tech sales. At Cloudflare I found an environment that rewards the same skills I honed on those docks: urgency, precision, and the ability to earn trust fast. Today I sell enterprise security and networking to the companies building the next internet.',
    'The common thread? A relentless drive to understand complex systems and make them work better for the people inside them.',
  ];

  return (
    <section id="about" className="about">
      <div className="section-inner">
        <motion.p
          className="section-label"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          About
        </motion.p>

        <div className="about-top" ref={ref}>
          <motion.div
            className="about-headshot-wrap"
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <img src="/photos/photo4.jpg" alt="Burke Ruder" className="about-headshot" />
          </motion.div>

          <div className="about-intro">
            {lines.slice(0, 2).map((line, i) => (
              <motion.p
                key={i}
                className={i === 0 ? 'about-lead' : 'about-body'}
                initial={{ opacity: 0, y: 24 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7, delay: 0.1 + i * 0.13, ease: [0.22, 1, 0.36, 1] }}
              >
                {line}
              </motion.p>
            ))}
          </div>
        </div>

        <div className="about-grid">
          <div className="about-text">
            {lines.slice(2).map((line, i) => (
              <motion.p
                key={i}
                className="about-body"
                initial={{ opacity: 0, y: 24 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7, delay: 0.35 + i * 0.13, ease: [0.22, 1, 0.36, 1] }}
              >
                {line}
              </motion.p>
            ))}
          </div>

          <div className="about-stats">
            {stats.map((s, i) => (
              <Stat key={s.label} {...s} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
