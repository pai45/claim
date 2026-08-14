import { describe, expect, it } from "vitest";
import {
  PAYMENT_RETURN_STORAGE_KEY,
  buildCompletedPaymentReturnTo,
  clearCompletedPaymentReturn,
  readCompletedPaymentReturn,
  saveCompletedPaymentReturn,
} from "@/features/scan-pay/paymentReturn";
import type { ScanPayTransaction } from "@/features/scan-pay/types";

function transaction(
  origin: "scan-pay" | "upi-transfer" = "scan-pay",
): ScanPayTransaction {
  const recipient = {
    id: "anjali-kumar",
    name: "Anjali Kumar",
    upiId: "anjali@upi",
    initials: "AK",
  };
  return {
    paymentContext:
      origin === "upi-transfer"
        ? { origin, recipient }
        : { origin: "scan-pay" },
    payee:
      origin === "upi-transfer"
        ? {
            kind: "upi",
            name: recipient.name,
            upiId: recipient.upiId,
            payeeId: recipient.id,
          }
        : {
            kind: "merchant",
            name: "Fresh Kitchen",
            upiId: "fresh@upi",
            merchantId: "fresh-kitchen",
          },
    mode: "benefits",
    amount: 480,
    transactionId: "123456789012",
    paymentMethod: "UPI",
    dateTime: "14 Aug 2026, 12:30 PM",
    walletId: "meal",
    walletLabel: "Meal Wallet",
    outcome: "success",
    cashbackAmount: 0,
    paymentGroupId: "scan-pay-123456789012",
    fundingAllocations: [
      { walletId: "meal", walletLabel: "Meal Wallet", amount: 480 },
    ],
  };
}

function memoryStorage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
  };
}

describe("completed payment return state", () => {
  it("stores, reads, and clears a matching completed transaction", () => {
    const storage = memoryStorage();
    const payment = transaction();

    expect(saveCompletedPaymentReturn(payment, storage)).toBe(true);
    expect(readCompletedPaymentReturn(payment.transactionId, storage)).toEqual(
      payment,
    );
    clearCompletedPaymentReturn(payment.transactionId, storage);
    expect(storage.getItem(PAYMENT_RETURN_STORAGE_KEY)).toBeNull();
  });

  it("does not return a snapshot for a different transaction", () => {
    const storage = memoryStorage();
    saveCompletedPaymentReturn(transaction(), storage);
    expect(readCompletedPaymentReturn("different", storage)).toBeNull();
    expect(storage.getItem(PAYMENT_RETURN_STORAGE_KEY)).not.toBeNull();
  });

  it("discards malformed payment snapshots", () => {
    const storage = memoryStorage();
    storage.setItem(
      PAYMENT_RETURN_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        transaction: { transactionId: "123456789012", outcome: "success" },
      }),
    );
    expect(readCompletedPaymentReturn("123456789012", storage)).toBeNull();
    expect(storage.getItem(PAYMENT_RETURN_STORAGE_KEY)).toBeNull();
  });

  it("fails safely when storage is unavailable", () => {
    const blockedStorage = {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("blocked");
      },
      removeItem: () => {
        throw new Error("blocked");
      },
    };
    expect(saveCompletedPaymentReturn(transaction(), blockedStorage)).toBe(false);
    expect(readCompletedPaymentReturn("123456789012", blockedStorage)).toBeNull();
    expect(() => clearCompletedPaymentReturn(undefined, blockedStorage)).not.toThrow();
  });

  it("builds return routes for scan and UPI payment receipts", () => {
    expect(buildCompletedPaymentReturnTo(transaction())).toBe(
      "/?mode=benefits&resumePayment=123456789012#scan-pay",
    );
    expect(buildCompletedPaymentReturnTo(transaction("upi-transfer"))).toBe(
      "/send-money/?mode=benefits&resumePayment=123456789012&payee=anjali-kumar",
    );
  });
});
