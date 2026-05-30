import { Link } from 'react-router-dom';

export default function Cybersecurity() {
  return (
    <div className="detail-page">
      <section className="detail-hero">
        <div className="container">
          <div className="label"><Link to="/solutions">← All Solutions</Link></div>
          <div className="detail-hero-icon">🔒</div>
          <h1 className="detail-hero-h1">Cybersecurity</h1>
          <p className="detail-hero-sub">
            Comprehensive security services tailored to your threat profile, industry, and compliance requirements. From Zero Trust architecture to managed detection and response — we source and manage security solutions from the world's top vendors.
          </p>
          <Link to="/contact" className="btn-primary">Get a Free Security Assessment →</Link>
        </div>
      </section>

      <section className="detail-body">
        <div className="container">
          <div className="detail-two-col">
            <div>
              <div className="label">What We Cover</div>
              <h2 className="section-title" style={{ marginBottom: '2rem' }}>Cybersecurity Solutions</h2>
              <div className="detail-features">
                {[
                  { title: 'SASE & Zero Trust (ZTNA)', desc: 'Secure Access Service Edge and Zero Trust Network Access frameworks that protect users wherever they work — in office, remote, or hybrid.' },
                  { title: 'Managed Detection & Response (MDR)', desc: '24/7 threat monitoring, detection, and response by expert security analysts. Faster threat containment without building an in-house SOC.' },
                  { title: 'Email Security', desc: 'Advanced anti-phishing, anti-malware, and business email compromise (BEC) protection that stops threats before they reach your inbox.' },
                  { title: 'Endpoint Detection & Response (EDR)', desc: 'Next-generation endpoint protection that detects, investigates, and responds to advanced threats across all devices.' },
                  { title: 'Firewall as a Service (FWaaS)', desc: 'Cloud-native firewall with deep packet inspection, IPS, URL filtering, and centralized management across all locations.' },
                  { title: 'Compliance & Risk Management', desc: 'Framework alignment for SOC 2, HIPAA, PCI-DSS, NIST, and CMMC. Assessment, gap analysis, and remediation roadmaps.' },
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
                  {['Palo Alto Networks', 'CrowdStrike', 'Fortinet', 'Zscaler', 'Logically', 'Integris', 'SentinelOne', 'Mimecast', 'Proofpoint', 'Arctic Wolf', 'Orca Security'].map((v) => (
                    <div key={v} className="detail-vendor-item">{v}</div>
                  ))}
                </div>
                <div className="detail-cta-box">
                  <p>We'll assess your current security posture and identify the highest-impact improvements.</p>
                  <Link to="/contact" className="btn-primary" style={{ fontSize: '0.82rem', padding: '0.6rem 1.25rem' }}>
                    Free Security Review →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-band">
        <div className="container">
          <h2 className="section-title">Strengthen Your Security Posture</h2>
          <p className="section-sub">Don't wait for a breach. We'll assess your environment and build a practical, budget-aligned security roadmap.</p>
          <div className="cta-actions">
            <Link to="/contact" className="btn-primary">Start a Free Assessment →</Link>
            <Link to="/solutions" className="btn-outline">View All Solutions</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
