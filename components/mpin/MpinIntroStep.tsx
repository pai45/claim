"use client";

import Image from "next/image";
import { useState } from "react";
import { PrimaryFooter } from "@/components/onboarding/PrimaryFooter";
import { withBasePath } from "@/lib/basePath";
import { BRAND_ASSETS } from "@/lib/ui/assets";
import { colors } from "@/lib/ui/colors";

type MpinIntroStepProps = {
  onStart: () => void;
};

/**
 * Falls back to a padlock glyph when the artwork is missing, so the screen is
 * never headed by a broken-image icon — same guard `PlusPayWordmark` uses.
 */
function LockArtwork() {
  const [artworkFailed, setArtworkFailed] = useState(false);

  if (artworkFailed) {
    return (
      <span
        className="flex h-32 w-32 items-center justify-center rounded-full bg-surface-tint"
        aria-hidden="true"
      >
        <svg width="56" height="56" viewBox="0 0 24 24" fill="none">
          <path
            d="M7 10V8a5 5 0 0 1 10 0v2"
            stroke={colors.pinePrimary}
            strokeWidth="1.85"
            strokeLinecap="round"
          />
          <rect
            x="3.6"
            y="10"
            width="16.8"
            height="11"
            rx="3"
            stroke={colors.pinePrimary}
            strokeWidth="1.85"
          />
          <path
            d="M12 14.6v2.2"
            stroke={colors.pinePrimary}
            strokeWidth="1.85"
            strokeLinecap="round"
          />
        </svg>
      </span>
    );
  }

  return (
    <Image
      src={withBasePath(BRAND_ASSETS.mpinLock)}
      alt=""
      width={240}
      height={240}
      unoptimized
      className="h-auto w-full max-w-[220px]"
      onError={() => setArtworkFailed(true)}
    />
  );
}

export function MpinIntroStep({ onStart }: MpinIntroStepProps) {
  return (
    <section
      className="animate-sheet-rise mt-auto flex h-[60dvh] min-h-0 flex-col overflow-hidden rounded-t-card bg-white shadow-drawer"
      aria-labelledby="mpin-setup-title"
    >
      <div
        className="mx-auto mt-2 h-1 w-12 shrink-0 rounded-full bg-border-muted"
        aria-hidden="true"
      />

      <main className="flex min-h-0 flex-1 flex-col overflow-y-auto px-page pb-3 pt-6">
        <h1 id="mpin-setup-title" className="type-screen-title text-center">
          Secure Your Payments
          <br />
          before your 1st Transaction
        </h1>
        <p className="type-body-secondary mt-3 text-center">
          Create your 4-digit MPIN to get started with your first transaction!
        </p>

        <div className="flex flex-1 items-center justify-center py-4">
          <LockArtwork />
        </div>
      </main>

      <PrimaryFooter label="Set up MPIN" onClick={onStart} />
    </section>
  );
}
