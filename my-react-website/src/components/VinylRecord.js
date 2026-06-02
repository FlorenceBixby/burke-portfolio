import { motion } from 'motion/react';

/**
 * Full top-down turntable — plinth, platter, spinning Black Keys record,
 * animated tonearm swinging in from rest. One full revolution every 12s.
 */
export default function VinylRecord({ size = 480, opacity = 0.13 }) {
  // The full SVG is wider than tall to show the whole turntable
  const W = size * 1.55;
  const H = size * 1.08;

  // Record center on the platter
  const cx = size * 0.535;
  const cy = H * 0.5;

  const recordR  = size * 0.42;   // vinyl radius
  const platR    = size * 0.445;  // platter slightly larger

  // Tonearm pivot (upper right area)
  const pivX = size * 1.28;
  const pivY = H * 0.13;

  // Groove rings
  const grooves = Array.from({ length: 32 }, (_, i) => ({
    r: recordR * 0.35 + i * (recordR * 0.019),
    o: i % 4 === 0 ? 0.14 : 0.07,
  }));

  return (
    <motion.div
      style={{ width: W, height: H, userSelect: 'none', pointerEvents: 'none', opacity }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity, scale: 1 }}
      transition={{ duration: 1.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* ── Static turntable base layer ───────────────── */}
      <svg
        width={W} height={H}
        viewBox={`0 0 ${W} ${H}`}
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        {/* Plinth / body */}
        <rect
          x={size * 0.03} y={H * 0.04}
          width={W - size * 0.06} height={H * 0.92}
          rx={size * 0.025} ry={size * 0.025}
          fill="#1a1a1a" stroke="rgba(255,255,255,0.06)" strokeWidth="1.5"
        />

        {/* Platter mat (rubber) — slightly larger than record */}
        <circle cx={cx} cy={cy} r={platR + size * 0.012}
          fill="#111" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
        <circle cx={cx} cy={cy} r={platR + size * 0.004}
          fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={size * 0.008} />

        {/* Tonearm base plate */}
        <rect
          x={pivX - size * 0.045} y={pivY - size * 0.045}
          width={size * 0.09} height={size * 0.09}
          rx={size * 0.008}
          fill="#222" stroke="rgba(255,255,255,0.1)" strokeWidth="1"
        />

        {/* Right side panel — controls */}
        <rect
          x={size * 1.12} y={H * 0.28}
          width={size * 0.36} height={H * 0.45}
          rx={size * 0.015}
          fill="#1e1e1e" stroke="rgba(255,255,255,0.05)" strokeWidth="1"
        />

        {/* Start / Stop button */}
        <circle cx={size * 1.32} cy={H * 0.42} r={size * 0.028}
          fill="#2a2a2a" stroke="rgba(74,124,89,0.6)" strokeWidth="1.5" />
        <text x={size * 1.32} y={H * 0.427}
          textAnchor="middle" fontSize={size * 0.016}
          fontFamily="Inter, sans-serif" fontWeight="600"
          fill="rgba(74,124,89,0.8)">▶</text>

        {/* 33 / 45 RPM selector */}
        <rect
          x={size * 1.17} y={H * 0.54}
          width={size * 0.072} height={size * 0.028}
          rx={size * 0.006}
          fill="rgba(74,124,89,0.18)" stroke="rgba(74,124,89,0.4)" strokeWidth="0.8"
        />
        <text x={size * 1.206} y={H * 0.558}
          textAnchor="middle" fontSize={size * 0.011}
          fontFamily="Inter, sans-serif" fontWeight="600"
          fill="rgba(74,124,89,0.8)">33</text>

        <rect
          x={size * 1.255} y={H * 0.54}
          width={size * 0.072} height={size * 0.028}
          rx={size * 0.006}
          fill="#2a2a2a" stroke="rgba(255,255,255,0.08)" strokeWidth="0.8"
        />
        <text x={size * 1.291} y={H * 0.558}
          textAnchor="middle" fontSize={size * 0.011}
          fontFamily="Inter, sans-serif" fontWeight="600"
          fill="rgba(255,255,255,0.3)">45</text>

        {/* Strobe dots along platter edge */}
        {Array.from({ length: 24 }, (_, i) => {
          const angle = (i / 24) * Math.PI * 2;
          const sr = platR + size * 0.02;
          return (
            <circle key={i}
              cx={cx + sr * Math.cos(angle)}
              cy={cy + sr * Math.sin(angle)}
              r={size * 0.003}
              fill={i % 3 === 0 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)'}
            />
          );
        })}

        {/* Tonearm pivot ring */}
        <circle cx={pivX} cy={pivY} r={size * 0.022}
          fill="#2a2a2a" stroke="rgba(255,255,255,0.2)" strokeWidth="1.2" />
        <circle cx={pivX} cy={pivY} r={size * 0.008}
          fill="rgba(74,124,89,0.9)" />
      </svg>

      {/* ── Spinning record ────────────────────────────── */}
      <motion.svg
        width={W} height={H}
        viewBox={`0 0 ${W} ${H}`}
        animate={{ rotate: 360 }}
        transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
        style={{ position: 'absolute', top: 0, left: 0, transformOrigin: `${cx}px ${cy}px` }}
      >
        {/* Vinyl — pure black */}
        <circle cx={cx} cy={cy} r={recordR} fill="#050505" />

        {/* Outer edge rim */}
        <circle cx={cx} cy={cy} r={recordR} fill="none"
          stroke="rgba(255,255,255,0.06)" strokeWidth="1.5" />

        {/* Grooves */}
        {grooves.map(({ r, o }, i) => (
          <circle key={i} cx={cx} cy={cy} r={r}
            fill="none" stroke={`rgba(255,255,255,${o})`} strokeWidth="0.4" />
        ))}

        {/* Vinyl sheen */}
        <path
          d={`M ${cx - recordR * 0.6} ${cy - recordR * 0.78}
              A ${recordR * 0.95} ${recordR * 0.95} 0 0 1
              ${cx + recordR * 0.78} ${cy - recordR * 0.2}`}
          fill="none"
          stroke="rgba(255,255,255,0.03)"
          strokeWidth={recordR * 0.1}
          strokeLinecap="round"
        />

        {/* Label — Black Keys */}
        <circle cx={cx} cy={cy} r={recordR * 0.28} fill="#1a1a1a" />
        <circle cx={cx} cy={cy} r={recordR * 0.275} fill="none"
          stroke="#c8882a" strokeWidth={recordR * 0.016} />
        <circle cx={cx} cy={cy} r={recordR * 0.238} fill="none"
          stroke="rgba(200,136,42,0.2)" strokeWidth="0.8" />

        <text x={cx} y={cy - recordR * 0.12}
          textAnchor="middle"
          fontSize={recordR * 0.105}
          fontFamily="Inter, sans-serif" fontWeight="900"
          letterSpacing={recordR * 0.008}
          fill="rgba(255,255,255,0.82)">THE</text>

        <text x={cx} y={cy - recordR * 0.018}
          textAnchor="middle"
          fontSize={recordR * 0.075}
          fontFamily="Inter, sans-serif" fontWeight="700"
          letterSpacing={recordR * 0.005}
          fill="rgba(255,255,255,0.65)">BLACK KEYS</text>

        <line
          x1={cx - recordR * 0.16} y1={cy + recordR * 0.018}
          x2={cx + recordR * 0.16} y2={cy + recordR * 0.018}
          stroke="rgba(200,136,42,0.45)" strokeWidth="0.8"
        />

        <text x={cx} y={cy + recordR * 0.09}
          textAnchor="middle"
          fontSize={recordR * 0.048}
          fontFamily="Inter, sans-serif" fontWeight="300" fontStyle="italic"
          letterSpacing={recordR * 0.004}
          fill="rgba(255,255,255,0.35)">El Camino</text>

        <text x={cx} y={cy + recordR * 0.2}
          textAnchor="middle"
          fontSize={recordR * 0.028}
          fontFamily="Inter, sans-serif" fontWeight="400"
          letterSpacing={recordR * 0.004}
          fill="rgba(255,255,255,0.2)">NON-539882-A  ·  33⅓ RPM</text>

        {/* Spindle */}
        <circle cx={cx} cy={cy} r={recordR * 0.026} fill="#0a0a0a" />
        <circle cx={cx} cy={cy} r={recordR * 0.026} fill="none"
          stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" />
      </motion.svg>

      {/* ── Tonearm — swings in from rest ─────────────── */}
      <svg
        width={W} height={H}
        viewBox={`0 0 ${W} ${H}`}
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        <motion.g
          initial={{ rotate: 38 }}
          animate={{ rotate: 0 }}
          transition={{ duration: 2.4, delay: 1.2, ease: [0.16, 1, 0.3, 1] }}
          style={{ transformOrigin: `${pivX}px ${pivY}px` }}
        >
          {/* Counterweight */}
          <line
            x1={pivX} y1={pivY}
            x2={pivX + size * 0.07} y2={pivY - size * 0.025}
            stroke="rgba(90,90,90,0.85)" strokeWidth={size * 0.014} strokeLinecap="round"
          />
          <circle
            cx={pivX + size * 0.082} cy={pivY - size * 0.028}
            r={size * 0.022}
            fill="#333" stroke="rgba(255,255,255,0.12)" strokeWidth="1"
          />

          {/* Main arm */}
          <line
            x1={pivX} y1={pivY}
            x2={cx + recordR * 0.65} y2={cy - recordR * 0.12}
            stroke="rgba(70,70,70,0.9)" strokeWidth={size * 0.012} strokeLinecap="round"
          />

          {/* Headshell */}
          <line
            x1={cx + recordR * 0.65} y1={cy - recordR * 0.12}
            x2={cx + recordR * 0.38} y2={cy - recordR * 0.02}
            stroke="rgba(70,70,70,0.9)" strokeWidth={size * 0.009} strokeLinecap="round"
          />

          {/* Cartridge body */}
          <rect
            x={cx + recordR * 0.33} y={cy - recordR * 0.065}
            width={recordR * 0.1} height={recordR * 0.065}
            rx={recordR * 0.01}
            fill="#2a2a2a" stroke="rgba(255,255,255,0.1)" strokeWidth="0.8"
          />

          {/* Stylus */}
          <line
            x1={cx + recordR * 0.38} y1={cy - recordR * 0.01}
            x2={cx + recordR * 0.38} y2={cy + recordR * 0.03}
            stroke="rgba(74,124,89,0.85)" strokeWidth={size * 0.005} strokeLinecap="round"
          />
          <circle
            cx={cx + recordR * 0.38} cy={cy + recordR * 0.03}
            r={size * 0.007}
            fill="rgba(74,124,89,1)"
          />
          {/* Stylus glow */}
          <circle
            cx={cx + recordR * 0.38} cy={cy + recordR * 0.03}
            r={size * 0.016}
            fill="none"
            stroke="rgba(74,124,89,0.3)" strokeWidth="1"
          />
        </motion.g>
      </svg>
    </motion.div>
  );
}
