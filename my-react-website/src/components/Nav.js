import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

const solutions = [
  { label: 'Network & Voice',        path: '/solutions/network-voice',          icon: '📡' },
  { label: 'Unified Communications', path: '/solutions/unified-communications', icon: '💬' },
  { label: 'Contact Center',         path: '/solutions/contact-center',         icon: '🎧' },
  { label: 'Cybersecurity',          path: '/solutions/cybersecurity',          icon: '🔒' },
  { label: 'Cloud Computing',        path: '/solutions/cloud-computing',        icon: '☁️' },
  { label: 'Mobility & IoT & AI',    path: '/solutions/mobility-iot-ai',        icon: '📱' },
  { label: 'Managed Services',       path: '/solutions/managed-services',       icon: '⚙️' },
  { label: 'SD-WAN',                 path: '/solutions/sd-wan',                 icon: '🌐' },
];

export default function Nav() {
  const [dropOpen, setDropOpen] = useState(false);
  const location = useLocation();
  useEffect(() => { setDropOpen(false); }, [location]);

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <motion.nav
      className="nav"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link to="/" className="nav-logo">
        {/* Bracket mark */}
        <svg width="14" height="18" viewBox="0 0 14 18" fill="none" style={{ flexShrink: 0, marginRight: 1 }}>
          <path d="M8 1H4C2.9 1 2 1.9 2 3V15C2 16.1 2.9 17 4 17H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span className="nav-logo-the">THE</span>
        <span className="nav-logo-rest">Interesting Group</span>
      </Link>

      <ul className="nav-links">
        <li><Link to="/" className={location.pathname === '/' ? 'nav-active' : ''}>Home</Link></li>

        <li
          className="nav-drop-wrap"
          onMouseEnter={() => setDropOpen(true)}
          onMouseLeave={() => setDropOpen(false)}
        >
          <button
            className={`nav-drop-trigger${isActive('/solutions') ? ' nav-active' : ''}`}
            onClick={() => setDropOpen(!dropOpen)}
          >
            What We Handle ▾
          </button>
          <AnimatePresence>
            {dropOpen && (
              <motion.div
                className="nav-dropdown"
                initial={{ opacity: 0, y: -8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.97 }}
                transition={{ duration: 0.16 }}
              >
                <Link to="/solutions">All Solutions</Link>
                {solutions.map((s, i) => (
                  <motion.div
                    key={s.path}
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.025 }}
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
        </li>

        <li><Link to="/about"   className={isActive('/about')   ? 'nav-active' : ''}>About</Link></li>
        <li><Link to="/contact" className={isActive('/contact') ? 'nav-active' : ''}>Contact</Link></li>

        <li>
          <Link to="/contact">
            <motion.span
              className="nav-cta"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              style={{ display: 'inline-block' }}
            >
              Book a Call
            </motion.span>
          </Link>
        </li>
      </ul>
    </motion.nav>
  );
}
