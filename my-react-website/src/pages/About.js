import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.7, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] },
  }),
};

const values = [
  { icon: '🔍', title: 'Transparency First',      desc: 'We always tell you what we know, what we don\'t, and why we\'re recommending what we are.' },
  { icon: '🤝', title: 'Long-Term Relationships',  desc: 'We\'re not transactional. We build partnerships that last the lifetime of your technology agreements.' },
  { icon: '⚖️', title: 'Vendor Neutral',           desc: 'We work with 200+ vendors so we can always match the right solution to your specific needs.' },
  { icon: '🚀', title: 'Speed & Efficiency',       desc: 'Our process cuts months of RFP cycles down to days, without sacrificing diligence.' },
  { icon: '🛡️', title: 'Accountability',           desc: 'We stay engaged after contracts are signed — managing escalations, renewals, and optimization.' },
  { icon: '💡', title: 'Strategic Thinking',       desc: 'We bring a 20+ year enterprise technology perspective to every engagement.' },
];

export default function About() {
  return (
    <div className="about-page">

      {/* Hero */}
      <section className="about-hero-section">
        <div className="container">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          >
            <motion.div variants={fadeUp}><div className="label">About Us</div></motion.div>
            <motion.h1 className="about-hero-h1" variants={fadeUp}>
              We're Technology Advisors<br />Who Work for You
            </motion.h1>
            <motion.p className="about-hero-sub" variants={fadeUp}>
              The Interesting Group is an independent technology solutions advisory firm based in Austin, TX. We help businesses navigate the complex landscape of telecom, cloud, cybersecurity, and IT services — at no cost to you.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Mission */}
      <section className="about-mission">
        <div className="container">
          <div className="about-mission-grid">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="label">Our Mission</div>
              <blockquote className="about-mission-quote">
                "Technology should accelerate your business, not distract from it. Our job is to make sure you're always running on the right infrastructure — at the right price."
              </blockquote>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              {[
                'Most businesses end up with the wrong technology because the process of evaluating vendors is slow, opaque, and tilted in the vendors\' favor.',
                'The Interesting Group exists to level the playing field. As an independent advisor, we bring deep market knowledge, vendor relationships, and a structured evaluation process to every engagement.',
                'Because our compensation comes from the vendors — not you — our interests are fully aligned with getting you the best outcome.',
              ].map((p, i) => (
                <motion.p
                  key={i}
                  className="about-mission-body"
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                >{p}</motion.p>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="about-values">
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={fadeUp}
          >
            <div className="label">Our Values</div>
            <h2 className="section-title">What Guides<br /><span>Everything We Do</span></h2>
          </motion.div>
          <motion.div
            className="about-values-grid"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
          >
            {values.map((v, i) => (
              <motion.div
                key={v.title}
                className="about-value-card"
                variants={fadeUp}
                custom={i}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
              >
                <div className="about-value-num">0{i + 1}</div>
                <div className="about-value-icon">{v.icon}</div>
                <div className="about-value-title">{v.title}</div>
                <div className="about-value-desc">{v.desc}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Sandler */}
      <section className="about-sandler">
        <div className="container">
          <div className="about-sandler-inner">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="label">Our Partnership</div>
              <h2 className="section-title">Powered by<br /><span>Sandler Partners</span></h2>
              {[
                'The Interesting Group operates under a partnership agreement with Sandler Partners — one of the largest technology advisory organizations in the United States.',
                'This gives us access to every major carrier, cloud provider, and technology vendor, backed by proven procurement infrastructure and supplier relationships.',
                'What this means for you: the reach of a national advisory firm with the attention of a dedicated local partner.',
              ].map((p, i) => (
                <motion.p
                  key={i}
                  className="about-mission-body"
                  style={{ marginTop: i === 0 ? '1.5rem' : 0 }}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 + 0.2, duration: 0.6 }}
                >{p}</motion.p>
              ))}
              <motion.div
                style={{ marginTop: '2rem' }}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
              >
                <Link to="/contact">
                  <motion.span className="btn-primary" whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                    Work With Us →
                  </motion.span>
                </Link>
              </motion.div>
            </motion.div>
            <motion.div
              className="about-sandler-stat-grid"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
            >
              {[
                { num: '200+', label: 'Technology Vendors' },
                { num: '8',    label: 'Solution Categories' },
                { num: '#1',   label: 'Master Agent in US' },
                { num: '$0',   label: 'Cost to You' },
              ].map((s) => (
                <motion.div
                  key={s.label}
                  className="about-sandler-stat"
                  variants={{ hidden: { opacity: 0, scale: 0.92 }, visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.16,1,0.3,1] } } }}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                >
                  <div className="about-sandler-stat-num">{s.num}</div>
                  <div className="about-sandler-stat-label">{s.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-band">
        <div className="cta-band-glow" />
        <div className="container" style={{ position: 'relative' }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="label" style={{ justifyContent: 'center' }}>Let's Talk</div>
            <h2 className="section-title" style={{ textAlign: 'center', maxWidth: 560, margin: '0 auto 1rem' }}>
              Ready to Simplify Your<br /><span>Technology Stack?</span>
            </h2>
            <p className="section-sub" style={{ textAlign: 'center', margin: '0 auto 3rem' }}>
              Free 30-minute technology assessment. No sales pressure — just an honest conversation about your environment and your options.
            </p>
            <div className="cta-actions">
              <Link to="/contact">
                <motion.span className="btn-primary" whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                  Schedule a Free Assessment →
                </motion.span>
              </Link>
              <Link to="/solutions">
                <motion.span className="btn-outline" whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                  View All Solutions
                </motion.span>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
