import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Nav from './components/Nav.jsx'
import Home from './pages/Home.jsx'
import Portfolio from './pages/Portfolio.jsx'
import About from './pages/About.jsx'
import Contact from './pages/Contact.jsx'
import Privacy from './pages/Privacy.jsx'
import Blog from './pages/Blog.jsx'
import Admin from './pages/Admin.jsx'
import LogoShowcase from './pages/LogoShowcase.jsx'
import Footer from './components/Footer.jsx'

const ACCENT = '#6B1F1F'

// ── Intro screen — Alamo Drafthouse style ────────────────────────────────
// Black full-screen. "THE" drops in, "Interesting Group" fades up,
// then the green period crawls in slowly. Slides up to reveal the page.
function Loader() {
  const [showPeriod, setShowPeriod] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setShowPeriod(true), 1000)
    return () => clearTimeout(t)
  }, [])

  return (
    <motion.div
      className="loader"
      initial={{ opacity: 1 }}
      exit={{ y: '-100%', transition: { duration: 0.55, ease: [0.76, 0, 0.24, 1] } }}
      style={{ flexDirection: 'column', gap: 0, overflow: 'hidden' }}
    >
      {/* Scanline grit */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1,
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.015) 2px, rgba(255,255,255,0.015) 4px)',
      }} />

      {/* Content */}
      <div style={{
        position: 'relative', zIndex: 2,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '0 5vw', textAlign: 'center',
      }}>
        {/* THE — drops from above */}
        <motion.div
          initial={{ opacity: 0, y: -40, scale: 1.08 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          style={{
            fontSize: 'clamp(72px, 18vw, 180px)',
            fontWeight: 900,
            color: '#fff',
            letterSpacing: '-0.05em',
            lineHeight: 1,
          }}
        >
          THE
        </motion.div>

        {/* Interesting Group + green period */}
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
            lineHeight: 1,
            marginTop: '0.15em',
          }}
        >
          <span>Interesting Group</span>

          {/* The dramatic green period */}
          <motion.span
            initial={{ opacity: 0, x: -6 }}
            animate={showPeriod ? { opacity: 1, x: 0 } : { opacity: 0, x: -6 }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
            style={{
              color: ACCENT,
              fontWeight: 900,
              fontSize: '1.4em',
              lineHeight: 0.75,
              display: 'inline-block',
            }}
          >
            .
          </motion.span>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default function App() {
  const [page, setPage] = useState('home')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 2800)
    return () => clearTimeout(t)
  }, [])

  const navigate = (p) => {
    setPage(p)
    window.location.hash = p === 'home' ? '' : p
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  useEffect(() => {
    const hash = window.location.hash.replace('#', '')
    if (hash) setPage(hash)
  }, [])

  return (
    <>
      {/* ── Intro screen ─────────────────────────────────────────── */}
      <AnimatePresence>
        {loading && <Loader key="loader" />}
      </AnimatePresence>

      {/* ── App shell ────────────────────────────────────────────── */}
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
                  {page === 'privacy'   && <Privacy />}
                  {page === 'logos'     && <LogoShowcase navigate={navigate} />}
                  {page === 'blog'      && <Blog />}
                  {page === 'admin'     && <Admin />}
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
