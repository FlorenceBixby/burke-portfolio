import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Reveal from '../components/Reveal.jsx'

const ENDPOINT = '/api/contact'

const services = [
  'Internet / Connectivity',
  'Phone / UCaaS',
  'Contact Center (CCaaS)',
  'Cloud Infrastructure',
  'Cybersecurity',
  'Managed IT Services',
  'Mobility / IoT',
  'Not sure — just exploring',
]

export default function Contact() {
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', company: '',
    phone: '', service: '', message: '',
  })
  const [status, setStatus] = useState('idle') // idle | sending | success | error

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('sending')
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Network error')
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  return (
    <>
      <section className="section">
        <div className="container">
          <div className="contact-grid">

            {/* Left: copy */}
            <Reveal>
              <div className="contact-copy">
                <span className="eyebrow">Get in touch</span>
                <h1 className="headline-lg" style={{ marginBottom: 24 }}>
                  Let's see what<br />we can save you.
                </h1>
                <p className="body-lg" style={{ marginBottom: 40 }}>
                  Tell us what you're running today — internet, phones, cloud, security — and we'll take it from there. No cost, no commitment.
                </p>

                <div className="contact-meta">
                  <div className="contact-meta-item">
                    <span className="contact-meta-label">Email</span>
                    <a href="mailto:info@theinterestinggroup.com">info@theinterestinggroup.com</a>
                  </div>
                  <div className="contact-meta-item">
                    <span className="contact-meta-label">Book directly</span>
                    <a href="https://calendly.com/burke-theinterestinggroup" target="_blank" rel="noopener noreferrer">
                      calendly.com/burke-theinterestinggroup →
                    </a>
                  </div>
                  <div className="contact-meta-item">
                    <span className="contact-meta-label">Based in</span>
                    <span>Buda, TX — serving all of Texas and beyond</span>
                  </div>
                </div>
              </div>
            </Reveal>

            {/* Right: form */}
            <Reveal delay={0.1}>
              <div className="contact-form-wrap">
                <AnimatePresence mode="wait">
                  {status === 'success' ? (
                    <motion.div
                      key="success"
                      className="contact-success"
                      initial={{ opacity: 0, scale: 0.97 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4 }}
                    >
                      <div className="contact-success-icon">✓</div>
                      <h3>You're in good hands.</h3>
                      <p>We'll be in touch within one business day. In the meantime, feel free to book a call directly if you'd rather talk now.</p>
                      <a
                        href="https://calendly.com/burke-theinterestinggroup"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-dark"
                        style={{ marginTop: 28, display: 'inline-flex' }}
                      >
                        Book a call →
                      </a>
                    </motion.div>
                  ) : (
                    <motion.form
                      key="form"
                      className="contact-form"
                      onSubmit={handleSubmit}
                      initial={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <div className="form-row">
                        <div className="form-field">
                          <label>First name <span>*</span></label>
                          <input required value={form.firstName} onChange={set('firstName')} placeholder="First name" />
                        </div>
                        <div className="form-field">
                          <label>Last name <span>*</span></label>
                          <input required value={form.lastName} onChange={set('lastName')} placeholder="Ruder" />
                        </div>
                      </div>

                      <div className="form-field">
                        <label>Work email <span>*</span></label>
                        <input required type="email" value={form.email} onChange={set('email')} placeholder="you@company.com" />
                      </div>

                      <div className="form-row">
                        <div className="form-field">
                          <label>Company <span>*</span></label>
                          <input required value={form.company} onChange={set('company')} placeholder="Acme Corp" />
                        </div>
                        <div className="form-field">
                          <label>Phone</label>
                          <input type="tel" value={form.phone} onChange={set('phone')} placeholder="(512) 555-0100" />
                        </div>
                      </div>

                      <div className="form-field">
                        <label>What are you most interested in?</label>
                        <select value={form.service} onChange={set('service')}>
                          <option value="">Select a category</option>
                          {services.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>

                      <div className="form-field">
                        <label>Tell us about your current setup</label>
                        <textarea
                          rows={4}
                          value={form.message}
                          onChange={set('message')}
                          placeholder="What tech are you running today? Any contracts coming up for renewal? What's frustrating you?"
                        />
                      </div>

                      {status === 'error' && (
                        <p className="form-error">Something went wrong — email us directly at info@theinterestinggroup.com</p>
                      )}

                      <button
                        type="submit"
                        className="btn btn-dark"
                        style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}
                        disabled={status === 'sending'}
                      >
                        {status === 'sending' ? 'Sending…' : 'Send message →'}
                      </button>

                      <p className="form-note">No cost, no pitch, no obligation. We'll respond within one business day.</p>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  )
}
