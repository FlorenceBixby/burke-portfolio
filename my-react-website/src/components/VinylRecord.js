import { motion } from 'motion/react';

/**
 * Decorative vinyl record SVG — slowly spins in the hero background.
 * Dark disc on a light background, using the green accent for details.
 */
export default function VinylRecord({ size = 540, opacity = 0.13 }) {
  const cx = size / 2;
  const grooves = Array.from({ length: 18 }, (_, i) => ({
    r: 80 + i * 14,
    o: 0.14 - i * 0.004,
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
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity, scale: 1 }}
      transition={{ duration: 2.4, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Spinning disc */}
      <motion.svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        animate={{ rotate: 360 }}
        transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        {/* Outer body */}
        <circle cx={cx} cy={cx} r={cx - 4} fill="#1a1a1a" stroke="rgba(0,0,0,0.1)" strokeWidth="1" />

        {/* Vinyl grooves */}
        {grooves.map(({ r, o }) => (
          <circle
            key={r}
            cx={cx}
            cy={cx}
            r={r}
            fill="none"
            stroke={`rgba(255,255,255,${o})`}
            strokeWidth="0.6"
          />
        ))}

        {/* Label area */}
        <circle cx={cx} cy={cx} r={62} fill="#2d2d2d" />
        <circle cx={cx} cy={cx} r={58} fill="none" stroke="rgba(74,124,89,0.6)" strokeWidth="0.8" />
        <circle cx={cx} cy={cx} r={46} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />

        {/* TIG monogram */}
        <text
          x={cx}
          y={cx - 6}
          textAnchor="middle"
          fontSize="11"
          fontFamily="Inter, sans-serif"
          fontWeight="700"
          letterSpacing="0.12em"
          fill="rgba(255,255,255,0.6)"
        >
          TIG
        </text>
        <text
          x={cx}
          y={cx + 8}
          textAnchor="middle"
          fontSize="5.5"
          fontFamily="Inter, sans-serif"
          fontWeight="400"
          letterSpacing="0.18em"
          fill="rgba(255,255,255,0.3)"
        >
          AUSTIN TX
        </text>

        {/* Center spindle */}
        <circle cx={cx} cy={cx} r={5} fill="#111" stroke="rgba(255,255,255,0.2)" strokeWidth="0.8" />

        {/* Sheen highlight */}
        <ellipse
          cx={cx - 55}
          cy={cx - 85}
          rx={65}
          ry={24}
          fill="none"
          stroke="rgba(255,255,255,0.035)"
          strokeWidth="16"
          transform={`rotate(-35 ${cx} ${cx})`}
        />
      </motion.svg>

      {/* Tonearm — static */}
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        <circle cx={cx + 155} cy={cx - 145} r={7} fill="#333" stroke="rgba(0,0,0,0.2)" strokeWidth="1.2" />
        <circle cx={cx + 155} cy={cx - 145} r={3} fill="rgba(74,124,89,0.8)" />
        <line
          x1={cx + 155} y1={cx - 145}
          x2={cx + 38}  y2={cx - 26}
          stroke="rgba(0,0,0,0.3)" strokeWidth="3.5" strokeLinecap="round"
        />
        <line
          x1={cx + 38} y1={cx - 26}
          x2={cx + 20} y2={cx - 6}
          stroke="rgba(0,0,0,0.4)" strokeWidth="2.5" strokeLinecap="round"
        />
        <circle cx={cx + 20} cy={cx - 5} r={2.5} fill="rgba(74,124,89,0.9)" />
        <circle cx={cx + 20} cy={cx - 5} r={5} fill="none" stroke="rgba(74,124,89,0.4)" strokeWidth="0.8" />
      </svg>
    </motion.div>
  );
}
