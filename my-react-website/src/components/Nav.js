import { motion, useScroll, useMotionValueEvent, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Nav() {
  const [hidden, setHidden] = useState(false);
  const [atTop, setAtTop] = useState(true);
  const [portfolioOpen, setPortfolioOpen] = useState(false);
  const { scrollY } = useScroll();
  const location = useLocation();

  useMotionValueEvent(scrollY, 'change', (latest) => {
    const prev = scrollY.getPrevious();
    setHidden(latest > prev && latest > 80);
    setAtTop(latest < 40);
  });

  const isHome = location.pathname === '/';
  const transparent = isHome && atTop;

  return (
    <motion.nav
      className={`nav ${transparent ? 'nav-overlay' : 'nav-solid'}`}
      animate={{ y: hidden ? -80 : 0 }}
      transition={{ duration: 0.35, ease: 'easeInOut' }}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        <Link to="/" className="nav-logo">Burke Ruder</Link>
      </motion.div>

      <motion.ul
        className="nav-links"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        {/* Portfolio with dropdown */}
        <li
          className="nav-item-portfolio"
          onMouseEnter={() => setPortfolioOpen(true)}
          onMouseLeave={() => setPortfolioOpen(false)}
        >
          <span className={`nav-link-text ${location.pathname === '/' || location.pathname.startsWith('/portfolio') ? 'nav-active' : ''}`}>
            Portfolios ∨
          </span>
          <AnimatePresence>
            {portfolioOpen && (
              <motion.div
                className="nav-dropdown"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
              >
                <Link to="/" className="nav-dropdown-item" onClick={() => setPortfolioOpen(false)}>
                  Featured
                </Link>
                <Link to="/portfolio/downtown-austin" className="nav-dropdown-item" onClick={() => setPortfolioOpen(false)}>
                  Downtown Austin
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </li>

        <li>
          <Link
            to="/about"
            className={location.pathname === '/about' ? 'nav-active' : ''}
          >
            About
          </Link>
        </li>
        <li>
          <a href="mailto:burke.ruder@gmail.com">Contact</a>
        </li>
      </motion.ul>
    </motion.nav>
  );
}
