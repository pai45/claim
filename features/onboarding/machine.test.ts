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

  it("starts Rahul's journey with his identity prefilled", () => {
    const state = createInitialOnboardingState("rahul_onboarding");

    expect(state.step).toBe("intro");
    expect(state.completed).toBe(false);
    expect(state.identity).toMatchObject({
      email: "rahul.verma@infosys.com",
      firstName: "Rahul",
      lastName: "Verma",
      dateOfBirth: "15/03/1995",
    });
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

  it("holds on the KYC screen across the browser hand-off", () => {
    let state = createInitialOnboardingState();
    state = onboardingReducer(state, { type: "identity-complete" });
    state = onboardingReducer(state, { type: "go", step: "kyc-intro" });

    // Leaving for the VKYC page must not move the step: the user comes back to
    // this screen and needs the "Reopen KYC tab" recovery on it.
    state = onboardingReducer(state, { type: "kyc-handoff-started" });
    expect(state.kycStatus).toBe("awaiting_return");
    expect(state.step).toBe("kyc-intro");

    state = onboardingReducer(state, { type: "kyc-verifying" });
    expect(state.kycStatus).toBe("in_progress");
    expect(state.step).toBe("kyc-intro");

    state = onboardingReducer(state, { type: "kyc-complete" });
    expect(state.kycStatus).toBe("completed");
    expect(state.step).toBe("kyc-completed");
  });

  it("sends the manual 'already completed' path back to the hub", () => {
    let state = createInitialOnboardingState();
    state = onboardingReducer(state, { type: "go", step: "kyc-intro" });
    state = onboardingReducer(state, { type: "kyc-mark-in-progress" });
    expect(state.kycStatus).toBe("in_progress");
    expect(state.step).toBe("hub");
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

  it("opens the card-ready screen as soon as card setup is complete", () => {
    let state = createInitialOnboardingState();
    state = onboardingReducer(state, { type: "identity-complete" });
    state = onboardingReducer(state, { type: "kyc-complete" });
    state = onboardingReducer(state, { type: "card-setup-complete" });
    expect(allStepsDone(state)).toBe(true);
    expect(state).toMatchObject({ step: "ready", completed: false });
  });

  it("stores kit number", () => {
    let state = createInitialOnboardingState();
    state = onboardingReducer(state, {
      type: "set-kit-number",
      value: DEMO_KIT_NUMBER,
    });
    expect(state.kitNumber).toBe(DEMO_KIT_NUMBER);
  });

  it("stores the first and last names selected for card embossment", () => {
    let state = createInitialOnboardingState();
    state = onboardingReducer(state, {
      type: "set-card-embossment-field",
      field: "firstName",
      value: "Vishal",
    });
    state = onboardingReducer(state, {
      type: "set-card-embossment-field",
      field: "lastName",
      value: "Sharma",
    });
    expect(state.cardEmbossment).toEqual({
      firstName: "Vishal",
      lastName: "Sharma",
    });
  });
});
