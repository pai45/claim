import { describe, expect, it } from "vitest";
import type { ClaimExtract } from "@/features/chat/types";
import { evaluateClaimPrecheck } from "./precheck";

function claim(overrides: Partial<ClaimExtract> = {}): ClaimExtract {
  return {
    fileName: "claim.pdf",
    rawText: "claim text",
    category: "Fuel & Maintenance",
    vendor: "Indian Oil",
    amount: "₹2,000",
    claimDate: "2026-07-15",
    confidence: 90,
    ...overrides,
  };
}

describe("claim pre-check", () => {
  it("passes a configured claim within allowance and deadline", () => {
    const result = evaluateClaimPrecheck(claim(), new Date("2026-08-02"));
    expect(result.status).toBe("pass");
    expect(result.benefitId).toBe("fuel");
  });

  it("blocks missing fields, invalid amounts, and exceeded allowance", () => {
    expect(evaluateClaimPrecheck(claim({ vendor: "" })).status).toBe("blocked");
    expect(evaluateClaimPrecheck(claim({ amount: "zero" })).status).toBe("blocked");
    expect(evaluateClaimPrecheck(claim({ amount: "₹50,000" })).status).toBe("blocked");
  });

  it("warns for an unconfigured category", () => {
    const result = evaluateClaimPrecheck(
      claim({ category: "Other / HR review" }),
      new Date("2026-08-02"),
    );
    expect(result.status).toBe("warning");
    expect(result.requiresAcknowledgement).toBe(true);
  });

  it("warns when vendor, amount, and date match an existing demo claim", () => {
    const result = evaluateClaimPrecheck(
      claim({ amount: "₹3,400", claimDate: "2026-05-11" }),
      new Date("2026-05-12"),
    );
    expect(result.checks.find((check) => check.id === "duplicate")?.status).toBe(
      "warning",
    );
    expect(result.requiresAcknowledgement).toBe(true);
  });

  it("blocks claims after a configured deadline", () => {
    const result = evaluateClaimPrecheck(claim(), new Date("2026-08-06"));
    expect(result.checks.find((check) => check.id === "deadline")?.status).toBe(
      "blocked",
    );
  });
});
