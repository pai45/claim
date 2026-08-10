import { describe, expect, it } from "vitest";
import {
  commitBenefitPayment,
  getPersonaFinancialDelta,
} from "@/features/transactions/financialState";
import type { TransactionItem } from "@/features/transactions/constants";

function memoryStorage() {
  const map = new Map<string, string>();
  return {
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => map.set(key, value),
    removeItem: (key: string) => map.delete(key),
  };
}

const baseBalances = { meal: 100, fuel: 80, misc: 200 };

function row(id: string, wallet: "meal" | "misc", amount: number): TransactionItem {
  return {
    id,
    merchant: "Coffee House Cafe",
    paymentMethod: "UPI",
    refId: "ref-1",
    amount,
    type: "debit",
    dateLabel: "10 Aug",
    dateTime: "10 August 2026 at 02:00 pm",
    postedOn: "2026-08-10",
    monthKey: "2026-08",
    wallet,
    icon: wallet === "meal" ? "food" : "money",
    category: "Dining",
    location: "Bengaluru, Karnataka",
    cardMasked: "Linked UPI account",
    walletName: wallet === "meal" ? "Meal Wallet" : "Reimbursement Wallet",
    paymentMode: "UPI",
    transactionId: "ref-1",
    referenceNumber: "ref-1",
    paymentGroupId: "payment-1",
    paymentTotal: 140,
  };
}

describe("financial state", () => {
  it("commits linked allocation rows exactly once", () => {
    const storage = memoryStorage();
    const input = {
      personaId: "returning" as const,
      paymentId: "payment-1",
      allocations: [
        { walletId: "meal" as const, walletLabel: "Meal Wallet", amount: 100 },
        { walletId: "misc" as const, walletLabel: "Reimbursement Wallet", amount: 40 },
      ],
      rows: [row("payment-1-meal", "meal", 100), row("payment-1-misc", "misc", 40)],
      baseBalances,
    };
    expect(commitBenefitPayment(input, storage).status).toBe("committed");
    expect(commitBenefitPayment(input, storage).status).toBe("duplicate");
    expect(getPersonaFinancialDelta("returning", storage)).toMatchObject({
      debits: { meal: 100, misc: 40 },
      committedPaymentIds: ["payment-1"],
    });
    expect(getPersonaFinancialDelta("returning", storage).transactions).toHaveLength(2);
  });

  it("rejects stale allocations without changing state", () => {
    const storage = memoryStorage();
    const result = commitBenefitPayment(
      {
        personaId: "returning",
        paymentId: "too-large",
        allocations: [
          { walletId: "meal", walletLabel: "Meal Wallet", amount: 101 },
        ],
        rows: [row("too-large", "meal", 101)],
        baseBalances,
      },
      storage,
    );
    expect(result).toEqual({ status: "insufficient", walletId: "meal" });
    expect(getPersonaFinancialDelta("returning", storage).transactions).toEqual([]);
  });
});
