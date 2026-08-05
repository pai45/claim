/**
 * Stand-in for the artwork on the Pine Labs consent screen: a figure reading an
 * open instruction manual, over a faint wallpaper of spanners, bulbs and
 * question marks. Drawn inline because no matching asset ships in `public/`.
 */

const LINE = "#0f3f37";
const FILL = "#dbe9e2";
const WASH = "#eef3f0";

export function InstructionManualIllustration() {
  return (
    <svg
      viewBox="0 0 320 200"
      width="100%"
      height="100%"
      fill="none"
      role="img"
      aria-label="A person reading an instruction manual"
    >
      <defs>
        <pattern
          id="vkyc-wallpaper"
          x="0"
          y="0"
          width="72"
          height="72"
          patternUnits="userSpaceOnUse"
        >
          {/* Spanner */}
          <g
            stroke={WASH}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M10 12a7 7 0 0 0 9 9l10 10a3 3 0 0 0 4-4L23 17a7 7 0 0 0-9-9l4 4-2 6-6 2-4-4Z" />
          </g>
          {/* Bulb */}
          <g stroke={WASH} strokeWidth="3" strokeLinecap="round">
            <path d="M52 8a8 8 0 0 1 5 14v3h-10v-3a8 8 0 0 1 5-14Z" />
            <path d="M48 30h8" />
          </g>
          {/* Question mark */}
          <g stroke={WASH} strokeWidth="3.4" strokeLinecap="round">
            <path d="M26 48a6 6 0 1 1 8 5.6v4.4" />
            <path d="M34 64v.5" />
          </g>
        </pattern>
      </defs>

      <rect width="320" height="200" fill="url(#vkyc-wallpaper)" />

      {/* Manual — two facing pages on a dark spine */}
      <g>
        <path
          d="M118 54c26-11 52-11 72 0v104c-20-11-46-11-72 0V54Z"
          fill="#ffffff"
          stroke={LINE}
          strokeWidth="4"
          strokeLinejoin="round"
        />
        <path
          d="M190 54c26-11 52-11 72 0v104c-20-11-46-11-72 0V54Z"
          fill="#ffffff"
          stroke={LINE}
          strokeWidth="4"
          strokeLinejoin="round"
        />
        <path d="M190 54v104" stroke={LINE} strokeWidth="4" />
        <path
          d="M112 60c-6 4-8 10-8 18v92c0 8 4 12 12 10"
          stroke={LINE}
          strokeWidth="4"
          strokeLinecap="round"
        />

        {/* Left page: a title and rules of text */}
        <g stroke={LINE} strokeWidth="3" strokeLinecap="round" opacity="0.75">
          <path d="M132 74h44" />
          <path d="M132 88h40" />
          <path d="M132 100h44" />
          <path d="M132 112h34" />
          <path d="M132 124h42" />
        </g>

        {/* Right page: a grid of illustrated steps */}
        <g>
          <rect
            x="204"
            y="70"
            width="20"
            height="20"
            rx="3"
            fill={FILL}
            stroke={LINE}
            strokeWidth="2.6"
          />
          <rect
            x="232"
            y="66"
            width="20"
            height="20"
            rx="3"
            fill={FILL}
            stroke={LINE}
            strokeWidth="2.6"
          />
          <rect
            x="204"
            y="100"
            width="20"
            height="20"
            rx="3"
            fill={FILL}
            stroke={LINE}
            strokeWidth="2.6"
          />
          <rect
            x="232"
            y="96"
            width="20"
            height="20"
            rx="3"
            fill={FILL}
            stroke={LINE}
            strokeWidth="2.6"
          />
          <g stroke={LINE} strokeWidth="3" strokeLinecap="round" opacity="0.75">
            <path d="M204 132h48" />
            <path d="M204 144h36" />
          </g>
        </g>
      </g>

      {/* Reader, seen from behind */}
      <g>
        <path
          d="M86 176c0-24 8-42 20-42s20 18 20 42"
          fill={LINE}
          stroke={LINE}
          strokeWidth="4"
          strokeLinejoin="round"
        />
        <path
          d="M96 134c-4-8-4-18 10-18s14 10 10 18"
          fill={LINE}
          stroke={LINE}
          strokeWidth="4"
          strokeLinejoin="round"
        />
        <circle cx="106" cy="106" r="13" fill={LINE} />
        {/* Arm reaching toward the page */}
        <path
          d="M124 146c10-2 18-8 22-16"
          stroke={LINE}
          strokeWidth="7"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}
