import { motion } from 'motion/react';

/**
 * Spinning vinyl record with Black Keys-style label and animated tonearm.
 * Tonearm swings in from rest position and drops onto the groove on load.
 */
export default function VinylRecord({ size = 700, opacity = 0.11 }) {
  const cx = size / 2;

  // Tonearm pivot point (upper right of record)
  const pivotX = cx + size * 0.345;
  const pivotY = cx - size * 0.322;

  // Groove rings — tighter spacing for more realism
  const grooves = Array.from({ length: 28 }, (_, i) => ({
    r: size * 0.148 + i * (size * 0.026),
    opacity: 0.09 + (i % 3 === 0 ? 0.05 : 0),
  }));

  return (
    <motion.div
      style={{
        position: 'absolute',
        width: size,
        height: size,
        opacity,
        userSelect: 'none',
        pointerEvents: 'none',
      }}
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity, scale: 1 }}
      transition={{ duration: 1.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* ── Spinning disc ─────────────────────────── */}
      <motion.svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        animate={{ rotate: 360 }}
        transition={{ duration: 2.8, repeat: Infinity, ease: 'linear' }}
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        {/* Outer vinyl body */}
        <circle cx={cx} cy={cx} r={cx - 3} fill="#0f0f0f" />

        {/* Outer edge highlight */}
        <circle cx={cx} cy={cx} r={cx - 3} fill="none"
          stroke="rgba(255,255,255,0.07)" strokeWidth="2" />

        {/* Grooves — dense rings */}
        {grooves.map(({ r, opacity: go }, i) => (
          <circle key={i} cx={cx} cy={cx} r={r}
            fill="none"
            stroke={`rgba(255,255,255,${go})`}
            strokeWidth="0.5" />
        ))}

        {/* Sheen / light reflection arc */}
        <path
          d={`M ${cx - size * 0.28} ${cx - size * 0.36} A ${size * 0.45} ${size * 0.45} 0 0 1 ${cx + size * 0.36} ${cx - size * 0.1}`}
          fill="none"
          stroke="rgba(255,255,255,0.035)"
          strokeWidth={size * 0.045}
          strokeLinecap="round"
        />

        {/* ── Label area ── */}
        {/* Label base — deep charcoal */}
        <circle cx={cx} cy={cx} r={size * 0.138} fill="#1c1c1c" />

        {/* Label outer ring — Black Keys gold/amber */}
        <circle cx={cx} cy={cx} r={size * 0.136} fill="none"
          stroke="#c8882a" strokeWidth={size * 0.008} />

        {/* Inner detail ring */}
        <circle cx={cx} cy={cx} r={size * 0.118} fill="none"
          stroke="rgba(200,136,42,0.3)" strokeWidth="1" />

        {/* "THE" — top of label */}
        <text
          x={cx}
          y={cx - size * 0.058}
          textAnchor="middle"
          fontSize={size * 0.028}
          fontFamily="Inter, sans-serif"
          fontWeight="900"
          letterSpacing={size * 0.003}
          fill="rgba(255,255,255,0.85)"
        >
          THE
        </text>

        {/* "BLACK KEYS" — center of label */}
        <text
          x={cx}
          y={cx - size * 0.018}
          textAnchor="middle"
          fontSize={size * 0.021}
          fontFamily="Inter, sans-serif"
          fontWeight="700"
          letterSpacing={size * 0.002}
          fill="rgba(255,255,255,0.7)"
        >
          BLACK KEYS
        </text>

        {/* Thin divider line */}
        <line
          x1={cx - size * 0.065} y1={cx + size * 0.005}
          x2={cx + size * 0.065} y2={cx + size * 0.005}
          stroke="rgba(200,136,42,0.5)" strokeWidth="0.8"
        />

        {/* "El Camino" in smaller italic */}
        <text
          x={cx}
          y={cx + size * 0.028}
          textAnchor="middle"
          fontSize={size * 0.013}
          fontFamily="Inter, sans-serif"
          fontWeight="300"
          fontStyle="italic"
          letterSpacing={size * 0.002}
          fill="rgba(255,255,255,0.4)"
        >
          El Camino
        </text>

        {/* Catalog number */}
        <text
          x={cx}
          y={cx + size * 0.058}
          textAnchor="middle"
          fontSize={size * 0.009}
          fontFamily="Inter, sans-serif"
          fontWeight="400"
          letterSpacing={size * 0.002}
          fill="rgba(255,255,255,0.25)"
        >
          NON-539882-A
        </text>

        {/* Center spindle hole */}
        <circle cx={cx} cy={cx} r={size * 0.012} fill="#050505" />
        <circle cx={cx} cy={cx} r={size * 0.012} fill="none"
          stroke="rgba(255,255,255,0.12)" strokeWidth="0.8" />
      </motion.svg>

      {/* ── Tonearm — swings in from rest on load ─── */}
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        {/* Pivot base circle */}
        <circle cx={pivotX} cy={pivotY} r={size * 0.018}
          fill="#2a2a2a" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
        <circle cx={pivotX} cy={pivotY} r={size * 0.007}
          fill="rgba(74,124,89,0.9)" />

        {/* Animated arm group — rotates around pivot */}
        <motion.g
          initial={{ rotate: 36 }}
          animate={{ rotate: 0 }}
          transition={{ duration: 2.2, delay: 1.0, ease: [0.16, 1, 0.3, 1] }}
          style={{ transformOrigin: `${pivotX}px ${pivotY}px` }}
        >
          {/* Counter-weight end (behind pivot) */}
          <line
            x1={pivotX} y1={pivotY}
            x2={pivotX + size * 0.06} y2={pivotY - size * 0.02}
            stroke="rgba(80,80,80,0.8)" strokeWidth={size * 0.007} strokeLinecap="round"
          />
          <circle
            cx={pivotX + size * 0.068} cy={pivotY - size * 0.023}
            r={size * 0.012}
            fill="#333" stroke="rgba(255,255,255,0.1)" strokeWidth="0.8"
          />

          {/* Main arm shaft */}
          <line
            x1={pivotX} y1={pivotY}
            x2={cx + size * 0.078} y2={cx - size * 0.06}
            stroke="rgba(60,60,60,0.9)" strokeWidth={size * 0.007} strokeLinecap="round"
          />

          {/* Headshell / cartridge angled section */}
          <line
            x1={cx + size * 0.078} y1={cx - size * 0.06}
            x2={cx + size * 0.038} y2={cx - size * 0.015}
            stroke="rgba(60,60,60,0.9)" strokeWidth={size * 0.005} strokeLinecap="round"
          />

          {/* Stylus tip */}
          <circle
            cx={cx + size * 0.038} cy={cx - size * 0.013}
            r={size * 0.006}
            fill="rgba(74,124,89,0.95)"
          />
          {/* Stylus glow */}
          <circle
            cx={cx + size * 0.038} cy={cx - size * 0.013}
            r={size * 0.013}
            fill="none"
            stroke="rgba(74,124,89,0.25)" strokeWidth="1"
          />
        </motion.g>
      </svg>
    </motion.div>
  );
}
