import { describe, expect, it } from "vitest";
import {
  createInitialOnboardingState,
  onboardingReducer,
  canOpenHubStep,
  allStepsDone,
} from "./machine";
import { DEMO_KIT_NUMBER, KYC_ADDRESS } from "./constants";

describe("onboardingReducer", () => {
  it("starts on intro with nothing complete", () => {
    const state = createInitialOnboardingState();
    expect(state.step).toBe("intro");
    expect(state.completed).toBe(false);
    expect(allStepsDone(state)).toBe(false);
  });

  it("locks KYC and card until prior steps complete", () => {
    let state = createInitialOnboardingState();
    expect(canOpenHubStep(state, "identity")).toBe(true);
    expect(canOpenHubStep(state, "kyc")).toBe(false);
    expect(canOpenHubStep(state, "card")).toBe(false);

    state = onboardingReducer(state, { type: "identity-complete" });
    expect(state.identityDone).toBe(true);
    expect(canOpenHubStep(state, "kyc")).toBe(true);
    expect(canOpenHubStep(state, "card")).toBe(false);

    state = onboardingReducer(state, { type: "kyc-complete" });
    expect(canOpenHubStep(state, "card")).toBe(true);
  });

  it("autofills KYC address when sameAsKyc is checked", () => {
    let state = createInitialOnboardingState();
    state = onboardingReducer(state, {
      type: "set-address-field",
      field: "sameAsKyc",
      value: true,
    });
    expect(state.address.line1).toBe(KYC_ADDRESS.line1);
    expect(state.address.pinCode).toBe(KYC_ADDRESS.pinCode);
    expect(state.address.sameAsKyc).toBe(true);
  });

  it("marks journey complete on finish", () => {
    let state = createInitialOnboardingState();
    state = onboardingReducer(state, { type: "identity-complete" });
    state = onboardingReducer(state, { type: "kyc-complete" });
    state = onboardingReducer(state, { type: "card-setup-complete" });
    expect(allStepsDone(state)).toBe(true);
    state = onboardingReducer(state, { type: "finish" });
    expect(state.completed).toBe(true);
  });

  it("stores kit number", () => {
    let state = createInitialOnboardingState();
    state = onboardingReducer(state, {
      type: "set-kit-number",
      value: DEMO_KIT_NUMBER,
    });
    expect(state.kitNumber).toBe(DEMO_KIT_NUMBER);
  });
});
