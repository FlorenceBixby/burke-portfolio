import { motion, useInView, AnimatePresence } from 'motion/react';
import { useRef, useState } from 'react';
import Birds from '../components/Birds';

const photos = [
  { src: '/photos/3R2A5336.jpg', w: 'wide' },
  { src: '/photos/3R2A5382.jpg', w: 'tall' },
  { src: '/photos/3R2A5354.jpg', w: 'normal' },
  { src: '/photos/3R2A5357.jpg', w: 'normal' },
  { src: '/photos/3R2A5320.jpg', w: 'wide' },
  { src: '/photos/3R2A5370.jpg', w: 'normal' },
  { src: '/photos/3R2A5342.jpg', w: 'tall' },
  { src: '/photos/3R2A5349.jpg', w: 'normal' },
  { src: '/photos/3R2A5363.jpg', w: 'wide' },
  { src: '/photos/3R2A5385.jpg', w: 'normal' },
  { src: '/photos/3R2A5386.jpg', w: 'normal' },
  { src: '/photos/3R2A5387.jpg', w: 'tall' },
  { src: '/photos/3R2A5392.jpg', w: 'wide' },
  { src: '/photos/3R2A5372.jpg', w: 'normal' },
  { src: '/photos/3R2A5381.jpg', w: 'normal' },
  { src: '/photos/3R2A5399.jpg', w: 'wide' },
  { src: '/photos/3R2A5352.jpg', w: 'tall' },
  { src: '/photos/3R2A5340.jpg', w: 'normal' },
  { src: '/photos/3R2A5341.jpg', w: 'normal' },
  { src: '/photos/3R2A5344.jpg', w: 'wide' },
  { src: '/photos/3R2A5322.jpg', w: 'normal' },
  { src: '/photos/3R2A5327.jpg', w: 'normal' },
  { src: '/photos/3R2A5329.jpg', w: 'tall' },
  { src: '/photos/3R2A5330.jpg', w: 'wide' },
  { src: '/photos/3R2A5331.jpg', w: 'normal' },
  { src: '/photos/3R2A5332.jpg', w: 'normal' },
  { src: '/photos/3R2A5334.jpg', w: 'wide' },
  { src: '/photos/3R2A5335.jpg', w: 'normal' },
  { src: '/photos/3R2A5338.jpg', w: 'normal' },
  { src: '/photos/3R2A5345.jpg', w: 'tall' },
  { src: '/photos/3R2A5346.jpg', w: 'normal' },
  { src: '/photos/3R2A5347.jpg', w: 'wide' },
  { src: '/photos/3R2A5351.jpg', w: 'normal' },
  { src: '/photos/3R2A5356.jpg', w: 'normal' },
  { src: '/photos/3R2A5361.jpg', w: 'wide' },
  { src: '/photos/3R2A5362.jpg', w: 'normal' },
  { src: '/photos/3R2A5365.jpg', w: 'normal' },
  { src: '/photos/3R2A5375.jpg', w: 'tall' },
  { src: '/photos/3R2A5378.jpg', w: 'wide' },
  { src: '/photos/3R2A5403.jpg', w: 'normal' },
  { src: '/photos/3R2A5406.jpg', w: 'normal' },
];

function PhotoItem({ photo, index, onClick }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      className={`grid-photo grid-photo--${photo.w}`}
      initial={{ opacity: 0, scale: 0.97 }}
      animate={inView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.7, delay: (index % 4) * 0.08, ease: [0.22, 1, 0.36, 1] }}
      onClick={() => onClick(index)}
      whileHover="hover"
    >
      <motion.img
        src={photo.src}
        alt=""
        loading="lazy"
        variants={{ hover: { scale: 1.04 } }}
        transition={{ duration: 0.5 }}
      />
      <motion.div
        className="grid-photo-overlay"
        variants={{ hover: { opacity: 1 } }}
        initial={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
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
                key={photo.src}
                src={photo.src}
                alt=""
                className="lightbox-img"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
              />
            </AnimatePresence>
            <div className="lightbox-caption">
              <span className="lightbox-location">Austin, TX</span>
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

export default function Home() {
  const [selectedIndex, setSelectedIndex] = useState(null);
  const handlePrev = () => setSelectedIndex(i => (i - 1 + photos.length) % photos.length);
  const handleNext = () => setSelectedIndex(i => (i + 1) % photos.length);

  return (
    <div className="home">
      {/* Full-screen hero */}
      <section className="home-hero">
        <Birds />
        <div
          className="home-hero-bg"
          style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/hero-bg.jpg)` }}
        />
        <div className="home-hero-overlay" />
        <motion.div
          className="home-hero-text"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.p
            className="home-hero-location"
            initial={{ opacity: 0, letterSpacing: '0.5em' }}
            animate={{ opacity: 1, letterSpacing: '0.25em' }}
            transition={{ duration: 1.2, delay: 0.6 }}
          >
            Austin, Texas
          </motion.p>
          <motion.h1
            className="home-hero-title"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.9, delay: 0.8 }}
          >
            Burke Ruder
          </motion.h1>
          <motion.p
            className="home-hero-tagline"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.9, delay: 1.1 }}
          >
            Through the lens of a city
          </motion.p>
        </motion.div>
        <motion.div
          className="home-scroll-hint"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8, duration: 0.8 }}
        >
          <motion.span
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
          >
            ↓
          </motion.span>
        </motion.div>
      </section>

      {/* Masonry photo grid */}
      <section className="home-grid">
        <div className="photo-masonry">
          {photos.map((p, i) => (
            <PhotoItem key={p.src} photo={p} index={i} onClick={setSelectedIndex} />
          ))}
        </div>
      </section>

      <footer className="home-footer">
        <p>© 2026 Burke Ruder · Austin, TX</p>
        <div className="home-footer-links">
          <a href="https://www.linkedin.com/in/burke-ruder/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
          <a href="mailto:burke.ruder@gmail.com">Email</a>
        </div>
      </footer>

      <Lightbox
        index={selectedIndex}
        onClose={() => setSelectedIndex(null)}
        onPrev={handlePrev}
        onNext={handleNext}
      />
    </div>
  );
}
