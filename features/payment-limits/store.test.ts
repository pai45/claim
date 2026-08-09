import { describe, expect, it } from "vitest";
import {
  PAYMENT_LIMITS_STORAGE_KEY,
  createDefaultPaymentLimitState,
  formatPaymentLimit,
  loadPaymentLimitState,
  parsePaymentLimitInput,
  resolvePaymentLimitAccount,
  resolvePaymentLimitAudience,
  resolvePaymentLimitMetric,
  savePaymentLimitState,
  updatePaymentLimit,
  validatePaymentLimitInput,
} from "./store";

function memoryStorage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
  };
}

describe("payment limit store", () => {
  it("creates independent screenshot-matched defaults", () => {
    const state = createDefaultPaymentLimitState();

    expect(state.accounts.benefits.individuals).toEqual({
      amountPerDay: 20_000,
      amountPerMonth: null,
      transactionsPerDay: 10,
      transactionsPerMonth: null,
    });
    expect(state.accounts.pluspay.merchants).toEqual(
      state.accounts.benefits.individuals,
    );
    expect(state.accounts.pluspay.merchants).not.toBe(
      state.accounts.benefits.individuals,
    );
  });

  it("updates and removes one metric without changing other scopes", () => {
    const initial = createDefaultPaymentLimitState();
    const updated = updatePaymentLimit(
      initial,
      "pluspay",
      "merchants",
      "amountPerMonth",
      50_000,
    );
    const removed = updatePaymentLimit(
      updated,
      "pluspay",
      "merchants",
      "amountPerMonth",
      null,
    );

    expect(updated.accounts.pluspay.merchants.amountPerMonth).toBe(50_000);
    expect(updated.accounts.pluspay.individuals.amountPerMonth).toBeNull();
    expect(updated.accounts.benefits.merchants.amountPerMonth).toBeNull();
    expect(removed.accounts.pluspay.merchants.amountPerMonth).toBeNull();
    expect(initial.accounts.pluspay.merchants.amountPerMonth).toBeNull();
  });

  it("round-trips persisted state", () => {
    const storage = memoryStorage();
    const state = updatePaymentLimit(
      createDefaultPaymentLimitState(),
      "benefits",
      "individuals",
      "transactionsPerMonth",
      100,
    );

    savePaymentLimitState(state, storage);

    expect(
      loadPaymentLimitState(storage).accounts.benefits.individuals
        .transactionsPerMonth,
    ).toBe(100);
  });

  it("removes corrupt storage and restores defaults", () => {
    const storage = memoryStorage();
    storage.setItem(PAYMENT_LIMITS_STORAGE_KEY, "{broken");

    const state = loadPaymentLimitState(storage);

    expect(state.accounts.benefits.individuals.amountPerDay).toBe(20_000);
    expect(storage.getItem(PAYMENT_LIMITS_STORAGE_KEY)).toBeNull();
  });

  it("resolves account and edit query values", () => {
    expect(resolvePaymentLimitAccount("pluspay", ["benefits", "pluspay"])).toBe(
      "pluspay",
    );
    expect(resolvePaymentLimitAccount("pluspay", ["benefits"])).toBe(
      "benefits",
    );
    expect(resolvePaymentLimitAudience("merchants")).toBe("merchants");
    expect(resolvePaymentLimitAudience("unknown")).toBeNull();
    expect(resolvePaymentLimitMetric("amountPerMonth")).toBe("amountPerMonth");
    expect(resolvePaymentLimitMetric("unknown")).toBeNull();
  });

  it("validates and parses positive whole numbers", () => {
    expect(validatePaymentLimitInput("7500")).toBeNull();
    expect(parsePaymentLimitInput(" 7500 ")).toBe(7500);
    expect(validatePaymentLimitInput("")).toContain("Enter");
    expect(validatePaymentLimitInput("0")).toContain("positive");
    expect(validatePaymentLimitInput("12.5")).toContain("whole");
    expect(validatePaymentLimitInput("-2")).toContain("whole");
  });

  it("formats amounts, counts, and unset values", () => {
    expect(formatPaymentLimit("amountPerDay", 20_000)).toBe("₹20,000");
    expect(formatPaymentLimit("transactionsPerDay", 10)).toBe("10");
    expect(formatPaymentLimit("amountPerMonth", null)).toBe("---");
  });
});
