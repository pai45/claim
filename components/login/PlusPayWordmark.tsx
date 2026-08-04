"use client";

import Image from "next/image";
import { useState } from "react";
import { withBasePath } from "@/lib/basePath";
import { BRAND_ASSETS } from "@/lib/ui/assets";

/**
 * Falls back to type when the artwork is missing, so the login screen is never
 * headed by a broken-image glyph. Matches how the static app draws its brand:
 * PP Telegraf, 20px, semibold, pine-dark.
 */
export function PlusPayWordmark({ className = "" }: { className?: string }) {
  const [artworkFailed, setArtworkFailed] = useState(false);

  if (artworkFailed) {
    return (
      <span
        className={`font-display text-title font-semibold tracking-tight text-pine-dark ${className}`.trim()}
      >
        pluspay
      </span>
    );
  }

  return (
    <Image
      src={withBasePath(BRAND_ASSETS.plusPay)}
      alt="pluspay"
      width={132}
      height={28}
      priority
      unoptimized
      className={`h-7 w-auto ${className}`.trim()}
      onError={() => setArtworkFailed(true)}
    />
  );
}
