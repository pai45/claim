import { describe, expect, it } from "vitest";
import {
  bankRecipientFromDraft,
  digitsOnly,
  maskAccountNumber,
  normalizeIfsc,
  validateBankRecipient,
  validateBankTransferAmount,
} from "./validation";

describe("bank transfer validation", () => {
  it("normalizes account and IFSC input", () => {
    expect(digitsOnly("1234 5678-abcd")).toBe("12345678");
    expect(normalizeIfsc("hdfc 0001234")).toBe("HDFC0001234");
  });

  it("accepts a valid account and IFSC", () => {
    expect(
      validateBankRecipient({
        accountHolder: "Ananya Rao",
        accountNumber: "123456789012",
        confirmAccountNumber: "123456789012",
        ifsc: "HDFC0001234",
      }),
    ).toEqual({});
  });

  it("rejects malformed recipient details", () => {
    const errors = validateBankRecipient({
      accountHolder: "",
      accountNumber: "123",
      confirmAccountNumber: "321",
      ifsc: "HDFC123",
    });
    expect(errors.accountHolder).toBeTruthy();
    expect(errors.accountNumber).toBeTruthy();
    expect(errors.confirmAccountNumber).toBe(
      "Account numbers do not match.",
    );
    expect(errors.ifsc).toBeTruthy();
  });

  it("requires the confirmation account number to match", () => {
    const errors = validateBankRecipient({
      accountHolder: "Ananya Rao",
      accountNumber: "123456789012",
      confirmAccountNumber: "123456789013",
      ifsc: "HDFC0001234",
    });

    expect(errors).toEqual({
      confirmAccountNumber: "Account numbers do not match.",
    });
  });

  it("removes confirmation data before checkout", () => {
    expect(
      bankRecipientFromDraft({
        accountHolder: "  Ananya Rao  ",
        accountNumber: "123456789012",
        confirmAccountNumber: "123456789012",
        ifsc: "HDFC0001234",
      }),
    ).toEqual({
      accountHolder: "Ananya Rao",
      accountNumber: "123456789012",
      ifsc: "HDFC0001234",
    });
  });

  it("enforces positive, available-balance and per-transfer limits", () => {
    expect(validateBankTransferAmount("0", 20_000)).toBeTruthy();
    expect(validateBankTransferAmount("25000", 20_000)).toContain("balance");
    expect(validateBankTransferAmount("100001", 200_000)).toContain("limit");
    expect(validateBankTransferAmount("5000", 20_000)).toBeNull();
  });

  it("masks all but the final four account digits", () => {
    expect(maskAccountNumber("123456789012")).toBe("••••••••9012");
  });
});
