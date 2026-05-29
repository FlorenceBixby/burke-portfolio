import { motion, useInView, AnimatePresence } from 'motion/react';
import { useRef, useState } from 'react';

const photos = [
  { src: '/photos/3R2A5336.jpg', caption: 'Empty Seats' },
  { src: '/photos/3R2A5322.jpg', caption: 'Seven Stories Up' },
  { src: '/photos/3R2A5320.jpg', caption: 'Sidewalk' },
  { src: '/photos/3R2A5334.jpg', caption: 'Passage' },
  { src: '/photos/3R2A5335.jpg', caption: 'After Hours' },
  { src: '/photos/3R2A5331.jpg', caption: 'Corner Light' },
  { src: '/photos/3R2A5330.jpg', caption: 'Still Life' },
  { src: '/photos/3R2A5332.jpg', caption: 'Urban Frame' },
  { src: '/photos/3R2A5327.jpg', caption: 'Mid-Block' },
  { src: '/photos/3R2A5329.jpg', caption: 'The Walk' },
  { src: '/photos/3R2A5338.jpg', caption: 'Contrast' },
  { src: '/photos/3R2A5340.jpg', caption: 'Punch Bowl Social' },
  { src: '/photos/3R2A5341.jpg', caption: 'Night Scene' },
  { src: '/photos/3R2A5342.jpg', caption: 'Neon & Dark' },
  { src: '/photos/3R2A5344.jpg', caption: 'Glass & Steel' },
  { src: '/photos/3R2A5345.jpg', caption: 'Open Sign' },
  { src: '/photos/3R2A5346.jpg', caption: 'Backlit' },
  { src: '/photos/3R2A5347.jpg', caption: 'City Geometry' },
  { src: '/photos/3R2A5349.jpg', caption: 'Long Shadow' },
  { src: '/photos/3R2A5351.jpg', caption: 'Quiet Street' },
  { src: '/photos/3R2A5352.jpg', caption: 'Downtown Drift' },
  { src: '/photos/3R2A5354.jpg', caption: 'The Capitol' },
  { src: '/photos/3R2A5356.jpg', caption: 'Congress Ave' },
  { src: '/photos/3R2A5357.jpg', caption: 'Texas Capitol' },
  { src: '/photos/3R2A5361.jpg', caption: 'Crosswalk' },
  { src: '/photos/3R2A5362.jpg', caption: 'Late Afternoon' },
  { src: '/photos/3R2A5363.jpg', caption: 'The Grid' },
  { src: '/photos/3R2A5365.jpg', caption: 'Street Level' },
  { src: '/photos/3R2A5370.jpg', caption: 'Entrance' },
  { src: '/photos/3R2A5372.jpg', caption: 'Indeed Tower' },
  { src: '/photos/3R2A5375.jpg', caption: 'Visitor Parking' },
  { src: '/photos/3R2A5378.jpg', caption: 'Looking Up' },
  { src: '/photos/3R2A5381.jpg', caption: 'Storefront' },
  { src: '/photos/3R2A5382.jpg', caption: 'Industrial' },
  { src: '/photos/3R2A5385.jpg', caption: 'Structure' },
  { src: '/photos/3R2A5386.jpg', caption: 'Depth' },
  { src: '/photos/3R2A5387.jpg', caption: 'Compression' },
  { src: '/photos/3R2A5392.jpg', caption: 'Wide Open' },
  { src: '/photos/3R2A5399.jpg', caption: 'Evening Light' },
  { src: '/photos/3R2A5403.jpg', caption: 'The Corner' },
  { src: '/photos/3R2A5406.jpg', caption: 'End of Day' },
];

function PhotoCard({ photo, index, onClick }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });

  return (
    <motion.div
      ref={ref}
      className="photo-card"
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: (index % 6) * 0.07, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      onClick={() => onClick(index)}
    >
      <div className="photo-card-img-wrap">
        <motion.img
          src={photo.src}
          alt={photo.caption}
          className="photo-card-img"
          loading="lazy"
          whileHover={{ scale: 1.05, transition: { duration: 0.4 } }}
        />
        <div className="photo-card-overlay">
          <span className="photo-card-expand">↗ View</span>
        </div>
      </div>
      <div className="photo-card-meta">
        <span className="photo-card-caption">{photo.caption}</span>
        <span className="photo-card-location">Austin, TX</span>
      </div>
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
          transition={{ duration: 0.25 }}
          onClick={onClose}
        >
          <motion.div
            className="lightbox-inner"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.93, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            onClick={e => e.stopPropagation()}
          >
            <AnimatePresence mode="wait">
              <motion.img
                key={photo.src}
                src={photo.src}
                alt={photo.caption}
                className="lightbox-img"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              />
            </AnimatePresence>
            <div className="lightbox-caption">
              <span>{photo.caption}</span>
              <span className="lightbox-location">Austin, TX · {index + 1} / {photos.length}</span>
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

export default function Photos() {
  const [selectedIndex, setSelectedIndex] = useState(null);

  const handlePrev = () => setSelectedIndex(i => (i - 1 + photos.length) % photos.length);
  const handleNext = () => setSelectedIndex(i => (i + 1) % photos.length);

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
            <PhotoCard key={p.src} photo={p} index={i} onClick={setSelectedIndex} />
          ))}
        </div>
      </div>

      <Lightbox
        index={selectedIndex}
        onClose={() => setSelectedIndex(null)}
        onPrev={handlePrev}
        onNext={handleNext}
      />
    </section>
  );
}
