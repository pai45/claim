"use client";

import type { ReactNode } from "react";
import { BackNavigationButton } from "./BackNavigationButton";

type ScreenHeaderProps = {
  title: string;
  onBack: () => void;
  eyebrow?: string;
  titleAccessory?: ReactNode;
  children?: ReactNode;
  className?: string;
};

export function ScreenHeader({
  title,
  onBack,
  eyebrow,
  titleAccessory,
  children,
  className = "",
}: ScreenHeaderProps) {
  return (
    <header
      className={`w-full min-w-0 shrink-0 bg-white ${className}`.trim()}
    >
      <div className="flex items-center gap-3 px-page pb-3 pt-2">
        <BackNavigationButton onClick={onBack} />
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          {eyebrow ? <p className="type-field-label">{eyebrow}</p> : null}
          <div className="flex min-w-0 items-center gap-2">
            <h1 className="type-screen-title min-w-0 truncate">{title}</h1>
            {titleAccessory ? (
              <span className="shrink-0">{titleAccessory}</span>
            ) : null}
          </div>
        </div>
        {children}
      </div>
    </header>
  );
}
