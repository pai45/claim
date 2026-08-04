import { KYC_ADDRESS, createInitialOnboardingState } from "./constants";
import type { OnboardingAction, OnboardingState } from "./types";

export function onboardingReducer(
  state: OnboardingState,
  action: OnboardingAction,
): OnboardingState {
  switch (action.type) {
    case "hydrate":
      return action.state;

    case "go":
      return { ...state, step: action.step };

    case "set-email":
      return {
        ...state,
        identity: {
          ...state.identity,
          email: action.value,
          emailVerified: false,
        },
      };

    case "email-verified":
      return {
        ...state,
        identity: { ...state.identity, emailVerified: true },
        step: "identity-details",
      };

    case "set-identity-field":
      return {
        ...state,
        identity: { ...state.identity, [action.field]: action.value },
      };

    case "identity-complete":
      return {
        ...state,
        identityDone: true,
        step: "hub",
      };

    case "kyc-start":
      return { ...state, step: "kyc-consent" };

    case "kyc-mark-in-progress":
      return {
        ...state,
        kycStatus: "in_progress",
        step: "hub",
      };

    case "kyc-complete":
      return {
        ...state,
        kycStatus: "completed",
        step: "kyc-completed",
      };

    case "set-address-field": {
      const next = {
        ...state,
        address: { ...state.address, [action.field]: action.value },
      };
      if (action.field === "sameAsKyc" && action.value === true) {
        next.address = {
          ...KYC_ADDRESS,
          sameAsKyc: true,
        };
      }
      if (action.field === "sameAsKyc" && action.value === false) {
        next.address = {
          line1: "",
          line2: "",
          pinCode: "",
          sameAsKyc: false,
        };
      }
      return next;
    }

    case "autofill-kyc-address":
      return {
        ...state,
        address: { ...KYC_ADDRESS, sameAsKyc: true },
      };

    case "set-kit-number":
      return { ...state, kitNumber: action.value };

    case "card-setup-complete":
      return {
        ...state,
        cardSetupDone: true,
        step: "hub",
      };

    case "set-online-tx":
      return { ...state, onlineTransactions: action.value };

    case "set-tap-to-pay":
      return { ...state, tapToPay: action.value };

    case "finish":
      return {
        ...state,
        completed: true,
        step: "ready",
      };

    default:
      return state;
  }
}

export function canOpenHubStep(
  state: OnboardingState,
  id: "identity" | "kyc" | "card",
): boolean {
  if (id === "identity") return true;
  if (id === "kyc") return state.identityDone;
  return state.identityDone && state.kycStatus === "completed";
}

export function allStepsDone(state: OnboardingState): boolean {
  return (
    state.identityDone &&
    state.kycStatus === "completed" &&
    state.cardSetupDone
  );
}

export { createInitialOnboardingState };
