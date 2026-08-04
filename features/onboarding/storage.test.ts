import { beforeEach, describe, expect, it } from "vitest";
import { createInitialOnboardingState } from "./constants";
import {
  clearOnboarding,
  isOnboardingComplete,
  loadOnboardingState,
  saveOnboardingState,
} from "./storage";
import { ONBOARDING_STORAGE_KEY } from "./constants";

function memoryStorage() {
  const map = new Map<string, string>();
  return {
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => {
      map.set(key, value);
    },
    removeItem: (key: string) => {
      map.delete(key);
    },
  };
}

describe("onboarding storage", () => {
  let storage: ReturnType<typeof memoryStorage>;

  beforeEach(() => {
    storage = memoryStorage();
  });

  it("round-trips a saved state", () => {
    const state = {
      ...createInitialOnboardingState(),
      identityDone: true,
      step: "hub" as const,
    };
    saveOnboardingState(state, storage);
    expect(loadOnboardingState(storage).identityDone).toBe(true);
    expect(loadOnboardingState(storage).step).toBe("hub");
  });

  it("reports incomplete by default", () => {
    expect(isOnboardingComplete(storage)).toBe(false);
  });

  it("reports complete after finish flag is saved", () => {
    saveOnboardingState(
      { ...createInitialOnboardingState(), completed: true },
      storage,
    );
    expect(isOnboardingComplete(storage)).toBe(true);
  });

  it("clears stored progress", () => {
    saveOnboardingState(
      { ...createInitialOnboardingState(), completed: true },
      storage,
    );
    clearOnboarding(storage);
    expect(storage.getItem(ONBOARDING_STORAGE_KEY)).toBeNull();
    expect(isOnboardingComplete(storage)).toBe(false);
  });
});
