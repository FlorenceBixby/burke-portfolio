import { motion } from 'motion/react';

/**
 * Decorative vinyl record SVG — slowly spins in the hero background.
 * Rendered as a large, near-transparent watermark element.
 */
export default function VinylRecord({ size = 540, opacity = 0.13 }) {
  const cx = size / 2;
  const grooves = Array.from({ length: 18 }, (_, i) => ({
    r: 80 + i * 14,
    o: 0.18 - i * 0.006,
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
      initial={{ opacity: 0, scale: 0.88 }}
      animate={{ opacity, scale: 1 }}
      transition={{ duration: 2.2, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Spinning disc */}
      <motion.svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        animate={{ rotate: 360 }}
        transition={{ duration: 9, repeat: Infinity, ease: 'linear' }}
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        {/* Outer edge */}
        <circle cx={cx} cy={cx} r={cx - 4} fill="#0e0e0e" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />

        {/* Vinyl grooves */}
        {grooves.map(({ r, o }) => (
          <circle
            key={r}
            cx={cx}
            cy={cx}
            r={r}
            fill="none"
            stroke={`rgba(255,255,255,${o})`}
            strokeWidth="0.7"
          />
        ))}

        {/* Label area */}
        <circle cx={cx} cy={cx} r={62} fill="#111" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
        <circle cx={cx} cy={cx} r={58} fill="none" stroke="var(--accent)" strokeWidth="0.6" opacity="0.5" />

        {/* Label text rings */}
        <circle cx={cx} cy={cx} r={46} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />

        {/* TIG monogram */}
        <text
          x={cx}
          y={cx - 6}
          textAnchor="middle"
          fontSize="11"
          fontFamily="Inter, sans-serif"
          fontWeight="600"
          letterSpacing="0.12em"
          fill="rgba(255,255,255,0.55)"
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
          letterSpacing="0.15em"
          fill="rgba(255,255,255,0.28)"
        >
          AUSTIN, TX
        </text>

        {/* Center spindle hole */}
        <circle cx={cx} cy={cx} r={5} fill="#060606" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" />

        {/* Highlight sheen */}
        <ellipse
          cx={cx - 60}
          cy={cx - 90}
          rx={70}
          ry={28}
          fill="none"
          stroke="rgba(255,255,255,0.04)"
          strokeWidth="18"
          transform={`rotate(-35 ${cx} ${cx})`}
        />
      </motion.svg>

      {/* Tonearm — static, layered on top */}
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        {/* Pivot point */}
        <circle cx={cx + 155} cy={cx - 145} r={7} fill="#1a1a1a" stroke="rgba(255,255,255,0.18)" strokeWidth="1.2" />
        <circle cx={cx + 155} cy={cx - 145} r={3} fill="rgba(255,255,255,0.25)" />

        {/* Arm shaft */}
        <line
          x1={cx + 155}
          y1={cx - 145}
          x2={cx + 38}
          y2={cx - 26}
          stroke="rgba(255,255,255,0.22)"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        {/* Headshell / cartridge */}
        <line
          x1={cx + 38}
          y1={cx - 26}
          x2={cx + 20}
          y2={cx - 6}
          stroke="rgba(255,255,255,0.3)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        {/* Stylus tip */}
        <circle cx={cx + 20} cy={cx - 5} r={2.5} fill="var(--accent)" opacity="0.7" />
        {/* Accent glow on stylus */}
        <circle cx={cx + 20} cy={cx - 5} r={5} fill="none" stroke="var(--accent)" strokeWidth="0.8" opacity="0.3" />
      </svg>
    </motion.div>
  );
}
