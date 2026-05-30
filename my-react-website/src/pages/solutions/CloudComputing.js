import { Link } from 'react-router-dom';

export default function CloudComputing() {
  return (
    <div className="detail-page">
      <section className="detail-hero">
        <div className="container">
          <div className="label"><Link to="/solutions">← All Solutions</Link></div>
          <div className="detail-hero-icon">☁️</div>
          <h1 className="detail-hero-h1">Cloud Computing</h1>
          <p className="detail-hero-sub">
            IaaS, PaaS, and managed cloud services across public, private, and hybrid architectures. We help you design the right cloud strategy and connect you with the right providers — from hyperscalers to specialized managed cloud partners.
          </p>
          <Link to="/contact" className="btn-primary">Get a Free Cloud Assessment →</Link>
        </div>
      </section>

      <section className="detail-body">
        <div className="container">
          <div className="detail-two-col">
            <div>
              <div className="label">What We Cover</div>
              <h2 className="section-title" style={{ marginBottom: '2rem' }}>Cloud Computing Solutions</h2>
              <div className="detail-features">
                {[
                  { title: 'Public Cloud (AWS, Azure, GCP)', desc: 'Infrastructure and platform services from the world\'s leading hyperscalers. We help you optimize spend and architect for performance.' },
                  { title: 'Managed Cloud Hosting', desc: 'Fully managed cloud environments with dedicated support, proactive monitoring, and guaranteed SLAs from specialized providers.' },
                  { title: 'Hybrid & Multi-Cloud', desc: 'Connect on-premise infrastructure with cloud resources. We design architectures that balance performance, cost, and compliance.' },
                  { title: 'Cloud Migration', desc: 'Assessment, planning, and execution support for migrating workloads from on-premise or co-location to cloud environments.' },
                  { title: 'Disaster Recovery as a Service (DRaaS)', desc: 'Cloud-based backup and recovery solutions with defined RPO/RTO objectives. Protect your business from ransomware and outages.' },
                  { title: 'Colocation & Data Centers', desc: 'Physical server space in Tier 3/4 data centers with carrier-neutral connectivity. A complement or alternative to full cloud adoption.' },
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
                  {['Amazon Web Services (AWS)', 'Microsoft Azure', 'Google Cloud Platform', 'Rackspace', 'Navisite', 'Lumen Edge Cloud', 'Flexential', 'Tierpoint', 'Peak 10', 'Zerto', 'Veeam'].map((v) => (
                    <div key={v} className="detail-vendor-item">{v}</div>
                  ))}
                </div>
                <div className="detail-cta-box">
                  <p>We'll review your workloads and recommend the right cloud environment for each application.</p>
                  <Link to="/contact" className="btn-primary" style={{ fontSize: '0.82rem', padding: '0.6rem 1.25rem' }}>
                    Cloud Strategy Call →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-band">
        <div className="container">
          <h2 className="section-title">Build a Smarter Cloud Strategy</h2>
          <p className="section-sub">Whether you're just starting your cloud journey or optimizing an existing environment, we bring the expertise and vendor relationships to get it right.</p>
          <div className="cta-actions">
            <Link to="/contact" className="btn-primary">Start a Free Assessment →</Link>
            <Link to="/solutions" className="btn-outline">View All Solutions</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
