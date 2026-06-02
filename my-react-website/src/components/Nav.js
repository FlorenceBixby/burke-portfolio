import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from 'motion/react';

const solutionLinks = [
  { label: 'Network & Voice',        path: '/solutions/network-voice' },
  { label: 'Unified Communications', path: '/solutions/unified-communications' },
  { label: 'Contact Center',         path: '/solutions/contact-center' },
  { label: 'Cybersecurity',          path: '/solutions/cybersecurity' },
  { label: 'Cloud Computing',        path: '/solutions/cloud-computing' },
  { label: 'Mobility & IoT & AI',    path: '/solutions/mobility-iot-ai' },
  { label: 'Managed Services',       path: '/solutions/managed-services' },
  { label: 'SD-WAN',                 path: '/solutions/sd-wan' },
];

export default function Nav() {
  const [hidden, setHidden]           = useState(false);
  const [atTop, setAtTop]             = useState(true);
  const [solutionsOpen, setSolutions] = useState(false);
  const { scrollY } = useScroll();
  const location    = useLocation();

  useMotionValueEvent(scrollY, 'change', (latest) => {
    const prev = scrollY.getPrevious() ?? 0;
    setHidden(latest > prev && latest > 100);
    setAtTop(latest < 40);
  });

  const transparent = atTop && location.pathname === '/';

  return (
    <motion.nav
      className={`nav ${transparent ? 'nav-overlay' : 'nav-solid'}`}
      animate={{ y: hidden ? -80 : 0 }}
      transition={{ duration: 0.35, ease: 'easeInOut' }}
    >
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <Link to="/" className="nav-logo">
          <motion.span
            className="nav-logo-dot"
            animate={{ boxShadow: ['0 0 0px var(--accent)', '0 0 10px var(--accent)', '0 0 0px var(--accent)'] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          />
          The Interesting Group
        </Link>
      </motion.div>

      {/* Links */}
      <motion.ul
        className="nav-links"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25, duration: 0.5 }}
      >
        {/* Solutions dropdown */}
        <li
          className="nav-item-dropdown"
          onMouseEnter={() => setSolutions(true)}
          onMouseLeave={() => setSolutions(false)}
        >
          <span className={`nav-link-text ${location.pathname.startsWith('/solutions') ? 'nav-active' : ''}`}>
            Solutions ∨
          </span>
          <AnimatePresence>
            {solutionsOpen && (
              <motion.div
                className="nav-dropdown nav-dropdown-wide"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
              >
                <Link to="/solutions" className="nav-dropdown-all" onClick={() => setSolutions(false)}>
                  All Solutions →
                </Link>
                <div className="nav-dropdown-grid">
                  {solutionLinks.map((s, i) => (
                    <motion.div
                      key={s.path}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                    >
                      <Link
                        to={s.path}
                        className="nav-dropdown-item"
                        onClick={() => setSolutions(false)}
                      >
                        {s.label}
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </li>

        <li>
          <Link to="/about" className={location.pathname === '/about' ? 'nav-active' : ''}>
            About
          </Link>
        </li>

        <li>
          <Link to="/contact" className={location.pathname === '/contact' ? 'nav-active' : ''}>
            Contact
          </Link>
        </li>

        <li>
          <Link to="/contact">
            <motion.span
              className="nav-cta"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
            >
              Free Assessment
            </motion.span>
          </Link>
        </li>
      </motion.ul>
    </motion.nav>
  );
}
