import { describe, expect, it } from "vitest";
import {
  WALLET_FILTER_OPTIONS,
  TRANSACTION_MONTHS,
  filterTransactionsByWallet,
  getAnalyticsData,
  getTransaction,
  getTransactionItems,
  getWalletLedgerSummary,
} from "./constants";
import { getEmployerBenefit } from "@/features/policy/constants";

describe("persona transaction data", () => {
  it("keeps a brand-new user transaction history empty", () => {
    expect(getTransactionItems("new_user")).toEqual([]);
    expect(getTransaction("txn-amazon", "new_user")).toBeUndefined();
    expect(getAnalyticsData("new_user")).toMatchObject({
      totalSpent: 0,
      categories: [],
    });
  });

  it("preserves the seeded history for a returning user", () => {
    expect(getTransactionItems("returning").length).toBeGreaterThan(0);
    expect(getTransaction("txn-amazon", "returning")?.merchant).toBe(
      "Amazon",
    );
  });
});

describe("filterTransactionsByWallet", () => {
  it("limits the native month calendar to April through August 2026", () => {
    expect(TRANSACTION_MONTHS.map((month) => month.key)).toEqual([
      "2026-04",
      "2026-05",
      "2026-06",
      "2026-07",
      "2026-08",
    ]);
  });

  it("exports every benefit wallet", () => {
    expect(WALLET_FILTER_OPTIONS.map((o) => o.id)).toEqual([
      "meal",
      "gift",
      "fuel",
      "mobile",
      "driver",
      "books",
      "professional",
    ]);
  });

  it("filters transactions for meal wallet", () => {
    const items = getTransactionItems("returning");
    const mealItems = filterTransactionsByWallet(items, "meal");
    expect(mealItems.length).toBeGreaterThan(0);
    expect(mealItems.every((item) => item.wallet === "meal" || item.walletName.includes("Meal"))).toBe(true);
    expect(mealItems.some((item) => item.category === "Wallet Load")).toBe(true);
    expect(mealItems.some((item) => item.wallet === "fuel")).toBe(false);
  });

  it("filters transactions for fuel wallet", () => {
    const items = getTransactionItems("returning");
    const fuelItems = filterTransactionsByWallet(items, "fuel");
    expect(fuelItems.length).toBeGreaterThan(0);
    expect(fuelItems.every((item) => item.wallet === "fuel" || item.walletName.includes("Fuel"))).toBe(true);
    expect(fuelItems.some((item) => item.merchant.includes("Indian Oil"))).toBe(true);
    expect(fuelItems.some((item) => item.wallet === "meal")).toBe(false);
  });

  it("keeps professional-development transactions in their own wallet", () => {
    const items = getTransactionItems("returning");
    const professionalItems = filterTransactionsByWallet(items, "professional");
    expect(professionalItems.length).toBeGreaterThan(0);
    expect(professionalItems.every((item) => item.wallet === "professional")).toBe(true);
  });

  it("loads each wallet on 1 April and deducts approved claims", () => {
    const items = getTransactionItems("returning");
    for (const wallet of WALLET_FILTER_OPTIONS) {
      const walletItems = filterTransactionsByWallet(items, wallet.id);
      expect(
        walletItems.some(
          (item) =>
            item.type === "credit" &&
            item.postedOn === "2026-04-01" &&
            item.category === "Wallet Load",
        ),
      ).toBe(true);
    }

    expect(getWalletLedgerSummary(items, "fuel", "2026-07")).toEqual({
      openingBalance: 46500,
      credits: 0,
      debits: 4500,
      closingBalance: 42000,
    });

    for (const wallet of WALLET_FILTER_OPTIONS) {
      const summary = getWalletLedgerSummary(items, wallet.id, "2026-07");
      expect(summary.closingBalance).toBe(
        getEmployerBenefit(wallet.id, "returning").balance.available,
      );
    }
  });
});
