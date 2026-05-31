import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'motion/react';
import { useState, useEffect, useCallback, useRef } from 'react';

const slides = [
  '/best/3R2A5336.jpg',
  '/best/3R2A5382.jpg',
  '/best/3R2A5356.jpg',
  '/best/3R2A5330.jpg',
  '/best/3R2A5362.jpg',
  '/best/3R2A5332.jpg',
  '/best/3R2A5334.jpg',
];

const INTERVAL = 5000;

export default function Home() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const [paused, setPaused] = useState(false);
  const containerRef = useRef(null);

  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start start', 'end start'] });
  const rawY = useTransform(scrollYProgress, [0, 1], ['0%', '25%']);
  const parallaxY = useSpring(rawY, { stiffness: 40, damping: 18 });
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.6], [0.35, 0.72]);
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '-18%']);

  const go = useCallback((next) => {
    setDirection(next > current || (current === slides.length - 1 && next === 0) ? 1 : -1);
    setCurrent(next);
  }, [current]);

  const prev = useCallback(() => go((current - 1 + slides.length) % slides.length), [current, go]);
  const next = useCallback(() => go((current + 1) % slides.length), [current, go]);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      setDirection(1);
      setCurrent(c => (c + 1) % slides.length);
    }, INTERVAL);
    return () => clearInterval(id);
  }, [paused]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [prev, next]);

  const variants = {
    enter: { opacity: 0, scale: 1.06 },
    center: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.96 },
  };

  return (
    <div
      ref={containerRef}
      className="slideshow"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <AnimatePresence custom={direction} mode="sync">
        <motion.div
          key={current}
          className="slide"
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 2.2, ease: [0.4, 0, 0.2, 1] }}
        >
          <motion.div
            className="slide-bg"
            style={{
              backgroundImage: `url(${process.env.PUBLIC_URL}${slides[current]})`,
              y: parallaxY,
            }}
          />
          <motion.div className="slide-overlay" style={{ opacity: overlayOpacity }} />
        </motion.div>
      </AnimatePresence>

      {/* Name overlay with scroll parallax */}
      <motion.div className="slide-name" style={{ y: textY }}>
        <motion.p
          className="slide-location"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
        >
          Austin, Texas
        </motion.p>
        <motion.h1
          className="slide-title"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          Burke Ruder
        </motion.h1>
        <motion.p
          className="slide-tagline"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9, delay: 0.55 }}
        >
          Through the lens of a city
        </motion.p>
      </motion.div>

      {/* Arrows */}
      <motion.button
        className="slide-arrow slide-arrow--prev"
        onClick={prev}
        aria-label="Previous"
        whileHover={{ scale: 1.15, x: -3 }}
        whileTap={{ scale: 0.9 }}
      >
        ←
      </motion.button>
      <motion.button
        className="slide-arrow slide-arrow--next"
        onClick={next}
        aria-label="Next"
        whileHover={{ scale: 1.15, x: 3 }}
        whileTap={{ scale: 0.9 }}
      >
        →
      </motion.button>

      {/* Dots */}
      <div className="slide-dots">
        {slides.map((_, i) => (
          <motion.button
            key={i}
            className={`slide-dot ${i === current ? 'slide-dot--active' : ''}`}
            onClick={() => go(i)}
            aria-label={`Go to slide ${i + 1}`}
            whileHover={{ scale: 1.5 }}
            whileTap={{ scale: 0.8 }}
            animate={i === current ? { scale: 1.25 } : { scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          />
        ))}
      </div>
    </div>
  );
}
