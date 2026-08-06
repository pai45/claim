import {
  DEFAULT_IDENTITY,
  ONBOARDING_SESSION_EVENT,
  ONBOARDING_STORAGE_KEY,
  ONBOARDING_STORAGE_VERSION,
  createInitialOnboardingState,
} from "./constants";
import type { OnboardingState } from "./types";

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

function notify(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(ONBOARDING_SESSION_EVENT));
}

function isValidState(value: unknown): value is OnboardingState {
  if (!value || typeof value !== "object") return false;
  const state = value as Partial<OnboardingState>;
  return (
    state.version === ONBOARDING_STORAGE_VERSION &&
    typeof state.step === "string" &&
    typeof state.completed === "boolean" &&
    typeof state.identityDone === "boolean" &&
    typeof state.kycStatus === "string" &&
    typeof state.cardSetupDone === "boolean" &&
    !!state.identity &&
    !!state.address &&
    !!state.cardEmbossment
  );
}

export function loadOnboardingState(
  storage: StorageLike = window.localStorage,
): OnboardingState {
  try {
    const raw = storage.getItem(ONBOARDING_STORAGE_KEY);
    if (!raw) return createInitialOnboardingState();
    const parsed = JSON.parse(raw) as unknown;
    if (!isValidState(parsed)) {
      storage.removeItem(ONBOARDING_STORAGE_KEY);
      return createInitialOnboardingState();
    }
    return {
      ...parsed,
      identity: {
        ...DEFAULT_IDENTITY,
        ...parsed.identity,
        // Existing demo sessions may have saved this before DOB was prefilled.
        dateOfBirth: parsed.identity.dateOfBirth || DEFAULT_IDENTITY.dateOfBirth,
      },
    };
  } catch {
    return createInitialOnboardingState();
  }
}

export function saveOnboardingState(
  state: OnboardingState,
  storage: StorageLike = window.localStorage,
): void {
  try {
    storage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage may be unavailable.
  }
  notify();
}

export function clearOnboarding(
  storage: StorageLike = window.localStorage,
): void {
  try {
    storage.removeItem(ONBOARDING_STORAGE_KEY);
  } catch {
    // Clearing should remain safe when storage is blocked.
  }
  notify();
}

export function isOnboardingComplete(
  storage: StorageLike = window.localStorage,
): boolean {
  return loadOnboardingState(storage).completed;
}

export function subscribeToOnboarding(listener: () => void): () => void {
  const onStorage = (event: StorageEvent) => {
    if (event.key === ONBOARDING_STORAGE_KEY || event.key === null) listener();
  };
  window.addEventListener(ONBOARDING_SESSION_EVENT, listener);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(ONBOARDING_SESSION_EVENT, listener);
    window.removeEventListener("storage", onStorage);
  };
}
