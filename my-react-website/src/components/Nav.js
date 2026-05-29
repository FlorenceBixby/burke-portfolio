import { motion, useScroll, useMotionValueEvent } from 'motion/react';
import { useState } from 'react';

const links = ['About', 'Experience', 'Contact'];

export default function Nav() {
  const [hidden, setHidden] = useState(false);
  const [atTop, setAtTop] = useState(true);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, 'change', (latest) => {
    const prev = scrollY.getPrevious();
    setHidden(latest > prev && latest > 80);
    setAtTop(latest < 40);
  });

  return (
    <motion.nav
      className="nav"
      animate={{ y: hidden ? -80 : 0 }}
      transition={{ duration: 0.35, ease: 'easeInOut' }}
      style={{ backdropFilter: atTop ? 'none' : 'blur(16px)' }}
    >
      <motion.a
        href="#hero"
        className="nav-logo"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.6 }}
      >
        BR
      </motion.a>
      <ul className="nav-links">
        {links.map((link, i) => (
          <motion.li
            key={link}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + i * 0.1, duration: 0.5 }}
          >
            <a href={`#${link.toLowerCase()}`}>{link}</a>
          </motion.li>
        ))}
      </ul>
    </motion.nav>
  );
}
