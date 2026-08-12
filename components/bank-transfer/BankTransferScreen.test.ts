import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import {
  BankBeneficiaryHistoryScreen,
  BankTransferRecipientForm,
} from "@/components/bank-transfer/BankTransferScreen";
import { BeneficiaryAddedSheet } from "@/components/bank-transfer/BeneficiaryAddedSheet";
import {
  SEEDED_BANK_TRANSFER_RECORDS,
  getSavedBankBeneficiaries,
} from "@/features/bank-transfer/history";

describe("BankTransferRecipientForm", () => {
  it("restores account confirmation without the recipient details eyebrow", () => {
    const markup = renderToStaticMarkup(
      createElement(BankTransferRecipientForm, {
        recipient: {
          accountHolder: "",
          accountNumber: "",
          confirmAccountNumber: "",
          ifsc: "",
        },
        errors: {},
        onChange: vi.fn(),
        onContinue: vi.fn(),
      }),
    );

    expect(markup).toContain("Account holder name");
    expect(markup).toContain("Account number");
    expect(markup).toContain("Re-enter account number");
    expect(markup).toContain("IFSC code");
    expect(markup).not.toContain("Recipient details");
    expect(markup).toContain("Register New Beneficiary");
    expect(markup).not.toContain("Step 1 of");
  });

  it("renders the beneficiary registration guidance without a wallet issuer footer", () => {
    const markup = renderToStaticMarkup(
      createElement(BeneficiaryAddedSheet, {
        open: true,
        accountHolder: "Priyangshu Das",
        onClose: vi.fn(),
        onContinue: vi.fn(),
      }),
    );

    expect(markup).toContain("Beneficiary Added Successfully");
    expect(markup).toContain("PRIYANGSHU DAS");
    expect(markup).toContain("For New Beneficiary");
    expect(markup).toContain("minimum 30 mins");
    expect(markup).toContain("For Existing Beneficiary");
    expect(markup).toContain("minimum 5 mins");
    expect(markup).toContain("Transfer Limit");
    expect(markup).toContain("₹2L");
    expect(markup).toContain("support@pinelabs.com");
    expect(markup).not.toContain("issued by");
  });

  it("shows the divider and four saved rows only when beneficiaries exist", () => {
    const beneficiaries = getSavedBankBeneficiaries("returning", null);
    const markup = renderToStaticMarkup(
      createElement(BankTransferRecipientForm, {
        recipient: {
          accountHolder: "",
          accountNumber: "",
          confirmAccountNumber: "",
          ifsc: "",
        },
        errors: {},
        beneficiaries,
        onChange: vi.fn(),
        onContinue: vi.fn(),
        onBeneficiary: vi.fn(),
      }),
    );

    expect(beneficiaries).toHaveLength(4);
    expect(markup).toContain("border-border-soft");
    expect(markup).toContain("Saved Beneficiaries");
    expect(markup).toContain("Ananya Rao");
    expect(markup).toContain("HDFC0001234");

    const emptyMarkup = renderToStaticMarkup(
      createElement(BankTransferRecipientForm, {
        recipient: {
          accountHolder: "",
          accountNumber: "",
          confirmAccountNumber: "",
          ifsc: "",
        },
        errors: {},
        beneficiaries: [],
        onChange: vi.fn(),
        onContinue: vi.fn(),
      }),
    );
    expect(emptyMarkup).not.toContain("Saved Beneficiaries");
  });

  it("renders bank transfer history and a Pay Again action", () => {
    const beneficiary = getSavedBankBeneficiaries("returning", null)[0]!;
    const records = SEEDED_BANK_TRANSFER_RECORDS.filter(
      (record) => record.beneficiary.id === beneficiary.id,
    );
    const markup = renderToStaticMarkup(
      createElement(BankBeneficiaryHistoryScreen, {
        beneficiary,
        records: [...records],
        onBack: vi.fn(),
        onPayAgain: vi.fn(),
        onTransaction: vi.fn(),
      }),
    );

    expect(markup).toContain("Account");
    expect(markup).toContain("Ananya Rao");
    expect(markup).toContain("24 July");
    expect(markup).toContain("Bank Transfer");
    expect(markup).toContain("Pay Again");
    expect(markup).not.toContain("Powered by UPI");
  });
});
