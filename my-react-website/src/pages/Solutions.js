import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.7, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] },
  }),
};

const solutions = [
  { icon: '📡', title: 'Network & Voice', path: '/solutions/network-voice',
    desc: 'Enterprise connectivity and business voice from every major carrier. We compare fiber, broadband, MPLS, DIA, and SIP trunking across AT&T, Lumen, Comcast, Spectrum, and 50+ providers.',
    bullets: ['Dedicated Internet Access (DIA) & fiber','SIP trunking and hosted PBX','MPLS and private networking','Business broadband and failover','Carrier-grade voice (POTS replacement)'] },
  { icon: '💬', title: 'Unified Communications', path: '/solutions/unified-communications',
    desc: 'Modern messaging, video, and voice platforms replacing legacy phone systems. We match businesses with the right UCaaS platform for their size, workflow, and budget.',
    bullets: ['Cloud phone systems and softphones','Video conferencing and team messaging','Microsoft Teams voice integration','Zoom Phone, RingCentral, Dialpad, Vonage','Mobile-first communication workflows'] },
  { icon: '🎧', title: 'Contact Center', path: '/solutions/contact-center',
    desc: 'Cloud CCaaS platforms that transform customer experience. Omnichannel, AI-powered, and built to scale — from 10-seat teams to enterprise operations.',
    bullets: ['Omnichannel (voice, chat, email, SMS, social)','AI-powered IVR and virtual agents','Workforce management and analytics','Five9, Genesys, NICE CXone, Talkdesk','CRM integrations (Salesforce, HubSpot)'] },
  { icon: '🔒', title: 'Cybersecurity', path: '/solutions/cybersecurity',
    desc: 'Comprehensive security services tailored to your threat profile and compliance requirements. From SASE and ZTNA to MDR and email security.',
    bullets: ['SASE and Zero Trust (ZTNA)','Managed Detection & Response (MDR)','Email security and phishing protection','Endpoint detection and response (EDR)','Compliance (SOC 2, HIPAA, PCI)'] },
  { icon: '☁️', title: 'Cloud Computing', path: '/solutions/cloud-computing',
    desc: 'IaaS, PaaS, and managed cloud across public, private, and hybrid architectures. We design the right strategy and connect you with the right provider.',
    bullets: ['AWS, Microsoft Azure, Google Cloud','Hybrid and multi-cloud strategies','Cloud migration planning','Disaster recovery (DRaaS)','Colocation and data center services'] },
  { icon: '📱', title: 'Mobility & IoT & AI', path: '/solutions/mobility-iot-ai',
    desc: 'MDM, IoT connectivity, and AI automation tools that keep your distributed workforce and devices connected and secure.',
    bullets: ['Mobile Device Management (MDM/UEM)','IoT connectivity and fleet management','AI-powered workflow automation','Business cellular and wireless plans','Yellow.ai and conversational AI'] },
  { icon: '⚙️', title: 'Managed Services', path: '/solutions/managed-services',
    desc: 'Outsourced IT management so your team can focus on the business. From NOC and helpdesk to fully managed infrastructure.',
    bullets: ['Managed IT and helpdesk support','Network operations center (NOC)','Proactive monitoring','vCIO and strategic IT consulting','IT asset management'] },
  { icon: '🌐', title: 'SD-WAN', path: '/solutions/sd-wan',
    desc: 'Software-defined WAN delivering enterprise reliability, application performance, and cost savings across all locations.',
    bullets: ['Multi-carrier WAN optimization','Application-aware routing','Centralized policy management','Cloud-native SD-WAN','Secure SD-WAN / SASE integration'] },
];

export default function Solutions() {
  return (
    <div className="solutions-page">
      <section className="solutions-hero">
        <div className="container">
          <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
            <motion.div variants={fadeUp}><div className="label">Solutions</div></motion.div>
            <motion.h1 className="section-title" style={{ fontSize: 'clamp(3rem,6vw,5.5rem)', marginBottom: '1.25rem' }} variants={fadeUp}>
              Every Technology Category<br /><span>Your Business Needs</span>
            </motion.h1>
            <motion.p className="section-sub" variants={fadeUp}>
              200+ carriers and technology providers across 8 major categories — sourced, compared, and managed at no cost to you.
            </motion.p>
          </motion.div>
        </div>
      </section>

      <section className="solutions-list">
        <div className="container">
          {solutions.map((s, i) => (
            <motion.div
              key={s.path}
              className="solution-row"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="solution-row-meta">
                <div className="solution-row-num">0{i + 1}</div>
                <div className="solution-row-icon">{s.icon}</div>
                <h2 className="solution-row-title">{s.title}</h2>
                <p className="solution-row-desc">{s.desc}</p>
                <Link to={s.path} className="solution-row-link">Learn more →</Link>
              </div>
              <motion.div
                className="solution-row-bullets"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
              >
                {s.bullets.map((b) => (
                  <motion.div
                    key={b}
                    className="solution-row-bullet"
                    variants={{ hidden: { opacity: 0, x: 12 }, visible: { opacity: 1, x: 0, transition: { duration: 0.5 } } }}
                    whileHover={{ x: 4, transition: { duration: 0.15 } }}
                  >
                    <span className="bullet-check">✓</span>{b}
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="cta-band">
        <div className="cta-band-glow" />
        <div className="container" style={{ position: 'relative' }}>
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="label" style={{ justifyContent: 'center' }}>Not sure where to start?</div>
            <h2 className="section-title" style={{ textAlign: 'center', maxWidth: 600, margin: '0 auto 1rem' }}>
              We'll Help You Figure<br /><span>It Out — For Free</span>
            </h2>
            <p className="section-sub" style={{ textAlign: 'center', margin: '0 auto 2.5rem' }}>
              Schedule a free technology assessment and we'll map the right solutions from our 200+ vendor portfolio.
            </p>
            <div className="cta-actions">
              <Link to="/contact">
                <motion.span className="btn-primary" whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                  Get a Free Assessment →
                </motion.span>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
