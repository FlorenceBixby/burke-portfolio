import { Link } from 'react-router-dom';

export default function ManagedServices() {
  return (
    <div className="detail-page">
      <section className="detail-hero">
        <div className="container">
          <div className="label"><Link to="/solutions">← All Solutions</Link></div>
          <div className="detail-hero-icon">⚙️</div>
          <h1 className="detail-hero-h1">Managed Services</h1>
          <p className="detail-hero-sub">
            Outsourced IT management so your team can focus on the business. From helpdesk and NOC to fully managed infrastructure — we find the right Managed Service Provider for your size, industry, and budget.
          </p>
          <Link to="/contact" className="btn-primary">Get a Free MSP Assessment →</Link>
        </div>
      </section>

      <section className="detail-body">
        <div className="container">
          <div className="detail-two-col">
            <div>
              <div className="label">What We Cover</div>
              <h2 className="section-title" style={{ marginBottom: '2rem' }}>Managed Services Offerings</h2>
              <div className="detail-features">
                {[
                  { title: 'Managed IT & Helpdesk', desc: 'Day-to-day IT support for your users — password resets, device issues, software problems — handled by a dedicated managed support team.' },
                  { title: 'Network Operations Center (NOC)', desc: '24/7 proactive monitoring, management, and remediation of your network infrastructure. Issues resolved before users feel the impact.' },
                  { title: 'Managed Security Services (MSSP)', desc: 'Security operations as a managed service. Threat monitoring, incident response, vulnerability management, and compliance reporting.' },
                  { title: 'vCIO & Strategic IT Consulting', desc: 'A virtual CIO to align your technology roadmap with business goals. Annual planning, vendor management, and board-level reporting.' },
                  { title: 'Managed Backup & Disaster Recovery', desc: 'Proactively managed backup jobs, regular recovery tests, and documented runbooks. Know your data is protected.' },
                  { title: 'IT Asset Management', desc: 'Hardware and software lifecycle management. Procurement, deployment, tracking, refresh planning, and responsible disposal.' },
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
                  {['Logically', 'Integris', 'Ntiva', 'Connectwise', 'Kaseya', 'Datto', 'Barracuda', 'Nerdio', 'Atera', 'N-able'].map((v) => (
                    <div key={v} className="detail-vendor-item">{v}</div>
                  ))}
                </div>
                <div className="detail-cta-box">
                  <p>We'll match your headcount, industry, and IT complexity to the right MSP partner.</p>
                  <Link to="/contact" className="btn-primary" style={{ fontSize: '0.82rem', padding: '0.6rem 1.25rem' }}>
                    Find Your MSP →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-band">
        <div className="container">
          <h2 className="section-title">Stop Managing IT. Start Growing.</h2>
          <p className="section-sub">The right managed services partner frees your team to focus on strategic work, not troubleshooting printers. Let us find yours.</p>
          <div className="cta-actions">
            <Link to="/contact" className="btn-primary">Start a Free Assessment →</Link>
            <Link to="/solutions" className="btn-outline">View All Solutions</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
