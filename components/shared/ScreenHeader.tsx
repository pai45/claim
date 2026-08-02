"use client";

import type { ReactNode } from "react";
import { colors } from "@/lib/ui/colors";

type ScreenHeaderProps = {
  title: string;
  onBack: () => void;
  eyebrow?: string;
  children?: ReactNode;
  className?: string;
};

function BackChevronIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M14.5 6.5 9 12l-5.5 5.5"
        stroke={colors.ink}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ScreenHeader({
  title,
  onBack,
  eyebrow,
  children,
  className = "",
}: ScreenHeaderProps) {
  return (
    <header
      className={`w-full min-w-0 shrink-0 bg-white ${className}`.trim()}
    >
      <div className="flex items-center gap-3 px-page pb-3 pt-2">
        <button
          type="button"
          aria-label="Go back"
          onClick={onBack}
          className="flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-control bg-surface-tint"
        >
          <BackChevronIcon />
        </button>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          {eyebrow ? <p className="type-field-label">{eyebrow}</p> : null}
          <h1 className="type-screen-title truncate">{title}</h1>
        </div>
        {children}
      </div>
    </header>
  );
}
