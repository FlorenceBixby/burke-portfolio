import { useState } from 'react'
import { motion } from 'framer-motion'
import { DotGrid, Orbit, TheHouse } from '../components/LogoMark.jsx'

const concepts = [
  {
    id: 'dots',
    name: 'The Dot Grid',
    tag: 'Eames Dot Pattern, 1947',
    description: `Charles and Ray Eames created their dot pattern in 1947 — born from the shadow
      cast by the DCM chair's welded steel frame. Nine circles in a grid. Six filled terracotta, three
      open. The diagonal scatter (● ● ○ / ● ○ ● / ○ ● ●) is not random — it has rhythm and tension,
      the way a good conversation does. Each dot is a person, an idea, a connection.
      The grid is the discipline. The gaps are the possibility.`,
    why: 'Eames-pure. Scalable to 16px favicon or building signage. Abstract enough to outlast any trend. The only logo that can be embroidered, etched, or stamped and still hold.',
    Mark: DotGrid,
    markProps: {},
  },
  {
    id: 'orbit',
    name: 'The Orbit',
    tag: 'Powers of Ten, Eames, 1977',
    description: `In 1977, Charles and Ray Eames made a nine-minute film that changed how humans
      understand scale: "Powers of Ten." It zooms from a picnic in Chicago to the edge of the
      observable universe and back to a single proton — all in nine minutes. Three concentric rings:
      the outer (systems, future), the middle (business, structure), and a solid terracotta dot
      at center — the human. The only filled element is the one that matters most.`,
    why: 'Paul Rand reduced IBM to stripes. This reduces "perspective" to three rings. Minimal, precise, and carries the exact meaning of a think group: zoom out, find the pattern, come back to the human.',
    Mark: Orbit,
    markProps: {},
  },
  {
    id: 'house',
    name: 'The House',
    tag: 'Case Study House #8, Pacific Palisades, 1949',
    description: `The Eames House is the most photographed house of the 20th century — a modular
      steel-and-glass facade built from off-the-shelf industrial components, assembled in two
      days. A 4×3 grid of rectangles: some filled terracotta, some near-black, some open. Charles
      and Ray chose those colored panels deliberately — warm accents against cool structure. It
      is joyful and rigorous at once. That duality is the point.`,
    why: 'The most direct Eames reference of the three. Works as a stamp, a wax seal, an icon. The grid suggests: structured thinking, modular systems, transparency (the open cells are glass).',
    Mark: TheHouse,
    markProps: {},
  },
]

function ConceptCard({ concept, isSelected, onSelect }) {
  const { Mark, markProps } = concept
  const [hovered, setHovered] = useState(false)

  return (
    <motion.div
      onClick={() => onSelect(concept.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      animate={{ y: isSelected ? -4 : 0 }}
      style={{
        cursor: 'pointer',
        border: isSelected ? '2px solid #C4622D' : '2px solid #E8E0D6',
        borderRadius: 16,
        overflow: 'hidden',
        transition: 'border-color 0.25s',
        background: '#fff',
      }}
    >
      {/* Mark on dark */}
      <div style={{
        background: '#1D1D1F',
        padding: '48px 0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 24,
      }}>
        <Mark
          size={concept.id === 'house' ? 80 : 72}
          accent={concept.id === 'orbit' ? '#E8845A' : '#C4622D'}
          ghost="rgba(255,255,255,0.15)"
          stroke="#fff"
          dark="#E8E0D8"
          {...markProps}
        />
        {/* Wordmark on dark */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <span style={{ color: '#fff', fontWeight: 900, fontSize: 22, letterSpacing: '-0.03em' }}>THE</span>
          <span style={{ color: 'rgba(255,255,255,0.45)', fontWeight: 400, fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase' }}>
            Interesting Group
          </span>
        </div>
      </div>

      {/* Mark on light */}
      <div style={{
        background: '#F9F6F2',
        padding: '36px 0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 20,
        borderBottom: '1px solid #E8E0D6',
      }}>
        <Mark
          size={concept.id === 'house' ? 56 : 48}
          accent="#C4622D"
          ghost="rgba(196,98,45,0.15)"
          stroke="#1D1D1F"
          dark="#1D1D1F"
          {...markProps}
        />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
          <span style={{ color: '#1D1D1F', fontWeight: 900, fontSize: 15, letterSpacing: '-0.03em' }}>THE</span>
          <span style={{ color: '#86868B', fontWeight: 400, fontSize: 8, letterSpacing: '0.22em', textTransform: 'uppercase' }}>
            Interesting Group
          </span>
        </div>
      </div>

      {/* Info */}
      <div style={{ padding: '28px 28px 32px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em', color: '#1D1D1F' }}>
            {concept.name}
          </h3>
          {isSelected && (
            <span style={{
              fontSize: 10, fontWeight: 600, letterSpacing: '0.12em',
              textTransform: 'uppercase', color: '#C4622D',
              background: 'rgba(196,98,45,0.1)', padding: '3px 10px', borderRadius: 980,
            }}>
              Selected
            </span>
          )}
        </div>
        <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#86868B', marginBottom: 14 }}>
          {concept.tag}
        </p>
        <p style={{ fontSize: 14, lineHeight: 1.65, color: '#424245', marginBottom: 16 }}>
          {concept.description}
        </p>
        <div style={{ background: 'rgba(196,98,45,0.06)', borderLeft: '3px solid #C4622D', padding: '10px 14px', borderRadius: '0 6px 6px 0' }}>
          <p style={{ fontSize: 13, lineHeight: 1.6, color: '#424245', fontStyle: 'italic' }}>
            {concept.why}
          </p>
        </div>
      </div>
    </motion.div>
  )
}

export default function LogoShowcase({ navigate }) {
  const [selected, setSelected] = useState('dots')

  return (
    <div style={{ paddingTop: 80, minHeight: '100vh', background: '#FAFAF8' }}>

      {/* Header */}
      <section style={{ padding: '72px 5vw 48px', maxWidth: 960, margin: '0 auto' }}>
        <motion.span
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.18em',
            textTransform: 'uppercase', color: '#C4622D', marginBottom: 16 }}
        >
          Identity System
        </motion.span>
        <motion.h1
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          style={{ fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 900, letterSpacing: '-0.04em',
            lineHeight: 1.08, color: '#1D1D1F', marginBottom: 20 }}
        >
          Three Concepts.<br />One Direction.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{ fontSize: 17, lineHeight: 1.65, color: '#424245', maxWidth: 620 }}
        >
          Each concept is grounded in Eames design DNA — geometric precision,
          human warmth, and a belief that good design is as little design as possible.
          All three are built for the next fifty years, not the next five.
        </motion.p>
      </section>

      {/* Design Principles */}
      <section style={{ padding: '0 5vw 56px', maxWidth: 960, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          {[
            { label: 'Timeless', note: 'Works in 2025 or 2045' },
            { label: 'Scalable', note: '16px favicon to 10-foot sign' },
            { label: 'Single color', note: 'Holds in black + white' },
            { label: 'Eames-grounded', note: 'Every element earns its place' },
          ].map(p => (
            <div key={p.label} style={{ background: '#fff', borderRadius: 12, padding: '18px 20px', border: '1px solid #E8E0D6' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1D1D1F', marginBottom: 4 }}>{p.label}</div>
              <div style={{ fontSize: 12, color: '#86868B' }}>{p.note}</div>
            </div>
          ))}
        </div>
      </section>

      {/* The three concepts */}
      <section style={{ padding: '0 5vw 80px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
          {concepts.map(c => (
            <ConceptCard
              key={c.id}
              concept={c}
              isSelected={selected === c.id}
              onSelect={setSelected}
            />
          ))}
        </div>
      </section>

      {/* Favicon scale test */}
      <section style={{ padding: '0 5vw 80px', maxWidth: 960, margin: '0 auto' }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.03em', color: '#1D1D1F', marginBottom: 8 }}>
          Scale test
        </h2>
        <p style={{ fontSize: 14, color: '#86868B', marginBottom: 32 }}>
          Paul Rand's test: blur it. If it still holds, it's real. Here's each mark at every size it'll live.
        </p>
        {concepts.map(c => {
          const { Mark, markProps } = c
          return (
            <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 32, marginBottom: 32,
              padding: '24px 28px', background: '#fff', borderRadius: 12, border: '1px solid #E8E0D6',
              flexWrap: 'wrap' }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#86868B', width: 110, flexShrink: 0 }}>
                {c.name}
              </span>
              {[16, 24, 36, 48, 72, 96].map(s => (
                <div key={s} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <Mark
                    size={c.id === 'house' ? Math.round(s * 1.15) : s}
                    accent="#C4622D"
                    ghost="rgba(196,98,45,0.18)"
                    stroke="#1D1D1F"
                    dark="#1D1D1F"
                    {...markProps}
                  />
                  <span style={{ fontSize: 9, color: '#C4C4C6', letterSpacing: '0.06em' }}>{s}px</span>
                </div>
              ))}
            </div>
          )
        })}
      </section>

      {/* My recommendation */}
      <section style={{ padding: '0 5vw 80px', maxWidth: 960, margin: '0 auto' }}>
        <div style={{ background: '#1D1D1F', borderRadius: 20, padding: '48px 52px' }}>
          <span style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.18em',
            textTransform: 'uppercase', color: '#E8845A', marginBottom: 16 }}>
            My Recommendation
          </span>
          <h2 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', color: '#fff', marginBottom: 20, lineHeight: 1.2 }}>
            The Dot Grid is the one.
          </h2>
          <p style={{ fontSize: 16, lineHeight: 1.7, color: 'rgba(255,255,255,0.65)', marginBottom: 20, maxWidth: 560 }}>
            It is the most direct translation of Eames' DNA into a mark that is yours and only yours.
            No other technology advisor, think group, or advisory firm has anything close to it.
            It is abstract but not empty. Geometric but warm. It holds at 16px and at 200px.
          </p>
          <p style={{ fontSize: 16, lineHeight: 1.7, color: 'rgba(255,255,255,0.65)', maxWidth: 560 }}>
            The diagonal scatter pattern means something: six dots connected, three open. That is a
            group — not everyone, not a crowd, but a deliberate assembly of interesting people with
            space left for more. It will still make sense when The Interesting Group is something
            bigger than any of us can currently describe.
          </p>
        </div>
      </section>

    </div>
  )
}
