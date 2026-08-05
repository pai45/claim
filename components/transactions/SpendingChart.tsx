"use client";

import { useState } from "react";
import {
  formatINR,
  type AnalyticsCategory,
} from "@/features/transactions/constants";
import { colors } from "@/lib/ui/colors";

type SpendingChartProps = {
  categories: AnalyticsCategory[];
  totalLabel: string;
  totalSubLabel: string;
};

const SIZE = 240;
const CENTER = SIZE / 2;
/** Every segment starts here; only the outer edge moves. */
const INNER_RADIUS = 58;
/** The floor is set by the label: 13px type needs a band it can breathe in. */
const MIN_THICKNESS = 26;
const MAX_THICKNESS = 50;
const LABEL_SIZE = 13;
/** The surface gap that separates touching segments, as an arc length. */
const GAP_PX = 2;

/**
 * Share-of-spend donut where each segment's *thickness* also grows with its
 * share, per the analytics design.
 *
 * Worth knowing: that makes radius a second encoding of the value the angle
 * already carries, and because area grows with the square of radius it
 * exaggerates the gap between big and small categories. The percentage sits
 * inside every segment precisely so the number, not the geometry, is what gets
 * read — and the list underneath repeats all six as a table.
 */
export function SpendingChart({
  categories,
  totalLabel,
  totalSubLabel,
}: SpendingChartProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const total = categories.reduce((sum, c) => sum + c.percent, 0) || 1;
  const percents = categories.map((c) => c.percent);
  const minPercent = Math.min(...percents);
  const maxPercent = Math.max(...percents);

  // A 2px gap at the inner edge, expressed as the angle that subtends it, so
  // the separation reads the same whatever the segment's thickness.
  const gapDeg = (GAP_PX / INNER_RADIUS) * (180 / Math.PI);
  const sweepBudget = 360 - gapDeg * categories.length;

  const sweeps = categories.map((c) => (c.percent / total) * sweepBudget);
  // Each segment starts where every sweep before it, plus their gaps, has ended.
  const starts = sweeps.map((_, index) =>
    sweeps.slice(0, index).reduce((sum, sweep) => sum + sweep + gapDeg, 0),
  );

  const segments = categories.map((category, index) => {
    const sweep = sweeps[index];
    const start = starts[index];

    const scale =
      maxPercent === minPercent
        ? 1
        : (category.percent - minPercent) / (maxPercent - minPercent);
    const thickness = MIN_THICKNESS + scale * (MAX_THICKNESS - MIN_THICKNESS);
    const midRadius = INNER_RADIUS + thickness / 2;
    const midAngle = start + sweep / 2;

    return {
      category,
      start,
      end: start + sweep,
      sweep,
      thickness,
      midRadius,
      label: `${category.percent}%`,
      labelPoint: polarToCartesian(CENTER, CENTER, midRadius, midAngle),
      // A label only goes inside the fill when it actually fits there.
      labelFits: fitsInside(`${category.percent}%`, sweep, midRadius, thickness),
    };
  });

  const selected = categories.find((c) => c.id === selectedId) ?? null;
  const centerValue = selected ? formatINR(selected.amount) : totalLabel;
  const centerCaption = selected ? selected.name : totalSubLabel;

  return (
    <div className="mx-auto w-full max-w-60">
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="block h-auto w-full"
        role="img"
        aria-label={`Spending by category. Total ${totalLabel}. ${categories
          .map((c) => `${c.name} ${c.percent} percent`)
          .join(", ")}. Full amounts follow in the list below.`}
      >
        {segments.map(
          ({ category, start, end, thickness, midRadius, label, labelPoint, labelFits }) => {
            const dimmed = selected !== null && selected.id !== category.id;
            return (
              <g
                key={category.id}
                onClick={() =>
                  setSelectedId(selectedId === category.id ? null : category.id)
                }
                className="cursor-pointer"
                style={{
                  opacity: dimmed ? 0.35 : 1,
                  transition: "opacity 150ms ease",
                }}
              >
                <path
                  d={describeArc(CENTER, CENTER, midRadius, start, end)}
                  fill="none"
                  stroke={category.color}
                  strokeWidth={thickness}
                  strokeLinecap="butt"
                />
                {labelFits ? (
                  <text
                    x={labelPoint.x}
                    y={labelPoint.y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={LABEL_SIZE}
                    fontWeight={700}
                    fill={labelInk(category.color)}
                    pointerEvents="none"
                  >
                    {label}
                  </text>
                ) : null}
              </g>
            );
          },
        )}

        <text
          x={CENTER}
          y={CENTER - 8}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={selected ? 18 : 22}
          fontWeight={700}
          fill={colors.ink}
        >
          {centerValue}
        </text>
        <text
          x={CENTER}
          y={CENTER + 16}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={12}
          fill={colors.inkSecondary}
        >
          {centerCaption}
        </text>
      </svg>
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

/**
 * Whether a label clears its segment with padding on every side. A clipped or
 * overflowing label is worse than none — the value is in the list regardless.
 */
function fitsInside(
  label: string,
  sweepDeg: number,
  radius: number,
  thickness: number,
): boolean {
  const arcLength = ((sweepDeg * Math.PI) / 180) * radius;
  // Bold digits run a shade over half an em wide apiece.
  const textWidth = label.length * LABEL_SIZE * 0.58;
  return arcLength > textWidth + 12 && thickness > LABEL_SIZE + 6;
}

/**
 * Labels sitting on a colored fill are the one place text may leave the ink
 * tokens, so the choice has to be computed rather than assumed: whichever of
 * white or ink contrasts better against the fill.
 */
function labelInk(fill: string): string {
  return contrastRatio(fill, "#FFFFFF") >= contrastRatio(fill, colors.ink)
    ? "#FFFFFF"
    : colors.ink;
}

function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const [light, dark] = la > lb ? [la, lb] : [lb, la];
  return (light + 0.05) / (dark + 0.05);
}

function relativeLuminance(hex: string): number {
  const value = hex.replace("#", "");
  const channels = [0, 2, 4].map((offset) => {
    const srgb = parseInt(value.slice(offset, offset + 2), 16) / 255;
    return srgb <= 0.03928
      ? srgb / 12.92
      : Math.pow((srgb + 0.055) / 1.055, 2.4);
  });
  return (
    0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2]
  );
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
