"use client";

import { colors } from "@/lib/ui/colors";

type EyeToggleProps = {
  revealed: boolean;
  onToggle: () => void;
};

/**
 * Show/hide for the MPIN boxes. Paths lifted from the `#icon-eye` sprite symbol
 * in `public/employee-benefits/index.html` so the two apps draw the same eye.
 */
export function EyeToggle({ revealed, onToggle }: EyeToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={revealed}
      aria-label={revealed ? "Hide MPIN" : "Show MPIN"}
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
    >
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke={colors.inkSecondary}
        strokeWidth="1.85"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M2.42 12.713c-.15-.238-.225-.357-.267-.54a1.17 1.17 0 0 1 0-.346c.042-.183.117-.302.267-.54C3.66 9.32 7.3 4.5 12 4.5s8.34 4.82 9.58 6.787c.15.238.225.357.267.54.03.13.03.216 0 .346-.042.183-.117.302-.267.54C20.34 14.68 16.7 19.5 12 19.5s-8.34-4.82-9.58-6.787Z" />
        <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
        {revealed ? null : <path d="m4 4 16 16" />}
      </svg>
    </button>
  );
}
