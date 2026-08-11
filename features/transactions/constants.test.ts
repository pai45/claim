import { describe, expect, it } from "vitest";
import {
  TRANSACTION_MAX_MONTH,
  WALLET_FILTER_OPTIONS,
  filterTransactionsByMonth,
  filterTransactionsByWallet,
  getAnalyticsData,
  getRecentTransactionsByWallet,
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

  it("preserves the canonical history for a returning user", () => {
    const items = getTransactionItems("returning");
    expect(items.length).toBeGreaterThan(0);
    expect(getTransaction("txn-amazon", "returning")?.merchant).toBe("Amazon");
    expect(items.every((item) => getTransaction(item.id, "returning") === item)).toBe(true);
  });

  it("gives Rahul the returning transaction history", () => {
    expect(getTransactionItems("rahul_onboarding")).toEqual(
      getTransactionItems("returning"),
    );
  });
});

describe("wallet transaction filters", () => {
  it("exports the four wallets shown on the Benefits home", () => {
    expect(WALLET_FILTER_OPTIONS.map((option) => option.id)).toEqual([
      "meal",
      "fuel",
      "misc",
      "gift",
    ]);
  });

  it("shows the selected wallet's current-month transactions", () => {
    const currentMeal = filterTransactionsByMonth(
      filterTransactionsByWallet(getTransactionItems("returning"), "meal"),
      TRANSACTION_MAX_MONTH,
    );

    expect(currentMeal.length).toBeGreaterThan(0);
    expect(currentMeal.every((item) => item.wallet === "meal")).toBe(true);
    expect(currentMeal.some((item) => item.merchant === "Zomato Payment")).toBe(true);
  });

  it("returns the same latest ten rows used by each wallet preview", () => {
    const items = getTransactionItems("returning");
    for (const wallet of WALLET_FILTER_OPTIONS) {
      const expected = filterTransactionsByWallet(items, wallet.id)
        .sort((left, right) => {
          const dateOrder = right.postedOn.localeCompare(left.postedOn);
          return dateOrder === 0
            ? left.id.localeCompare(right.id)
            : dateOrder;
        })
        .slice(0, 10);

      expect(getRecentTransactionsByWallet(items, wallet.id)).toEqual(expected);
      expect(getRecentTransactionsByWallet(items, wallet.id).length).toBeLessThanOrEqual(10);
    }
  });

  it("does not expose opening, annual load, or closing-balance rows", () => {
    const labels = getTransactionItems("returning")
      .map((item) => `${item.merchant} ${item.category}`.toLowerCase())
      .join(" ");
    expect(labels).not.toContain("opening");
    expect(labels).not.toContain("annual wallet load");
    expect(labels).not.toContain("closing balance");
  });
});

describe("analytics calculations", () => {
  it("derives weekly bars, totals, average, categories, and rewards from the same debits", () => {
    const analytics = getAnalyticsData("returning", "meal", "2026-08");
    const weeklyTotal = analytics.weeks.reduce((sum, week) => sum + week.amount, 0);
    const categoryTotal = analytics.categories.reduce(
      (sum, category) => sum + category.amount,
      0,
    );
    const merchantTotal = analytics.merchants.reduce(
      (sum, merchant) => sum + merchant.amount,
      0,
    );

    expect(analytics.weeks).toHaveLength(4);
    expect(weeklyTotal).toBe(analytics.totalSpent);
    expect(categoryTotal).toBe(analytics.totalSpent);
    expect(merchantTotal).toBe(analytics.totalSpent);
    expect(analytics.averageWeeklySpend).toBe(
      Math.round(analytics.totalSpent / analytics.weeks.length),
    );
    expect(analytics.rewardsEarned).toBe(Math.round(analytics.totalSpent * 0.02));
    expect(analytics.topMerchant).toBe(analytics.merchants[0]);
    expect(
      analytics.merchants.every(
        (merchant) =>
          merchant.averageSpend ===
            Math.round(merchant.amount / merchant.transactionCount) &&
          merchant.rewardsEarned === Math.round(merchant.amount * 0.02),
      ),
    ).toBe(true);
  });

  it("excludes real wallet credits from spend analytics", () => {
    const items = filterTransactionsByMonth(
      filterTransactionsByWallet(getTransactionItems("returning"), "misc"),
      "2026-08",
    );
    const debitTotal = items.reduce(
      (sum, item) => sum + (item.type === "debit" ? item.amount : 0),
      0,
    );
    expect(getAnalyticsData("returning", "misc", "2026-08").totalSpent).toBe(
      debitTotal,
    );
  });
});
