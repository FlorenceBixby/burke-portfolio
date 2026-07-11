export default function HeroBackground() {
  return (
    <div
      aria-hidden="true"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}
    >
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at 30% 50%, transparent 40%, rgba(5,4,2,0.55) 100%)',
      }} />
    </div>
  )
}
