import { describe, expect, it } from "vitest";
import { createScanPayTransaction } from "@/features/scan-pay/fixtures";
import { createPaymentLedgerRows } from "@/features/scan-pay/ledger";

function bankTransaction() {
  return createScanPayTransaction({
    amount: 500,
    walletId: "misc",
    categoryId: "finance",
    subcategoryId: "bank",
    note: "",
    outcome: "success",
    mode: "benefits",
    merchantType: "unclassified",
    fundingAllocations: [
      {
        walletId: "misc",
        walletLabel: "Reimbursement Wallet",
        amount: 500,
      },
    ],
    paymentContext: {
      origin: "bank-transfer",
      recipient: {
        accountHolder: "Ananya Rao",
        accountNumber: "123456789012",
        ifsc: "HDFC0001234",
      },
    },
  });
}

describe("payment ledger", () => {
  it("records bank transfers against reimbursement with bank metadata", () => {
    const [row] = createPaymentLedgerRows(
      bankTransaction(),
      new Date("2026-08-10T10:00:00.000Z"),
    );
    expect(row).toMatchObject({
      merchant: "Ananya Rao",
      paymentMethod: "Bank Transfer",
      wallet: "misc",
      walletName: "Reimbursement Wallet",
      category: "Finance / Bank",
      location: "Online transfer",
      cardMasked: "••••••••9012",
      amount: 500,
    });
  });
});
