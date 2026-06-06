import { Link } from 'react-router-dom';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="nav-logo" style={{ marginBottom: '0.75rem' }}>
              <span className="nav-logo-dot" />
              The Interesting Group
            </div>
            <p>
              Your technology solutions advisor. We simplify the process of
              finding, comparing, and managing telecom, cloud, and IT services
              — at no additional cost to you.
            </p>
          </div>

          <div>
            <div className="footer-col-title">Solutions</div>
            <div className="footer-links">
              <Link to="/solutions/network-voice">Network & Voice</Link>
              <Link to="/solutions/unified-communications">Unified Comms</Link>
              <Link to="/solutions/contact-center">Contact Center</Link>
              <Link to="/solutions/cybersecurity">Cybersecurity</Link>
              <Link to="/solutions/cloud-computing">Cloud Computing</Link>
              <Link to="/solutions/sd-wan">SD-WAN</Link>
            </div>
          </div>

          <div>
            <div className="footer-col-title">More Solutions</div>
            <div className="footer-links">
              <Link to="/solutions/mobility-iot-ai">Mobility & IoT & AI</Link>
              <Link to="/solutions/managed-services">Managed Services</Link>
              <Link to="/solutions">All Solutions</Link>
            </div>
          </div>

          <div>
            <div className="footer-col-title">Company</div>
            <div className="footer-links">
              <Link to="/about">About Us</Link>
              <Link to="/contact">Contact</Link>
              <Link to="/contact">Get a Free Assessment</Link>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {year} The Interesting Group. All rights reserved.</span>
          <span className="footer-sandler">
            Technology solutions powered by{' '}
            <a href="https://www.sandlerpartners.com" target="_blank" rel="noopener noreferrer">
              Sandler Partners
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
