"use client";

import { useEffect, useRef, useState } from "react";
import {
  nextBannerStage,
  readBannerStage,
  writeBannerStage,
  type BannerStage,
} from "./bannerRotation";

/**
 * Resolves the banner stage for this app open and books the next one.
 *
 * Returns `null` until the first client effect runs: the stage lives in
 * localStorage, so rendering it during SSR would guarantee a hydration
 * mismatch on every visit past the first. ChatShell already withholds the
 * empty state until `isHydrated`, so the null pass costs nothing visually.
 *
 * The advance happens once per mount — one app open, one step — which is why
 * it is not tied to `showEmptyState`: starting a new chat re-shows the banners
 * but is not a return visit.
 */
export function useBannerStage(): BannerStage | null {
  const [stage, setStage] = useState<BannerStage | null>(null);
  // StrictMode double-invokes effects in dev; without this the counter would
  // advance twice and skip a stage on every reload.
  const advanced = useRef(false);

  useEffect(() => {
    if (advanced.current) return;
    advanced.current = true;

    const current = readBannerStage(window.localStorage);
    setStage(current);
    writeBannerStage(window.localStorage, nextBannerStage(current));
  }, []);

  return stage;
}
