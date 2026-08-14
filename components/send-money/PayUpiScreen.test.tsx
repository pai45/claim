import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import {
  PayeeListScreen,
  RecipientHistoryScreen,
} from "@/components/send-money/PayUpiScreen";
import { UpiEntryDrawer } from "@/components/scan-pay/ScanPayScanner";
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
    expect(markup).toContain(
      "type-body-secondary mb-2 font-bold text-pine-primary",
    );
  });

  it("shows an example without marking an empty UPI ID as valid", () => {
    const markup = renderToStaticMarkup(
      createElement(UpiEntryDrawer, {
        open: true,
        upiId: "",
        onChange: vi.fn(),
        onVerify: vi.fn(),
        onClose: vi.fn(),
      }),
    );

    expect(markup).toContain('placeholder="e.g. name@bank"');
    expect(markup).not.toContain('aria-label="Valid UPI ID"');
    expect(markup).toContain("disabled");
  });

  it("shows the valid tick only after a UPI ID is entered", () => {
    const markup = renderToStaticMarkup(
      createElement(UpiEntryDrawer, {
        open: true,
        upiId: "person@bank",
        onChange: vi.fn(),
        onVerify: vi.fn(),
        onClose: vi.fn(),
      }),
    );

    expect(markup).toContain('aria-label="Valid UPI ID"');
    expect(markup).not.toContain("disabled");
  });
});
