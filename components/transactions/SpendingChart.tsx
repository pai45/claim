import type { AnalyticsCategory } from "@/features/transactions/constants";
import { colors } from "@/lib/ui/colors";

type SpendingChartProps = {
  categories: AnalyticsCategory[];
  totalLabel: string;
  totalSubLabel: string;
};

/** Multi-radius arc chart matching the analytics mock (no chart library). */
export function SpendingChart({
  categories,
  totalLabel,
  totalSubLabel,
}: SpendingChartProps) {
  const size = 220;
  const cx = size / 2;
  const cy = size / 2;
  const baseRadius = 78;
  const stroke = 18;
  const gapDeg = 4;
  const total = categories.reduce((sum, c) => sum + c.percent, 0) || 1;

  const arcs = categories.reduce<
    Array<{
      category: AnalyticsCategory;
      start: number;
      end: number;
      radius: number;
    }>
  >((acc, category, index) => {
    const previousEnd = acc.length ? acc[acc.length - 1].end : -gapDeg;
    const start = previousEnd + gapDeg;
    const sweep =
      (category.percent / total) * (360 - gapDeg * categories.length);
    const end = start + sweep;
    const radius = baseRadius + (index % 3) * 4;
    acc.push({ category, start, end, radius });
    return acc;
  }, []);

  return (
    <div className="relative mx-auto flex h-[220px] w-[220px] items-center justify-center">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="absolute inset-0"
        aria-hidden="true"
      >
        {arcs.map(({ category, start, end, radius }) => (
          <path
            key={category.id}
            d={describeArc(cx, cy, radius, start, end)}
            fill="none"
            stroke={category.color}
            strokeWidth={stroke}
            strokeLinecap="round"
          />
        ))}
      </svg>
      <div className="relative z-10 flex flex-col items-center px-4 text-center">
        <p className="type-amount text-ink">{totalLabel}</p>
        <p className="text-caption text-ink-secondary">{totalSubLabel}</p>
      </div>
      <span className="sr-only">
        Donut chart of spending by category. Total {totalLabel}.
      </span>
    </div>
  );
}

function polarToCartesian(
  cx: number,
  cy: number,
  radius: number,
  angleDeg: number,
) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(rad),
    y: cy + radius * Math.sin(rad),
  };
}

function describeArc(
  cx: number,
  cy: number,
  radius: number,
  startAngle: number,
  endAngle: number,
) {
  const start = polarToCartesian(cx, cy, radius, endAngle);
  const end = polarToCartesian(cx, cy, radius, startAngle);
  const largeArc = endAngle - startAngle <= 180 ? 0 : 1;
  return [
    "M",
    start.x,
    start.y,
    "A",
    radius,
    radius,
    0,
    largeArc,
    0,
    end.x,
    end.y,
  ].join(" ");
}

type CategoryGlyphProps = {
  icon: AnalyticsCategory["icon"];
  color?: string;
};

export function CategoryGlyph({
  icon,
  color = "#fff",
}: CategoryGlyphProps) {
  const common = {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none" as const,
    "aria-hidden": true as const,
  };

  switch (icon) {
    case "groceries":
      return (
        <svg {...common}>
          <path
            d="M7 8h10l-1 12H8L7 8Z"
            stroke={color}
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
          <path
            d="M9 8V6.5A3 3 0 0 1 15 6.5V8"
            stroke={color}
            strokeWidth="1.7"
          />
        </svg>
      );
    case "entertainment":
      return (
        <svg {...common}>
          <rect
            x="3"
            y="6"
            width="18"
            height="12"
            rx="2"
            stroke={color}
            strokeWidth="1.7"
          />
          <path d="M10 10l5 2-5 2v-4Z" fill={color} />
        </svg>
      );
    case "dining":
      return (
        <svg {...common}>
          <path
            d="M8 4v16M8 8h3M16 4v7c0 2-1 3-2.5 3H16v6"
            stroke={color}
            strokeWidth="1.7"
            strokeLinecap="round"
          />
        </svg>
      );
    case "shopping":
      return (
        <svg {...common}>
          <path
            d="M6 8h12l-1 12H7L6 8Z"
            stroke={color}
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
          <path
            d="M9 8V7a3 3 0 0 1 6 0v1"
            stroke={color}
            strokeWidth="1.7"
          />
        </svg>
      );
    case "travel":
      return (
        <svg {...common}>
          <rect
            x="6"
            y="7"
            width="12"
            height="13"
            rx="2"
            stroke={color}
            strokeWidth="1.7"
          />
          <path
            d="M9 7V5.5A3 3 0 0 1 15 5.5V7M6 12h12"
            stroke={color}
            strokeWidth="1.7"
          />
        </svg>
      );
    case "bills":
      return (
        <svg {...common}>
          <path
            d="M13 3 6 13h5l-1 8 8-11h-5l0-7Z"
            stroke={color}
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="6" stroke={colors.pinePrimary} strokeWidth="1.7" />
        </svg>
      );
  }
}
