import MagneticButton from './MagneticButton.jsx'

export default function Footer({ navigate }) {
  return (
    <>
      <section className="footer-cta">
        <div className="container" style={{ textAlign: 'center' }}>
          <h2>Ready to stop managing vendors?</h2>
          <p>15 minutes. No cost. No obligation.</p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <MagneticButton
              className="btn btn-white"
              onClick={() => navigate('contact')}
            >
              Get in touch →
            </MagneticButton>
            <MagneticButton
              className="btn btn-outline"
              style={{ borderColor: 'rgba(255,255,255,0.2)', color: '#fff' }}
              href="https://calendly.com/burke-theinterestinggroup"
              target="_blank"
              rel="noopener noreferrer"
            >
              Book a call
            </MagneticButton>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-logo" style={{ cursor: 'pointer' }} onClick={() => navigate('home')}>
          <span className="footer-logo-the">THE</span>
          <span className="footer-logo-rest">Interesting Group</span>
        </div>
        <span className="footer-meta">
          <a href="mailto:burke@theinterestinggroup.com" style={{ color: '#86868B', transition: 'color 0.2s' }}
            onMouseEnter={e => e.target.style.color = '#fff'}
            onMouseLeave={e => e.target.style.color = '#86868B'}>
            burke@theinterestinggroup.com
          </a>
        </span>
        <span className="footer-meta">© {new Date().getFullYear()} The Interesting Group</span>
      </footer>
    </>
  )
}
