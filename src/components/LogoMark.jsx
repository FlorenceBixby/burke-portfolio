/**
 * LogoMark — Three world-class logo concepts for The Interesting Group
 *
 * CONCEPT A: "The Dot Grid"
 *   Inspired by Charles & Ray Eames' 1947 dot pattern — born from the shadow
 *   cast by the DCM chair's metal frame. A 3×3 grid of circles, 6 filled in
 *   terracotta, 3 open. The diagonal scatter pattern (● ● ○ / ● ○ ● / ○ ● ●)
 *   suggests movement, systems thinking, and structured curiosity. Each dot
 *   is a person, an idea, a connection. The grid is the discipline; the gaps
 *   are the possibility. Eames-pure, scalable to 16px favicon or billboard.
 *
 * CONCEPT B: "The Orbit"
 *   Homage to Eames' "Powers of Ten" (1977) — the film that changed how we
 *   understand scale. Three concentric rings: thin outer (macro, systems),
 *   medium middle (business, structure), solid terracotta dot (human, you).
 *   Paul Rand reduced IBM to stripes. This reduces "perspective" to three
 *   rings. Works in a single stamp, a favicon, an embossed business card.
 *
 * CONCEPT C: "The House"
 *   A direct translation of the Eames Case Study House #8 facade — the most
 *   photographed house of the 20th century. A modular grid of rectangles,
 *   some filled, some open, in the exact proportions of the steel-and-glass
 *   facade. The terracotta panel is the warm accent Charles and Ray placed
 *   deliberately against the cool structure. Order, warmth, precision.
 */

// ── Concept A: The Dot Grid ────────────────────────────────────────────────
// 3×3 grid. Pattern (reading L→R, T→B): ● ● ○ / ● ○ ● / ○ ● ●
// Six filled (terracotta), three open (ghost). Diagonal scatter = momentum.
export function DotGrid({ size = 36, accent = '#6B1F1F', ghost = 'rgba(107,31,31,0.18)' }) {
  const r = size / 8          // circle radius
  const gap = size / 8        // gap between circles
  const step = r * 2 + gap    // center-to-center distance
  const positions = [
    [0, 0], [1, 0], [2, 0],
    [0, 1], [1, 1], [2, 1],
    [0, 2], [1, 2], [2, 2],
  ]
  // filled = true → terracotta; false → ghost ring
  const filled = [true, true, false, true, false, true, false, true, true]
  const total = r * 6 + gap * 2  // = step*3 - gap = total width/height

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${total} ${total}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="The Interesting Group logomark"
    >
      {positions.map(([col, row], i) => {
        const cx = r + col * step
        const cy = r + row * step
        return filled[i] ? (
          <circle key={i} cx={cx} cy={cy} r={r} fill={accent} />
        ) : (
          <circle key={i} cx={cx} cy={cy} r={r} fill={ghost} />
        )
      })}
    </svg>
  )
}

// ── Concept B: The Orbit ───────────────────────────────────────────────────
// Three concentric forms: thin outer ring → medium inner ring → solid dot.
// Proportions: outer r=36, middle r=22, dot r=7. Golden-ratio inspired.
// The dot — the only solid element — is terracotta. The rest is structure.
export function Orbit({ size = 40, accent = '#6B1F1F', stroke = '#1D1D1F' }) {
  const cx = size / 2
  const cy = size / 2
  const outerR = size * 0.45
  const midR   = size * 0.275
  const dotR   = size * 0.0875

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="The Interesting Group logomark"
    >
      <circle cx={cx} cy={cy} r={outerR} stroke={stroke} strokeWidth={size * 0.02} />
      <circle cx={cx} cy={cy} r={midR}   stroke={stroke} strokeWidth={size * 0.028} />
      <circle cx={cx} cy={cy} r={dotR}   fill={accent} />
    </svg>
  )
}

// ── Concept C: The House ───────────────────────────────────────────────────
// 4-column × 3-row modular grid, Eames House facade proportions.
// Filled cells: terracotta (warm), black (structure), open (light).
// The pattern reads as a forward-leaning "T" in negative space.
export function TheHouse({ size = 48, accent = '#6B1F1F', dark = '#1D1D1F', border = '#D2D2D7' }) {
  // Grid: 4 cols × 3 rows. Each cell proportioned 3:2 (wider than tall).
  const cols = 4
  const rows = 3
  const pad  = size * 0.02
  const gutter = size * 0.04
  const cellW = (size - pad * 2 - gutter * (cols - 1)) / cols
  const cellH = (size * 0.75 - pad * 2 - gutter * (rows - 1)) / rows  // slightly shorter total
  const totalH = pad * 2 + cellH * rows + gutter * (rows - 1)

  // Cell fills: null = open/white, 'accent' = terracotta, 'dark' = near-black
  // Grid pattern inspired by Eames House Case Study #8 facade:
  const grid = [
    ['dark',   null,     null,   'accent'],  // row 0 (top)
    [null,     'accent', 'dark', null    ],  // row 1 (mid)
    ['accent', null,     null,   'dark'  ],  // row 2 (bottom)
  ]

  const fillMap = { dark, accent, null: null }

  return (
    <svg
      width={size}
      height={totalH}
      viewBox={`0 0 ${size} ${totalH}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="The Interesting Group logomark"
    >
      {grid.map((row, ri) =>
        row.map((cell, ci) => {
          const x = pad + ci * (cellW + gutter)
          const y = pad + ri * (cellH + gutter)
          const fill = cell ? fillMap[cell] : 'white'
          return (
            <rect
              key={`${ri}-${ci}`}
              x={x} y={y}
              width={cellW} height={cellH}
              rx={size * 0.015}
              fill={fill}
              stroke={border}
              strokeWidth={0.75}
            />
          )
        })
      )}
    </svg>
  )
}

// ── Combined Wordmark ──────────────────────────────────────────────────────
// Used in Nav and Footer. Pairs the mark with the typographic lockup.
export function LogoWordmark({ mark = 'dots', size, dark = false }) {
  const color = dark ? '#fff' : '#1D1D1F'
  const subColor = dark ? 'rgba(255,255,255,0.5)' : '#86868B'
  const accent = dark ? '#6B1F1F' : '#6B1F1F'
  const ghost = dark ? 'rgba(255,255,255,0.2)' : 'rgba(107,31,31,0.18)'

  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 10, userSelect: 'none' }}>
      {mark === 'dots'  && <DotGrid  size={size || 28} accent={accent} ghost={ghost} />}
      {mark === 'orbit' && <Orbit    size={size || 30} accent={accent} stroke={color} />}
      {mark === 'house' && <TheHouse size={size || 40} accent={accent} dark={dark ? '#E8E0D8' : '#1D1D1F'} />}
      <span style={{ display: 'flex', flexDirection: 'column', gap: 1, lineHeight: 1 }}>
        <span style={{
          fontSize: 15, fontWeight: 900, letterSpacing: '-0.03em', color,
          fontFamily: "'Inter', sans-serif"
        }}>
          THE
        </span>
        <span style={{
          fontSize: 9.5, fontWeight: 400, letterSpacing: '0.18em',
          textTransform: 'uppercase', color: subColor,
          fontFamily: "'Inter', sans-serif"
        }}>
          Interesting Group
        </span>
      </span>
    </span>
  )
}
