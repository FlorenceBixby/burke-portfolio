import { motion, useScroll, useMotionValueEvent } from 'motion/react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Nav() {
  const [hidden, setHidden] = useState(false);
  const [atTop, setAtTop] = useState(true);
  const { scrollY } = useScroll();
  const location = useLocation();
  const isHome = location.pathname === '/';

  useMotionValueEvent(scrollY, 'change', (latest) => {
    const prev = scrollY.getPrevious();
    setHidden(latest > prev && latest > 80);
    setAtTop(latest < 40);
  });

  return (
    <motion.nav
      className={`nav ${isHome ? 'nav-overlay' : 'nav-solid'}`}
      animate={{ y: hidden ? -80 : 0 }}
      transition={{ duration: 0.35, ease: 'easeInOut' }}
      style={{ backdropFilter: isHome && atTop ? 'none' : 'blur(16px)' }}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        <Link to="/" className="nav-logo">Burke Ruder</Link>
      </motion.div>

      <motion.ul
        className="nav-links"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <li><Link to="/" className={location.pathname === '/' ? 'nav-active' : ''}>Portfolio</Link></li>
        <li><Link to="/about" className={location.pathname === '/about' ? 'nav-active' : ''}>About</Link></li>
        <li><a href="mailto:burke.ruder@gmail.com">Contact</a></li>
      </motion.ul>
    </motion.nav>
  );
}
