import { useState } from 'react';

export default function Contact() {
  const [form, setForm] = useState({
    name: '', email: '', company: '', phone: '', service: '', message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handle = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="contact-page">
      <section className="contact-hero-section">
        <div className="container">
          <div className="label">Contact Us</div>
          <h1 className="section-title" style={{ marginBottom: '1rem' }}>
            Let's Find the Right<br /><span>Technology for You</span>
          </h1>
          <p className="section-sub">
            Tell us about your business and current technology environment. We'll reach out within one business day to schedule your free assessment.
          </p>
        </div>
      </section>

      <section className="contact-main">
        <div className="container">
          <div className="contact-grid">
            <div>
              <h2 className="contact-info-title">Get in Touch</h2>
              <p className="contact-info-sub">
                Whether you're looking to reduce your telecom spend, move to the cloud, or improve your security posture — we can help. Our advisory services are free to you, funded by our vendor partners.
              </p>

              <div className="contact-methods">
                <div className="contact-method">
                  <div className="contact-method-icon">✉️</div>
                  <div>
                    <div className="contact-method-label">Email</div>
                    <div className="contact-method-value">info@theinterestinggroup.com</div>
                  </div>
                </div>
                <div className="contact-method">
                  <div className="contact-method-icon">📍</div>
                  <div>
                    <div className="contact-method-label">Location</div>
                    <div className="contact-method-value">Austin, Texas</div>
                  </div>
                </div>
                <div className="contact-method">
                  <div className="contact-method-icon">⏱️</div>
                  <div>
                    <div className="contact-method-label">Response Time</div>
                    <div className="contact-method-value">Within 1 Business Day</div>
                  </div>
                </div>
              </div>

              <div style={{
                padding: '1.5rem',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                background: 'var(--bg2)',
              }}>
                <div className="label" style={{ marginBottom: '0.5rem' }}>What to Expect</div>
                {[
                  'Free 30-minute technology assessment call',
                  'Review of your current tech stack and spend',
                  'Comparison of top solutions across 200+ vendors',
                  'Custom recommendations with transparent pricing',
                  'Ongoing support through implementation and beyond',
                ].map((item) => (
                  <div key={item} style={{
                    display: 'flex', gap: '0.6rem', fontSize: '0.85rem',
                    color: 'var(--muted)', marginBottom: '0.6rem', alignItems: 'flex-start',
                  }}>
                    <span style={{ color: 'var(--accent)', flexShrink: 0 }}>✓</span>
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="contact-form-wrap">
              {submitted ? (
                <div className="form-success">
                  <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>✅</div>
                  <h3 style={{ marginBottom: '0.5rem' }}>Message Received!</h3>
                  <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
                    Thanks for reaching out. We'll be in touch within one business day to schedule your free technology assessment.
                  </p>
                </div>
              ) : (
                <>
                  <h2 className="contact-form-title">Schedule a Free Assessment</h2>
                  <form onSubmit={submit}>
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">First Name *</label>
                        <input
                          className="form-input"
                          name="name"
                          value={form.name}
                          onChange={handle}
                          placeholder="Jane"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Last Name *</label>
                        <input
                          className="form-input"
                          name="company"
                          value={form.company}
                          onChange={handle}
                          placeholder="Smith"
                          required
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Work Email *</label>
                      <input
                        className="form-input"
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handle}
                        placeholder="jane@company.com"
                        required
                      />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Company</label>
                        <input
                          className="form-input"
                          name="phone"
                          value={form.phone}
                          onChange={handle}
                          placeholder="Acme Corp"
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Phone</label>
                        <input
                          className="form-input"
                          name="phone"
                          type="tel"
                          value={form.phone}
                          onChange={handle}
                          placeholder="(512) 000-0000"
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">I'm interested in...</label>
                      <select
                        className="form-select"
                        name="service"
                        value={form.service}
                        onChange={handle}
                      >
                        <option value="">Select a solution category</option>
                        <option>Network & Voice</option>
                        <option>Unified Communications</option>
                        <option>Contact Center</option>
                        <option>Cybersecurity</option>
                        <option>Cloud Computing</option>
                        <option>Mobility & IoT & AI</option>
                        <option>Managed Services</option>
                        <option>SD-WAN</option>
                        <option>Multiple / Not Sure</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Tell Us About Your Needs</label>
                      <textarea
                        className="form-textarea"
                        name="message"
                        value={form.message}
                        onChange={handle}
                        placeholder="Describe your current technology environment, pain points, or what you're looking to improve..."
                      />
                    </div>
                    <button type="submit" className="btn-primary form-submit">
                      Request Free Assessment →
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
