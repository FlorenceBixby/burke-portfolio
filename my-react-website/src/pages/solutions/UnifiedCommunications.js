import { Link } from 'react-router-dom';

export default function UnifiedCommunications() {
  return (
    <div className="detail-page">
      <section className="detail-hero">
        <div className="container">
          <div className="label"><Link to="/solutions">← All Solutions</Link></div>
          <div className="detail-hero-icon">💬</div>
          <h1 className="detail-hero-h1">Unified Communications</h1>
          <p className="detail-hero-sub">
            Replace your legacy phone system with a modern cloud communications platform. UCaaS combines voice, video, messaging, and collaboration into a single, mobile-first solution — reducing costs and improving how your team communicates.
          </p>
          <Link to="/contact" className="btn-primary">Get a Free UCaaS Assessment →</Link>
        </div>
      </section>

      <section className="detail-body">
        <div className="container">
          <div className="detail-two-col">
            <div>
              <div className="label">What We Cover</div>
              <h2 className="section-title" style={{ marginBottom: '2rem' }}>UCaaS Capabilities</h2>
              <div className="detail-features">
                {[
                  { title: 'Cloud Phone Systems', desc: 'Hosted PBX and VoIP replacing traditional on-premise hardware. Full feature parity with legacy systems, plus cloud flexibility.' },
                  { title: 'Video Conferencing', desc: 'HD video meetings with screen sharing, recording, and transcription. Native integrations with your calendar and CRM.' },
                  { title: 'Team Messaging & Collaboration', desc: 'Persistent chat channels, file sharing, and threaded conversations that keep remote and hybrid teams aligned.' },
                  { title: 'Microsoft Teams Voice', desc: 'Direct Routing and Operator Connect solutions that add PSTN calling to your existing Microsoft 365 environment.' },
                  { title: 'Mobile & Softphone Apps', desc: 'Full business phone capabilities on any device — laptop, mobile, or desk phone — through a single app.' },
                  { title: 'Auto-Attendant & IVR', desc: 'Intelligent call routing, voicemail-to-email, and self-service menus that improve the caller experience.' },
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
                  {['RingCentral', 'Zoom Phone', 'Microsoft Teams / Operator Connect', 'Dialpad', 'Vonage Business', 'Ooma Enterprise', 'Zultys', 'Broadvoice', 'Sinch', 'Nextiva', 'GoTo Connect'].map((v) => (
                    <div key={v} className="detail-vendor-item">{v}</div>
                  ))}
                </div>
                <div className="detail-cta-box">
                  <p>We'll match your business size, integrations, and budget to the right UCaaS platform.</p>
                  <Link to="/contact" className="btn-primary" style={{ fontSize: '0.82rem', padding: '0.6rem 1.25rem' }}>
                    Compare Platforms →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-band">
        <div className="container">
          <h2 className="section-title">Modernize Your Business Communications</h2>
          <p className="section-sub">Move off your legacy PBX and onto a cloud platform that scales with your team. We handle the evaluation, negotiation, and transition.</p>
          <div className="cta-actions">
            <Link to="/contact" className="btn-primary">Start a Free Assessment →</Link>
            <Link to="/solutions" className="btn-outline">View All Solutions</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
