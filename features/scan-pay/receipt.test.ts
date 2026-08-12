import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ScanPayBankTransferPaid } from "@/components/scan-pay/ScanPayReward";
import { createScanPayTransaction } from "@/features/scan-pay/fixtures";
import {
  buildScanPayReceiptText,
  paymentPayeeIdentifier,
  receiptRows,
} from "@/features/scan-pay/receipt";

const transaction = createScanPayTransaction({
  amount: 510,
  transferAmount: 500,
  convenienceFee: 10,
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
      amount: 510,
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
        ["Status", "Pending"],
        ["Account", "••••••••9012"],
        ["IFSC", "HDFC0001234"],
        ["Reference ID", transaction.transactionId],
        ["Payment Method", "Bank Transfer"],
        ["Transfer amount", "₹500"],
        ["Convenience fee", "₹10"],
        ["Paid from Reimbursement Wallet", "₹510"],
        ["Category", "Finance / Bank"],
      ]),
    );
    const text = buildScanPayReceiptText(transaction);
    expect(text).toContain("EB+ bank transfer receipt");
    expect(text).toContain("Status: Pending");
    expect(text).toContain("Convenience fee: ₹10");
    expect(text).not.toContain("Merchant ID");
    expect(text).not.toContain("UPI Transaction ID");
    expect(paymentPayeeIdentifier(transaction)).toContain("HDFC0001234");
  });

  it("uses the paid-to screen variant without a scratch card", () => {
    const markup = renderToStaticMarkup(
      createElement(ScanPayBankTransferPaid, {
        transaction,
        onClose: () => {},
      }),
    );

    expect(markup).toContain("Paid to");
    expect(markup).toContain("Pending");
    expect(markup).toContain("Transaction details");
    expect(markup).toContain("Convenience fee");
    expect(markup).toContain("Total debited");
    expect(markup).toContain("Back to Home");
    expect(markup).not.toContain("Scratch card");
    expect(markup).not.toContain("Cashback");
  });
});
