"use client";

import type { CSSProperties, ElementType } from "react";
import { colors } from "@/lib/ui/colors";

type MagicTextProps = {
  text: string;
  as?: "span" | "p" | "h1" | "h2" | "h3";
  className?: string;
  mode?: "chars" | "words";
  delayMs?: number;
  stepMs?: number;
  shimmer?: boolean;
  /** Final text color used by the magic shimmer reveal. */
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
  shimmerBase = colors.pinePrimary,
}: MagicTextProps) {
  const units = mode === "words" ? text.split(/(\s+)/) : Array.from(text);
  const Component = Tag as ElementType;

  return (
    <Component className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {units.map((unit, index) => {
          if (mode === "words" && /^\s+$/.test(unit)) {
            return <span key={`space-${index}`}>{unit}</span>;
          }

          const style = {
            "--magic-unit-delay": `${delayMs + index * stepMs}ms`,
            ...(shimmer && shimmerBase
              ? { "--magic-base": shimmerBase }
              : null),
          } as CSSProperties;

          return (
            <span
              key={`${unit}-${index}`}
              className={
                shimmer
                  ? "magic-text-unit magic-text-shimmer"
                  : "magic-text-unit"
              }
              style={style}
            >
              {unit === " " ? "\u00A0" : unit}
            </span>
          );
        })}
      </span>
    </Component>
  );
}
