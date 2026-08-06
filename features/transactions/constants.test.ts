import { describe, expect, it } from "vitest";
import {
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
