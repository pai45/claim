import { getActivePersonaId } from "@/features/persona/store";
import {
  ONBOARDING_SESSION_EVENT,
  ONBOARDING_STORAGE_KEY,
  ONBOARDING_STORAGE_VERSION,
  createCompletedOnboardingState,
  createInitialOnboardingState,
  getIdentityForPersona,
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
  storage: StorageLike = typeof window !== "undefined" ? window.localStorage : { getItem: () => null, setItem: () => {}, removeItem: () => {} },
): OnboardingState {
  try {
    const personaId = getActivePersonaId(storage);
    const defaultIdentity = getIdentityForPersona(personaId);
    const raw = storage.getItem(ONBOARDING_STORAGE_KEY);
    if (!raw) return createInitialOnboardingState(personaId);
    const parsed = JSON.parse(raw) as unknown;
    if (!isValidState(parsed)) {
      storage.removeItem(ONBOARDING_STORAGE_KEY);
      return createInitialOnboardingState(personaId);
    }
    return {
      ...parsed,
      identity: {
        ...defaultIdentity,
        ...parsed.identity,
        // Existing demo sessions may have saved this before DOB was prefilled.
        dateOfBirth: parsed.identity.dateOfBirth || defaultIdentity.dateOfBirth,
      },
    };
  } catch {
    return createInitialOnboardingState();
  }
}

export function saveOnboardingState(
  state: OnboardingState,
  storage: StorageLike = typeof window !== "undefined" ? window.localStorage : { getItem: () => null, setItem: () => {}, removeItem: () => {} },
): void {
  try {
    storage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage may be unavailable.
  }
  notify();
}

export function clearOnboarding(
  storage: StorageLike = typeof window !== "undefined" ? window.localStorage : { getItem: () => null, setItem: () => {}, removeItem: () => {} },
): void {
  try {
    storage.removeItem(ONBOARDING_STORAGE_KEY);
  } catch {
    // Clearing should remain safe when storage is blocked.
  }
  notify();
}

export function isOnboardingComplete(
  storage: StorageLike = typeof window !== "undefined" ? window.localStorage : { getItem: () => null, setItem: () => {}, removeItem: () => {} },
): boolean {
  return loadOnboardingState(storage).completed;
}

export function subscribeToOnboarding(listener: () => void): () => void {
  if (typeof window === "undefined") return () => {};
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

export { createInitialOnboardingState, createCompletedOnboardingState };
