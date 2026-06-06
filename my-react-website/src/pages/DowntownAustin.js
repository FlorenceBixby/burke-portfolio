import { motion, useScroll, useTransform, useSpring } from 'motion/react';
import { useRef } from 'react';

const photos = [
  '/photos/3R2A5320.jpg', '/photos/3R2A5322.jpg', '/photos/3R2A5327.jpg',
  '/photos/3R2A5329.jpg', '/photos/3R2A5330.jpg', '/photos/3R2A5331.jpg',
  '/photos/3R2A5332.jpg', '/photos/3R2A5334.jpg', '/photos/3R2A5335.jpg',
  '/photos/3R2A5336.jpg', '/photos/3R2A5338.jpg', '/photos/3R2A5340.jpg',
  '/photos/3R2A5341.jpg', '/photos/3R2A5342.jpg', '/photos/3R2A5344.jpg',
  '/photos/3R2A5345.jpg', '/photos/3R2A5346.jpg', '/photos/3R2A5347.jpg',
  '/photos/3R2A5349.jpg', '/photos/3R2A5351.jpg', '/photos/3R2A5352.jpg',
  '/photos/3R2A5354.jpg', '/photos/3R2A5356.jpg', '/photos/3R2A5357.jpg',
  '/photos/3R2A5361.jpg', '/photos/3R2A5362.jpg', '/photos/3R2A5363.jpg',
  '/photos/3R2A5365.jpg', '/photos/3R2A5370.jpg', '/photos/3R2A5372.jpg',
  '/photos/3R2A5375.jpg', '/photos/3R2A5378.jpg', '/photos/3R2A5381.jpg',
  '/photos/3R2A5382.jpg', '/photos/3R2A5385.jpg', '/photos/3R2A5386.jpg',
  '/photos/3R2A5387.jpg', '/photos/3R2A5392.jpg', '/photos/3R2A5399.jpg',
  '/photos/3R2A5403.jpg', '/photos/3R2A5406.jpg',
];

/* ── Sticky progress bar at top ── */
function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  return (
    <motion.div
      className="scroll-progress-bar"
      style={{ scaleX, transformOrigin: 'left' }}
    />
  );
}

/* ── Single full-screen scroll photo ── */
function ScrollPhoto({ src, index }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const imgY = useTransform(scrollYProgress, [0, 1], ['8%', '-8%']);
  const smoothImgY = useSpring(imgY, { stiffness: 60, damping: 20 });
  const opacity = useTransform(scrollYProgress, [0, 0.18, 0.82, 1], [0, 1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.18, 0.82, 1], [1.08, 1, 1, 1.04]);
  const captionY = useTransform(scrollYProgress, [0.12, 0.28], [30, 0]);
  const captionOpacity = useTransform(scrollYProgress, [0.12, 0.28, 0.78, 0.92], [0, 1, 1, 0]);

  const isOdd = index % 2 !== 0;

  return (
    <div ref={ref} className="scroll-photo-section">
      <motion.div className="scroll-photo-frame" style={{ opacity, scale }}>
        <div className="scroll-photo-bg-wrap">
          <motion.div
            className="scroll-photo-bg"
            style={{
              backgroundImage: `url(${process.env.PUBLIC_URL}${src})`,
              y: smoothImgY,
            }}
          />
          <div className="scroll-photo-vignette" />
        </div>
        <motion.div
          className={`scroll-photo-caption ${isOdd ? 'scroll-photo-caption--right' : ''}`}
          style={{ y: captionY, opacity: captionOpacity }}
        >
          <span className="scroll-photo-index">{String(index + 1).padStart(2, '0')}</span>
          <span className="scroll-photo-location">Downtown Austin</span>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default function DowntownAustin() {
  return (
    <div className="gallery-scroll-page">
      <ScrollProgress />

      {/* Hero header */}
      <motion.div
        className="gallery-scroll-header"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2 }}
      >
        <motion.p
          className="section-label"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Portfolio
        </motion.p>
        <motion.h1
          className="gallery-scroll-title"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          Downtown Austin
        </motion.h1>
        <motion.p
          className="gallery-scroll-sub"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.55 }}
        >
          {photos.length} photographs — scroll to explore
        </motion.p>
        <motion.div
          className="gallery-scroll-hint"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.9 }}
        >
          <motion.span
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
          >
            ↓
          </motion.span>
        </motion.div>
      </motion.div>

      {/* Scroll photos */}
      {photos.map((src, i) => (
        <ScrollPhoto key={src} src={src} index={i} />
      ))}

      {/* Footer */}
      <motion.div
        className="gallery-scroll-footer"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
      >
        <p>End of series &mdash; {photos.length} photographs</p>
      </motion.div>
    </div>
  );
}
