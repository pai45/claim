"use client";

import { useEffect, useReducer, useRef, useState } from "react";
import { AppShell } from "@/components/shared/AppShell";
import {
  KYC_AUTO_COMPLETE_MS,
  MIN_HANDOFF_AWAY_MS,
} from "@/features/onboarding/constants";
import {
  createInitialOnboardingState,
  onboardingReducer,
} from "@/features/onboarding/machine";
import {
  createEbPlusActivationState,
  loadEbPlusActivationState,
  saveEbPlusActivationState,
} from "@/features/onboarding/ebPlusActivation";
import {
  loadOnboardingState,
  saveOnboardingState,
} from "@/features/onboarding/storage";
import {
  clearVkycHandoff,
  handoffFlagCanCross,
  openVkycDemo,
  readVkycDone,
} from "@/features/onboarding/vkycHandoff";
import {
  CardAddressStep,
  CardChoiceStep,
  CardEmbossmentStep,
  CardKitStep,
  ReadyStep,
} from "./CardSteps";
import { HubStep } from "./HubStep";
import { IdentityDetailsStep, IdentityEmailStep } from "./IdentitySteps";
import { IntroStep } from "./IntroStep";
import {
  KycCompletedStep,
  KycIntroStep,
  KycProgressOverlay,
} from "./KycSteps";

export type OnboardingJourney = "initial" | "eb-plus-activation";

type OnboardingShellProps = {
  journey?: OnboardingJourney;
  onExit?: () => void;
  onComplete?: () => void;
};

export function OnboardingShell({
  journey = "initial",
  onExit,
  onComplete,
}: OnboardingShellProps = {}) {
  const [state, dispatch] = useReducer(
    onboardingReducer,
    journey,
    (activeJourney) =>
      activeJourney === "eb-plus-activation"
        ? createEbPlusActivationState()
        : createInitialOnboardingState(),
  );
  const [hydrated, setHydrated] = useState(false);
  const [kycProgressOpen, setKycProgressOpen] = useState(false);
  /** True when the browser hand-off was triggered by this page load, not a previous one. */
  const handoffStartedHereRef = useRef(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      dispatch({
        type: "hydrate",
        state:
          journey === "eb-plus-activation"
            ? loadEbPlusActivationState()
            : loadOnboardingState(),
      });
      setHydrated(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [journey]);

  useEffect(() => {
    if (!hydrated) return;
    if (journey === "eb-plus-activation") {
      saveEbPlusActivationState(state);
    } else {
      saveOnboardingState(state);
    }
  }, [state, hydrated, journey]);

  // Complete KYC from status, not from the modal staying open — dismissing
  // "OK" must not cancel the demo auto-approve timer.
  useEffect(() => {
    if (
      journey === "eb-plus-activation" ||
      !hydrated ||
      state.kycStatus !== "in_progress"
    ) {
      return;
    }
    const timer = window.setTimeout(() => {
      setKycProgressOpen(false);
      dispatch({ type: "kyc-complete" });
    }, KYC_AUTO_COMPLETE_MS);
    return () => window.clearTimeout(timer);
  }, [hydrated, journey, state.kycStatus]);

  // The VKYC page runs in another browsing context, so coming back here is the
  // only signal that it is over. When it ran in a tab of this same browser it
  // also leaves a flag behind, and requiring that flag means an early tab
  // switch cannot skip the journey. When it ran in a separate app — the native
  // shell's browser, or Chrome from an iOS home-screen app — the flag is
  // written to storage this app cannot read, so returning has to be enough.
  useEffect(() => {
    if (
      journey === "eb-plus-activation" ||
      !hydrated ||
      state.kycStatus !== "awaiting_return"
    ) {
      return;
    }
    const flagCanCross = handoffFlagCanCross();
    const startedHere = handoffStartedHereRef.current;
    const handoffAt = Date.now();

    const settle = (viaEvent: boolean) => {
      if (document.visibilityState !== "visible") return;
      if (!readVkycDone()) {
        // No flag to go on. Within one browser that means unfinished, full
        // stop. Across apps it is the normal case, and coming back is the whole
        // signal — so what counts is being sure the user actually went. Two
        // guards, because an iOS web app does not reliably report itself hidden
        // once a URL scheme has launched another app: it must be an event
        // rather than this effect's own first run, and enough time must have
        // passed that the event is a return and not the OS swapping windows.
        // Neither applies when this page load post-dates the hand-off (an app
        // relaunch), where leaving has already happened.
        if (flagCanCross) return;
        if (startedHere && !viaEvent) return;
        if (startedHere && Date.now() - handoffAt < MIN_HANDOFF_AWAY_MS) return;
      }
      clearVkycHandoff();
      handoffStartedHereRef.current = false;
      dispatch({ type: "kyc-verifying" });
      setKycProgressOpen(true);
    };

    // `focus` covers tab switches, which do not always fire `visibilitychange`;
    // `pageshow` covers a restore from the back-forward cache, which is how iOS
    // usually brings a web app back.
    const onEvent = () => settle(true);
    document.addEventListener("visibilitychange", onEvent);
    window.addEventListener("focus", onEvent);
    window.addEventListener("pageshow", onEvent);
    settle(false);
    return () => {
      document.removeEventListener("visibilitychange", onEvent);
      window.removeEventListener("focus", onEvent);
      window.removeEventListener("pageshow", onEvent);
    };
  }, [hydrated, journey, state.kycStatus]);

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
          journey={journey}
          onBack={() => {
            if (journey === "eb-plus-activation") {
              onExit?.();
              return;
            }
            dispatch({ type: "go", step: "intro" });
          }}
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

      {journey === "initial" && state.step === "kyc-intro" ? (
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

      {journey === "initial" && state.step === "kyc-completed" ? (
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
          onProceed={() => dispatch({ type: "go", step: "card-embossment" })}
        />
      ) : null}

      {state.step === "card-embossment" ? (
        <CardEmbossmentStep
          embossment={state.cardEmbossment}
          onBack={() => dispatch({ type: "go", step: "card-address" })}
          onChange={(field, value) =>
            dispatch({ type: "set-card-embossment-field", field, value })
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
          onFinish={() => {
            if (journey === "eb-plus-activation") {
              const completedState = onboardingReducer(state, {
                type: "finish",
              });
              saveEbPlusActivationState(completedState);
              dispatch({ type: "hydrate", state: completedState });
              onComplete?.();
              return;
            }
            dispatch({ type: "finish" });
          }}
        />
      ) : null}

      {journey === "initial" ? (
        <KycProgressOverlay
          open={kycProgressOpen}
          onDismiss={() => setKycProgressOpen(false)}
        />
      ) : null}
    </AppShell>
  );
}
