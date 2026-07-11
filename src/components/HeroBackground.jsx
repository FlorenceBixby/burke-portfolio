import { motion } from 'framer-motion'

export default function HeroBackground() {
  return (
    <div
      aria-hidden="true"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}
    >
      {/* Dominant shape — deep burgundy circle, cropped bottom-right */}
      <motion.div
        animate={{ x: [0, 22, 0], y: [0, 14, 0], scale: [1, 1.018, 1] }}
        transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          bottom: '-28%', right: '-16%',
          width: 560, height: 560,
          borderRadius: '50%',
          background: '#5C1A1A',
          opacity: 0.92,
        }}
      />

      {/* Secondary — rotated square, aged gold */}
      <motion.div
        animate={{ x: [0, 8, 0], y: [0, -10, 0], rotate: [12, 17, 12] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          bottom: '30%', right: '20%',
          width: 48, height: 48,
          background: '#8B6914',
          opacity: 0.85,
        }}
      />

      {/* Small accent dot — tarnished brass */}
      <motion.div
        animate={{ x: [0, -12, 0], y: [0, 16, 0] }}
        transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut', delay: 5 }}
        style={{
          position: 'absolute',
          top: '15%', right: '35%',
          width: 16, height: 16,
          borderRadius: '50%',
          background: '#A07830',
          opacity: 0.72,
        }}
      />

      {/* Precision rule */}
      <div style={{
        position: 'absolute',
        bottom: '19%', left: 0, right: 0,
        height: 1,
        background: 'linear-gradient(90deg, transparent, rgba(180,155,100,0.1) 25%, rgba(180,155,100,0.1) 58%, transparent)',
      }} />

      {/* Film grain */}
      <div style={{
        position: 'absolute', inset: 0,
        opacity: 0.04,
        backgroundImage: `url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='200' height='200' filter='url(%23n)'/></svg>")`,
      }} />

      {/* Vignette */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at 30% 50%, transparent 40%, rgba(5,4,2,0.65) 100%)',
      }} />
    </div>
  )
}
