"use client";

import { useEffect, useReducer, useState } from "react";
import { AppShell } from "@/components/shared/AppShell";
import { KYC_AUTO_COMPLETE_MS } from "@/features/onboarding/constants";
import {
  createInitialOnboardingState,
  onboardingReducer,
} from "@/features/onboarding/machine";
import {
  loadOnboardingState,
  saveOnboardingState,
} from "@/features/onboarding/storage";
import type { IdentityForm } from "@/features/onboarding/types";
import { CardAddressStep, CardChoiceStep, CardKitStep, ReadyStep } from "./CardSteps";
import { HubStep } from "./HubStep";
import { IdentityDetailsStep, IdentityEmailStep } from "./IdentitySteps";
import { IntroStep } from "./IntroStep";
import {
  KycAuthStep,
  KycCompletedStep,
  KycConsentStep,
  KycIntroStep,
  KycProgressOverlay,
} from "./KycSteps";

export function OnboardingShell() {
  const [state, dispatch] = useReducer(
    onboardingReducer,
    undefined,
    () => createInitialOnboardingState(),
  );
  const [hydrated, setHydrated] = useState(false);
  const [kycProgressOpen, setKycProgressOpen] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      dispatch({ type: "hydrate", state: loadOnboardingState() });
      setHydrated(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveOnboardingState(state);
  }, [state, hydrated]);

  // Complete KYC from status, not from the modal staying open — dismissing
  // "OK" must not cancel the demo auto-approve timer.
  useEffect(() => {
    if (!hydrated || state.kycStatus !== "in_progress") return;
    const timer = window.setTimeout(() => {
      setKycProgressOpen(false);
      dispatch({ type: "kyc-complete" });
    }, KYC_AUTO_COMPLETE_MS);
    return () => window.clearTimeout(timer);
  }, [hydrated, state.kycStatus]);

  if (!hydrated) {
    return <div className="h-dvh w-full bg-surface" aria-hidden="true" />;
  }

  return (
    <AppShell className="overflow-hidden">
      {state.step === "intro" ? (
        <IntroStep onContinue={() => dispatch({ type: "go", step: "hub" })} />
      ) : null}

      {state.step === "hub" ? (
        <HubStep
          state={state}
          onBack={() => dispatch({ type: "go", step: "intro" })}
          onOpenIdentity={() =>
            dispatch({ type: "go", step: "identity-email" })
          }
          onOpenKyc={() => {
            if (state.kycStatus === "completed") return;
            if (state.kycStatus === "in_progress") {
              setKycProgressOpen(true);
              return;
            }
            dispatch({ type: "go", step: "kyc-intro" });
          }}
          onOpenCard={() => dispatch({ type: "go", step: "card-choice" })}
          onContinueToReady={() => dispatch({ type: "go", step: "ready" })}
        />
      ) : null}

      {state.step === "identity-email" ? (
        <IdentityEmailStep
          email={state.identity.email}
          onBack={() => dispatch({ type: "go", step: "hub" })}
          onChangeEmail={(value) => dispatch({ type: "set-email", value })}
          onVerified={() => dispatch({ type: "email-verified" })}
        />
      ) : null}

      {state.step === "identity-details" ? (
        <IdentityDetailsStep
          identity={state.identity}
          onBack={() => dispatch({ type: "go", step: "identity-email" })}
          onChange={(field, value) =>
            dispatch({
              type: "set-identity-field",
              field: field as keyof IdentityForm,
              value,
            })
          }
          onComplete={() => dispatch({ type: "identity-complete" })}
        />
      ) : null}

      {state.step === "kyc-intro" ? (
        <KycIntroStep
          onBack={() => dispatch({ type: "go", step: "hub" })}
          onStart={() => dispatch({ type: "kyc-start" })}
        />
      ) : null}

      {state.step === "kyc-consent" ? (
        <KycConsentStep
          onBack={() => dispatch({ type: "go", step: "kyc-intro" })}
          onConfirm={() => dispatch({ type: "go", step: "kyc-auth" })}
        />
      ) : null}

      {state.step === "kyc-auth" ? (
        <KycAuthStep
          onBack={() => dispatch({ type: "go", step: "kyc-consent" })}
          onAuthenticate={() => {
            dispatch({ type: "kyc-mark-in-progress" });
            setKycProgressOpen(true);
          }}
        />
      ) : null}

      {state.step === "kyc-completed" ? (
        <KycCompletedStep
          onContinue={() => dispatch({ type: "go", step: "hub" })}
        />
      ) : null}

      {state.step === "card-choice" ? (
        <CardChoiceStep
          onBack={() => dispatch({ type: "go", step: "hub" })}
          onOrderNew={() => dispatch({ type: "go", step: "card-address" })}
          onHaveKit={() => dispatch({ type: "go", step: "card-kit" })}
        />
      ) : null}

      {state.step === "card-address" ? (
        <CardAddressStep
          address={state.address}
          onBack={() => dispatch({ type: "go", step: "card-choice" })}
          onChange={(field, value) =>
            dispatch({ type: "set-address-field", field, value })
          }
          onComplete={() => dispatch({ type: "card-setup-complete" })}
        />
      ) : null}

      {state.step === "card-kit" ? (
        <CardKitStep
          kitNumber={state.kitNumber}
          onBack={() => dispatch({ type: "go", step: "card-choice" })}
          onChange={(value) => dispatch({ type: "set-kit-number", value })}
          onComplete={() => dispatch({ type: "card-setup-complete" })}
        />
      ) : null}

      {state.step === "ready" ? (
        <ReadyStep
          state={state}
          onToggleOnline={(value) =>
            dispatch({ type: "set-online-tx", value })
          }
          onToggleTap={(value) => dispatch({ type: "set-tap-to-pay", value })}
          onFinish={() => dispatch({ type: "finish" })}
        />
      ) : null}

      <KycProgressOverlay
        open={kycProgressOpen}
        onDismiss={() => setKycProgressOpen(false)}
      />
    </AppShell>
  );
}
