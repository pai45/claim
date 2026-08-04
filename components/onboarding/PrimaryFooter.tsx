"use client";

import type { ReactNode } from "react";

type PrimaryFooterProps = {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  secondary?: ReactNode;
};

export function PrimaryFooter({
  label,
  onClick,
  disabled = false,
  secondary,
}: PrimaryFooterProps) {
  return (
    <div className="shrink-0 border-t border-border-soft bg-white px-page pb-[max(16px,env(safe-area-inset-bottom))] pt-3">
      {secondary}
      <button
        type="button"
        className="btn-primary"
        disabled={disabled}
        onClick={onClick}
      >
        {label}
      </button>
    </div>
  );
}
