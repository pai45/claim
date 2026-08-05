"use client";

import { useEffect, useReducer, useRef, useState } from "react";
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
import {
  clearVkycDone,
  openVkycDemo,
  readVkycDone,
} from "@/features/onboarding/vkycHandoff";
import { detectAppPlatform } from "@/lib/pwa/platform";
import { CardAddressStep, CardChoiceStep, CardKitStep, ReadyStep } from "./CardSteps";
import { HubStep } from "./HubStep";
import { IdentityDetailsStep, IdentityEmailStep } from "./IdentitySteps";
import { IntroStep } from "./IntroStep";
import {
  KycCompletedStep,
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
  /** True when the browser hand-off was triggered by this page load, not a previous one. */
  const handoffStartedHereRef = useRef(false);

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

  // The VKYC page runs in another browsing context, so coming back here is the
  // only signal that it is over. On the web and in a PWA the page also leaves a
  // flag behind, and requiring it means an early tab switch cannot skip the
  // journey. The native shell cannot see that flag — the system browser has its
  // own storage — so there, returning at all has to be enough.
  useEffect(() => {
    if (!hydrated || state.kycStatus !== "awaiting_return") return;
    const flagCanCross = detectAppPlatform() !== "native-shell";
    const startedHere = handoffStartedHereRef.current;
    let wentAway = false;

    const settle = () => {
      if (document.visibilityState !== "visible") {
        wentAway = true;
        return;
      }
      if (!readVkycDone()) {
        // No flag to go on. On the web that means unfinished, full stop. In the
        // native shell it is the normal case — but the hand-off leaves the app
        // in the foreground for a moment while the OS starts the browser, and
        // settling then would finish KYC as the user is only just arriving. So
        // require having actually gone away, unless this page load post-dates
        // the hand-off (an app relaunch), where leaving already happened.
        if (flagCanCross) return;
        if (startedHere && !wentAway) return;
      }
      clearVkycDone();
      handoffStartedHereRef.current = false;
      dispatch({ type: "kyc-verifying" });
      setKycProgressOpen(true);
    };

    // `focus` covers desktop tab switches, which do not always fire
    // `visibilitychange`.
    document.addEventListener("visibilitychange", settle);
    window.addEventListener("focus", settle);
    settle();
    return () => {
      document.removeEventListener("visibilitychange", settle);
      window.removeEventListener("focus", settle);
    };
  }, [hydrated, state.kycStatus]);

  if (!hydrated) {
    return <div className="h-dvh w-full bg-surface" aria-hidden="true" />;
  }

  return (
    <AppShell
      className={`overflow-hidden ${
        state.step === "kyc-intro" ? "!max-w-[418px]" : ""
      }`}
    >
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
            // `awaiting_return` falls through: the KYC screen is where the
            // "Reopen KYC tab" recovery lives.
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
          onVerified={() => dispatch({ type: "email-verified" })}
        />
      ) : null}

      {state.step === "identity-details" ? (
        <IdentityDetailsStep
          identity={state.identity}
          onBack={() => dispatch({ type: "go", step: "identity-email" })}
          onComplete={() => dispatch({ type: "identity-complete" })}
        />
      ) : null}

      {state.step === "kyc-intro" ? (
        <KycIntroStep
          awaitingReturn={state.kycStatus === "awaiting_return"}
          onStart={() => {
            // Must run inside the click, before any state update, or the
            // user-gesture flag is gone and the popup is blocked.
            openVkycDemo();
            handoffStartedHereRef.current = true;
            dispatch({ type: "kyc-handoff-started" });
          }}
          onCompleted={() => {
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
