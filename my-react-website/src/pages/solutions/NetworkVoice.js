import { Link } from 'react-router-dom';

export default function NetworkVoice() {
  return (
    <div className="detail-page">
      <section className="detail-hero">
        <div className="container">
          <div className="label"><Link to="/solutions">← All Solutions</Link></div>
          <div className="detail-hero-icon">📡</div>
          <h1 className="detail-hero-h1">Network &amp; Voice</h1>
          <p className="detail-hero-sub">
            Enterprise-grade connectivity and business voice solutions from every major carrier. We compare and source fiber, broadband, MPLS, dedicated internet, and SIP trunking across AT&T, Lumen, Comcast Business, Spectrum Enterprise, and 50+ providers — getting you the best performance at the best price.
          </p>
          <Link to="/contact" className="btn-primary">Get a Free Network Assessment →</Link>
        </div>
      </section>

      <section className="detail-body">
        <div className="container">
          <div className="detail-two-col">
            <div>
              <div className="label">What We Cover</div>
              <h2 className="section-title" style={{ marginBottom: '2rem' }}>Network &amp; Voice Solutions</h2>
              <div className="detail-features">
                {[
                  { title: 'Dedicated Internet Access (DIA)', desc: 'Symmetrical, business-grade fiber internet with SLAs, guaranteed uptime, and priority support. Available from every major provider in your area.' },
                  { title: 'SIP Trunking', desc: 'Replace your legacy PSTN lines with cloud-based SIP trunks. Lower cost, higher capacity, and built-in redundancy.' },
                  { title: 'Hosted PBX & Cloud Voice', desc: 'Fully managed cloud phone systems that eliminate on-premise hardware. Scale seats up or down as your business changes.' },
                  { title: 'MPLS & Private WAN', desc: 'Secure, private network connections between your offices with guaranteed QoS for voice and critical applications.' },
                  { title: 'Business Broadband & Failover', desc: 'Primary and backup internet solutions to ensure your business stays connected even when one circuit goes down.' },
                  { title: 'POTS Replacement', desc: 'Migrate analog copper lines to modern digital alternatives before the telecom industry\'s POTS sunset deadline.' },
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
                  {['AT&T', 'Lumen / CenturyLink', 'Comcast Business', 'Spectrum Enterprise', 'Verizon Business', 'Cox Business', 'Windstream', 'Consolidated Communications', 'Airespring', 'Zayo', 'Crown Castle'].map((v) => (
                    <div key={v} className="detail-vendor-item">{v}</div>
                  ))}
                </div>
                <div className="detail-cta-box">
                  <p>Not sure which carrier is right for your location? We'll run a free availability check and quote comparison.</p>
                  <Link to="/contact" className="btn-primary" style={{ fontSize: '0.82rem', padding: '0.6rem 1.25rem' }}>
                    Get Quotes →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-band">
        <div className="container">
          <h2 className="section-title">Ready to Optimize Your Connectivity?</h2>
          <p className="section-sub">We'll compare every carrier serving your locations and deliver a side-by-side quote in days, not months.</p>
          <div className="cta-actions">
            <Link to="/contact" className="btn-primary">Start a Free Assessment →</Link>
            <Link to="/solutions" className="btn-outline">View All Solutions</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
