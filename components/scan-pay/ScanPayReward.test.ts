import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ScanPayReward } from "@/components/scan-pay/ScanPayReward";
import { createScanPayTransaction } from "@/features/scan-pay/fixtures";

const transaction = createScanPayTransaction({
  amount: 780,
  walletId: "misc",
  categoryId: "finance",
  subcategoryId: "bank",
  note: "",
  outcome: "success",
  mode: "benefits",
  merchantType: "unclassified",
  fundingAllocations: [
    { walletId: "misc", walletLabel: "Reimbursement Wallet", amount: 780 },
  ],
});

function render(props: Partial<Parameters<typeof ScanPayReward>[0]> = {}) {
  return renderToStaticMarkup(
    createElement(ScanPayReward, {
      transaction,
      onViewDetails: () => {},
      onDownload: () => {},
      onShare: () => {},
      onClose: () => {},
      ...props,
    }),
  );
}

describe("paid-to screen", () => {
  it("shows the payee, the amount, and the transaction details", () => {
    const markup = render();

    expect(markup).toContain("Paid to");
    expect(markup).toContain(transaction.payee.name);
    expect(markup).toContain("Transaction details");
    expect(markup).toContain("₹780");
    expect(markup).toContain("Total paid");
    expect(markup).toContain("Success");
    expect(markup).toContain("Back to Home");
  });

  it("no longer offers a scratch card or cashback", () => {
    const markup = render();

    expect(markup).not.toContain("Scratch");
    expect(markup).not.toContain("Cashback");
    expect(markup).not.toContain("canvas");
  });

  it("delays its entrance only when it arrives behind the success tick", () => {
    expect(render({ entranceBaseMs: 1060 })).toContain("--paid-enter-base:1060ms");
    // Back-navigation from payment details renders it with no veil in front.
    expect(render()).toContain("--paid-enter-base:0ms");
  });
});
