/**
 * SpreadCoilBinding — spiral wire coil overlay on the center seam of an open book.
 *
 * Absolutely positioned on the spread row (spine | left | right) so pages stay
 * flush with zero flex gap. z-index 35 (see globals.css) keeps rings visible above
 * PageFlipOverlay — the turning sheet passes underneath, like a real spiral binding.
 *
 * Parent spread should use `.spread-coil-flipping` while flip or auth hold is active
 * so CSS can deepen seam shadows smoothly (see globals.css).
 */
const COIL_LOOP_COUNT = 20;
const COIL_LOOP_SPACING = 26;
const COIL_START_Y = 24;

/** Vertical spring-loop centers for the SVG coil rings */
function coilLoopCenters(): number[] {
  return Array.from(
    { length: COIL_LOOP_COUNT },
    (_, i) => COIL_START_Y + i * COIL_LOOP_SPACING,
  );
}

export function SpreadCoilBinding() {
  const loops = coilLoopCenters();

  return (
    <div aria-hidden className="spread-coil-binding">
      <svg
        viewBox="0 0 14 540"
        preserveAspectRatio="none"
        width="100%"
        height="100%"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Center crease line — soft fold between leaves */}
        <line
          x1="7"
          y1="0"
          x2="7"
          y2="540"
          stroke="rgba(50,25,6,0.22)"
          strokeWidth="0.6"
        />
        {loops.map((cy) => (
          <g key={cy}>
            {/* Wire loop — ellipse seen from the side (spring spiral binding) */}
            <ellipse
              cx="7"
              cy={cy}
              rx="5.2"
              ry="2.4"
              fill="none"
              stroke="rgba(120,75,35,0.55)"
              strokeWidth="1.1"
            />
            <ellipse
              cx="7"
              cy={cy}
              rx="4.2"
              ry="1.6"
              fill="none"
              stroke="rgba(200,165,110,0.35)"
              strokeWidth="0.45"
            />
            {/* Highlight on upper arc */}
            <path
              d={`M 2.2 ${cy - 1.2} Q 7 ${cy - 2.6} 11.8 ${cy - 1.2}`}
              fill="none"
              stroke="rgba(230,200,150,0.28)"
              strokeWidth="0.5"
            />
          </g>
        ))}
      </svg>
    </div>
  );
}
