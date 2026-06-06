import { Link } from 'react-router-dom';

export default function ContactCenter() {
  return (
    <div className="detail-page">
      <section className="detail-hero">
        <div className="container">
          <div className="label"><Link to="/solutions">← All Solutions</Link></div>
          <div className="detail-hero-icon">🎧</div>
          <h1 className="detail-hero-h1">Contact Center as a Service</h1>
          <p className="detail-hero-sub">
            Transform your customer experience with cloud contact center platforms that are omnichannel, AI-powered, and built to scale. Whether you run a 10-seat team or a 1,000-agent operation, we'll find the right CCaaS solution.
          </p>
          <Link to="/contact" className="btn-primary">Get a Free CCaaS Assessment →</Link>
        </div>
      </section>

      <section className="detail-body">
        <div className="container">
          <div className="detail-two-col">
            <div>
              <div className="label">What We Cover</div>
              <h2 className="section-title" style={{ marginBottom: '2rem' }}>Contact Center Capabilities</h2>
              <div className="detail-features">
                {[
                  { title: 'Omnichannel Routing', desc: 'Handle voice, email, live chat, SMS, social media, and messaging apps through a single unified agent desktop.' },
                  { title: 'AI-Powered IVR & Virtual Agents', desc: 'Conversational AI that resolves common issues without an agent, reducing handle time and improving CSAT.' },
                  { title: 'Workforce Management (WFM)', desc: 'Scheduling, forecasting, and real-time adherence tools that optimize staffing and reduce labor costs.' },
                  { title: 'Real-Time & Historical Analytics', desc: 'Dashboards and reports that surface key KPIs — AHT, CSAT, FCR — and drive continuous improvement.' },
                  { title: 'CRM Integration', desc: 'Native connectors for Salesforce, HubSpot, Microsoft Dynamics, ServiceNow, and Zendesk.' },
                  { title: 'Quality Management & Coaching', desc: 'Call recording, screen capture, and AI-driven quality scoring to develop your agents faster.' },
                ].map((f) => (
                  <div key={f.title} className="detail-feature">
                    <div className="detail-feature-title"><span>✓</span> {f.title}</div>
                    <div className="detail-feature-desc">{f.desc}</div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="detail-vendors-box">
                <div className="detail-vendors-box-title">Featured Vendors</div>
                <div className="detail-vendor-list">
                  {['Five9', 'Genesys Cloud', 'NICE CXone', 'Talkdesk', 'Dialpad Contact Center', 'RingCentral Contact Center', 'Vonage Contact Center', 'Zoom Contact Center', 'Yellow.ai', 'Alorica'].map((v) => (
                    <div key={v} className="detail-vendor-item">{v}</div>
                  ))}
                </div>
                <div className="detail-cta-box">
                  <p>Tell us your agent count and top 3 requirements — we'll narrow to the best-fit platforms.</p>
                  <Link to="/contact" className="btn-primary" style={{ fontSize: '0.82rem', padding: '0.6rem 1.25rem' }}>
                    Compare CCaaS →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-band">
        <div className="container">
          <h2 className="section-title">Elevate Your Customer Experience</h2>
          <p className="section-sub">Move your contact center to the cloud and give your agents the tools they need to deliver exceptional service at scale.</p>
          <div className="cta-actions">
            <Link to="/contact" className="btn-primary">Start a Free Assessment →</Link>
            <Link to="/solutions" className="btn-outline">View All Solutions</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
