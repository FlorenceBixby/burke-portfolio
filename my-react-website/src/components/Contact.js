import { motion, useInView } from 'motion/react';
import { useRef } from 'react';

const links = [
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/burke-ruder/', icon: '↗' },
  { label: 'Email', href: 'mailto:burke.ruder@gmail.com', icon: '→' },
];

export default function Contact() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="contact" className="contact">
      <div className="section-inner" ref={ref}>
        <motion.p
          className="section-label"
          initial={{ opacity: 0, x: -20 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          Contact
        </motion.p>
        <motion.h2
          className="section-heading contact-heading"
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          Let's <span className="hero-accent">connect</span>.
        </motion.h2>
        <motion.p
          className="contact-sub"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.15 }}
        >
          Whether it's a partnership, an opportunity, or just a good conversation —
          I'm always open to connecting with interesting people.
        </motion.p>

        <motion.div
          className="contact-links"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {links.map((l, i) => (
            <motion.a
              key={l.label}
              href={l.href}
              target={l.label === 'LinkedIn' ? '_blank' : undefined}
              rel="noopener noreferrer"
              className="contact-link"
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.35 + i * 0.1, duration: 0.5 }}
              whileHover={{ x: 6, transition: { duration: 0.2 } }}
            >
              <span>{l.label}</span>
              <span className="contact-link-icon">{l.icon}</span>
            </motion.a>
          ))}
        </motion.div>
      </div>

      <motion.footer
        className="footer"
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ delay: 0.7, duration: 0.6 }}
      >
        <p>© 2026 Burke Ruder · Austin, TX</p>
      </motion.footer>
    </section>
  );
}
