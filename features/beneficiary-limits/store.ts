export type BeneficiaryAccount = "benefits" | "pluspay";

export type BeneficiaryLimit = {
  id: string;
  name: string;
  upiId: string;
  monthlyLimit: number;
  perTransactionLimit: number;
};

export type BeneficiaryLimitState = {
  version: typeof BENEFICIARY_LIMITS_STORAGE_VERSION;
  accounts: Record<BeneficiaryAccount, BeneficiaryLimit[]>;
};

export type BeneficiaryLimitDraft = {
  name: string;
  upiId: string;
  monthlyLimit: string;
  perTransactionLimit: string;
};

export type BeneficiaryLimitField = keyof BeneficiaryLimitDraft;
export type BeneficiaryLimitErrors = Partial<
  Record<BeneficiaryLimitField, string>
>;

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export const BENEFICIARY_LIMITS_STORAGE_KEY =
  "eb-claims:beneficiary-limits:v1";
export const BENEFICIARY_LIMITS_STORAGE_VERSION = 1;

const SEED_BENEFICIARIES: BeneficiaryLimit[] = [
  {
    id: "vishal-sharma",
    name: "Vishal Sharma",
    upiId: "john.doe@paytm",
    monthlyLimit: 6392,
    perTransactionLimit: 6392,
  },
  {
    id: "alice-smith",
    name: "Alice Smith",
    upiId: "alice.smith@example",
    monthlyLimit: 7500,
    perTransactionLimit: 7500,
  },
];

const UPI_ID_PATTERN =
  /^[a-z0-9][a-z0-9._-]{1,255}@[a-z][a-z0-9.-]{1,63}$/i;

export function createDefaultBeneficiaryLimitState(): BeneficiaryLimitState {
  return {
    version: BENEFICIARY_LIMITS_STORAGE_VERSION,
    accounts: {
      benefits: SEED_BENEFICIARIES.map((beneficiary) => ({ ...beneficiary })),
      pluspay: SEED_BENEFICIARIES.map((beneficiary) => ({ ...beneficiary })),
    },
  };
}

export function loadBeneficiaryLimitState(
  storage: StorageLike = window.localStorage,
): BeneficiaryLimitState {
  try {
    const raw = storage.getItem(BENEFICIARY_LIMITS_STORAGE_KEY);
    if (!raw) return createDefaultBeneficiaryLimitState();

    const parsed = JSON.parse(raw) as unknown;
    if (!isBeneficiaryLimitState(parsed)) {
      storage.removeItem(BENEFICIARY_LIMITS_STORAGE_KEY);
      return createDefaultBeneficiaryLimitState();
    }

    return {
      version: BENEFICIARY_LIMITS_STORAGE_VERSION,
      accounts: {
        benefits: parsed.accounts.benefits.map((item) => ({ ...item })),
        pluspay: parsed.accounts.pluspay.map((item) => ({ ...item })),
      },
    };
  } catch {
    try {
      storage.removeItem(BENEFICIARY_LIMITS_STORAGE_KEY);
    } catch {
      // Storage can be unavailable in private or managed browsing contexts.
    }
    return createDefaultBeneficiaryLimitState();
  }
}

export function saveBeneficiaryLimitState(
  state: BeneficiaryLimitState,
  storage: StorageLike = window.localStorage,
): void {
  try {
    storage.setItem(BENEFICIARY_LIMITS_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // The in-memory UI remains usable when persistence is blocked.
  }
}

export function addBeneficiaryLimit(
  state: BeneficiaryLimitState,
  account: BeneficiaryAccount,
  beneficiary: BeneficiaryLimit,
): BeneficiaryLimitState {
  return replaceAccount(state, account, [
    { ...beneficiary },
    ...state.accounts[account],
  ]);
}

export function updateBeneficiaryLimit(
  state: BeneficiaryLimitState,
  account: BeneficiaryAccount,
  beneficiary: BeneficiaryLimit,
): BeneficiaryLimitState {
  return replaceAccount(
    state,
    account,
    state.accounts[account].map((item) =>
      item.id === beneficiary.id ? { ...beneficiary } : item,
    ),
  );
}

export function deleteBeneficiaryLimit(
  state: BeneficiaryLimitState,
  account: BeneficiaryAccount,
  beneficiaryId: string,
): BeneficiaryLimitState {
  return replaceAccount(
    state,
    account,
    state.accounts[account].filter((item) => item.id !== beneficiaryId),
  );
}

export function validateBeneficiaryLimitDraft(
  draft: BeneficiaryLimitDraft,
  existing: BeneficiaryLimit[],
  editingId?: string,
): BeneficiaryLimitErrors {
  const errors: BeneficiaryLimitErrors = {};
  const name = draft.name.trim();
  const upiId = draft.upiId.trim();

  if (!name) {
    errors.name = "Enter the beneficiary name.";
  }

  if (!upiId) {
    errors.upiId = "Enter the beneficiary UPI ID.";
  } else if (!UPI_ID_PATTERN.test(upiId)) {
    errors.upiId = "Enter a valid UPI ID, such as name@bank.";
  } else if (
    existing.some(
      (beneficiary) =>
        beneficiary.id !== editingId &&
        beneficiary.upiId.trim().toLowerCase() === upiId.toLowerCase(),
    )
  ) {
    errors.upiId = "This UPI ID already has a beneficiary limit.";
  }

  const monthlyLimit = parseWholeRupees(draft.monthlyLimit);
  const perTransactionLimit = parseWholeRupees(draft.perTransactionLimit);

  if (monthlyLimit === null) {
    errors.monthlyLimit = "Enter a positive whole-rupee monthly limit.";
  }
  if (perTransactionLimit === null) {
    errors.perTransactionLimit =
      "Enter a positive whole-rupee transaction limit.";
  } else if (monthlyLimit !== null && perTransactionLimit > monthlyLimit) {
    errors.perTransactionLimit =
      "Per-transaction limit cannot exceed the monthly limit.";
  }

  return errors;
}

export function beneficiaryFromDraft(
  draft: BeneficiaryLimitDraft,
  id: string,
): BeneficiaryLimit {
  return {
    id,
    name: draft.name.trim(),
    upiId: draft.upiId.trim(),
    monthlyLimit: Number(draft.monthlyLimit),
    perTransactionLimit: Number(draft.perTransactionLimit),
  };
}

export function draftFromBeneficiary(
  beneficiary: BeneficiaryLimit,
): BeneficiaryLimitDraft {
  return {
    name: beneficiary.name,
    upiId: beneficiary.upiId,
    monthlyLimit: String(beneficiary.monthlyLimit),
    perTransactionLimit: String(beneficiary.perTransactionLimit),
  };
}

export function createBeneficiaryLimitId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `beneficiary-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function resolveBeneficiaryAccount(
  requested: string | null,
  allowedAccounts: BeneficiaryAccount[],
): BeneficiaryAccount {
  const candidate: BeneficiaryAccount =
    requested === "pluspay" ? "pluspay" : "benefits";
  return allowedAccounts.includes(candidate)
    ? candidate
    : (allowedAccounts[0] ?? "benefits");
}

export function formatBeneficiaryLimit(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function replaceAccount(
  state: BeneficiaryLimitState,
  account: BeneficiaryAccount,
  beneficiaries: BeneficiaryLimit[],
): BeneficiaryLimitState {
  return {
    ...state,
    accounts: {
      ...state.accounts,
      [account]: beneficiaries,
    },
  };
}

function parseWholeRupees(value: string): number | null {
  if (!/^\d+$/.test(value.trim())) return null;
  const amount = Number(value);
  return Number.isSafeInteger(amount) && amount > 0 ? amount : null;
}

function isBeneficiaryLimitState(
  value: unknown,
): value is BeneficiaryLimitState {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<BeneficiaryLimitState>;
  return (
    candidate.version === BENEFICIARY_LIMITS_STORAGE_VERSION &&
    Boolean(candidate.accounts) &&
    Array.isArray(candidate.accounts?.benefits) &&
    candidate.accounts.benefits.every(isBeneficiaryLimit) &&
    Array.isArray(candidate.accounts.pluspay) &&
    candidate.accounts.pluspay.every(isBeneficiaryLimit)
  );
}

function isBeneficiaryLimit(value: unknown): value is BeneficiaryLimit {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<BeneficiaryLimit>;
  return (
    typeof item.id === "string" &&
    Boolean(item.id) &&
    typeof item.name === "string" &&
    Boolean(item.name.trim()) &&
    typeof item.upiId === "string" &&
    UPI_ID_PATTERN.test(item.upiId) &&
    Number.isSafeInteger(item.monthlyLimit) &&
    Number(item.monthlyLimit) > 0 &&
    Number.isSafeInteger(item.perTransactionLimit) &&
    Number(item.perTransactionLimit) > 0 &&
    Number(item.perTransactionLimit) <= Number(item.monthlyLimit)
  );
}
