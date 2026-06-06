import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

/**
 * Alamo Drafthouse-style intro — plays once on load.
 * Black full-screen. "THE" slams in, then "Interesting Group" fades in,
 * then a lone period crawls in slowly. Fades out to reveal the page.
 */
export default function PageIntro({ onDone }) {
  const [phase, setPhase] = useState('in'); // 'in' | 'period' | 'out' | 'gone'

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('period'), 1000);
    const t2 = setTimeout(() => setPhase('out'),    2600);
    const t3 = setTimeout(() => { setPhase('gone'); onDone(); }, 3400);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onDone]);

  if (phase === 'gone') return null;

  return (
    <AnimatePresence>
      {phase !== 'gone' && (
        <motion.div
          key="intro"
          initial={{ opacity: 1 }}
          animate={{ opacity: phase === 'out' ? 0 : 1 }}
          transition={{ duration: 0.7, ease: 'easeInOut' }}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: '#000',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            pointerEvents: 'none', userSelect: 'none',
          }}
        >
          {/* THE */}
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 1.08 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontSize: 'clamp(56px, 18vw, 180px)',
              fontWeight: 900,
              color: '#fff',
              letterSpacing: '-0.05em',
              lineHeight: 1,
              fontFamily: 'Inter, sans-serif',
            }}
          >
            THE
          </motion.div>

          {/* Interesting Group + period */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.38, ease: [0.16, 1, 0.3, 1] }}
            style={{
              display: 'flex', alignItems: 'flex-end', gap: '0.12em',
              fontSize: 'clamp(14px, 3.8vw, 38px)',
              fontWeight: 300,
              color: 'rgba(255,255,255,0.82)',
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              fontFamily: 'Inter, sans-serif',
              lineHeight: 1,
              marginTop: '0.15em',
            }}
          >
            <span>Interesting Group</span>

            {/* The dramatic period */}
            <motion.span
              initial={{ opacity: 0, x: -6 }}
              animate={phase === 'period' || phase === 'out'
                ? { opacity: 1, x: 0 }
                : { opacity: 0, x: -6 }
              }
              transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
              style={{
                color: '#2d5c3d',
                fontWeight: 900,
                fontSize: '1.4em',
                lineHeight: 0.75,
                display: 'inline-block',
              }}
            >
              .
            </motion.span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
