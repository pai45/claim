import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { BankTransferRecipientForm } from "@/components/bank-transfer/BankTransferScreen";

describe("BankTransferRecipientForm", () => {
  it("shows one account field without a progress stepper", () => {
    const markup = renderToStaticMarkup(
      createElement(BankTransferRecipientForm, {
        recipient: {
          accountHolder: "",
          accountNumber: "",
          ifsc: "",
        },
        errors: {},
        onChange: vi.fn(),
        onContinue: vi.fn(),
      }),
    );

    expect(markup).toContain("Account holder name");
    expect(markup).toContain("Account number");
    expect(markup).toContain("IFSC code");
    expect(markup).not.toContain("Re-enter account number");
    expect(markup).not.toContain("Step 1 of");
  });
});
