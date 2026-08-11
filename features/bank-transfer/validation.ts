export type BankRecipient = {
  accountHolder: string;
  accountNumber: string;
  ifsc: string;
};

export type BankRecipientDraft = BankRecipient & {
  confirmAccountNumber: string;
};

export type BankRecipientErrors = Partial<
  Record<keyof BankRecipientDraft, string>
>;

const ACCOUNT_NUMBER_PATTERN = /^\d{9,18}$/;
const IFSC_PATTERN = /^[A-Z]{4}0[A-Z0-9]{6}$/;

export function digitsOnly(value: string): string {
  return value.replace(/\D/g, "").slice(0, 18);
}

export function normalizeIfsc(value: string): string {
  return value.replace(/\s/g, "").toUpperCase().slice(0, 11);
}

export function validateBankRecipient(
  draft: BankRecipientDraft,
): BankRecipientErrors {
  const errors: BankRecipientErrors = {};
  const accountHolder = draft.accountHolder.trim();

  if (accountHolder.length < 2) {
    errors.accountHolder = "Enter the account holder name.";
  }
  if (!ACCOUNT_NUMBER_PATTERN.test(draft.accountNumber)) {
    errors.accountNumber = "Enter a valid 9 to 18 digit account number.";
  }
  if (draft.confirmAccountNumber !== draft.accountNumber) {
    errors.confirmAccountNumber = "Account numbers do not match.";
  }
  if (!IFSC_PATTERN.test(draft.ifsc)) {
    errors.ifsc = "Enter a valid 11 character IFSC code.";
  }

  return errors;
}

export function bankRecipientFromDraft(
  draft: BankRecipientDraft,
): BankRecipient {
  return {
    accountHolder: draft.accountHolder.trim(),
    accountNumber: draft.accountNumber,
    ifsc: draft.ifsc,
  };
}

export function validateBankTransferAmount(
  value: string,
  availableBalance: number,
): string | null {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) {
    return "Enter a valid transfer amount.";
  }
  if (amount > 100_000) {
    return "The per-transfer limit is ₹1,00,000.";
  }
  if (amount > availableBalance) {
    return "Amount exceeds your available EB+ balance.";
  }
  return null;
}

export function maskAccountNumber(accountNumber: string): string {
  const visible = accountNumber.slice(-4);
  return `${"•".repeat(Math.max(0, accountNumber.length - 4))}${visible}`;
}

export function formatBankTransferINR(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value);
}
