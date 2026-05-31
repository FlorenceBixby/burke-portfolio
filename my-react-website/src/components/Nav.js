import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

const solutions = [
  { label: 'Network & Voice',          path: '/solutions/network-voice',           icon: '📡' },
  { label: 'Unified Communications',   path: '/solutions/unified-communications',  icon: '💬' },
  { label: 'Contact Center',           path: '/solutions/contact-center',          icon: '🎧' },
  { label: 'Cybersecurity',            path: '/solutions/cybersecurity',           icon: '🔒' },
  { label: 'Cloud Computing',          path: '/solutions/cloud-computing',         icon: '☁️' },
  { label: 'Mobility & IoT & AI',      path: '/solutions/mobility-iot-ai',         icon: '📱' },
  { label: 'Managed Services',         path: '/solutions/managed-services',        icon: '⚙️' },
  { label: 'SD-WAN',                   path: '/solutions/sd-wan',                  icon: '🌐' },
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

  useEffect(() => { setDropOpen(false); }, [location]);

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <motion.nav
      className={`nav ${scrolled ? 'nav--solid' : 'nav--transparent'}`}
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link to="/" className="nav-logo">
        <motion.span
          className="nav-logo-dot"
          animate={{ boxShadow: ['0 0 6px #00c8b4', '0 0 14px #00c8b4', '0 0 6px #00c8b4'] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        />
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
          <AnimatePresence>
            {dropOpen && (
              <motion.div
                className="nav-dropdown"
                initial={{ opacity: 0, y: -8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.97 }}
                transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              >
                <Link to="/solutions">All Solutions</Link>
                {solutions.map((s, i) => (
                  <motion.div
                    key={s.path}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03, duration: 0.2 }}
                  >
                    <Link to={s.path}>
                      <span className="nav-dropdown-icon">{s.icon}</span>
                      {s.label}
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Link to="/about"   className={isActive('/about')   ? 'nav-active' : ''}>About</Link>
        <Link to="/contact" className={isActive('/contact') ? 'nav-active' : ''}>Contact</Link>

        <Link to="/contact" className="nav-cta">
          <motion.span
            className="btn-primary"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            style={{ display: 'inline-flex', alignItems: 'center' }}
          >
            Get Started
          </motion.span>
        </Link>
      </div>

      <button className="nav-hamburger" aria-label="Menu">
        <span /><span /><span />
      </button>
    </motion.nav>
  );
}
