import { useEffect, useRef } from 'react'

const COUNT     = 72          // number of particles
const CONNECT   = 130         // px — max distance to draw a line
const SPEED     = 0.35        // pixels per frame
const DOT_R     = 1.6         // dot radius
const DOT_ALPHA = 0.22        // dot opacity
const LINE_ALPHA = 0.09       // line max opacity (fades by distance)
const ACCENT_RATIO = 0.12     // ~12% of dots are terracotta

const DARK   = '29,29,31'
const WARM   = '196,98,45'

export default function HeroBackground() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const dpr = window.devicePixelRatio || 1
    let W = canvas.offsetWidth
    let H = canvas.offsetHeight

    const resize = () => {
      W = canvas.offsetWidth
      H = canvas.offsetHeight
      canvas.width  = W * dpr
      canvas.height = H * dpr
      ctx.scale(dpr, dpr)
    }
    resize()

    // Build particles — a small fraction are accent-colored
    const particles = Array.from({ length: COUNT }, (_, i) => ({
      x:  Math.random() * W,
      y:  Math.random() * H,
      vx: (Math.random() - 0.5) * SPEED * 2,
      vy: (Math.random() - 0.5) * SPEED * 2,
      warm: i < COUNT * ACCENT_RATIO,
    }))

    let raf
    const loop = () => {
      ctx.clearRect(0, 0, W, H)

      // Connection lines first (drawn below dots)
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx   = particles[i].x - particles[j].x
          const dy   = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist >= CONNECT) continue

          const t = 1 - dist / CONNECT          // 1 = close, 0 = far
          const color = (particles[i].warm || particles[j].warm) ? WARM : DARK
          ctx.beginPath()
          ctx.strokeStyle = `rgba(${color},${(t * LINE_ALPHA).toFixed(3)})`
          ctx.lineWidth   = 0.6
          ctx.moveTo(particles[i].x, particles[i].y)
          ctx.lineTo(particles[j].x, particles[j].y)
          ctx.stroke()
        }
      }

      // Dots
      particles.forEach(p => {
        ctx.beginPath()
        ctx.arc(p.x, p.y, DOT_R, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${p.warm ? WARM : DARK},${DOT_ALPHA})`
        ctx.fill()

        // Move
        p.x += p.vx
        p.y += p.vy

        // Soft bounce at edges
        if (p.x < 0)  { p.x = 0;  p.vx = Math.abs(p.vx) }
        if (p.x > W)  { p.x = W;  p.vx = -Math.abs(p.vx) }
        if (p.y < 0)  { p.y = 0;  p.vy = Math.abs(p.vy) }
        if (p.y > H)  { p.y = H;  p.vy = -Math.abs(p.vy) }
      })

      raf = requestAnimationFrame(loop)
    }
    loop()

    window.addEventListener('resize', resize)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  )
}
