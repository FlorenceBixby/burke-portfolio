import { motion, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';
import Birds from './Birds';

const words = ['Sales.', 'Operations.', 'Technology.', 'Leadership.'];

function AnimatedWord({ word, delay }) {
  return (
    <motion.span
      className="hero-rotating-word"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      {word}
    </motion.span>
  );
}

export default function Hero() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.12, delayChildren: 0.2 } },
  };

  const item = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } },
  };

  return (
    <section id="hero" className="hero" ref={ref}>
      <Birds />
      <motion.div className="hero-content" style={{ y, opacity }}>
        <motion.p
          className="hero-eyebrow"
          initial={{ opacity: 0, letterSpacing: '0.4em' }}
          animate={{ opacity: 1, letterSpacing: '0.2em' }}
          transition={{ duration: 1, delay: 0.1 }}
        >
          Burke Ruder
        </motion.p>

        <motion.h1
          className="hero-headline"
          variants={container}
          initial="hidden"
          animate="show"
        >
          <motion.span variants={item}>20+ years of</motion.span>{' '}
          <motion.span variants={item} className="hero-accent">building,</motion.span>{' '}
          <motion.span variants={item}>selling, &</motion.span>{' '}
          <motion.span variants={item} className="hero-accent">leading.</motion.span>
        </motion.h1>

        <motion.p
          className="hero-sub"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.7 }}
        >
          From loading docks to the C-suite. From solar panels to cybersecurity.
          <br />
          Currently helping digital natives scale securely at{' '}
          <span className="hero-accent">Cloudflare</span>.
        </motion.p>

        <motion.div
          className="hero-tags"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.6 }}
        >
          {words.map((w, i) => (
            <AnimatedWord key={w} word={w} delay={1.5 + i * 0.1} />
          ))}
        </motion.div>

        <motion.a
          href="#about"
          className="hero-cta"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.9, duration: 0.5, type: 'spring', stiffness: 200 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
        >
          Learn more
        </motion.a>
      </motion.div>

      <motion.div
        className="hero-scroll-indicator"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2, duration: 0.8 }}
      >
        <motion.div
          className="hero-scroll-dot"
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
        />
      </motion.div>
    </section>
  );
}
