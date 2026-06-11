import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Nav from './components/Nav.jsx'
import Home from './pages/Home.jsx'
import Portfolio from './pages/Portfolio.jsx'
import About from './pages/About.jsx'
import Contact from './pages/Contact.jsx'
import LogoShowcase from './pages/LogoShowcase.jsx'
import Footer from './components/Footer.jsx'

// ── Dot Grid assembled inline so the loader has no import side-effects ──
// Each dot lights up individually — the mark "builds" before your eyes.
const DOT_PATTERN = [true, true, false, true, false, true, false, true, true]
const ACCENT = '#2d5c3d'
const GHOST  = 'rgba(255,255,255,0.14)'

function LoaderDots() {
  return (
    <svg width="54" height="54" viewBox="0 0 54 54" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* 3×3 grid: r=7, step=20, starts at 7 */}
      {DOT_PATTERN.map((filled, i) => {
        const col = i % 3
        const row = Math.floor(i / 3)
        return (
          <motion.circle
            key={i}
            cx={7 + col * 20}
            cy={7 + row * 20}
            r={7}
            fill={filled ? ACCENT : GHOST}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              delay: 0.15 + i * 0.07,
              type: 'spring',
              stiffness: 500,
              damping: 22,
            }}
          />
        )
      })}
    </svg>
  )
}

// ── Alamo-style word slam ────────────────────────────────────────────────
// Each word hits from a different direction with a hard spring snap.
// This is the Alamo Drafthouse DNA: theatrical, punchy, cinematic.
const slamWords = [
  {
    text: 'THE',
    from: { x: 160, y: 0, rotate: -4 },
    delay: 0.55,
    style: {
      fontSize: 'clamp(72px, 13vw, 140px)',
      fontWeight: 900,
      letterSpacing: '-0.05em',
      color: '#FFFFFF',
      lineHeight: 1,
    },
  },
  {
    text: 'INTERESTING',
    from: { x: -180, y: 0, rotate: 2 },
    delay: 0.85,
    style: {
      fontSize: 'clamp(18px, 3.8vw, 42px)',
      fontWeight: 700,
      letterSpacing: '0.18em',
      color: '#FFFFFF',
      lineHeight: 1,
    },
  },
  {
    text: 'GROUP',
    from: { x: 0, y: -80, rotate: 0 },
    delay: 1.05,
    style: {
      fontSize: 'clamp(18px, 3.8vw, 42px)',
      fontWeight: 300,
      letterSpacing: '0.42em',
      color: ACCENT,
      lineHeight: 1,
    },
  },
]

// Accent flash on impact — a single frame punch of color
function SlamWord({ word }) {
  return (
    <motion.div
      initial={{ x: word.from.x, y: word.from.y, rotate: word.from.rotate, opacity: 0 }}
      animate={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
      transition={{
        delay: word.delay,
        type: 'spring',
        stiffness: 480,
        damping: 26,
        opacity: { duration: 0.01, delay: word.delay },
      }}
      style={word.style}
    >
      {word.text}
    </motion.div>
  )
}

// Thin horizontal rule that slashes across like a film clapperboard line
function SlashLine() {
  return (
    <motion.div
      initial={{ scaleX: 0 }}
      animate={{ scaleX: 1 }}
      transition={{ delay: 0.72, duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      style={{
        height: 2,
        background: ACCENT,
        width: '100%',
        transformOrigin: 'left',
        marginTop: 4,
        marginBottom: 10,
      }}
    />
  )
}

export default function App() {
  const [page, setPage] = useState('home')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 2400)
    return () => clearTimeout(t)
  }, [])

  const navigate = (p) => {
    setPage(p)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
      {/* ── Loading screen ──────────────────────────────────────────── */}
      <AnimatePresence>
        {loading && (
          <motion.div
            className="loader"
            initial={{ opacity: 1 }}
            exit={{
              y: '-100%',
              transition: { duration: 0.55, ease: [0.76, 0, 0.24, 1] },
            }}
            style={{ flexDirection: 'column', gap: 0, overflow: 'hidden' }}
          >
            {/* Scanline texture overlay — cinematic grit */}
            <div style={{
              position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1,
              backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.015) 2px, rgba(255,255,255,0.015) 4px)',
            }} />

            {/* Content */}
            <div style={{
              position: 'relative', zIndex: 2,
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: 18, padding: '0 5vw', textAlign: 'center',
            }}>
              {/* Dot grid assembles first */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.01 }}
              >
                <LoaderDots />
              </motion.div>

              {/* Wordmark slams in word by word */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                {slamWords.map((w, i) => <SlamWord key={i} word={w} />)}
              </div>

              {/* Slash line */}
              <div style={{ width: 'clamp(180px, 30vw, 320px)' }}>
                <SlashLine />
              </div>

              {/* Tagline blinks in last — Alamo-style footer text */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.45 }}
                transition={{ delay: 1.35, duration: 0.4 }}
                style={{
                  fontSize: 10, fontWeight: 500, letterSpacing: '0.22em',
                  textTransform: 'uppercase', color: '#fff',
                }}
              >
                Technology Advisor
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── App shell ───────────────────────────────────────────────── */}
      <AnimatePresence>
        {!loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <Nav page={page} navigate={navigate} />
            <AnimatePresence mode="wait">
              <motion.div
                key={page}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
              >
                <div className="page">
                  {page === 'home'      && <Home navigate={navigate} />}
                  {page === 'portfolio' && <Portfolio navigate={navigate} />}
                  {page === 'about'     && <About navigate={navigate} />}
                  {page === 'contact'   && <Contact />}
                  {page === 'logos'     && <LogoShowcase navigate={navigate} />}
                </div>
              </motion.div>
            </AnimatePresence>
            <Footer navigate={navigate} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
