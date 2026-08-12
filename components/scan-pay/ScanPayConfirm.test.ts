import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { ScanPayConfirm } from "@/components/scan-pay/ScanPayConfirm";
import { ScanPaySubmitting } from "@/components/scan-pay/ScanPayResult";
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
  it("hides the payment-category prompt and selection in the EB+ journey", () => {
    const state = createInitialScanPayState("success", "benefits", "meal");
    const markup = renderConfirm(state);
    const categoryPickerMarkup = renderConfirm({
      ...state,
      step: "categoryPicker",
    });

    expect(markup).not.toContain("Paying for");
    expect(markup).not.toContain("Food &amp; Drinks");
    expect(categoryPickerMarkup).not.toContain("Select category for the payment");
  });

  it("keeps the payment-category prompt and selection in the PlusPay journey", () => {
    const state = createInitialScanPayState("success", "pluspay", "meal");
    const markup = renderConfirm(state);
    const categoryPickerMarkup = renderConfirm({
      ...state,
      step: "categoryPicker",
    });

    expect(markup).toContain("Paying for");
    expect(markup).toContain("Food &amp; Drinks");
    expect(categoryPickerMarkup).toContain("Select category for the payment");
  });

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

    const bankPaymentMarkup = renderConfirm({
      ...createInitialBankTransferState({
        accountHolder: "Ananya Rao",
        accountNumber: "123456789012",
        ifsc: "HDFC0001234",
      }),
      amount: "500",
    });
    expect(bankPaymentMarkup).not.toContain("Transfer amount");
    expect(bankPaymentMarkup).toContain("Convenience fee");
    expect(bankPaymentMarkup).toContain("Total payable");
    expect(upiMarkup).not.toContain("Convenience fee");
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

  it("does not show a convenience-fee callout while payment is processing", () => {
    const markup = renderToStaticMarkup(
      createElement(ScanPaySubmitting, {
        transactionAmount: 510,
        onBack: vi.fn(),
      }),
    );

    expect(markup).toContain("₹510");
    expect(markup).not.toContain("Convenience fee");
  });
});
