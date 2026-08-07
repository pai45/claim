import { describe, expect, it } from "vitest";
import {
  WALLET_FILTER_OPTIONS,
  filterTransactionsByWallet,
  getAnalyticsData,
  getTransaction,
  getTransactionItems,
} from "./constants";

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
  it("exports the three wallet filter options", () => {
    expect(WALLET_FILTER_OPTIONS.map((o) => o.id)).toEqual([
      "meal",
      "fuel",
      "reimbursement",
    ]);
  });

  it("filters transactions for meal wallet", () => {
    const items = getTransactionItems("returning");
    const mealItems = filterTransactionsByWallet(items, "meal");
    expect(mealItems.length).toBeGreaterThan(0);
    expect(mealItems.every((item) => item.wallet === "meal" || item.walletName.includes("Meal"))).toBe(true);
    expect(mealItems.some((item) => item.merchant.includes("Zomato"))).toBe(true);
    expect(mealItems.some((item) => item.merchant.includes("Uber"))).toBe(false);
  });

  it("filters transactions for fuel wallet", () => {
    const items = getTransactionItems("returning");
    const fuelItems = filterTransactionsByWallet(items, "fuel");
    expect(fuelItems.length).toBeGreaterThan(0);
    expect(fuelItems.every((item) => item.wallet === "fuel" || item.walletName.includes("Fuel"))).toBe(true);
    expect(fuelItems.some((item) => item.merchant.includes("Uber"))).toBe(true);
    expect(fuelItems.some((item) => item.merchant.includes("Zomato"))).toBe(false);
  });

  it("filters transactions for reimbursement wallet", () => {
    const items = getTransactionItems("returning");
    const reimbItems = filterTransactionsByWallet(items, "reimbursement");
    expect(reimbItems.length).toBeGreaterThan(0);
    expect(reimbItems.some((item) => item.merchant.includes("Amazon"))).toBe(true);
    expect(reimbItems.some((item) => item.merchant.includes("Zomato"))).toBe(false);
  });
});
