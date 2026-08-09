export type PaymentLimitAccount = "benefits" | "pluspay";

export type PaymentLimitAudience = "individuals" | "merchants";

export type PaymentLimitMetric =
  | "amountPerDay"
  | "amountPerMonth"
  | "transactionsPerDay"
  | "transactionsPerMonth";

export type PaymentLimitValues = Record<PaymentLimitMetric, number | null>;

export type PaymentLimitState = {
  version: typeof PAYMENT_LIMITS_STORAGE_VERSION;
  accounts: Record<
    PaymentLimitAccount,
    Record<PaymentLimitAudience, PaymentLimitValues>
  >;
};

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export const PAYMENT_LIMITS_STORAGE_KEY = "eb-claims:payment-limits:v1";
export const PAYMENT_LIMITS_STORAGE_VERSION = 1;

export const PAYMENT_LIMIT_AUDIENCES: PaymentLimitAudience[] = [
  "individuals",
  "merchants",
];

export const PAYMENT_LIMIT_METRICS: PaymentLimitMetric[] = [
  "amountPerDay",
  "amountPerMonth",
  "transactionsPerDay",
  "transactionsPerMonth",
];

const DEFAULT_VALUES: PaymentLimitValues = {
  amountPerDay: 20_000,
  amountPerMonth: null,
  transactionsPerDay: 10,
  transactionsPerMonth: null,
};

export function createDefaultPaymentLimitState(): PaymentLimitState {
  return {
    version: PAYMENT_LIMITS_STORAGE_VERSION,
    accounts: {
      benefits: createDefaultAudienceState(),
      pluspay: createDefaultAudienceState(),
    },
  };
}

export function loadPaymentLimitState(
  storage: StorageLike = window.localStorage,
): PaymentLimitState {
  try {
    const raw = storage.getItem(PAYMENT_LIMITS_STORAGE_KEY);
    if (!raw) return createDefaultPaymentLimitState();

    const parsed = JSON.parse(raw) as unknown;
    if (!isPaymentLimitState(parsed)) {
      storage.removeItem(PAYMENT_LIMITS_STORAGE_KEY);
      return createDefaultPaymentLimitState();
    }

    return clonePaymentLimitState(parsed);
  } catch {
    try {
      storage.removeItem(PAYMENT_LIMITS_STORAGE_KEY);
    } catch {
      // Storage can be unavailable in private or managed browsing contexts.
    }
    return createDefaultPaymentLimitState();
  }
}

export function savePaymentLimitState(
  state: PaymentLimitState,
  storage: StorageLike = window.localStorage,
): void {
  try {
    storage.setItem(PAYMENT_LIMITS_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Keep the in-memory UI usable when persistence is unavailable.
  }
}

export function updatePaymentLimit(
  state: PaymentLimitState,
  account: PaymentLimitAccount,
  audience: PaymentLimitAudience,
  metric: PaymentLimitMetric,
  value: number | null,
): PaymentLimitState {
  return {
    ...state,
    accounts: {
      ...state.accounts,
      [account]: {
        ...state.accounts[account],
        [audience]: {
          ...state.accounts[account][audience],
          [metric]: value,
        },
      },
    },
  };
}

export function resolvePaymentLimitAccount(
  requested: string | null,
  allowedAccounts: PaymentLimitAccount[],
): PaymentLimitAccount {
  const candidate: PaymentLimitAccount =
    requested === "pluspay" ? "pluspay" : "benefits";
  return allowedAccounts.includes(candidate)
    ? candidate
    : (allowedAccounts[0] ?? "benefits");
}

export function resolvePaymentLimitAudience(
  requested: string | null,
): PaymentLimitAudience | null {
  return requested === "individuals" || requested === "merchants"
    ? requested
    : null;
}

export function resolvePaymentLimitMetric(
  requested: string | null,
): PaymentLimitMetric | null {
  return PAYMENT_LIMIT_METRICS.find((metric) => metric === requested) ?? null;
}

export function validatePaymentLimitInput(value: string): string | null {
  if (!value.trim()) return "Enter a limit.";
  if (!/^\d+$/.test(value.trim())) return "Enter a positive whole number.";

  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed <= 0) {
    return "Enter a positive whole number.";
  }
  return null;
}

export function parsePaymentLimitInput(value: string): number {
  return Number(value.trim());
}

export function isAmountMetric(metric: PaymentLimitMetric): boolean {
  return metric === "amountPerDay" || metric === "amountPerMonth";
}

export function formatPaymentLimit(
  metric: PaymentLimitMetric,
  value: number | null,
): string {
  if (value === null) return "---";
  if (!isAmountMetric(metric)) return new Intl.NumberFormat("en-IN").format(value);

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function createDefaultAudienceState(): Record<
  PaymentLimitAudience,
  PaymentLimitValues
> {
  return {
    individuals: { ...DEFAULT_VALUES },
    merchants: { ...DEFAULT_VALUES },
  };
}

function clonePaymentLimitState(state: PaymentLimitState): PaymentLimitState {
  return {
    version: PAYMENT_LIMITS_STORAGE_VERSION,
    accounts: {
      benefits: {
        individuals: { ...state.accounts.benefits.individuals },
        merchants: { ...state.accounts.benefits.merchants },
      },
      pluspay: {
        individuals: { ...state.accounts.pluspay.individuals },
        merchants: { ...state.accounts.pluspay.merchants },
      },
    },
  };
}

function isPaymentLimitState(value: unknown): value is PaymentLimitState {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<PaymentLimitState>;
  return (
    candidate.version === PAYMENT_LIMITS_STORAGE_VERSION &&
    Boolean(candidate.accounts) &&
    isAudienceState(candidate.accounts?.benefits) &&
    isAudienceState(candidate.accounts?.pluspay)
  );
}

function isAudienceState(
  value: unknown,
): value is Record<PaymentLimitAudience, PaymentLimitValues> {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<
    Record<PaymentLimitAudience, PaymentLimitValues>
  >;
  return (
    isPaymentLimitValues(candidate.individuals) &&
    isPaymentLimitValues(candidate.merchants)
  );
}

function isPaymentLimitValues(value: unknown): value is PaymentLimitValues {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<PaymentLimitValues>;
  return PAYMENT_LIMIT_METRICS.every((metric) => {
    const limit = candidate[metric];
    return limit === null || (Number.isSafeInteger(limit) && Number(limit) > 0);
  });
}
