import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import {
  PayeeListScreen,
  RecipientHistoryScreen,
} from "@/components/send-money/PayUpiScreen";
import { SEEDED_PAYEES } from "@/features/send-money/history";

describe("Pay to UPI screens", () => {
  it("renders manual UPI entry and the existing recent payees", () => {
    const markup = renderToStaticMarkup(
      createElement(PayeeListScreen, {
        payees: [...SEEDED_PAYEES],
        onBack: vi.fn(),
        onEnterUpi: vi.fn(),
        onPayee: vi.fn(),
      }),
    );
    expect(markup).toContain("Pay to UPI ID");
    expect(markup).toContain("Enter UPI ID");
    expect(markup).toContain("Recently Paid");
    expect(markup).toContain("Deevanshu Sharma");
  });

  it("renders the account history layout with a sticky Pay Again action", () => {
    const markup = renderToStaticMarkup(
      createElement(RecipientHistoryScreen, {
        payee: SEEDED_PAYEES[0],
        mode: "benefits",
        onBack: vi.fn(),
        onPayAgain: vi.fn(),
        onTransaction: vi.fn(),
      }),
    );
    expect(markup).toContain("Account");
    expect(markup).toContain("deevanshu@paytm");
    expect(markup).toContain("Powered by UPI");
    expect(markup).toContain("Pay Again");
    expect(markup).toContain("UPI");
  });
});
