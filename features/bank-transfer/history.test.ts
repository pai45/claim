import { describe, expect, it } from "vitest";
import {
  getBankBeneficiaryHistory,
  getBankTransferHistoryTransaction,
  getSavedBankBeneficiaries,
  recordBankTransfer,
} from "@/features/bank-transfer/history";
import type { BankRecipient } from "@/features/bank-transfer/validation";
import type { ScanPayOutcome, ScanPayTransaction } from "@/features/scan-pay/types";

function memoryStorage() {
  const map = new Map<string, string>();
  return {
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => map.set(key, value),
    removeItem: (key: string) => map.delete(key),
  };
}

const RECIPIENT: BankRecipient = {
  accountHolder: "Maya Singh",
  accountNumber: "555566667777",
  ifsc: "KKBK0001234",
};

function bankTransaction(
  paymentGroupId: string,
  outcome: ScanPayOutcome = "success",
  recipient: BankRecipient = RECIPIENT,
): ScanPayTransaction {
  return {
    paymentContext: { origin: "bank-transfer", recipient },
    payee: {
      kind: "bank-transfer",
      name: recipient.accountHolder,
      accountNumber: recipient.accountNumber,
      ifsc: recipient.ifsc,
    },
    mode: "benefits",
    amount: 1_500,
    transactionId: `EB-${paymentGroupId}`,
    paymentMethod: "Bank Transfer",
    dateTime: "11 Aug 2026, 03:30 pm",
    walletId: "misc",
    walletLabel: "Reimbursement Wallet",
    category: "Finance",
    subcategory: "Bank",
    outcome,
    cashbackAmount: 0,
    paymentGroupId,
    fundingAllocations: [
      {
        walletId: "misc",
        walletLabel: "Reimbursement Wallet",
        amount: 1_500,
      },
    ],
  };
}

describe("bank transfer history", () => {
  it("seeds four beneficiaries only for Vishal", () => {
    expect(getSavedBankBeneficiaries("returning", null).map((item) => item.accountHolder)).toEqual([
      "Ananya Rao",
      "Deevanshu Sharma",
      "Anjali Kumar",
      "Sneha Roy",
    ]);
    expect(getSavedBankBeneficiaries("rahul_onboarding", null)).toEqual([]);
    expect(getSavedBankBeneficiaries("new_user", null)).toEqual([]);
  });

  it("adds a successful transfer to only the active persona", () => {
    const storage = memoryStorage();
    const transaction = bankTransaction("payment-1");

    expect(
      recordBankTransfer(
        "new_user",
        transaction,
        storage,
        "2026-08-11T10:00:00.000Z",
      ),
    ).toBe(true);
    expect(getSavedBankBeneficiaries("new_user", storage)).toMatchObject([
      { accountHolder: "Maya Singh", ifsc: "KKBK0001234" },
    ]);
    expect(getSavedBankBeneficiaries("ebPlus_only", storage)).toEqual([]);
  });

  it("is idempotent per payment and keeps one beneficiary with full history", () => {
    const storage = memoryStorage();
    const first = bankTransaction("payment-1");
    const second = bankTransaction("payment-2");

    expect(recordBankTransfer("new_user", first, storage)).toBe(true);
    expect(recordBankTransfer("new_user", first, storage)).toBe(false);
    expect(recordBankTransfer("new_user", second, storage)).toBe(true);

    const beneficiaries = getSavedBankBeneficiaries("new_user", storage);
    expect(beneficiaries).toHaveLength(1);
    expect(
      getBankBeneficiaryHistory(beneficiaries[0].id, "new_user", storage),
    ).toHaveLength(2);
  });

  it("ignores unsuccessful or non-bank payments", () => {
    const storage = memoryStorage();
    expect(
      recordBankTransfer("new_user", bankTransaction("failed", "failed"), storage),
    ).toBe(false);

    const upiTransaction: ScanPayTransaction = {
      ...bankTransaction("upi"),
      paymentContext: {
        origin: "upi-transfer",
        recipient: {
          id: "maya",
          name: "Maya Singh",
          upiId: "maya@paytm",
          initials: "MS",
        },
      },
      payee: {
        kind: "upi",
        name: "Maya Singh",
        upiId: "maya@paytm",
        payeeId: "maya",
      },
    };
    expect(recordBankTransfer("new_user", upiTransaction, storage)).toBe(false);
    expect(getSavedBankBeneficiaries("new_user", storage)).toEqual([]);
  });

  it("resolves bank history rows for transaction details", () => {
    const storage = memoryStorage();
    const transaction = bankTransaction("payment-details");
    recordBankTransfer("new_user", transaction, storage);

    expect(
      getBankTransferHistoryTransaction(
        transaction.transactionId,
        "new_user",
        storage,
      ),
    ).toMatchObject({
      merchant: "Maya Singh",
      cardMasked: "••••••••7777",
      paymentMode: "Bank Transfer",
    });
  });
});
