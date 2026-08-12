"use client";

import { HUB_STEPS } from "@/features/onboarding/constants";
import { canOpenHubStep } from "@/features/onboarding/machine";
import type { OnboardingState } from "@/features/onboarding/types";
import { colors } from "@/lib/ui/colors";
import { OnboardingHeader } from "./OnboardingHeader";
import { HubStepCard } from "./OnboardingPrimitives";

type HubStepProps = {
  state: OnboardingState;
  journey?: "initial" | "eb-plus-activation";
  onBack: () => void;
  onOpenIdentity: () => void;
  onOpenKyc: () => void;
  onOpenCard: () => void;
};

export function HubStep({
  state,
  journey = "initial",
  onBack,
  onOpenIdentity,
  onOpenKyc,
  onOpenCard,
}: HubStepProps) {
  function statusFor(
    id: "identity" | "kyc" | "card",
  ): "locked" | "available" | "complete" | "in_progress" {
    if (id === "identity") {
      return state.identityDone ? "complete" : "available";
    }
    if (id === "kyc") {
      if (state.kycStatus === "completed") return "complete";
      // Handed off to the browser but not back yet — still mid-flight, so it
      // must not read as an untouched step.
      if (
        state.kycStatus === "in_progress" ||
        state.kycStatus === "awaiting_return"
      ) {
        return "in_progress";
      }
      return canOpenHubStep(state, "kyc") ? "available" : "locked";
    }
    if (state.cardSetupDone) return "complete";
    return canOpenHubStep(state, "card") ? "available" : "locked";
  }

  const upgradeJourney = journey === "eb-plus-activation";
  const steps = upgradeJourney
    ? HUB_STEPS.filter((step) => step.id !== "kyc")
    : HUB_STEPS;
  return (
    <>
      <OnboardingHeader
        title={
          upgradeJourney
            ? "Complete your EB+ setup"
            : "Apply for Infosys Employee Benefits"
        }
        subtitle={
          upgradeJourney
            ? "Complete these two steps to activate your EB+."
            : "Complete these steps to activate your account."
        }
        onBack={onBack}
      />
      <main className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-page pb-4 pt-5">
        {steps.map((step, index) => {
          const status = statusFor(step.id);
          return (
            <HubStepCard
              key={step.id}
              index={index + 1}
              title={step.title}
              description={step.description}
              status={status}
              icon={<StepIcon id={step.id} />}
              onClick={
                status === "available" || status === "in_progress"
                  ? () => {
                      if (step.id === "identity") onOpenIdentity();
                      else if (step.id === "kyc") onOpenKyc();
                      else onOpenCard();
                    }
                  : undefined
              }
            />
          );
        })}
      </main>
    </>
  );
}

function StepIcon({ id }: { id: "identity" | "kyc" | "card" }) {
  const stroke = colors.pinePrimary;
  if (id === "kyc") {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M7 3h7l4 4v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"
          stroke={stroke}
          strokeWidth="1.7"
        />
        <path
          d="m9 13 2 2 4-4"
          stroke={stroke}
          strokeWidth="1.7"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  if (id === "card") {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="2.5" y="5" width="19" height="14" rx="2" stroke={stroke} strokeWidth="1.7" />
        <path d="M2.5 9.5h19" stroke={stroke} strokeWidth="1.7" />
      </svg>
    );
  }
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" stroke={stroke} strokeWidth="1.7" />
      <circle cx="9" cy="12" r="2" stroke={stroke} strokeWidth="1.7" />
      <path d="M13 10h5M13 14h3" stroke={stroke} strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}
