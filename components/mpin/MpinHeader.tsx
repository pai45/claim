"use client";

import { PlusPayWordmark } from "@/components/login/PlusPayWordmark";
import { BackNavigationButton } from "@/components/shared/BackNavigationButton";

type MpinHeaderProps = {
  onBack?: () => void;
};

/**
 * Back arrow left, wordmark optically centred.
 *
 * The spacer keeps the wordmark centred when there is nothing to go back to.
 */
export function MpinHeader({ onBack }: MpinHeaderProps) {
  return (
    <header className="flex w-full shrink-0 items-center gap-2 bg-white px-page pb-2 pt-4">
      {onBack ? (
        <BackNavigationButton
          onClick={onBack}
          className="-ml-2"
        />
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
