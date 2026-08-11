"use client";

import { colors } from "@/lib/ui/colors";

type NumericKeypadProps = {
  onDigit: (digit: string) => void;
  onBackspace: () => void;
  disabled?: boolean;
  /** Payment amounts may include cents; MPINs intentionally cannot. */
  allowDecimal?: boolean;
};

/**
 * The `.` key carries no meaning for a numeric PIN, but it is in the design and
 * removing it would leave a visible hole in the grid. It is inert for PINs and
 * becomes available for decimal payment amounts.
 */
const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0"] as const;

export function NumericKeypad({
  onDigit,
  onBackspace,
  disabled = false,
  allowDecimal = false,
}: NumericKeypadProps) {
  return (
    <div className="grid shrink-0 grid-cols-3 gap-px bg-border-soft pb-[max(8px,env(safe-area-inset-bottom))] pt-px">
      {KEYS.map((key) => {
        const inert = key === "." && !allowDecimal;
        return (
          <button
            key={key}
            type="button"
            disabled={disabled || inert}
            aria-hidden={inert || undefined}
            tabIndex={inert ? -1 : undefined}
            aria-label={inert ? undefined : `Enter ${key}`}
            onClick={() => onDigit(key)}
            className="flex h-14 items-center justify-center bg-white text-[22px] font-bold text-ink transition-colors active:bg-surface-muted disabled:text-ink disabled:opacity-100"
          >
            {key}
          </button>
        );
      })}

      <button
        type="button"
        disabled={disabled}
        aria-label="Delete last digit"
        onClick={onBackspace}
        className="flex h-14 items-center justify-center bg-white transition-colors active:bg-surface-muted disabled:opacity-40"
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
          <path
            d="M9 5h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-6-7 6-7Z"
            stroke={colors.ink}
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path
            d="m11.5 9.5 5 5m0-5-5 5"
            stroke={colors.ink}
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>
  );
}
