import { describe, expect, it } from "vitest";
import { CLAIM_HISTORY_ITEMS, applyClaimHistoryOverrides } from "@/features/claims-history/constants";
import {
  applyBenefitClaimOverrides,
  getBenefitClaimsDashboard,
} from "@/features/dashboard/benefitClaims";
import {
  CLAIM_OVERRIDES_STORAGE_KEY,
  isClaimMutable,
  readClaimOverrides,
  revokeClaim,
  updateClaimOverride,
} from "./store";

function fakeStorage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
  };
}

describe("claim override store", () => {
  it("merges edits for the same normalized claim id", () => {
    const storage = fakeStorage();
    updateClaimOverride("clm-45188", { vendor: "Updated Oil" }, storage, 10);
    updateClaimOverride(" CLM-45188 ", { amount: 3550 }, storage, 20);

    expect(readClaimOverrides(storage)["CLM-45188"]).toEqual({
      vendor: "Updated Oil",
      amount: 3550,
      updatedAt: 20,
    });
  });

  it("persists revocation without deleting the claim", () => {
    const storage = fakeStorage();
    revokeClaim("CLM-45188", storage, 1234);

    const overrides = readClaimOverrides(storage);
    expect(overrides["CLM-45188"]).toMatchObject({
      status: "Revoked",
      revokedAt: 1234,
      updatedAt: 1234,
    });
    const history = applyClaimHistoryOverrides(CLAIM_HISTORY_ITEMS, overrides);
    expect(history.find((claim) => claim.id === "CLM-45188")?.status).toBe("revoked");
  });

  it("removes corrupt or unsupported persisted data", () => {
    const storage = fakeStorage();
    storage.setItem(CLAIM_OVERRIDES_STORAGE_KEY, "{bad json");
    expect(readClaimOverrides(storage)).toEqual({});
    expect(storage.getItem(CLAIM_OVERRIDES_STORAGE_KEY)).toBeNull();

    storage.setItem(
      CLAIM_OVERRIDES_STORAGE_KEY,
      JSON.stringify({ version: 99, claims: {} }),
    );
    expect(readClaimOverrides(storage)).toEqual({});
  });

  it("allows mutations only while a claim is open", () => {
    expect(isClaimMutable("Pending")).toBe(true);
    expect(isClaimMutable("Under review")).toBe(true);
    expect(isClaimMutable("Needs info")).toBe(true);
    expect(isClaimMutable("Approved")).toBe(false);
    expect(isClaimMutable("Rejected")).toBe(false);
    expect(isClaimMutable("Revoked")).toBe(false);
  });

  it("keeps revoked claims listed and removes their pending amount from summaries", () => {
    const base = getBenefitClaimsDashboard("fuel");
    const next = applyBenefitClaimOverrides(base, {
      "CLM-44088": {
        status: "Revoked",
        updatedAt: 1,
        revokedAt: 1,
      },
    });

    expect(next.claims.find((claim) => claim.id === "CLM-44088")?.status).toBe("Revoked");
    expect(next.monthTotal).toBe(base.monthTotal - 3200);
    expect(next.monthPending).toBe(base.monthPending - 3200);
  });
});
