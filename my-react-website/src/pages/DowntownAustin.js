import { motion, useInView, AnimatePresence } from 'motion/react';
import { useRef, useState } from 'react';

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

function PhotoItem({ src, index, onClick }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });

  return (
    <motion.div
      ref={ref}
      className="gallery-item"
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: (index % 4) * 0.06, ease: [0.22, 1, 0.36, 1] }}
      onClick={() => onClick(index)}
      whileHover="hover"
    >
      <motion.img
        src={src}
        alt=""
        loading="lazy"
        variants={{ hover: { scale: 1.04 } }}
        transition={{ duration: 0.45 }}
      />
      <motion.div
        className="gallery-item-overlay"
        variants={{ hover: { opacity: 1 } }}
        initial={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <span>↗</span>
      </motion.div>
    </motion.div>
  );
}

function Lightbox({ index, onClose, onPrev, onNext }) {
  const photo = index !== null ? photos[index] : null;
  return (
    <AnimatePresence>
      {photo && (
        <motion.div
          className="lightbox"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
        >
          <motion.div
            className="lightbox-inner"
            initial={{ scale: 0.93, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            onClick={e => e.stopPropagation()}
          >
            <AnimatePresence mode="wait">
              <motion.img
                key={photo}
                src={photo}
                alt=""
                className="lightbox-img"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
              />
            </AnimatePresence>
            <div className="lightbox-caption">
              <span className="lightbox-location">Downtown Austin</span>
              <span>{index + 1} / {photos.length}</span>
            </div>
            <button className="lightbox-close" onClick={onClose}>✕</button>
            <button className="lightbox-prev" onClick={onPrev}>←</button>
            <button className="lightbox-next" onClick={onNext}>→</button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function DowntownAustin() {
  const [selected, setSelected] = useState(null);
  const prev = () => setSelected(i => (i - 1 + photos.length) % photos.length);
  const next = () => setSelected(i => (i + 1) % photos.length);

  return (
    <div className="gallery-page">
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
          {photos.length} photographs
        </motion.p>
      </div>

      <div className="gallery-grid">
        {photos.map((src, i) => (
          <PhotoItem key={src} src={src} index={i} onClick={setSelected} />
        ))}
      </div>

      <Lightbox
        index={selected}
        onClose={() => setSelected(null)}
        onPrev={prev}
        onNext={next}
      />
    </div>
  );
}
