import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

/**
 * Dramatic word-by-word intro.
 * THE — pause — INTERESTING — pause — GROUP — pause — . (green) — fade out.
 */
export default function PageIntro({ onDone }) {
  const [step, setStep] = useState(0);
  // step 0 = blank, 1 = THE, 2 = INTERESTING, 3 = GROUP, 4 = period, 5 = fade out, 6 = gone

  useEffect(() => {
    const timings = [
      120,   // → show THE
      620,   // → show INTERESTING
      620,   // → show GROUP
      700,   // → show period
      1000,  // → fade out
      700,   // → gone / onDone
    ];
    const timeouts = [];
    let cumulative = 0;
    timings.forEach((delay, i) => {
      cumulative += delay;
      timeouts.push(setTimeout(() => setStep(i + 1), cumulative));
    });
    timeouts.push(setTimeout(() => onDone(), cumulative + 10));
    return () => timeouts.forEach(clearTimeout);
  }, [onDone]);

  if (step === 6) return null;

  const wordStyle = {
    fontFamily: 'Inter, sans-serif',
    lineHeight: 1,
    display: 'block',
    overflow: 'hidden',
  };

  const popIn = {
    initial: { opacity: 0, scale: 1.18, y: 12, filter: 'blur(6px)' },
    animate: { opacity: 1, scale: 1,    y: 0,  filter: 'blur(0px)' },
    transition: { duration: 0.38, ease: [0.16, 1, 0.3, 1] },
  };

  return (
    <AnimatePresence>
      {step < 6 && (
        <motion.div
          key="intro"
          initial={{ opacity: 1 }}
          animate={{ opacity: step === 5 ? 0 : 1 }}
          transition={{ duration: 0.55, ease: 'easeInOut' }}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: '#000',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            gap: '0.18em',
            pointerEvents: 'none', userSelect: 'none',
          }}
        >
          {/* THE */}
          <AnimatePresence>
            {step >= 1 && (
              <motion.span
                key="the"
                {...popIn}
                style={{
                  ...wordStyle,
                  fontSize: 'clamp(60px, 19vw, 200px)',
                  fontWeight: 900,
                  color: '#ffffff',
                  letterSpacing: '-0.05em',
                }}
              >
                THE
              </motion.span>
            )}
          </AnimatePresence>

          {/* INTERESTING */}
          <AnimatePresence>
            {step >= 2 && (
              <motion.span
                key="interesting"
                {...popIn}
                style={{
                  ...wordStyle,
                  fontSize: 'clamp(18px, 4.8vw, 52px)',
                  fontWeight: 300,
                  color: 'rgba(255,255,255,0.78)',
                  letterSpacing: '0.28em',
                  textTransform: 'uppercase',
                }}
              >
                Interesting
              </motion.span>
            )}
          </AnimatePresence>

          {/* GROUP + period */}
          <AnimatePresence>
            {step >= 3 && (
              <motion.span
                key="group"
                {...popIn}
                style={{
                  ...wordStyle,
                  display: 'flex', alignItems: 'flex-end', gap: '0.06em',
                  fontSize: 'clamp(18px, 4.8vw, 52px)',
                  fontWeight: 300,
                  color: 'rgba(255,255,255,0.78)',
                  letterSpacing: '0.28em',
                  textTransform: 'uppercase',
                }}
              >
                Group
                {/* Period — appears on its own beat */}
                <AnimatePresence>
                  {step >= 4 && (
                    <motion.span
                      key="period"
                      initial={{ opacity: 0, x: -8, scale: 1.4 }}
                      animate={{ opacity: 1, x: 0,  scale: 1   }}
                      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                      style={{
                        color: '#2d5c3d',
                        fontWeight: 900,
                        fontSize: '1.5em',
                        lineHeight: 0.72,
                        letterSpacing: 0,
                        display: 'inline-block',
                      }}
                    >
                      .
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
