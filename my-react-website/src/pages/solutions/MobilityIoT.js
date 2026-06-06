import { Link } from 'react-router-dom';

export default function MobilityIoT() {
  return (
    <div className="detail-page">
      <section className="detail-hero">
        <div className="container">
          <div className="label"><Link to="/solutions">← All Solutions</Link></div>
          <div className="detail-hero-icon">📱</div>
          <h1 className="detail-hero-h1">Mobility, IoT &amp; AI</h1>
          <p className="detail-hero-sub">
            Mobile device management, IoT connectivity platforms, and AI-driven automation tools that keep your workforce connected, your devices secure, and your business running smarter. Built for the modern, distributed enterprise.
          </p>
          <Link to="/contact" className="btn-primary">Get a Free Mobility Assessment →</Link>
        </div>
      </section>

      <section className="detail-body">
        <div className="container">
          <div className="detail-two-col">
            <div>
              <div className="label">What We Cover</div>
              <h2 className="section-title" style={{ marginBottom: '2rem' }}>Mobility, IoT &amp; AI Solutions</h2>
              <div className="detail-features">
                {[
                  { title: 'Mobile Device Management (MDM/UEM)', desc: 'Unified endpoint management for iOS, Android, Windows, and macOS. Enforce policies, deploy apps, and wipe devices remotely.' },
                  { title: 'Business Cellular & Wireless', desc: 'Competitive business wireless plans from major carriers. We negotiate rates and manage your mobile fleet across AT&T, Verizon, T-Mobile, and more.' },
                  { title: 'IoT Connectivity Platforms', desc: 'Connectivity management for IoT device fleets. SIM management, data pooling, and real-time device monitoring at scale.' },
                  { title: 'AI-Powered Automation', desc: 'Conversational AI, workflow automation, and intelligent process tools that reduce manual work and improve customer and employee experiences.' },
                  { title: 'Fleet & Asset Tracking', desc: 'GPS and IoT-based fleet management, asset tracking, and field service optimization for businesses with mobile assets.' },
                  { title: 'Fixed Wireless Access (FWA)', desc: 'High-speed wireless internet for locations where fiber isn\'t available. LTE and 5G-based solutions with enterprise-grade reliability.' },
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
                  {['Yellow.ai', 'Microsoft Intune', 'VMware Workspace ONE', 'Jamf', 'AT&T Business Wireless', 'Verizon Business', 'T-Mobile for Business', 'Aeris', 'KORE Wireless', 'Samsara'].map((v) => (
                    <div key={v} className="detail-vendor-item">{v}</div>
                  ))}
                </div>
                <div className="detail-cta-box">
                  <p>Tell us about your device fleet and we'll find the best management and connectivity options.</p>
                  <Link to="/contact" className="btn-primary" style={{ fontSize: '0.82rem', padding: '0.6rem 1.25rem' }}>
                    Get a Mobility Quote →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-band">
        <div className="container">
          <h2 className="section-title">Connect, Manage, and Automate</h2>
          <p className="section-sub">From mobile devices to IoT sensors to AI workflows — we help you build the connected infrastructure your business needs to stay competitive.</p>
          <div className="cta-actions">
            <Link to="/contact" className="btn-primary">Start a Free Assessment →</Link>
            <Link to="/solutions" className="btn-outline">View All Solutions</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
