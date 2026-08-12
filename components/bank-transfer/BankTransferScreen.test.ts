import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import {
  BankBeneficiaryHistoryScreen,
  BankTransferRecipientForm,
  SavedBankBeneficiaryList,
} from "@/components/bank-transfer/BankTransferScreen";
import { BeneficiaryAddedSheet } from "@/components/bank-transfer/BeneficiaryAddedSheet";
import { MobileOtpSheet } from "@/components/bank-transfer/MobileOtpSheet";
import {
  SEEDED_BANK_TRANSFER_RECORDS,
  getSavedBankBeneficiaries,
} from "@/features/bank-transfer/history";

describe("BankTransferRecipientForm", () => {
  it("renders the simplified beneficiary registration form", () => {
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
    expect(markup).not.toContain("Re-enter account number");
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

  it("uses the OTP bottom sheet before a newly added beneficiary can continue", () => {
    const markup = renderToStaticMarkup(
      createElement(MobileOtpSheet, {
        open: true,
        mobile: "+91 98765 43210",
        onClose: vi.fn(),
        onVerified: vi.fn(),
      }),
    );

    expect(markup).toContain("Verify mobile OTP to continue");
    expect(markup).toContain("+91 98765 43210");
    expect(markup).toContain("Verify OTP");
    expect(markup).toContain("Resend OTP");
  });

  it("renders saved beneficiaries separately from registration", () => {
    const beneficiaries = getSavedBankBeneficiaries("returning", null);
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

    expect(beneficiaries).toHaveLength(4);
    expect(markup).not.toContain("Saved Beneficiaries");

    const listMarkup = renderToStaticMarkup(
      createElement(SavedBankBeneficiaryList, {
        beneficiaries,
        onBeneficiary: vi.fn(),
      }),
    );
    expect(listMarkup).toContain("Saved Beneficiaries");
    expect(listMarkup).toContain("Ananya Rao");
    expect(listMarkup).toContain("HDFC0001234");
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
