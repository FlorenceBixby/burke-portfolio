import { Link } from 'react-router-dom';

const solutions = [
  {
    icon: '📡',
    title: 'Network & Voice',
    desc: 'Enterprise-grade connectivity and voice solutions from leading carriers. Fiber, broadband, MPLS, and SIP trunking.',
    path: '/solutions/network-voice',
  },
  {
    icon: '💬',
    title: 'Unified Communications',
    desc: 'Seamless messaging, video, and voice platforms. Microsoft Teams, Zoom, RingCentral, and more.',
    path: '/solutions/unified-communications',
  },
  {
    icon: '🎧',
    title: 'Contact Center',
    desc: 'Cloud-based CCaaS solutions that elevate customer experience. AI-powered, omnichannel, and scalable.',
    path: '/solutions/contact-center',
  },
  {
    icon: '🔒',
    title: 'Cybersecurity',
    desc: 'Comprehensive security services including SASE, ZTNA, MDR, and compliance-ready frameworks.',
    path: '/solutions/cybersecurity',
  },
  {
    icon: '☁️',
    title: 'Cloud Computing',
    desc: 'IaaS, PaaS, and hybrid cloud strategies. AWS, Azure, Google Cloud, and private cloud options.',
    path: '/solutions/cloud-computing',
  },
  {
    icon: '📱',
    title: 'Mobility & IoT & AI',
    desc: 'Mobile device management, IoT connectivity, and AI-driven automation to future-proof your operations.',
    path: '/solutions/mobility-iot-ai',
  },
  {
    icon: '⚙️',
    title: 'Managed Services',
    desc: 'Fully managed IT, NOC, and helpdesk services. Focus on your business while we manage the technology.',
    path: '/solutions/managed-services',
  },
  {
    icon: '🌐',
    title: 'SD-WAN',
    desc: 'Software-defined networking that delivers reliability, agility, and cost savings across all your locations.',
    path: '/solutions/sd-wan',
  },
];

const vendors = [
  'AT&T', 'Lumen', 'Comcast Business', 'Spectrum Enterprise', 'Verizon',
  'RingCentral', 'Zoom', 'Microsoft Teams', 'Dialpad', 'Vonage',
  'Five9', 'Genesys', 'NICE CXone', 'Talkdesk',
  'Palo Alto Networks', 'Crowdstrike', 'Fortinet', 'Zscaler',
  'AWS', 'Microsoft Azure', 'Google Cloud', 'Rackspace',
  'Airespring', 'Broadvoice', 'Ooma', 'Zultys',
  'Logically', 'Integris', 'Graphiant', 'Crown Castle',
];

const whyItems = [
  {
    icon: '🎯',
    title: 'Vendor-Neutral Advice',
    desc: 'We represent 200+ carriers and providers, so our recommendations are always based on what\'s best for your business — not what pays the highest commission.',
  },
  {
    icon: '💰',
    title: 'No Additional Cost',
    desc: 'Our advisory services are funded by the vendors, not you. You get expert guidance and ongoing support at no extra charge.',
  },
  {
    icon: '⚡',
    title: 'Faster Procurement',
    desc: 'Skip the months of vendor negotiations. We leverage our Sandler Partners network to get you competitive quotes quickly.',
  },
  {
    icon: '🔧',
    title: 'Ongoing Support',
    desc: 'We stay with you after the contract is signed — escalating issues, managing renewals, and identifying cost savings.',
  },
];

export default function Home() {
  const doubledVendors = [...vendors, ...vendors];

  return (
    <main>
      {/* Hero */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-grid-overlay" />
        <div className="hero-content container">
          <div className="hero-eyebrow">
            <span>●</span> Powered by Sandler Partners
          </div>
          <h1 className="hero-h1">
            Smarter Technology.<br />
            <span>Simpler Decisions.</span>
          </h1>
          <p className="hero-sub">
            The Interesting Group is your independent technology advisor — helping businesses find the right telecom, cloud, cybersecurity, and IT solutions from 200+ top vendors, at no additional cost.
          </p>
          <div className="hero-actions">
            <Link to="/contact" className="btn-primary">Get a Free Assessment →</Link>
            <Link to="/solutions" className="btn-outline">Explore Solutions</Link>
          </div>
          <div className="hero-stats">
            <div>
              <div className="hero-stat-num">200<span>+</span></div>
              <div className="hero-stat-label">Technology Vendors</div>
            </div>
            <div>
              <div className="hero-stat-num">8</div>
              <div className="hero-stat-label">Solution Categories</div>
            </div>
            <div>
              <div className="hero-stat-num">$0</div>
              <div className="hero-stat-label">Advisory Cost to You</div>
            </div>
            <div>
              <div className="hero-stat-num">1</div>
              <div className="hero-stat-label">Trusted Partner</div>
            </div>
          </div>
        </div>
      </section>

      {/* Solutions Grid */}
      <section className="solutions-section">
        <div className="container">
          <div className="label">What We Offer</div>
          <h2 className="section-title">
            Every Technology Category<br />
            <span>Your Business Needs</span>
          </h2>
          <p className="section-sub">
            From connectivity to cloud to cybersecurity — we source and manage best-fit solutions across every major technology category.
          </p>
          <div className="solutions-grid">
            {solutions.map((s) => (
              <Link key={s.path} to={s.path} className="solution-card">
                <div className="solution-card-icon">{s.icon}</div>
                <div className="solution-card-title">{s.title}</div>
                <div className="solution-card-desc">{s.desc}</div>
                <div className="solution-card-link">Learn more →</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why Us */}
      <section className="why-section">
        <div className="container">
          <div className="why-grid">
            <div className="why-left">
              <div className="label">Why The Interesting Group</div>
              <h2 className="section-title">
                The Smarter Way to<br />
                <span>Buy Technology</span>
              </h2>
              <p className="section-sub">
                Most businesses overpay for technology because navigating hundreds of vendors is complex and time-consuming. We fix that.
              </p>
              <div style={{ marginTop: '2rem' }}>
                <Link to="/about" className="btn-outline">Learn About Our Approach →</Link>
              </div>
            </div>
            <div className="why-right">
              {whyItems.map((w) => (
                <div key={w.title} className="why-item">
                  <div className="why-item-icon">{w.icon}</div>
                  <div>
                    <div className="why-item-title">{w.title}</div>
                    <div className="why-item-desc">{w.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Vendor Marquee */}
      <section className="vendors-section">
        <div className="container">
          <div className="label">Our Vendor Network</div>
          <h2 className="section-title">200+ Carriers &amp; Providers</h2>
          <p className="section-sub">
            Through our partnership with Sandler Partners, we have access to every major technology vendor — giving you unbiased comparisons and competitive pricing.
          </p>
        </div>
        <div className="vendors-marquee-wrap" style={{ marginTop: '2.5rem' }}>
          <div className="vendors-marquee">
            {doubledVendors.map((v, i) => (
              <div key={i} className="vendor-chip">{v}</div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Band */}
      <section className="cta-band">
        <div className="container">
          <div className="label">Ready to Start?</div>
          <h2 className="section-title">
            Let's Find the Right Technology<br />
            <span>for Your Business</span>
          </h2>
          <p className="section-sub">
            Schedule a free technology assessment. We'll review your current environment, identify savings opportunities, and present the best options across our 200+ vendor network.
          </p>
          <div className="cta-actions">
            <Link to="/contact" className="btn-primary">Schedule a Free Assessment →</Link>
            <Link to="/solutions" className="btn-outline">Browse Solutions</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
