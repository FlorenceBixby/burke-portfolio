import { motion, useScroll, useTransform } from 'motion/react';
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

function PhotoRow({ src, index }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], ['6%', '-6%']);
  const opacity = useTransform(scrollYProgress, [0, 0.12, 0.88, 1], [0, 1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.15], [0.97, 1]);

  return (
    <motion.div
      ref={ref}
      className="scroll-photo-row"
      style={{ opacity, scale }}
    >
      <div className="scroll-photo-label">
        <span className="scroll-photo-num">{String(index + 1).padStart(2, '0')}</span>
        <span className="scroll-photo-city">Downtown Austin</span>
      </div>

      <div className="scroll-photo-frame">
        <motion.img
          src={src}
          alt=""
          loading="lazy"
          className="scroll-photo-img"
          style={{ y }}
        />
      </div>
    </motion.div>
  );
}

export default function DowntownAustin() {
  return (
    <div className="scroll-gallery-page">
      <div className="gallery-header">
        <motion.p
          className="section-label"
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          Portfolio
        </motion.p>
        <motion.h1
          className="gallery-title"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          Downtown Austin
        </motion.h1>
        <motion.p
          className="gallery-count"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          {photos.length} photographs — scroll to explore
        </motion.p>
      </div>

      <div className="scroll-photo-feed">
        {photos.map((src, i) => (
          <PhotoRow key={src} src={src} index={i} />
        ))}
      </div>

      <div className="footer" style={{ textAlign: 'center' }}>
        © {new Date().getFullYear()} Burke Ruder · All rights reserved
      </div>
    </div>
  );
}
