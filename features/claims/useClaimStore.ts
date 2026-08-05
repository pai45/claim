"use client";

import { useEffect, useState } from "react";
import { getClaimDetails, type ClaimDetails } from "./constants";
import {
  CLAIM_OVERRIDES_STORAGE_KEY,
  CLAIM_STORE_EVENT,
  readClaimOverrides,
  type ClaimOverride,
  type ClaimOverrides,
} from "./store";

function applyOverride(
  claim: ClaimDetails,
  override?: ClaimOverride,
): ClaimDetails {
  if (!override) return claim;
  return getClaimDetails(claim.id, override);
}

export function useClaimOverrides() {
  const [overrides, setOverrides] = useState<ClaimOverrides>({});

  useEffect(() => {
    const refresh = () => setOverrides(readClaimOverrides());
    const handleStorage = (event: StorageEvent) => {
      if (!event.key || event.key === CLAIM_OVERRIDES_STORAGE_KEY) refresh();
    };
    window.addEventListener(CLAIM_STORE_EVENT, refresh);
    window.addEventListener("storage", handleStorage);
    refresh();
    return () => {
      window.removeEventListener(CLAIM_STORE_EVENT, refresh);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  return overrides;
}

export function useClaimDetails(claimId: string): ClaimDetails {
  const overrides = useClaimOverrides();
  const base = getClaimDetails(claimId);
  return applyOverride(base, overrides[base.id]);
}
