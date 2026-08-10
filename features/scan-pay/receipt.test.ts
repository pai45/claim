import { describe, expect, it } from "vitest";
import { createScanPayTransaction } from "@/features/scan-pay/fixtures";
import {
  buildScanPayReceiptText,
  paymentPayeeIdentifier,
  receiptRows,
} from "@/features/scan-pay/receipt";

const transaction = createScanPayTransaction({
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

describe("bank-transfer receipt", () => {
  it("uses account, IFSC, reference, and wallet fields without UPI labels", () => {
    expect(receiptRows(transaction)).toEqual(
      expect.arrayContaining([
        ["Account", "••••••••9012"],
        ["IFSC", "HDFC0001234"],
        ["Reference ID", transaction.transactionId],
        ["Payment Method", "Bank Transfer"],
        ["Paid from Reimbursement Wallet", "₹500"],
        ["Category", "Finance / Bank"],
      ]),
    );
    const text = buildScanPayReceiptText(transaction);
    expect(text).toContain("EB+ bank transfer receipt");
    expect(text).not.toContain("Merchant ID");
    expect(text).not.toContain("UPI Transaction ID");
    expect(paymentPayeeIdentifier(transaction)).toContain("HDFC0001234");
  });
});
