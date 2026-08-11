import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { ScanPayConfirm } from "@/components/scan-pay/ScanPayConfirm";
import {
  createInitialBankTransferState,
  createInitialScanPayState,
} from "@/features/scan-pay/machine";
import type { ScanPayState } from "@/features/scan-pay/types";

function renderConfirm(state: ScanPayState): string {
  return renderToStaticMarkup(
    createElement(ScanPayConfirm, {
      state,
      dispatch: vi.fn(),
    }),
  );
}

describe("ScanPayConfirm payment source", () => {
  it("shows the assigned EB+ wallet icon, full name, and live balance", () => {
    const markup = renderConfirm(
      createInitialScanPayState("success", "benefits", "meal"),
    );

    expect(markup).toContain('aria-label="Payment source"');
    expect(markup).toContain("wallet-bg-meal");
    expect(markup).toContain("Meal Wallet");
    expect(markup).toContain("Available balance ₹6,400");
    expect(markup).not.toContain("Choose your wallet");
  });

  it("locks UPI and bank-transfer confirmations to Reimbursement Wallet", () => {
    const payee = {
      id: "deevanshu-sharma",
      name: "Deevanshu Sharma",
      upiId: "deevanshu@paytm",
      initials: "DS",
    };
    const upiMarkup = renderConfirm(
      createInitialScanPayState("success", "benefits", "meal", {
        kind: "payee",
        payee,
      }),
    );
    const bankMarkup = renderConfirm(
      createInitialBankTransferState({
        accountHolder: "Ananya Rao",
        accountNumber: "123456789012",
        ifsc: "HDFC0001234",
      }),
    );

    for (const markup of [upiMarkup, bankMarkup]) {
      expect(markup).toContain("wallet-bg-reimbursement");
      expect(markup).toContain("Reimbursement Wallet");
      expect(markup).toContain("Available balance ₹9,100");
      expect(markup).not.toContain("Choose your wallet");
    }
  });

  it("shows the fixed ANQ source without inventing an EB+ balance", () => {
    const markup = renderConfirm(
      createInitialScanPayState("success", "pluspay", "meal"),
    );

    expect(markup).toContain("/assets/upi-settings/anq.svg");
    expect(markup).toContain("ANQ");
    expect(markup).toContain("PlusPay");
    expect(markup).not.toContain("Available balance");
    expect(markup).not.toContain("Choose your wallet");
  });
});
