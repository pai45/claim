import { describe, expect, it } from "vitest";
import type { ScanPayTransaction } from "@/features/scan-pay/types";
import {
  filterPlusPayTransactionsByMonth,
  getPlusPayTransaction,
  getPlusPayTransactionItems,
  groupPlusPayTransactions,
  recordPlusPayTransaction,
} from "@/features/transactions/plusPayHistory";

function memoryStorage() {
  const map = new Map<string, string>();
  return {
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => map.set(key, value),
    removeItem: (key: string) => map.delete(key),
  };
}

function transaction(
  overrides: Partial<ScanPayTransaction> = {},
): ScanPayTransaction {
  return {
    paymentContext: { origin: "scan-pay" },
    payee: {
      kind: "merchant",
      name: "Blue Tokai",
      upiId: "bluetokai@pay",
      merchantId: "blue-tokai",
    },
    mode: "pluspay",
    amount: 880,
    transactionId: "ANQ10082699",
    paymentMethod: "ANQ",
    dateTime: "10 Aug 2026, 04:20 pm",
    walletId: "misc",
    walletLabel: "ANQ",
    category: "Food",
    outcome: "success",
    cashbackAmount: 0,
    paymentGroupId: "pluspay-payment-99",
    fundingAllocations: [],
    ...overrides,
  };
}

describe("PlusPay transaction history", () => {
  it("seeds active PlusPay personas without wallet fields", () => {
    const rows = getPlusPayTransactionItems("pluspay_only", false, null);

    expect(rows.length).toBeGreaterThan(0);
    expect(rows.some((row) => row.kind === "merchant")).toBe(true);
    expect(rows.some((row) => row.kind === "transfer")).toBe(true);
    expect(rows.every((row) => !("wallet" in row))).toBe(true);
    expect(getPlusPayTransactionItems("new_user", false, null)).toEqual([]);
    expect(getPlusPayTransactionItems("ebPlus_only", false, null)).toEqual([]);
  });

  it("records successful PlusPay activity once and keeps personas isolated", () => {
    const storage = memoryStorage();
    const payment = transaction();

    expect(
      recordPlusPayTransaction(
        "returning",
        payment,
        storage,
        new Date("2026-08-10T16:20:00.000Z"),
      ),
    ).toBe(true);
    expect(recordPlusPayTransaction("returning", payment, storage)).toBe(false);

    const returningRows = getPlusPayTransactionItems(
      "returning",
      true,
      storage,
    );
    expect(
      returningRows.filter((row) => row.transactionId === payment.transactionId),
    ).toHaveLength(1);
    expect(
      getPlusPayTransaction(payment.transactionId, "returning", true, storage)
        ?.merchant,
    ).toBe("Blue Tokai");
    expect(
      getPlusPayTransactionItems("pluspay_only", true, storage).some(
        (row) => row.transactionId === payment.transactionId,
      ),
    ).toBe(false);
  });

  it("excludes EB+ and unsuccessful payments", () => {
    const storage = memoryStorage();

    expect(
      recordPlusPayTransaction(
        "returning",
        transaction({ mode: "benefits" }),
        storage,
      ),
    ).toBe(false);
    expect(
      recordPlusPayTransaction(
        "returning",
        transaction({ outcome: "failed", transactionId: "FAILED-1" }),
        storage,
      ),
    ).toBe(false);
  });

  it("filters and groups the flat ledger by month", () => {
    const rows = getPlusPayTransactionItems("returning", false, null);
    const august = filterPlusPayTransactionsByMonth(rows, "2026-08");
    const groups = groupPlusPayTransactions(august);

    expect(august.length).toBeGreaterThan(0);
    expect(august.every((row) => row.monthKey === "2026-08")).toBe(true);
    expect(groups).toHaveLength(1);
    expect(groups[0].label).toBe("Current Month");
  });
});
