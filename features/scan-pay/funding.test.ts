import { describe, expect, it } from "vitest";
import {
  calculateScanPayFunding,
  walletIsEligibleForPayment,
  walletOrderForPayment,
} from "@/features/scan-pay/funding";

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
      }),
    ).toMatchObject({
      status: "fallback-disabled",
      allocations: [],
      shortfall: 60,
      message:
        "Meal Wallet does not have enough balance. Turn on Fallback Control or reduce the amount.",
    });
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

  it("orders reimbursement first and disables other bank-transfer wallets", () => {
    const context = {
      origin: "bank-transfer" as const,
      recipient: {
        accountHolder: "Ananya Rao",
        accountNumber: "123456789012",
        ifsc: "HDFC0001234",
      },
    };
    expect(walletOrderForPayment(context)).toEqual(["misc", "meal", "fuel"]);
    expect(
      walletIsEligibleForPayment("misc", "benefits", "unclassified", context),
    ).toBe(true);
    expect(
      walletIsEligibleForPayment("meal", "benefits", "unclassified", context),
    ).toBe(false);
    expect(
      walletIsEligibleForPayment("fuel", "benefits", "unclassified", context),
    ).toBe(false);
  });
});
