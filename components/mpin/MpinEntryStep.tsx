"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { EyeToggle } from "./EyeToggle";
import { MpinDots } from "./MpinDots";
import { MpinHeader } from "./MpinHeader";
import { NumericKeypad } from "./NumericKeypad";

type MpinEntryStepProps = {
  title: string;
  subtitle: string;
  fieldLabel: string;
  digits: string[];
  onDigit: (digit: string) => void;
  onBackspace: () => void;
  onSubmit: () => void;
  canSubmit: boolean;
  submitLabel?: string;
  error?: string | null;
  /** Bumped on each error so the shake replays even for the same message. */
  shakeKey?: number;
  onBack?: () => void;
  /** Disables the keypad and CTA, e.g. while a lockout runs. */
  locked?: boolean;
  /** Rendered under the error line — the lockout notice and Forgot link. */
  footnote?: ReactNode;
};

/**
 * One screen shape drives Set, Confirm and Unlock. They differ only in copy and
 * what the caller does on submit, so splitting them would mean three near-copies
 * of the same layout to keep in sync.
 */
export function MpinEntryStep({
  title,
  subtitle,
  fieldLabel,
  digits,
  onDigit,
  onBackspace,
  onSubmit,
  canSubmit,
  submitLabel = "Continue",
  error = null,
  shakeKey = 0,
  onBack,
  locked = false,
  footnote,
}: MpinEntryStepProps) {
  const [revealed, setRevealed] = useState(false);

  // The visual keypad remains the primary mobile control, while this keeps the
  // same PIN flow usable from a physical desktop keyboard.
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (locked || event.ctrlKey || event.metaKey || event.altKey) return;

      if (/^\d$/.test(event.key)) {
        event.preventDefault();
        onDigit(event.key);
      } else if (event.key === "Backspace") {
        event.preventDefault();
        onBackspace();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [locked, onBackspace, onDigit]);

  return (
    <>
      <MpinHeader onBack={onBack} />

      <main className="flex min-h-0 flex-1 flex-col overflow-y-auto px-page pb-4 pt-5">
        <h1 className="type-screen-title">{title}</h1>
        <p className="type-body-secondary mt-1">{subtitle}</p>

        <p className="type-body-secondary mt-6">{fieldLabel}</p>

        <div className="mt-2 flex items-center gap-2">
          <MpinDots
            digits={digits}
            revealed={revealed}
            invalid={Boolean(error)}
            shakeKey={shakeKey}
            label={fieldLabel}
          />
          <EyeToggle
            revealed={revealed}
            onToggle={() => setRevealed((value) => !value)}
          />
        </div>

        <p
          role="status"
          aria-live="polite"
          className="min-h-4 pt-2 text-caption text-danger"
        >
          {error}
        </p>

        {footnote}
      </main>

      <div className="shrink-0 bg-white px-page pb-3 pt-2">
        <button
          type="button"
          className="btn-primary"
          disabled={!canSubmit || locked}
          onClick={onSubmit}
        >
          {submitLabel}
        </button>
      </div>

      <NumericKeypad
        onDigit={onDigit}
        onBackspace={onBackspace}
        disabled={locked}
      />
    </>
  );
}
