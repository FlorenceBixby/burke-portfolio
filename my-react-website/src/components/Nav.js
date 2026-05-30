import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const solutions = [
  { label: 'Network & Voice', path: '/solutions/network-voice', icon: '📡' },
  { label: 'Unified Communications', path: '/solutions/unified-communications', icon: '💬' },
  { label: 'Contact Center', path: '/solutions/contact-center', icon: '🎧' },
  { label: 'Cybersecurity', path: '/solutions/cybersecurity', icon: '🔒' },
  { label: 'Cloud Computing', path: '/solutions/cloud-computing', icon: '☁️' },
  { label: 'Mobility & IoT & AI', path: '/solutions/mobility-iot-ai', icon: '📱' },
  { label: 'Managed Services', path: '/solutions/managed-services', icon: '⚙️' },
  { label: 'SD-WAN', path: '/solutions/sd-wan', icon: '🌐' },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setDropOpen(false);
  }, [location]);

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <nav className={`nav ${scrolled ? 'nav--solid' : 'nav--transparent'}`}>
      <Link to="/" className="nav-logo">
        <span className="nav-logo-dot" />
        The Interesting Group
      </Link>

      <div className="nav-links">
        <Link to="/" className={location.pathname === '/' ? 'nav-active' : ''}>Home</Link>

        <div
          className="nav-drop-wrap"
          onMouseEnter={() => setDropOpen(true)}
          onMouseLeave={() => setDropOpen(false)}
        >
          <button
            className={`nav-drop-trigger${isActive('/solutions') ? ' nav-active' : ''}`}
            onClick={() => setDropOpen(!dropOpen)}
          >
            Solutions ▾
          </button>
          {dropOpen && (
            <div className="nav-dropdown">
              <Link to="/solutions">All Solutions</Link>
              {solutions.map((s) => (
                <Link key={s.path} to={s.path}>
                  <span className="nav-dropdown-icon">{s.icon}</span>
                  {s.label}
                </Link>
              ))}
            </div>
          )}
        </div>

        <Link to="/about" className={isActive('/about') ? 'nav-active' : ''}>About</Link>
        <Link to="/contact" className={isActive('/contact') ? 'nav-active' : ''}>Contact</Link>
        <Link to="/contact" className="btn-primary nav-cta">Get Started</Link>
      </div>

      <button className="nav-hamburger" aria-label="Menu">
        <span /><span /><span />
      </button>
    </nav>
  );
}
