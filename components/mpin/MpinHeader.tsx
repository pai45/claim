"use client";

import { PlusPayWordmark } from "@/components/login/PlusPayWordmark";
import { colors } from "@/lib/ui/colors";

type MpinHeaderProps = {
  onBack?: () => void;
};

/**
 * Back arrow left, wordmark optically centred.
 *
 * Uses a bare arrow rather than the circled `BackNavigationButton` the
 * onboarding screens use — this journey sits on white with no card behind it,
 * so the chip reads as a stray button. The spacer keeps the wordmark centred
 * when there is nothing to go back to.
 */
export function MpinHeader({ onBack }: MpinHeaderProps) {
  return (
    <header className="flex w-full shrink-0 items-center gap-2 bg-white px-page pb-2 pt-4">
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          aria-label="Go back"
          className="-ml-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path
              d="M19 12H5m0 0 7-7m-7 7 7 7"
              stroke={colors.ink}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      ) : (
        <span className="h-11 w-11 shrink-0" aria-hidden="true" />
      )}

      <div className="flex min-w-0 flex-1 justify-center">
        <PlusPayWordmark className="h-7" />
      </div>

      {/* Mirrors the arrow's width so the wordmark lands on the true centre. */}
      <span className="h-11 w-11 shrink-0" aria-hidden="true" />
    </header>
  );
}
