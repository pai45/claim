import { describe, expect, it } from "vitest";
import { onboardingReducer } from "./machine";
import {
  EB_PLUS_ACTIVATION_STORAGE_KEY,
  clearEbPlusActivation,
  createEbPlusActivationState,
  isEbPlusActivationComplete,
  loadEbPlusActivationState,
  saveEbPlusActivationState,
} from "./ebPlusActivation";

function memoryStorage() {
  const map = new Map<string, string>();
  return {
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => map.set(key, value),
    removeItem: (key: string) => map.delete(key),
  };
}

describe("Rohan EB+ activation", () => {
  it("starts on the benefits activation intro with KYC already complete", () => {
    const state = createEbPlusActivationState();

    expect(state).toMatchObject({
      step: "intro",
      completed: false,
      identityDone: false,
      kycStatus: "completed",
      cardSetupDone: false,
    });
    expect(state.identity).toMatchObject({
      email: "rohan.mehta@infosys.com",
      emailVerified: false,
      firstName: "Rohan",
      lastName: "Mehta",
    });
    expect(state.address.sameAsKyc).toBe(true);
  });

  it("continues from the intro through two setup steps to the card-ready screen", () => {
    let state = createEbPlusActivationState();

    state = onboardingReducer(state, { type: "go", step: "hub" });
    expect(state.step).toBe("hub");
    expect(state.kycStatus).toBe("completed");

    state = onboardingReducer(state, { type: "identity-complete" });
    state = onboardingReducer(state, { type: "card-setup-complete" });
    expect(state).toMatchObject({
      step: "ready",
      identityDone: true,
      cardSetupDone: true,
    });

    expect(state.completed).toBe(false);

    state = onboardingReducer(state, { type: "finish" });
    expect(state).toMatchObject({ step: "ready", completed: true });
  });

  it("persists partial progress and completion separately", () => {
    const storage = memoryStorage();
    let state = createEbPlusActivationState();
    state = onboardingReducer(state, { type: "identity-complete" });
    saveEbPlusActivationState(state, storage);

    expect(loadEbPlusActivationState(storage).identityDone).toBe(true);
    expect(isEbPlusActivationComplete(storage)).toBe(false);

    state = onboardingReducer(state, { type: "card-setup-complete" });
    state = onboardingReducer(state, { type: "finish" });
    saveEbPlusActivationState(state, storage);
    expect(isEbPlusActivationComplete(storage)).toBe(true);

    clearEbPlusActivation(storage);
    expect(storage.getItem(EB_PLUS_ACTIVATION_STORAGE_KEY)).toBeNull();
  });

  it("recovers from invalid records without exposing KYC", () => {
    const storage = memoryStorage();
    storage.setItem(EB_PLUS_ACTIVATION_STORAGE_KEY, "not-json");

    expect(loadEbPlusActivationState(storage)).toMatchObject({
      step: "intro",
      kycStatus: "completed",
    });
  });
});
