import type { PersonaId } from "@/features/persona/types";
import type {
  TransactionItem,
  TransactionWallet,
} from "@/features/transactions/constants";

export const FINANCIAL_STATE_STORAGE_KEY =
  "eb-claims:financial-state:v1";
export const FINANCIAL_STATE_VERSION = 1;
export const FINANCIAL_STATE_EVENT = "eb-claims:financial-state-updated";

/** Wallets eligible for the existing Scan & Pay/transfer funding flows. */
export type FundingWalletId = Exclude<TransactionWallet, "mobile">;

export type FundingAllocation = {
  walletId: FundingWalletId;
  walletLabel: string;
  amount: number;
};

export type PersonaFinancialDelta = {
  debits: Partial<Record<FundingWalletId, number>>;
  /** Claim amounts reserved against the Mobile & Internet wallet by claim ID. */
  mobileClaimDebits: Record<string, number>;
  transactions: TransactionItem[];
  committedPaymentIds: string[];
};

type PersistedFinancialState = {
  version: typeof FINANCIAL_STATE_VERSION;
  personas: Partial<Record<PersonaId, PersonaFinancialDelta>>;
};

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export type CommitBenefitPaymentInput = {
  personaId: PersonaId;
  paymentId: string;
  allocations: FundingAllocation[];
  rows: TransactionItem[];
  baseBalances: Record<FundingWalletId, number>;
};

export type CommitBenefitPaymentResult =
  | { status: "committed" }
  | { status: "duplicate" }
  | { status: "insufficient"; walletId: FundingWalletId };

const EMPTY_PERSONA_DELTA: PersonaFinancialDelta = {
  debits: {},
  mobileClaimDebits: {},
  transactions: [],
  committedPaymentIds: [],
};

function defaultStorage(): StorageLike | null {
  return typeof window === "undefined" ? null : window.sessionStorage;
}

export function readFinancialState(
  storage: StorageLike | null = defaultStorage(),
): PersistedFinancialState {
  const empty: PersistedFinancialState = {
    version: FINANCIAL_STATE_VERSION,
    personas: {},
  };
  if (!storage) return empty;
  try {
    const raw = storage.getItem(FINANCIAL_STATE_STORAGE_KEY);
    if (!raw) return empty;
    const parsed = JSON.parse(raw) as Partial<PersistedFinancialState>;
    if (
      parsed.version !== FINANCIAL_STATE_VERSION ||
      !parsed.personas ||
      typeof parsed.personas !== "object"
    ) {
      storage.removeItem(FINANCIAL_STATE_STORAGE_KEY);
      return empty;
    }
    return {
      version: FINANCIAL_STATE_VERSION,
      personas: parsed.personas,
    };
  } catch {
    return empty;
  }
}

export function getPersonaFinancialDelta(
  personaId: PersonaId,
  storage: StorageLike | null = defaultStorage(),
): PersonaFinancialDelta {
  const state = readFinancialState(storage).personas[personaId];
  return state
    ? {
        debits: { ...state.debits },
        mobileClaimDebits: { ...(state.mobileClaimDebits ?? {}) },
        transactions: [...state.transactions],
        committedPaymentIds: [...state.committedPaymentIds],
      }
    : {
        debits: {},
        mobileClaimDebits: {},
        transactions: [],
        committedPaymentIds: [],
      };
}

export function commitBenefitPayment(
  input: CommitBenefitPaymentInput,
  storage: StorageLike | null = defaultStorage(),
): CommitBenefitPaymentResult {
  const state = readFinancialState(storage);
  const current = getPersonaFinancialDelta(input.personaId, storage);
  if (current.committedPaymentIds.includes(input.paymentId)) {
    return { status: "duplicate" };
  }

  for (const allocation of input.allocations) {
    const alreadyDebited = current.debits[allocation.walletId] ?? 0;
    const available = Math.max(
      0,
      input.baseBalances[allocation.walletId] - alreadyDebited,
    );
    if (allocation.amount > available) {
      return { status: "insufficient", walletId: allocation.walletId };
    }
  }

  const nextDebits = { ...current.debits };
  for (const allocation of input.allocations) {
    nextDebits[allocation.walletId] =
      (nextDebits[allocation.walletId] ?? 0) + allocation.amount;
  }
  const next: PersonaFinancialDelta = {
    debits: nextDebits,
    mobileClaimDebits: { ...current.mobileClaimDebits },
    transactions: [...input.rows, ...current.transactions],
    committedPaymentIds: [
      input.paymentId,
      ...current.committedPaymentIds,
    ],
  };
  const persisted: PersistedFinancialState = {
    ...state,
    personas: { ...state.personas, [input.personaId]: next },
  };

  if (storage) {
    try {
      storage.setItem(FINANCIAL_STATE_STORAGE_KEY, JSON.stringify(persisted));
    } catch {
      // The current flow remains usable even when browser storage is blocked.
    }
  }
  if (typeof window !== "undefined" && storage === window.sessionStorage) {
    window.dispatchEvent(new Event(FINANCIAL_STATE_EVENT));
  }
  return { status: "committed" };
}

export type CommitMobileClaimResult =
  | { status: "committed" }
  | { status: "duplicate" }
  | { status: "insufficient" };

function writePersonaFinancialDelta(
  personaId: PersonaId,
  next: PersonaFinancialDelta,
  storage: StorageLike | null,
): void {
  const state = readFinancialState(storage);
  const persisted: PersistedFinancialState = {
    ...state,
    personas: { ...state.personas, [personaId]: next },
  };
  if (storage) {
    try {
      storage.setItem(FINANCIAL_STATE_STORAGE_KEY, JSON.stringify(persisted));
    } catch {
      // Keep the local demo usable when browser storage is unavailable.
    }
  }
  if (typeof window !== "undefined" && storage === window.sessionStorage) {
    window.dispatchEvent(new Event(FINANCIAL_STATE_EVENT));
  }
}

export function getMobileClaimDebit(
  personaId: PersonaId,
  storage: StorageLike | null = defaultStorage(),
): number {
  return Object.values(getPersonaFinancialDelta(personaId, storage).mobileClaimDebits)
    .reduce((sum, amount) => sum + amount, 0);
}

/** Reserve Mobile & Internet funds once for a submitted claim. */
export function commitMobileClaim(
  {
    personaId,
    claimId,
    amount,
    baseBalance,
  }: {
    personaId: PersonaId;
    claimId: string;
    amount: number;
    baseBalance: number;
  },
  storage: StorageLike | null = defaultStorage(),
): CommitMobileClaimResult {
  const normalizedClaimId = claimId.trim().toUpperCase();
  if (!Number.isFinite(amount) || amount <= 0) return { status: "insufficient" };
  const current = getPersonaFinancialDelta(personaId, storage);
  if (current.mobileClaimDebits[normalizedClaimId] !== undefined) {
    return { status: "duplicate" };
  }
  if (amount > Math.max(0, baseBalance - getMobileClaimDebit(personaId, storage))) {
    return { status: "insufficient" };
  }
  writePersonaFinancialDelta(personaId, {
    ...current,
    mobileClaimDebits: {
      ...current.mobileClaimDebits,
      [normalizedClaimId]: amount,
    },
  }, storage);
  return { status: "committed" };
}

/** Reprice a previously submitted Mobile & Internet claim without double-debiting. */
export function updateMobileClaim(
  input: { personaId: PersonaId; claimId: string; amount: number; baseBalance: number },
  storage: StorageLike | null = defaultStorage(),
): CommitMobileClaimResult {
  const normalizedClaimId = input.claimId.trim().toUpperCase();
  const current = getPersonaFinancialDelta(input.personaId, storage);
  const previous = current.mobileClaimDebits[normalizedClaimId];
  if (previous === undefined) return commitMobileClaim(input, storage);
  const usedExcludingCurrent = getMobileClaimDebit(input.personaId, storage) - previous;
  if (!Number.isFinite(input.amount) || input.amount <= 0 || input.amount > input.baseBalance - usedExcludingCurrent) {
    return { status: "insufficient" };
  }
  writePersonaFinancialDelta(input.personaId, {
    ...current,
    mobileClaimDebits: {
      ...current.mobileClaimDebits,
      [normalizedClaimId]: input.amount,
    },
  }, storage);
  return { status: "committed" };
}

export function releaseMobileClaim(
  personaId: PersonaId,
  claimId: string,
  storage: StorageLike | null = defaultStorage(),
): void {
  const normalizedClaimId = claimId.trim().toUpperCase();
  const current = getPersonaFinancialDelta(personaId, storage);
  if (current.mobileClaimDebits[normalizedClaimId] === undefined) return;
  const mobileClaimDebits = { ...current.mobileClaimDebits };
  delete mobileClaimDebits[normalizedClaimId];
  writePersonaFinancialDelta(personaId, { ...current, mobileClaimDebits }, storage);
}

export function subscribeToFinancialState(listener: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const onStorage = (event: StorageEvent) => {
    if (event.key === FINANCIAL_STATE_STORAGE_KEY || event.key === null) {
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(FINANCIAL_STATE_EVENT, listener);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(FINANCIAL_STATE_EVENT, listener);
  };
}

export function getFinancialSnapshot(): string {
  if (typeof window === "undefined") return "";
  try {
    return window.sessionStorage.getItem(FINANCIAL_STATE_STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

export function emptyPersonaFinancialDelta(): PersonaFinancialDelta {
  return {
    debits: { ...EMPTY_PERSONA_DELTA.debits },
    mobileClaimDebits: { ...EMPTY_PERSONA_DELTA.mobileClaimDebits },
    transactions: [],
    committedPaymentIds: [],
  };
}
