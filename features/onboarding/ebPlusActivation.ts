import { KYC_ADDRESS, createInitialOnboardingState } from "./constants";
import type { OnboardingState } from "./types";

export const EB_PLUS_ACTIVATION_STORAGE_KEY =
  "eb-claims:eb-plus-activation:v1";
export const EB_PLUS_ACTIVATION_EVENT =
  "eb-claims:eb-plus-activation-changed";
export const EB_PLUS_ACTIVATION_VERSION = 1 as const;

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

type PersistedEbPlusActivation = {
  version: typeof EB_PLUS_ACTIVATION_VERSION;
  personaId: "pluspay_only";
  state: OnboardingState;
};

function fallbackStorage(): StorageLike {
  return { getItem: () => null, setItem: () => {}, removeItem: () => {} };
}

function defaultStorage(): StorageLike {
  return typeof window !== "undefined" ? window.localStorage : fallbackStorage();
}

function isValidOnboardingState(value: unknown): value is OnboardingState {
  if (!value || typeof value !== "object") return false;
  const state = value as Partial<OnboardingState>;
  return (
    state.version === 3 &&
    typeof state.step === "string" &&
    typeof state.completed === "boolean" &&
    typeof state.identityDone === "boolean" &&
    state.kycStatus === "completed" &&
    typeof state.cardSetupDone === "boolean" &&
    !!state.identity &&
    !!state.address &&
    !!state.cardEmbossment &&
    typeof state.kitNumber === "string" &&
    typeof state.onlineTransactions === "boolean" &&
    typeof state.tapToPay === "boolean"
  );
}

function notify(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(EB_PLUS_ACTIVATION_EVENT));
}

export function createEbPlusActivationState(): OnboardingState {
  const state = createInitialOnboardingState("pluspay_only");
  return {
    ...state,
    step: "hub",
    kycStatus: "completed",
    identity: {
      ...state.identity,
      emailVerified: false,
    },
    address: {
      ...KYC_ADDRESS,
      sameAsKyc: true,
    },
  };
}

export function loadEbPlusActivationState(
  storage: StorageLike = defaultStorage(),
): OnboardingState {
  try {
    const raw = storage.getItem(EB_PLUS_ACTIVATION_STORAGE_KEY);
    if (!raw) return createEbPlusActivationState();
    const record = JSON.parse(raw) as Partial<PersistedEbPlusActivation>;
    if (
      record.version !== EB_PLUS_ACTIVATION_VERSION ||
      record.personaId !== "pluspay_only" ||
      !isValidOnboardingState(record.state)
    ) {
      storage.removeItem(EB_PLUS_ACTIVATION_STORAGE_KEY);
      return createEbPlusActivationState();
    }
    return record.state;
  } catch {
    try {
      storage.removeItem(EB_PLUS_ACTIVATION_STORAGE_KEY);
    } catch {
      // Storage can be blocked in managed or private browsing contexts.
    }
    return createEbPlusActivationState();
  }
}

export function saveEbPlusActivationState(
  state: OnboardingState,
  storage: StorageLike = defaultStorage(),
): void {
  const record: PersistedEbPlusActivation = {
    version: EB_PLUS_ACTIVATION_VERSION,
    personaId: "pluspay_only",
    state: {
      ...state,
      // KYC belongs to the existing PlusPay account and cannot regress here.
      kycStatus: "completed",
    },
  };
  try {
    storage.setItem(EB_PLUS_ACTIVATION_STORAGE_KEY, JSON.stringify(record));
  } catch {
    // The in-memory journey can still finish when persistence is unavailable.
  }
  notify();
}

export function clearEbPlusActivation(
  storage: StorageLike = defaultStorage(),
): void {
  try {
    storage.removeItem(EB_PLUS_ACTIVATION_STORAGE_KEY);
  } catch {
    // Clearing remains safe when storage is unavailable.
  }
  notify();
}

export function isEbPlusActivationComplete(
  storage: StorageLike = defaultStorage(),
): boolean {
  return loadEbPlusActivationState(storage).completed;
}

export function subscribeToEbPlusActivation(listener: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const onStorage = (event: StorageEvent) => {
    if (
      event.key === EB_PLUS_ACTIVATION_STORAGE_KEY ||
      event.key === null
    ) {
      listener();
    }
  };
  window.addEventListener(EB_PLUS_ACTIVATION_EVENT, listener);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(EB_PLUS_ACTIVATION_EVENT, listener);
    window.removeEventListener("storage", onStorage);
  };
}
