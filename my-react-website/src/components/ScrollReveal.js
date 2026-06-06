import { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'motion/react';

/**
 * Clip-path wipe-up reveal — identical to the photography scroll reveal.
 * Wraps any child; as the element scrolls into view it wipes up from the bottom.
 */
export function ClipReveal({ children, delay = 0, direction = 'up' }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 95%', 'start 30%'],
  });

  const clipStart =
    direction === 'up'   ? 'inset(100% 0% 0% 0%)' :
    direction === 'down' ? 'inset(0% 0% 100% 0%)' :
    direction === 'left' ? 'inset(0% 100% 0% 0%)' :
                           'inset(0% 0% 0% 100%)';

  const clip = useTransform(scrollYProgress, [0, 1], [clipStart, 'inset(0% 0% 0% 0%)']);
  const smoothClip = useSpring(clip, { stiffness: 60, damping: 20 });
  const y = useTransform(scrollYProgress, [0, 1], [40, 0]);
  const smoothY = useSpring(y, { stiffness: 60, damping: 20 });
  const opacity = useTransform(scrollYProgress, [0, 0.3], [0, 1]);

  return (
    <motion.div
      ref={ref}
      style={{
        clipPath: smoothClip,
        y: smoothY,
        opacity,
        willChange: 'clip-path, transform, opacity',
      }}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Parallax wrapper — children move at a fraction of scroll speed.
 * speed: 0 = fixed, 0.5 = half scroll speed, -0.5 = opposite direction
 */
export function Parallax({ children, speed = 0.3, style = {} }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const range = 120 * speed;
  const y = useTransform(scrollYProgress, [0, 1], [-range, range]);
  const smoothY = useSpring(y, { stiffness: 50, damping: 20 });

  return (
    <motion.div ref={ref} style={{ y: smoothY, ...style }}>
      {children}
    </motion.div>
  );
}

/**
 * Scale-up reveal — element scales from 0.88 to 1 as it enters view.
 */
export function ScaleReveal({ children, delay = 0 }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 90%', 'start 40%'],
  });
  const scale = useTransform(scrollYProgress, [0, 1], [0.88, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [0, 1]);
  const smoothScale = useSpring(scale, { stiffness: 60, damping: 18 });

  return (
    <motion.div ref={ref} style={{ scale: smoothScale, opacity, transformOrigin: 'center top' }}>
      {children}
    </motion.div>
  );
}

/**
 * Scroll progress bar — thin line at top of page.
 */
export function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  return (
    <motion.div
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0,
        height: '2px',
        background: 'var(--accent)',
        transformOrigin: '0%',
        scaleX,
        zIndex: 999,
        boxShadow: '0 0 10px var(--accent)',
      }}
    />
  );
}

/**
 * Horizontal scroll-linked text — text that slides horizontally as you scroll past it.
 */
export function HorizontalScroll({ text, direction = 1 }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const x = useTransform(
    scrollYProgress,
    [0, 1],
    direction > 0 ? ['-5%', '5%'] : ['5%', '-5%']
  );

  const repeated = Array(6).fill(text).join('  ·  ');

  return (
    <div ref={ref} style={{ overflow: 'hidden' }}>
      <motion.div style={{ x, whiteSpace: 'nowrap' }}>
        <span style={{
          fontSize: 'clamp(3rem, 8vw, 7rem)',
          fontWeight: 800,
          letterSpacing: '-0.04em',
          color: 'rgba(255,255,255,0.04)',
          userSelect: 'none',
        }}>
          {repeated}
        </span>
      </motion.div>
    </div>
  );
}

/**
 * Stagger container — wraps children and staggers their whileInView animations.
 */
export function StaggerContainer({ children, staggerDelay = 0.08, style = {} }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      variants={{
        visible: { transition: { staggerChildren: staggerDelay } },
      }}
      style={style}
    >
      {children}
    </motion.div>
  );
}

export const fadeUpItem = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
};
