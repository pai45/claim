import { describe, expect, it } from "vitest";
import type { BillExtract } from "@/features/chat/types";
import { evaluateClaimPrecheck } from "./precheck";

function bill(overrides: Partial<BillExtract> = {}): BillExtract {
  return {
    fileName: "bill.pdf",
    rawText: "bill text",
    category: "Fuel & Maintenance",
    vendor: "Indian Oil",
    amount: "₹2,000",
    billDate: "2026-07-15",
    confidence: 90,
    ...overrides,
  };
}

describe("claim pre-check", () => {
  it("passes a configured claim within allowance and deadline", () => {
    const result = evaluateClaimPrecheck(bill(), new Date("2026-08-02"));
    expect(result.status).toBe("pass");
    expect(result.benefitId).toBe("fuel");
  });

  it("blocks missing fields, invalid amounts, and exceeded allowance", () => {
    expect(evaluateClaimPrecheck(bill({ vendor: "" })).status).toBe("blocked");
    expect(evaluateClaimPrecheck(bill({ amount: "zero" })).status).toBe("blocked");
    expect(evaluateClaimPrecheck(bill({ amount: "₹50,000" })).status).toBe("blocked");
  });

  it("warns for an unconfigured category", () => {
    const result = evaluateClaimPrecheck(
      bill({ category: "Other / HR review" }),
      new Date("2026-08-02"),
    );
    expect(result.status).toBe("warning");
    expect(result.requiresAcknowledgement).toBe(true);
  });

  it("warns when vendor, amount, and date match an existing demo claim", () => {
    const result = evaluateClaimPrecheck(
      bill({ amount: "₹3,400", billDate: "2026-05-11" }),
      new Date("2026-05-12"),
    );
    expect(result.checks.find((check) => check.id === "duplicate")?.status).toBe(
      "warning",
    );
    expect(result.requiresAcknowledgement).toBe(true);
  });

  it("blocks claims after a configured deadline", () => {
    const result = evaluateClaimPrecheck(bill(), new Date("2026-08-06"));
    expect(result.checks.find((check) => check.id === "deadline")?.status).toBe(
      "blocked",
    );
  });
});
