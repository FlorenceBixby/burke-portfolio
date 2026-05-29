import { motion, useInView, AnimatePresence } from 'motion/react';
import { useRef, useState } from 'react';

const photos = [
  { src: '/photos/photo5.jpg', caption: 'Empty Seats', location: 'Austin, TX' },
  { src: '/photos/photo3.jpg', caption: 'Game Day', location: 'Austin, TX' },
  { src: '/photos/photo1.jpg', caption: 'First to the Finish', location: 'Austin, TX' },
  { src: '/photos/photo2.jpg', caption: 'Full Sprint', location: 'Austin, TX' },
];

function PhotoCard({ photo, index, onClick }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      className="photo-card"
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6, transition: { duration: 0.25 } }}
      onClick={() => onClick(photo)}
    >
      <div className="photo-card-img-wrap">
        <motion.img
          src={photo.src}
          alt={photo.caption}
          className="photo-card-img"
          whileHover={{ scale: 1.04, transition: { duration: 0.4 } }}
        />
        <div className="photo-card-overlay">
          <span className="photo-card-expand">↗ View</span>
        </div>
      </div>
      <div className="photo-card-meta">
        <span className="photo-card-caption">{photo.caption}</span>
        <span className="photo-card-location">{photo.location}</span>
      </div>
    </motion.div>
  );
}

function Lightbox({ photo, onClose }) {
  return (
    <AnimatePresence>
      {photo && (
        <motion.div
          className="lightbox"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={onClose}
        >
          <motion.div
            className="lightbox-inner"
            initial={{ scale: 0.88, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            onClick={e => e.stopPropagation()}
          >
            <img src={photo.src} alt={photo.caption} className="lightbox-img" />
            <div className="lightbox-caption">
              <span>{photo.caption}</span>
              <span className="lightbox-location">{photo.location}</span>
            </div>
            <button className="lightbox-close" onClick={onClose}>✕</button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function Photos() {
  const [selected, setSelected] = useState(null);

  return (
    <section id="photos" className="photos-section">
      <div className="section-inner">
        <motion.p
          className="section-label"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          Photography
        </motion.p>
        <motion.h2
          className="section-heading"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          Through the <span className="hero-accent">lens</span>.
        </motion.h2>
        <motion.p
          className="photos-sub"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          Sales is about the big picture. Photography is about the fine details.
        </motion.p>

        <div className="photo-grid">
          {photos.map((p, i) => (
            <PhotoCard key={p.src} photo={p} index={i} onClick={setSelected} />
          ))}
        </div>
      </div>

      <Lightbox photo={selected} onClose={() => setSelected(null)} />
    </section>
  );
}
