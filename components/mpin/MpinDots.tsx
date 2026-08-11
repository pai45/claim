"use client";

import { MPIN_LENGTH } from "@/features/auth/mpin";

type MpinDotsProps = {
  digits: string[];
  revealed: boolean;
  invalid?: boolean;
  /** Bumped by the caller on each error so the shake replays. */
  shakeKey?: number;
  label: string;
};

/**
 * Read-only boxes, deliberately not `<input>`s. The visual keypad is kept for
 * touch entry, while the enclosing screen handles physical keyboard presses.
 * Border states match `OtpInput` so the two digit rows in the app look like one
 * component.
 */
export function MpinDots({
  digits,
  revealed,
  invalid = false,
  shakeKey = 0,
  label,
}: MpinDotsProps) {
  const filled = digits.filter((digit) => digit !== "").length;

  return (
    <>
      <div
        key={shakeKey}
        role="group"
        aria-label={label}
        className={`flex gap-3 ${invalid ? "animate-shake" : ""}`.trim()}
      >
        {digits.map((digit, index) => (
          <span
            key={index}
            aria-hidden="true"
            className={`flex h-12 w-12 items-center justify-center rounded-control border bg-input-soft text-title font-bold text-pine transition-colors ${
              invalid
                ? "border-danger"
                : digit
                  ? "border-pine-primary"
                  : "border-input-border"
            }`}
          >
            {digit === "" ? null : revealed ? (
              digit
            ) : (
              <span className="h-2.5 w-2.5 rounded-full bg-pine" />
            )}
          </span>
        ))}
      </div>

      {/* Announces progress without ever reading the digits aloud. */}
      <span className="sr-only" role="status" aria-live="polite">
        {filled} of {MPIN_LENGTH} digits entered
      </span>
    </>
  );
}
