import { describe, expect, it } from "vitest";
import { calculateScanPayFunding } from "@/features/scan-pay/funding";

const balances = { meal: 100, fuel: 80, misc: 200 };
const fallback = { meal: true, fuel: true };

describe("scan pay funding", () => {
  it("uses one wallet for sufficient and exact balances", () => {
    expect(
      calculateScanPayFunding({
        amount: 100,
        walletId: "meal",
        mode: "benefits",
        merchantType: "meal",
        balances,
        fallback,
      }),
    ).toMatchObject({
      status: "single",
      allocations: [{ walletId: "meal", amount: 100 }],
    });
  });

  it("uses the selected wallet first and reimbursement for the shortfall", () => {
    expect(
      calculateScanPayFunding({
        amount: 160,
        walletId: "meal",
        mode: "benefits",
        merchantType: "meal",
        balances,
        fallback,
      }),
    ).toMatchObject({
      status: "split",
      shortfall: 60,
      allocations: [
        { walletId: "meal", amount: 100 },
        { walletId: "misc", amount: 60 },
      ],
    });
  });

  it("blocks a shortfall when fallback is disabled", () => {
    expect(
      calculateScanPayFunding({
        amount: 160,
        walletId: "meal",
        mode: "benefits",
        merchantType: "meal",
        balances,
        fallback: { ...fallback, meal: false },
      }).status,
    ).toBe("fallback-disabled");
  });

  it("blocks insufficient reimbursement and combined balances", () => {
    expect(
      calculateScanPayFunding({
        amount: 240,
        walletId: "misc",
        mode: "benefits",
        merchantType: "luxury",
        balances,
        fallback,
      }).status,
    ).toBe("insufficient");
    expect(
      calculateScanPayFunding({
        amount: 310,
        walletId: "meal",
        mode: "benefits",
        merchantType: "meal",
        balances,
        fallback,
      }).status,
    ).toBe("insufficient");
  });

  it("does not expose benefit funding for PlusPay or ineligible wallets", () => {
    expect(
      calculateScanPayFunding({
        amount: 20,
        walletId: "meal",
        mode: "pluspay",
        merchantType: "meal",
        balances,
        fallback,
      }).status,
    ).toBe("idle");
    expect(
      calculateScanPayFunding({
        amount: 20,
        walletId: "fuel",
        mode: "benefits",
        merchantType: "meal",
        balances,
        fallback,
      }).status,
    ).toBe("insufficient");
  });
});
