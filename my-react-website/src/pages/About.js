import { useRef } from 'react';
import { motion, useInView } from 'motion/react';

const experience = [
  {
    years: '2023 – Present',
    role: 'Senior Account Executive',
    company: 'Cloudflare',
    color: '#F6821F',
    bullets: [
      '100%+ quota attainment consistently',
      '4× Top Performer',
      'Top regional performer in enterprise segment',
    ],
  },
  {
    years: '2022 – 2023',
    role: 'Account Executive',
    company: 'Cloudflare',
    color: '#F6821F',
    bullets: [
      'Closed complex enterprise deals across networking & security',
      'Built and expanded strategic accounts',
    ],
  },
  {
    years: '2021 – 2022',
    role: 'Channel Account Executive / BDR',
    company: 'Cloudflare',
    color: '#F6821F',
    bullets: [
      'Launched partner channel relationships',
      'Consistently exceeded pipeline targets',
    ],
  },
  {
    years: '2020 – 2021',
    role: 'Account Executive',
    company: 'Paycor',
    color: '#4a7c59',
    bullets: [
      'Sold HCM solutions to mid-market companies',
      'Top new business performer in territory',
    ],
  },
  {
    years: '2019 – 2020',
    role: 'Account Executive',
    company: 'Vercara',
    color: '#4a7c59',
    bullets: [
      'Enterprise DNS & cybersecurity solutions',
      'Managed complex multi-stakeholder sales cycles',
    ],
  },
  {
    years: '2016 – 2019',
    role: 'Director of Procurement',
    company: 'Lighthouse Solar',
    color: '#e8c84a',
    bullets: [
      'Managed $50M+ in annual materials procurement',
      'Built supplier network from the ground up',
      'Scaled operations through rapid company growth',
    ],
  },
  {
    years: '2004 – 2016',
    role: 'Pre-loader → Operations Supervisor',
    company: 'UPS',
    color: '#8B6914',
    bullets: [
      'Started loading package cars at 3am',
      'Progressed through every operational role in the building',
      'Managed teams, logistics, and time-critical operations',
    ],
  },
];

function ExpCard({ item, index }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
      style={{
        borderLeft: `2px solid ${item.color}`,
        paddingLeft: '1.5rem',
        paddingBottom: '2.5rem',
      }}
    >
      <div style={{ fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
        {item.years}
      </div>
      <div style={{ fontFamily: 'var(--serif)', fontSize: '1.15rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.2rem' }}>
        {item.role}
      </div>
      <div style={{ fontSize: '0.78rem', letterSpacing: '0.06em', color: item.color, marginBottom: '0.75rem', textTransform: 'uppercase', fontWeight: 500 }}>
        {item.company}
      </div>
      <ul style={{ paddingLeft: '1rem' }}>
        {item.bullets.map((b, i) => (
          <li key={i} style={{ fontSize: '0.88rem', lineHeight: 1.75, color: 'var(--text-muted)', fontWeight: 300, marginBottom: '0.15rem' }}>
            {b}
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

export default function About() {
  return (
    <div style={{ background: 'var(--bg)', paddingTop: 64, minHeight: '100vh' }}>

      {/* Hero */}
      <div style={{ position: 'relative', height: '55vh', overflow: 'hidden', background: '#000' }}>
        <img
          src={`${process.env.PUBLIC_URL}/photos/photo4.jpg`}
          alt="Burke Ruder"
          style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.45, display: 'block' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 30%, rgba(10,13,11,0.95) 100%)' }} />
        <div style={{ position: 'absolute', bottom: '3rem', left: '5vw' }}>
          <motion.p
            style={{ fontSize: '0.7rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '0.75rem' }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            About
          </motion.p>
          <motion.h1
            style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(2.5rem, 6vw, 5rem)', fontWeight: 900, color: 'var(--text)', letterSpacing: '-0.02em', lineHeight: 1 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            Burke Ruder
          </motion.h1>
          <motion.p
            style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 300 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            Senior Account Executive · Cloudflare · Austin, TX
          </motion.p>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', borderBottom: '1px solid var(--border)' }}>
        {[
          { num: '20+', label: 'Years experience' },
          { num: '$50M+', label: 'Procurement managed' },
          { num: '4×', label: "Top Performer" },
          { num: '100%+', label: 'Quota attainment' },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            style={{ padding: '2.5rem 2rem', borderRight: i < 3 ? '1px solid var(--border)' : 'none' }}
          >
            <div style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 900, lineHeight: 1, marginBottom: '0.4rem' }}>
              <span style={{ color: 'var(--accent)' }}>{s.num}</span>
            </div>
            <div style={{ fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              {s.label}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Bio + Experience */}
      <div style={{ padding: '6rem 5vw', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5rem', alignItems: 'start' }}>

          {/* Bio */}
          <div>
            <motion.p
              style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            >
              <span style={{ display: 'block', width: 28, height: 1, background: 'var(--accent)' }} />
              Background
            </motion.p>
            <motion.h2
              style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', fontWeight: 700, lineHeight: 1.2, letterSpacing: '-0.02em', color: 'var(--text)', marginBottom: '2rem' }}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              Curious by nature.<br />Built by experience.
            </motion.h2>
            {[
              "I started my career loading package cars at UPS at 3am. No plan, just work. Over the next twelve years I touched every part of that operation — logistics, management, team-building, problem-solving under pressure. It was the best business school I could have attended.",
              "When the solar industry started to boom, I made a move into procurement. I spent several years at Lighthouse Solar building supplier relationships and managing $50M+ in materials. That chapter taught me how to think in systems, manage complexity, and make big decisions with incomplete information.",
              "Then I bet on myself again. I joined Cloudflare — one of the fastest-growing infrastructure companies in the world — as a BDR. Within a couple of years I was a Senior AE. I've hit 100%+ quota every year, earned 4× Top Performer recognition, and I'm still learning something new every week.",
              "Outside of work I'm a photographer. I shoot street and urban scenes around Austin — always looking for the light, the moment, the thing you weren't supposed to see. Same instinct, different medium.",
            ].map((para, i) => (
              <motion.p
                key={i}
                style={{ fontSize: '0.93rem', lineHeight: 1.9, color: 'var(--text-muted)', fontWeight: 300, marginBottom: '1.25rem' }}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                {para}
              </motion.p>
            ))}
          </div>

          {/* Experience */}
          <div>
            <motion.p
              style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            >
              <span style={{ display: 'block', width: 28, height: 1, background: 'var(--accent)' }} />
              Experience
            </motion.p>
            {experience.map((item, i) => (
              <ExpCard key={item.years + item.company} item={item} index={i} />
            ))}
          </div>
        </div>
      </div>

      {/* Contact strip */}
      <div style={{ borderTop: '1px solid var(--border)', padding: '4rem 5vw', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div>
          <p style={{ fontSize: '0.7rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Get in touch</p>
          <a href="mailto:burke.ruder@gmail.com" style={{ fontFamily: 'var(--serif)', fontSize: '1.4rem', fontWeight: 700, color: 'var(--text)', borderBottom: '1px solid var(--accent)', paddingBottom: 2 }}>
            burke.ruder@gmail.com
          </a>
        </div>
        <a href="https://www.linkedin.com/in/burke-ruder/" target="_blank" rel="noopener noreferrer"
          style={{ fontSize: '0.78rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', borderBottom: '1px solid var(--border)', paddingBottom: 2 }}>
          View LinkedIn →
        </a>
      </div>
    </div>
  );
}
