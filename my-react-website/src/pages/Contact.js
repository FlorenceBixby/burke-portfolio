import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export default function Contact() {
  const [form, setForm] = useState({ name: '', lastName: '', email: '', company: '', phone: '', service: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handle = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  const submit = (e) => { e.preventDefault(); setSubmitted(true); };

  return (
    <div className="contact-page">
      <section className="contact-hero-section">
        <div className="container">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          >
            <motion.div
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } }}
            >
              <div className="label">Contact</div>
            </motion.div>
            <motion.h1
              className="section-title"
              style={{ fontSize: 'clamp(2.5rem,5vw,5rem)', marginBottom: '1rem' }}
              variants={{ hidden: { opacity: 0, y: 28 }, visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16,1,0.3,1] } } }}
            >
              Let's Find the Right<br /><span>Technology for You</span>
            </motion.h1>
            <motion.p
              className="section-sub"
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.1 } } }}
            >
              Tell us about your business. We'll reach out within one business day to schedule your free assessment.
            </motion.p>
          </motion.div>
        </div>
      </section>

      <section className="contact-main">
        <div className="container">
          <div className="contact-grid">

            {/* Left col */}
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16,1,0.3,1] }}
            >
              <h2 className="contact-info-title">Get in Touch</h2>
              <p className="contact-info-sub">
                Whether you're looking to reduce telecom spend, move to the cloud, or improve your security posture — we can help. Our advisory services are free, funded by our vendor partners.
              </p>

              <div className="contact-methods">
                {[
                  { icon: '✉️', label: 'Email', value: 'info@theinterestinggroup.com' },
                  { icon: '📍', label: 'Location', value: 'Austin, Texas' },
                  { icon: '⏱️', label: 'Response Time', value: 'Within 1 Business Day' },
                ].map((m, i) => (
                  <motion.div
                    key={m.label}
                    className="contact-method"
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.08, duration: 0.5 }}
                    whileHover={{ x: 4, transition: { duration: 0.15 } }}
                  >
                    <div className="contact-method-icon">{m.icon}</div>
                    <div>
                      <div className="contact-method-label">{m.label}</div>
                      <div className="contact-method-value">{m.value}</div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <motion.div
                style={{ padding: '1.5rem', border: '1px solid var(--border)', borderRadius: '4px', background: 'var(--bg2)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.6 }}
              >
                <div className="label" style={{ marginBottom: '0.75rem' }}>What to Expect</div>
                {[
                  'Free 30-minute technology assessment call',
                  'Review of your current tech stack and spend',
                  'Comparison of top solutions across 200+ vendors',
                  'Custom recommendations with transparent pricing',
                  'Ongoing support through implementation and beyond',
                ].map((item, i) => (
                  <motion.div
                    key={item}
                    style={{ display: 'flex', gap: '0.6rem', fontSize: '0.82rem', color: 'var(--text2)', marginBottom: '0.6rem', alignItems: 'flex-start' }}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.65 + i * 0.07, duration: 0.4 }}
                  >
                    <span style={{ color: 'var(--accent)', flexShrink: 0 }}>✓</span>
                    {item}
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right col — form */}
            <motion.div
              className="contact-form-wrap"
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.15, ease: [0.16,1,0.3,1] }}
            >
              <AnimatePresence mode="wait">
                {submitted ? (
                  <motion.div
                    key="success"
                    className="form-success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    <motion.div
                      style={{ fontSize: '2.5rem', marginBottom: '1rem' }}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    >✅</motion.div>
                    <h3 style={{ marginBottom: '0.5rem' }}>Message Received!</h3>
                    <p style={{ color: 'var(--text2)', fontSize: '0.88rem' }}>
                      Thanks for reaching out. We'll be in touch within one business day to schedule your free technology assessment.
                    </p>
                  </motion.div>
                ) : (
                  <motion.div key="form" initial={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <h2 className="contact-form-title">Schedule a Free Assessment</h2>
                    <form onSubmit={submit}>
                      <div className="form-row">
                        <div className="form-group">
                          <label className="form-label">First Name *</label>
                          <input className="form-input" name="name" value={form.name} onChange={handle} placeholder="Jane" required />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Last Name *</label>
                          <input className="form-input" name="lastName" value={form.lastName} onChange={handle} placeholder="Smith" required />
                        </div>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Work Email *</label>
                        <input className="form-input" name="email" type="email" value={form.email} onChange={handle} placeholder="jane@company.com" required />
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label className="form-label">Company</label>
                          <input className="form-input" name="company" value={form.company} onChange={handle} placeholder="Acme Corp" />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Phone</label>
                          <input className="form-input" name="phone" type="tel" value={form.phone} onChange={handle} placeholder="(512) 000-0000" />
                        </div>
                      </div>
                      <div className="form-group">
                        <label className="form-label">I'm interested in...</label>
                        <select className="form-select" name="service" value={form.service} onChange={handle}>
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
                        <textarea className="form-textarea" name="message" value={form.message} onChange={handle}
                          placeholder="Describe your current environment, pain points, or what you're looking to improve..." />
                      </div>
                      <motion.button
                        type="submit"
                        className="btn-primary form-submit"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        Request Free Assessment →
                      </motion.button>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
