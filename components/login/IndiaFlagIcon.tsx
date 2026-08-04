/**
 * Drawn rather than using the 🇮🇳 emoji, which Windows renders as the letters
 * "IN" because it ships no regional-indicator glyphs.
 */
export function IndiaFlagIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      role="presentation"
      aria-hidden="true"
      className="shrink-0"
    >
      <defs>
        <clipPath id="india-flag-clip">
          <circle cx="10" cy="10" r="10" />
        </clipPath>
      </defs>
      <g clipPath="url(#india-flag-clip)">
        <rect width="20" height="6.67" fill="#FF9933" />
        <rect y="6.67" width="20" height="6.66" fill="#FFFFFF" />
        <rect y="13.33" width="20" height="6.67" fill="#138808" />
        <circle
          cx="10"
          cy="10"
          r="2.1"
          fill="none"
          stroke="#000080"
          strokeWidth="0.7"
        />
      </g>
      <circle
        cx="10"
        cy="10"
        r="9.65"
        fill="none"
        stroke="rgba(0, 42, 25, 0.12)"
        strokeWidth="0.7"
      />
    </svg>
  );
}
