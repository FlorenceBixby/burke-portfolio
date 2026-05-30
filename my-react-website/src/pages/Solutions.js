import { Link } from 'react-router-dom';

const solutions = [
  {
    icon: '📡',
    title: 'Network & Voice',
    path: '/solutions/network-voice',
    desc: 'Enterprise connectivity and business voice solutions from every major carrier. We compare fiber, broadband, MPLS, dedicated internet, and SIP trunking across AT&T, Lumen, Comcast, Spectrum, and 50+ providers.',
    bullets: [
      'Dedicated Internet Access (DIA) & fiber connectivity',
      'SIP trunking and hosted PBX',
      'MPLS and private networking',
      'Business broadband and failover',
      'Carrier-grade voice (POTS replacement)',
    ],
  },
  {
    icon: '💬',
    title: 'Unified Communications as a Service (UCaaS)',
    path: '/solutions/unified-communications',
    desc: 'Modern messaging, video, and voice collaboration platforms that replace legacy phone systems. We match businesses with the right UCaaS platform for their size, workflow, and budget.',
    bullets: [
      'Cloud phone systems and softphones',
      'Video conferencing and team messaging',
      'Microsoft Teams voice integration',
      'Zoom Phone, RingCentral, Dialpad, Vonage',
      'Mobile-first communication workflows',
    ],
  },
  {
    icon: '🎧',
    title: 'Contact Center as a Service (CCaaS)',
    path: '/solutions/contact-center',
    desc: 'Cloud contact center platforms that transform customer experience. Omnichannel, AI-powered, and built to scale — from 10-seat teams to enterprise operations.',
    bullets: [
      'Omnichannel (voice, chat, email, SMS, social)',
      'AI-powered IVR and virtual agents',
      'Workforce management and analytics',
      'Five9, Genesys, NICE CXone, Talkdesk',
      'CRM integrations (Salesforce, HubSpot, etc.)',
    ],
  },
  {
    icon: '🔒',
    title: 'Cybersecurity',
    path: '/solutions/cybersecurity',
    desc: 'Comprehensive security services tailored to your threat profile and compliance requirements. From SASE and ZTNA to MDR and email security — we source from the top vendors.',
    bullets: [
      'SASE and Zero Trust Network Access (ZTNA)',
      'Managed Detection and Response (MDR)',
      'Email security and phishing protection',
      'Endpoint protection and EDR',
      'Compliance frameworks (SOC 2, HIPAA, PCI)',
    ],
  },
  {
    icon: '☁️',
    title: 'Cloud Computing',
    path: '/solutions/cloud-computing',
    desc: 'IaaS, PaaS, and managed cloud services across public, private, and hybrid architectures. We help you design the right cloud strategy and connect you with the right provider.',
    bullets: [
      'AWS, Microsoft Azure, Google Cloud',
      'Hybrid and multi-cloud strategies',
      'Cloud migration planning and execution',
      'Disaster recovery and backup (DRaaS)',
      'Colocation and data center services',
    ],
  },
  {
    icon: '📱',
    title: 'Mobility & IoT & AI',
    path: '/solutions/mobility-iot-ai',
    desc: 'Mobile device management, IoT connectivity platforms, and AI automation tools that keep your distributed workforce and devices connected and secure.',
    bullets: [
      'Mobile Device Management (MDM/UEM)',
      'IoT connectivity and fleet management',
      'AI-powered workflow automation',
      'Business cellular and wireless plans',
      'Yellow.ai and conversational AI platforms',
    ],
  },
  {
    icon: '⚙️',
    title: 'Managed Services',
    path: '/solutions/managed-services',
    desc: 'Outsourced IT management so your team can focus on the business. From NOC and helpdesk to fully managed infrastructure — we find the right MSP for your environment.',
    bullets: [
      'Managed IT and helpdesk support',
      'Network operations center (NOC)',
      'Proactive monitoring and maintenance',
      'vCIO and strategic IT consulting',
      'IT asset management',
    ],
  },
  {
    icon: '🌐',
    title: 'SD-WAN',
    path: '/solutions/sd-wan',
    desc: 'Software-defined wide area networking that delivers enterprise reliability, application performance, and cost savings across all your locations — in the cloud or on-premise.',
    bullets: [
      'Multi-carrier WAN optimization',
      'Application-aware traffic routing',
      'Centralized policy management',
      'Cloud-native SD-WAN (Graphiant, Meraki, etc.)',
      'Integrated security (Secure SD-WAN)',
    ],
  },
];

export default function Solutions() {
  return (
    <div className="solutions-page">
      <section className="solutions-hero">
        <div className="container">
          <div className="label">Solutions</div>
          <h1 className="section-title" style={{ marginBottom: '1rem' }}>
            Every Technology Category<br /><span>Your Business Needs</span>
          </h1>
          <p className="section-sub">
            Through our partnership with Sandler Partners, we represent 200+ carriers and technology providers across 8 major solution categories. We compare, source, and manage it all — at no cost to you.
          </p>
        </div>
      </section>

      <section className="solutions-list">
        <div className="container">
          {solutions.map((s) => (
            <div key={s.path} className="solution-row">
              <div className="solution-row-meta">
                <div className="solution-row-icon">{s.icon}</div>
                <h2 className="solution-row-title">{s.title}</h2>
                <p className="solution-row-desc">{s.desc}</p>
                <Link to={s.path} className="solution-row-link">
                  Learn more about {s.title} →
                </Link>
              </div>
              <div className="solution-row-bullets">
                {s.bullets.map((b) => (
                  <div key={b} className="solution-row-bullet">
                    <span className="bullet-check">✓</span>
                    {b}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="cta-band">
        <div className="container">
          <div className="label">Not Sure Where to Start?</div>
          <h2 className="section-title">
            We'll Help You Figure<br /><span>It Out — For Free</span>
          </h2>
          <p className="section-sub">
            Schedule a free technology assessment and we'll review your environment, identify gaps, and map the right solutions from our 200+ vendor portfolio.
          </p>
          <div className="cta-actions">
            <Link to="/contact" className="btn-primary">Get a Free Assessment →</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
