import { describe, expect, it } from "vitest";
import { createInitialScanPayState, createPaymentTransactionForState } from "@/features/scan-pay/machine";
import {
  RECIPIENT_HISTORY_STORAGE_KEY,
  getPayeeHistory,
  getRecentPayees,
  getRecipientHistoryTransaction,
  recordRecipientPayment,
} from "@/features/send-money/history";

function memoryStorage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
  };
}

describe("recipient payment history", () => {
  it("keeps seeded histories product-specific", () => {
    const storage = memoryStorage();
    const payee = getRecentPayees("benefits", storage)[0];
    expect(getPayeeHistory(payee.id, "benefits", storage)).toHaveLength(2);
    expect(
      getPayeeHistory(payee.id, "benefits", storage).every(
        (record) => record.transaction.mode === "benefits",
      ),
    ).toBe(true);
  });

  it("persists successful UPI recipients once and resolves transaction details", () => {
    const storage = memoryStorage();
    const payee = {
      id: "new-recipient",
      name: "New Recipient",
      upiId: "new.recipient@upi",
      initials: "NR",
    };
    const state = {
      ...createInitialScanPayState("success", "pluspay", "unclassified", {
        kind: "payee" as const,
        payee,
      }),
      amount: "725",
    };
    const transaction = createPaymentTransactionForState(state);

    expect(
      recordRecipientPayment(
        transaction,
        storage,
        "2026-08-10T12:00:00.000Z",
      ),
    ).toBe(true);
    expect(recordRecipientPayment(transaction, storage)).toBe(false);
    expect(storage.getItem(RECIPIENT_HISTORY_STORAGE_KEY)).not.toBeNull();
    expect(getRecentPayees("pluspay", storage)[0]).toEqual(payee);
    expect(getPayeeHistory(payee.id, "pluspay", storage)).toHaveLength(1);
    expect(
      getRecipientHistoryTransaction(transaction.transactionId, storage),
    ).toMatchObject({
      merchant: "New Recipient",
      amount: 725,
      paymentMode: "ANQ",
      cardMasked: "new.recipient@upi",
    });
  });

  it("ignores merchant scans and unsuccessful payments", () => {
    const storage = memoryStorage();
    const merchant = createPaymentTransactionForState({
      ...createInitialScanPayState("success", "benefits", "meal"),
      amount: "100",
    });
    const failed = createPaymentTransactionForState({
      ...createInitialScanPayState("failed", "pluspay", "unclassified", {
        kind: "payee",
        payee: {
          id: "failed",
          name: "Failed Payee",
          upiId: "failed@upi",
          initials: "FP",
        },
      }),
      amount: "100",
    });
    expect(recordRecipientPayment(merchant, storage)).toBe(false);
    expect(recordRecipientPayment(failed, storage)).toBe(false);
  });
});
