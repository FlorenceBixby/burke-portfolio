import { Link } from 'react-router-dom';

export default function SDWAN() {
  return (
    <div className="detail-page">
      <section className="detail-hero">
        <div className="container">
          <div className="label"><Link to="/solutions">← All Solutions</Link></div>
          <div className="detail-hero-icon">🌐</div>
          <h1 className="detail-hero-h1">SD-WAN</h1>
          <p className="detail-hero-sub">
            Software-defined wide area networking that delivers enterprise reliability, application performance, and significant cost savings across all your locations. Replace expensive MPLS with intelligent, policy-driven networking built for the cloud era.
          </p>
          <Link to="/contact" className="btn-primary">Get a Free SD-WAN Assessment →</Link>
        </div>
      </section>

      <section className="detail-body">
        <div className="container">
          <div className="detail-two-col">
            <div>
              <div className="label">What We Cover</div>
              <h2 className="section-title" style={{ marginBottom: '2rem' }}>SD-WAN Solutions</h2>
              <div className="detail-features">
                {[
                  { title: 'Multi-Carrier WAN Optimization', desc: 'Intelligently route traffic across multiple internet connections — fiber, broadband, LTE — based on real-time performance.' },
                  { title: 'Application-Aware Routing', desc: 'Prioritize critical applications like VoIP, UCaaS, and ERP while keeping non-critical traffic on lower-cost circuits.' },
                  { title: 'Centralized Management', desc: 'Manage all your branch locations, policies, and network changes from a single cloud-based dashboard.' },
                  { title: 'Secure SD-WAN / SASE Integration', desc: 'Combine SD-WAN with built-in security (firewall, IPS, CASB, ZTNA) to eliminate the need for separate security appliances.' },
                  { title: 'Cloud-Native SD-WAN', desc: 'Purpose-built SD-WAN solutions for direct cloud access to AWS, Azure, and SaaS applications — without backhauling through the data center.' },
                  { title: 'Managed SD-WAN', desc: 'Fully managed deployment and day-2 operations. Our managed SD-WAN partners handle configuration, monitoring, and troubleshooting.' },
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
                  {['Graphiant', 'Cisco Meraki', 'VMware SD-WAN (VeloCloud)', 'Fortinet Secure SD-WAN', 'Palo Alto Prisma SD-WAN', 'Aryaka', 'Cato Networks', 'Versa Networks', 'Silver Peak (HPE Aruba)', 'Lumen SD-WAN'].map((v) => (
                    <div key={v} className="detail-vendor-item">{v}</div>
                  ))}
                </div>
                <div className="detail-cta-box">
                  <p>Share your location count and bandwidth needs — we'll build a comparison of top SD-WAN options.</p>
                  <Link to="/contact" className="btn-primary" style={{ fontSize: '0.82rem', padding: '0.6rem 1.25rem' }}>
                    Compare SD-WAN →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-band">
        <div className="container">
          <h2 className="section-title">Modernize Your WAN</h2>
          <p className="section-sub">Replace expensive MPLS with intelligent SD-WAN that's faster, more resilient, and purpose-built for cloud. Most businesses see 30–50% cost savings.</p>
          <div className="cta-actions">
            <Link to="/contact" className="btn-primary">Start a Free Assessment →</Link>
            <Link to="/solutions" className="btn-outline">View All Solutions</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
