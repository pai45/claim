import { describe, expect, it } from "vitest";
import { getClaimDetails } from "./constants";
import { claimReceiptFileName, claimReceiptRows } from "./receipt";

describe("claim receipt", () => {
  it("creates a safe, predictable PDF filename", () => {
    expect(claimReceiptFileName(" clm-45/188 ")).toBe(
      "CLM-45-188-claim-receipt.pdf",
    );
  });

  it("maps the current claim values and uses an ASCII-safe INR amount", () => {
    const claim = getClaimDetails("CLM-45188", {
      vendor: "Updated Oil",
      amount: 3550,
      status: "Revoked",
      updatedAt: 1,
      revokedAt: 1,
    });

    expect(claimReceiptRows(claim)).toContainEqual(["Merchant", "Updated Oil"]);
    expect(claimReceiptRows(claim)).toContainEqual(["Amount", "INR 3,550"]);
    expect(claimReceiptRows(claim)).toContainEqual(["Current status", "Revoked"]);
  });
});
