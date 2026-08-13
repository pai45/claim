"use client";

import Image from "next/image";
import { useRef } from "react";
import { AppIcon } from "@/components/shared/AppIcon";
import { withBasePath } from "@/lib/basePath";
import { ONBOARDING_ASSETS } from "@/lib/ui/assets";
import { useModalFocus } from "@/lib/ui/useModalFocus";
import { OnboardingHeader } from "./OnboardingHeader";
import { PrimaryFooter } from "./PrimaryFooter";
import { SuccessSealIcon } from "./SuccessSealIcon";

type KycIntroStepProps = {
  onStart: () => void;
  onCompleted: () => void;
  /** True once the VKYC page has been handed off to and not yet come back from. */
  awaitingReturn: boolean;
};

export function KycIntroStep({
  onStart,
  onCompleted,
  awaitingReturn,
}: KycIntroStepProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-[#f1f1f1]">
      <main className="flex shrink-0 flex-col px-[19px]">
        <Image
          src={withBasePath("/assets/kyc-verification.svg")}
          alt=""
          width={181}
          height={128}
          unoptimized
          className="mx-auto mt-[18px] block h-32 w-[181px] shrink-0"
          aria-hidden="true"
        />
        <h1 className="mt-5 text-center font-display text-[28px] leading-[30px] font-bold text-[#0d3838]">
          Complete your
          <br />
          KYC Verification
        </h1>
        <p className="mt-6 text-center text-[18px] leading-[22px] text-[#5f6174]">
          KYC requires camera &amp; microphone access.
          <br />
          Please allow location and enable pop-ups in your
          <br />
          browser.
        </p>
        <ul className="mt-[25px] divide-y divide-[#eeeeee] rounded-2xl bg-white px-4 py-px text-[16px] leading-6 text-[#25282a]">
          <li className="flex min-h-14 items-center gap-[18px]">
            <span className="h-1 w-1 shrink-0 rounded-full bg-[#006060]" aria-hidden="true" />
            <span>Keep your original PAN card handy.</span>
          </li>
          <li className="flex min-h-[76px] items-center gap-[18px]">
            <span className="h-1 w-1 shrink-0 rounded-full bg-[#006060]" aria-hidden="true" />
            <span>Ensure access to your Aadhaar-linked mobile number.</span>
          </li>
          <li className="flex min-h-14 items-center gap-[18px]">
            <span className="h-1 w-1 shrink-0 rounded-full bg-[#006060]" aria-hidden="true" />
            <span>Return here after completing your KYC.</span>
          </li>
        </ul>
      </main>

      <div className="mt-auto shrink-0 px-[19px] pb-[max(17px,env(safe-area-inset-bottom))] pt-8">
        {awaitingReturn ? (
          <p className="mb-3 text-center text-[15px] leading-5 text-[#5f6174]">
            Finish the steps in the browser, then come back here.
          </p>
        ) : null}
        <button
          type="button"
          className="flex h-[50px] w-full items-center justify-center rounded-lg bg-[#196261] px-4 text-center text-[17px] leading-6 text-white"
          onClick={onStart}
        >
          {awaitingReturn
            ? "Reopen KYC tab"
            : "Ready? Let's begin KYC in browser."}
        </button>
        <button
          type="button"
          className="btn-secondary mt-3 min-h-11 h-[50px]"
          onClick={onCompleted}
        >
          I&apos;ve completed my KYC
        </button>
      </div>
    </div>
  );
}

type KycProgressOverlayProps = {
  open: boolean;
  onDismiss: () => void;
};

export function KycProgressOverlay({
  open,
  onDismiss,
}: KycProgressOverlayProps) {
  const panelRef = useRef<HTMLElement>(null);
  useModalFocus(panelRef, open, onDismiss);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[70] mx-auto max-w-phone"
    >
      <button
        type="button"
        tabIndex={-1}
        aria-label="Dismiss KYC verification status"
        onClick={onDismiss}
        className="absolute inset-0 bg-ink/55"
      />
      <section
        ref={panelRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="kyc-progress-title"
        aria-describedby="kyc-progress-description"
        className="animate-sheet-rise absolute inset-x-0 bottom-0 rounded-t-bubble bg-white px-page pb-[max(16px,env(safe-area-inset-bottom))] pt-10 text-center shadow-drawer"
      >
        <AppIcon
          src={ONBOARDING_ASSETS.kycInProgress}
          size={80}
          className="absolute -top-10 left-1/2 -translate-x-1/2"
        />
        <button
          type="button"
          aria-label="Close"
          onClick={onDismiss}
          className="absolute right-2 top-1 flex min-h-11 min-w-11 items-center justify-center rounded-pill text-ink-secondary"
        >
          <CloseIcon />
        </button>
        <h2 id="kyc-progress-title" className="type-section-title">
          KYC Verification in Progress
        </h2>
        <p
          id="kyc-progress-description"
          className="type-body-secondary mx-auto mt-3 max-w-card"
        >
          Your VKYC is under verification. Please wait while we complete the
          process (usually 24-48 hrs)
        </p>
        <button
          type="button"
          className="btn-primary mt-6 min-h-11 h-auto py-3"
          onClick={onDismiss}
        >
          OK
        </button>
      </section>
    </div>
  );
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M7 7l10 10M17 7 7 17"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

type KycCompletedStepProps = {
  onContinue: () => void;
};

export function KycCompletedStep({ onContinue }: KycCompletedStepProps) {
  return (
    <>
      <OnboardingHeader title="KYC Verification" />
      <main className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto px-page pb-4 pt-5 text-center">
        <SuccessSealIcon size={64} />
        <h2 className="type-section-title mt-5">KYC Completed</h2>
        <p className="type-body-secondary mt-2 max-w-[280px]">
          Your KYC verification has been successfully completed.
        </p>
      </main>
      <PrimaryFooter label="Continue" onClick={onContinue} />
    </>
  );
}
