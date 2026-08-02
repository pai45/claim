"use client";

import type { CSSProperties, ElementType } from "react";

type MagicTextProps = {
  text: string;
  as?: "span" | "p" | "h1" | "h2" | "h3";
  className?: string;
  mode?: "chars" | "words";
  delayMs?: number;
  stepMs?: number;
  shimmer?: boolean;
  /** Base text color used by the shimmer gradient. */
  shimmerBase?: string;
};

export function MagicText({
  text,
  as: Tag = "span",
  className,
  mode = "chars",
  delayMs = 0,
  stepMs = mode === "words" ? 55 : 28,
  shimmer = false,
  shimmerBase,
}: MagicTextProps) {
  const units =
    mode === "words" ? text.split(/(\s+)/) : Array.from(text);

  const Component = Tag as ElementType;
  const unitCount = units.filter((unit) =>
    mode === "words" ? !/^\s+$/.test(unit) : true,
  ).length;
  const shimmerStyle = {
    ...(shimmerBase ? { "--magic-base": shimmerBase } : null),
    ...(shimmer
      ? {
          "--magic-shimmer-delay": `${delayMs + Math.max(unitCount - 1, 0) * stepMs * 0.55}ms`,
        }
      : null),
  } as CSSProperties;

  return (
    <Component className={className}>
      <span className="sr-only">{text}</span>
      <span
        aria-hidden="true"
        className={shimmer ? "magic-text-shimmer" : undefined}
        style={shimmer ? shimmerStyle : undefined}
      >
        {units.map((unit, index) => {
          if (mode === "words" && /^\s+$/.test(unit)) {
            return <span key={`space-${index}`}>{unit}</span>;
          }

          return (
            <span
              key={`${unit}-${index}`}
              className="magic-text-unit"
              style={{
                animationDelay: `${delayMs + index * stepMs}ms`,
              }}
            >
              {unit === " " ? "\u00A0" : unit}
            </span>
          );
        })}
      </span>
    </Component>
  );
}
