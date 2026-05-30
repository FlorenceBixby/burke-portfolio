import { Link } from 'react-router-dom';

const values = [
  {
    icon: '🔍',
    title: 'Transparency First',
    desc: 'We always tell you exactly what we know, what we don\'t, and why we\'re recommending what we are.',
  },
  {
    icon: '🤝',
    title: 'Long-Term Relationships',
    desc: 'We\'re not transactional. We build partnerships that last the lifetime of your technology agreements.',
  },
  {
    icon: '⚖️',
    title: 'Vendor Neutral',
    desc: 'We work with 200+ vendors so we can always match the right solution to your specific needs.',
  },
  {
    icon: '🚀',
    title: 'Speed & Efficiency',
    desc: 'Our process cuts months of RFP cycles down to days, without sacrificing diligence.',
  },
  {
    icon: '🛡️',
    title: 'Accountability',
    desc: 'After contracts are signed, we stay engaged — managing escalations, renewals, and ongoing optimization.',
  },
  {
    icon: '💡',
    title: 'Strategic Thinking',
    desc: 'We bring a 20+ year enterprise technology perspective to every engagement.',
  },
];

export default function About() {
  return (
    <div className="about-page">
      <section className="about-hero-section">
        <div className="container">
          <div className="label">About Us</div>
          <h1 className="about-hero-h1">
            We're Technology Advisors<br />Who Work for You
          </h1>
          <p className="about-hero-sub">
            The Interesting Group is an independent technology solutions advisory firm based in Austin, TX. We help businesses of all sizes navigate the complex landscape of telecom, cloud, cybersecurity, and IT services — and we do it at no cost to you.
          </p>
        </div>
      </section>

      <section className="about-mission">
        <div className="container">
          <div className="about-mission-grid">
            <div>
              <div className="label">Our Mission</div>
              <blockquote className="about-mission-quote">
                "Technology should accelerate your business, not distract from it. Our job is to make sure you're always running on the right infrastructure — at the right price."
              </blockquote>
            </div>
            <div>
              <p className="about-mission-body">
                Most businesses end up with the wrong technology because the process of evaluating vendors is slow, opaque, and tilted in the vendors' favor. Salespeople push their own products. IT teams are stretched thin. Decision-makers don't have time to become telecom experts.
              </p>
              <p className="about-mission-body">
                The Interesting Group exists to level the playing field. As an independent advisor, we bring deep market knowledge, vendor relationships, and a structured evaluation process to every engagement. We help you understand your options, negotiate favorable terms, and make confident decisions.
              </p>
              <p className="about-mission-body">
                And because our compensation comes from the vendors — not you — our interests are fully aligned with getting you the best outcome.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="about-values">
        <div className="container">
          <div className="label">Our Values</div>
          <h2 className="section-title">What Guides Everything We Do</h2>
          <div className="about-values-grid">
            {values.map((v) => (
              <div key={v.title} className="about-value-card">
                <div className="about-value-icon">{v.icon}</div>
                <div className="about-value-title">{v.title}</div>
                <div className="about-value-desc">{v.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="about-sandler">
        <div className="container">
          <div className="about-sandler-inner">
            <div>
              <div className="label">Our Partnership</div>
              <h2 className="section-title">Powered by<br /><span>Sandler Partners</span></h2>
              <p className="about-mission-body" style={{ marginTop: '1rem' }}>
                The Interesting Group operates under a partnership agreement with Sandler Partners — one of the largest and most respected technology advisory organizations in the United States.
              </p>
              <p className="about-mission-body">
                This partnership gives us access to every major carrier, cloud provider, and technology vendor in the market, backed by Sandler's proven procurement infrastructure, contract expertise, and supplier relationships.
              </p>
              <p className="about-mission-body">
                What this means for you: you get the reach and leverage of a national advisory firm, with the personalized attention of a dedicated local partner.
              </p>
              <div style={{ marginTop: '1.75rem' }}>
                <Link to="/contact" className="btn-primary">Work With Us →</Link>
              </div>
            </div>
            <div>
              <div className="about-sandler-stat-grid">
                {[
                  { num: '200+', label: 'Technology Vendors' },
                  { num: '8', label: 'Solution Categories' },
                  { num: '#1', label: 'Master Agent in the US' },
                  { num: '$0', label: 'Cost to You' },
                ].map((s) => (
                  <div key={s.label} className="about-sandler-stat">
                    <div className="about-sandler-stat-num">{s.num}</div>
                    <div className="about-sandler-stat-label">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-band">
        <div className="container">
          <div className="label">Let's Talk</div>
          <h2 className="section-title">Ready to Simplify Your<br /><span>Technology Stack?</span></h2>
          <p className="section-sub">
            Schedule a free 30-minute technology assessment. No sales pressure — just an honest conversation about your environment and what options exist.
          </p>
          <div className="cta-actions">
            <Link to="/contact" className="btn-primary">Schedule a Free Assessment →</Link>
            <Link to="/solutions" className="btn-outline">View All Solutions</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
